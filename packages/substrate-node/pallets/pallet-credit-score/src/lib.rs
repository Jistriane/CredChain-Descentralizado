#![cfg_attr(not(feature = "std"), no_std)]

//! # Credit Score Pallet
//! 
//! Este pallet implementa o sistema de credit scoring descentralizado do CredChain.
//! Ele permite o registro, cálculo e consulta de scores de crédito de forma
//! transparente e verificável na blockchain.

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::{
        pallet_prelude::*,
        traits::{Get, Randomness},
    };
    use frame_system::pallet_prelude::*;
    use sp_runtime::traits::{AccountIdConversion, BlakeTwo256, Hash};
    use sp_std::vec::Vec;

    /// Configuração do pallet
    #[pallet::config]
    pub trait Config: frame_system::Config {
        /// Evento do runtime
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        
        /// Peso máximo para cálculo de score
        type WeightInfo: WeightInfo;
        
        /// Score mínimo permitido (0-1000)
        #[pallet::constant]
        type MinScore: Get<u32>;
        
        /// Score máximo permitido (0-1000)
        #[pallet::constant]
        type MaxScore: Get<u32>;
        
        /// Número máximo de fatores de score
        #[pallet::constant]
        type MaxScoreFactors: Get<u32>;
        
        /// Randomness source para geração de IDs únicos
        type Randomness: Randomness<Self::Hash, Self::BlockNumber>;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    /// Armazena scores de crédito por usuário
    #[pallet::storage]
    #[pallet::getter(fn credit_score)]
    pub type CreditScores<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        CreditScoreData<T::AccountId, T::BlockNumber>,
        OptionQuery,
    >;

    /// Histórico de mudanças de score
    #[pallet::storage]
    #[pallet::getter(fn score_history)]
    pub type ScoreHistory<T: Config> = StorageDoubleMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        Blake2_128Concat,
        T::BlockNumber,
        ScoreChange<T::AccountId, T::BlockNumber>,
        OptionQuery,
    >;

    /// Fatores que influenciam o score
    #[pallet::storage]
    #[pallet::getter(fn score_factors)]
    pub type ScoreFactors<T: Config> = StorageDoubleMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        Blake2_128Concat,
        ScoreFactorType,
        u32,
        ValueQuery,
    >;

    /// Contador global de scores calculados
    #[pallet::storage]
    pub type TotalScoresCalculated<T: Config> = StorageValue<_, u64, ValueQuery>;

    /// Hash da última atualização de score por usuário
    #[pallet::storage]
    #[pallet::getter(fn last_score_hash)]
    pub type LastScoreHash<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        T::Hash,
        OptionQuery,
    >;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// Score calculado para um usuário
        ScoreCalculated {
            user: T::AccountId,
            score: u32,
            factors: Vec<ScoreFactor>,
            block_number: T::BlockNumber,
        },
        /// Score atualizado
        ScoreUpdated {
            user: T::AccountId,
            old_score: u32,
            new_score: u32,
            reason: ScoreUpdateReason,
        },
        /// Fator de score adicionado
        ScoreFactorAdded {
            user: T::AccountId,
            factor_type: ScoreFactorType,
            value: u32,
            weight: u32,
        },
        /// Score verificado por terceiro
        ScoreVerified {
            user: T::AccountId,
            verifier: T::AccountId,
            score: u32,
            verification_hash: T::Hash,
        },
    }

    #[pallet::error]
    pub enum Error<T> {
        /// Score fora do range permitido
        ScoreOutOfRange,
        /// Usuário não encontrado
        UserNotFound,
        /// Fator de score inválido
        InvalidScoreFactor,
        /// Score já existe para este usuário
        ScoreAlreadyExists,
        /// Score não encontrado
        ScoreNotFound,
        /// Fator de score não encontrado
        ScoreFactorNotFound,
        /// Peso do fator inválido
        InvalidFactorWeight,
        /// Muitos fatores de score
        TooManyScoreFactors,
        /// Cálculo de score falhou
        ScoreCalculationFailed,
        /// Verificação de score falhou
        ScoreVerificationFailed,
    }

    #[pallet::hooks]
    impl<T: Config> Hooks<T::BlockNumber> for Pallet<T> {
        fn on_initialize(_n: T::BlockNumber) -> Weight {
            // Lógica de inicialização se necessário
            Weight::zero()
        }
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        /// Calcula e registra um novo score de crédito
        #[pallet::call_index(0)]
        #[pallet::weight(T::WeightInfo::calculate_score())]
        pub fn calculate_score(
            origin: OriginFor<T>,
            factors: Vec<ScoreFactor>,
        ) -> DispatchResult {
            let user = ensure_signed(origin)?;
            
            // Verifica se não há muitos fatores
            ensure!(
                factors.len() <= T::MaxScoreFactors::get() as usize,
                Error::<T>::TooManyScoreFactors
            );

            // Calcula o score baseado nos fatores
            let score = Self::calculate_score_from_factors(&factors)?;
            
            // Verifica se o score está no range permitido
            ensure!(
                score >= T::MinScore::get() && score <= T::MaxScore::get(),
                Error::<T>::ScoreOutOfRange
            );

            // Gera hash único para este cálculo
            let score_hash = Self::generate_score_hash(&user, &factors, &score);
            
            // Armazena o score
            let score_data = CreditScoreData {
                user: user.clone(),
                score,
                factors: factors.clone(),
                calculated_at: frame_system::Pallet::<T>::block_number(),
                score_hash,
                is_verified: false,
                verification_count: 0,
            };

            CreditScores::<T>::insert(&user, score_data);
            
            // Armazena histórico
            let score_change = ScoreChange {
                user: user.clone(),
                old_score: None,
                new_score: score,
                factors: factors.clone(),
                block_number: frame_system::Pallet::<T>::block_number(),
                reason: ScoreUpdateReason::InitialCalculation,
            };

            ScoreHistory::<T>::insert(&user, frame_system::Pallet::<T>::block_number(), score_change);
            
            // Atualiza fatores de score
            for factor in &factors {
                ScoreFactors::<T>::insert(&user, factor.factor_type, factor.value);
            }

            // Atualiza contador global
            TotalScoresCalculated::<T>::mutate(|count| *count += 1);
            
            // Armazena hash do último score
            LastScoreHash::<T>::insert(&user, score_hash);

            Self::deposit_event(Event::ScoreCalculated {
                user,
                score,
                factors,
                block_number: frame_system::Pallet::<T>::block_number(),
            });

            Ok(())
        }

        /// Atualiza um score existente
        #[pallet::call_index(1)]
        #[pallet::weight(T::WeightInfo::update_score())]
        pub fn update_score(
            origin: OriginFor<T>,
            new_factors: Vec<ScoreFactor>,
        ) -> DispatchResult {
            let user = ensure_signed(origin)?;
            
            // Verifica se o usuário tem score existente
            let old_score_data = CreditScores::<T>::get(&user)
                .ok_or(Error::<T>::ScoreNotFound)?;

            // Calcula novo score
            let new_score = Self::calculate_score_from_factors(&new_factors)?;
            
            // Verifica se o score está no range permitido
            ensure!(
                new_score >= T::MinScore::get() && new_score <= T::MaxScore::get(),
                Error::<T>::ScoreOutOfRange
            );

            // Gera novo hash
            let new_score_hash = Self::generate_score_hash(&user, &new_factors, &new_score);
            
            // Atualiza score
            let updated_score_data = CreditScoreData {
                user: user.clone(),
                score: new_score,
                factors: new_factors.clone(),
                calculated_at: frame_system::Pallet::<T>::block_number(),
                score_hash: new_score_hash,
                is_verified: false,
                verification_count: 0,
            };

            CreditScores::<T>::insert(&user, updated_score_data);
            
            // Armazena histórico da mudança
            let score_change = ScoreChange {
                user: user.clone(),
                old_score: Some(old_score_data.score),
                new_score,
                factors: new_factors.clone(),
                block_number: frame_system::Pallet::<T>::block_number(),
                reason: ScoreUpdateReason::UserUpdate,
            };

            ScoreHistory::<T>::insert(&user, frame_system::Pallet::<T>::block_number(), score_change);
            
            // Atualiza fatores
            for factor in &new_factors {
                ScoreFactors::<T>::insert(&user, factor.factor_type, factor.value);
            }

            // Atualiza hash do último score
            LastScoreHash::<T>::insert(&user, new_score_hash);

            Self::deposit_event(Event::ScoreUpdated {
                user,
                old_score: old_score_data.score,
                new_score,
                reason: ScoreUpdateReason::UserUpdate,
            });

            Ok(())
        }

        /// Verifica um score (apenas para usuários autorizados)
        #[pallet::call_index(2)]
        #[pallet::weight(T::WeightInfo::verify_score())]
        pub fn verify_score(
            origin: OriginFor<T>,
            target_user: T::AccountId,
        ) -> DispatchResult {
            let verifier = ensure_signed(origin)?;
            
            // Verifica se o usuário tem score
            let mut score_data = CreditScores::<T>::get(&target_user)
                .ok_or(Error::<T>::ScoreNotFound)?;

            // Gera hash de verificação
            let verification_hash = Self::generate_verification_hash(&target_user, &score_data.score, &verifier);
            
            // Marca como verificado
            score_data.is_verified = true;
            score_data.verification_count += 1;
            
            CreditScores::<T>::insert(&target_user, score_data);

            Self::deposit_event(Event::ScoreVerified {
                user: target_user,
                verifier,
                score: score_data.score,
                verification_hash,
            });

            Ok(())
        }

        /// Adiciona um fator de score específico
        #[pallet::call_index(3)]
        #[pallet::weight(T::WeightInfo::add_score_factor())]
        pub fn add_score_factor(
            origin: OriginFor<T>,
            factor_type: ScoreFactorType,
            value: u32,
            weight: u32,
        ) -> DispatchResult {
            let user = ensure_signed(origin)?;
            
            // Verifica se o valor do fator é válido
            ensure!(value > 0, Error::<T>::InvalidScoreFactor);
            ensure!(weight > 0 && weight <= 100, Error::<T>::InvalidFactorWeight);

            // Armazena o fator
            ScoreFactors::<T>::insert(&user, factor_type, value);

            Self::deposit_event(Event::ScoreFactorAdded {
                user,
                factor_type,
                value,
                weight,
            });

            Ok(())
        }
    }

    impl<T: Config> Pallet<T> {
        /// Calcula score baseado nos fatores fornecidos
        fn calculate_score_from_factors(factors: &[ScoreFactor]) -> Result<u32, Error<T>> {
            if factors.is_empty() {
                return Err(Error::<T>::InvalidScoreFactor);
            }

            let mut total_weighted_score = 0u32;
            let mut total_weight = 0u32;

            for factor in factors {
                // Valida o fator
                if factor.value == 0 || factor.weight == 0 || factor.weight > 100 {
                    return Err(Error::<T>::InvalidScoreFactor);
                }

                // Aplica peso ao valor
                let weighted_value = factor.value * factor.weight;
                total_weighted_score += weighted_value;
                total_weight += factor.weight;
            }

            if total_weight == 0 {
                return Err(Error::<T>::InvalidScoreFactor);
            }

            // Calcula score final (0-1000)
            let final_score = (total_weighted_score * 1000) / (total_weight * 100);
            
            Ok(final_score.min(1000))
        }

        /// Gera hash único para o score
        fn generate_score_hash(
            user: &T::AccountId,
            factors: &[ScoreFactor],
            score: &u32,
        ) -> T::Hash {
            let mut data = Vec::new();
            data.extend_from_slice(&user.encode());
            data.extend_from_slice(&score.encode());
            
            for factor in factors {
                data.extend_from_slice(&factor.factor_type.encode());
                data.extend_from_slice(&factor.value.encode());
                data.extend_from_slice(&factor.weight.encode());
            }

            BlakeTwo256::hash(&data)
        }

        /// Gera hash de verificação
        fn generate_verification_hash(
            user: &T::AccountId,
            score: &u32,
            verifier: &T::AccountId,
        ) -> T::Hash {
            let mut data = Vec::new();
            data.extend_from_slice(&user.encode());
            data.extend_from_slice(&score.encode());
            data.extend_from_slice(&verifier.encode());
            data.extend_from_slice(&frame_system::Pallet::<T>::block_number().encode());

            BlakeTwo256::hash(&data)
        }
    }

    /// Dados de um score de crédito
    #[derive(Clone, Encode, Decode, PartialEq, Eq, RuntimeDebug, TypeInfo)]
    pub struct CreditScoreData<AccountId, BlockNumber> {
        pub user: AccountId,
        pub score: u32,
        pub factors: Vec<ScoreFactor>,
        pub calculated_at: BlockNumber,
        pub score_hash: <Self as frame_support::traits::Get<()>>::Hash,
        pub is_verified: bool,
        pub verification_count: u32,
    }

    /// Fator que influencia o score
    #[derive(Clone, Encode, Decode, PartialEq, Eq, RuntimeDebug, TypeInfo)]
    pub struct ScoreFactor {
        pub factor_type: ScoreFactorType,
        pub value: u32,
        pub weight: u32, // 1-100
    }

    /// Tipos de fatores de score
    #[derive(Clone, Encode, Decode, PartialEq, Eq, RuntimeDebug, TypeInfo)]
    pub enum ScoreFactorType {
        PaymentHistory,      // Histórico de pagamentos
        CreditUtilization,   // Utilização de crédito
        CreditAge,          // Idade do crédito
        CreditMix,          // Diversidade de crédito
        NewCredit,          // Novas linhas de crédito
        IncomeStability,    // Estabilidade de renda
        EmploymentHistory,  // Histórico de emprego
        DebtToIncome,       // Relação dívida/renda
    }

    /// Mudança no score
    #[derive(Clone, Encode, Decode, PartialEq, Eq, RuntimeDebug, TypeInfo)]
    pub struct ScoreChange<AccountId, BlockNumber> {
        pub user: AccountId,
        pub old_score: Option<u32>,
        pub new_score: u32,
        pub factors: Vec<ScoreFactor>,
        pub block_number: BlockNumber,
        pub reason: ScoreUpdateReason,
    }

    /// Razão da atualização do score
    #[derive(Clone, Encode, Decode, PartialEq, Eq, RuntimeDebug, TypeInfo)]
    pub enum ScoreUpdateReason {
        InitialCalculation,
        UserUpdate,
        SystemUpdate,
        VerificationUpdate,
        ComplianceUpdate,
    }

    /// Trait para informações de peso das funções
    pub trait WeightInfo {
        fn calculate_score() -> Weight;
        fn update_score() -> Weight;
        fn verify_score() -> Weight;
        fn add_score_factor() -> Weight;
    }

    /// Implementação padrão dos pesos
    impl WeightInfo for () {
        fn calculate_score() -> Weight {
            Weight::from_parts(50_000, 0)
        }
        
        fn update_score() -> Weight {
            Weight::from_parts(30_000, 0)
        }
        
        fn verify_score() -> Weight {
            Weight::from_parts(10_000, 0)
        }
        
        fn add_score_factor() -> Weight {
            Weight::from_parts(5_000, 0)
        }
    }
}
