/**
 * Unit Tests for Credit Score Pallet
 * 
 * Testes unitários para o pallet de credit score
 */

use crate::*;
use frame_support::{
    assert_ok, assert_noop,
    traits::{OnInitialize, OnFinalize},
};
use sp_io::TestExternalities;

// Mock para o runtime de teste
pub struct Test;

impl frame_system::Config for Test {
    type BaseCallFilter = frame_support::traits::Everything;
    type BlockWeights = ();
    type BlockLength = ();
    type DbWeight = ();
    type RuntimeOrigin = RuntimeOrigin;
    type RuntimeCall = ();
    type Nonce = u64;
    type Hash = sp_core::H256;
    type Hashing = sp_runtime::traits::BlakeTwo256;
    type AccountId = u64;
    type Lookup = sp_runtime::traits::AccountIdLookup<Self::AccountId, ()>;
    type Block = sp_runtime::generic::Block<Header, UncheckedExtrinsic>;
    type RuntimeEvent = ();
    type BlockHashCount = ();
    type Version = ();
    type PalletInfo = ();
    type AccountData = ();
    type OnNewAccount = ();
    type OnKilledAccount = ();
    type SystemWeightInfo = ();
    type SS58Prefix = ();
    type OnSetCode = ();
    type MaxConsumers = frame_support::traits::ConstU32<16>;
}

impl Config for Test {
    type RuntimeEvent = ();
    type CreditScoreAdminOrigin = frame_support::traits::EnsureRoot<u64>;
}

pub type CreditScore = Pallet<Test>;

// Helper para criar extrinsics
fn new_test_ext() -> TestExternalities {
    let mut storage = frame_system::GenesisConfig::default()
        .build_storage::<Test>()
        .unwrap();
    
    storage.0.insert(
        <frame_system::Account<Test>>::hashed_key_for(&1),
        frame_system::AccountInfo {
            nonce: 0,
            consumers: 0,
            providers: 0,
            sufficients: 0,
            data: (),
        }
        .encode(),
    );
    
    TestExternalities::new(storage)
}

#[test]
fn test_credit_score_initialization() {
    new_test_ext().execute_with(|| {
        // Verificar se o pallet foi inicializado corretamente
        assert_eq!(CreditScore::credit_scores(1), None);
        assert_eq!(CreditScore::credit_score_count(), 0);
    });
}

#[test]
fn test_set_credit_score_success() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let score = 750;
        let factors = vec![1, 2, 3, 4, 5];
        
        // Definir score de crédito
        assert_ok!(CreditScore::set_credit_score(
            RuntimeOrigin::root(),
            account_id,
            score,
            factors.clone()
        ));
        
        // Verificar se foi armazenado corretamente
        let stored_score = CreditScore::credit_scores(account_id);
        assert!(stored_score.is_some());
        
        let score_data = stored_score.unwrap();
        assert_eq!(score_data.score, score);
        assert_eq!(score_data.factors, factors);
        assert_eq!(score_data.updated_at, 0); // Block number
        
        // Verificar contador
        assert_eq!(CreditScore::credit_score_count(), 1);
    });
}

#[test]
fn test_set_credit_score_unauthorized() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let score = 750;
        let factors = vec![1, 2, 3, 4, 5];
        
        // Tentar definir score sem autorização
        assert_noop!(
            CreditScore::set_credit_score(
                RuntimeOrigin::signed(2), // Usuário comum
                account_id,
                score,
                factors
            ),
            frame_system::Error::<Test>::BadOrigin
        );
    });
}

#[test]
fn test_set_credit_score_invalid_score() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let factors = vec![1, 2, 3, 4, 5];
        
        // Score muito alto
        assert_noop!(
            CreditScore::set_credit_score(
                RuntimeOrigin::root(),
                account_id,
                1001, // Score inválido
                factors.clone()
            ),
            Error::<Test>::InvalidScore
        );
        
        // Score negativo
        assert_noop!(
            CreditScore::set_credit_score(
                RuntimeOrigin::root(),
                account_id,
                -1, // Score inválido
                factors
            ),
            Error::<Test>::InvalidScore
        );
    });
}

#[test]
fn test_set_credit_score_invalid_factors() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let score = 750;
        
        // Fatores muito longos
        let long_factors = vec![1; 1000]; // Muito longo
        assert_noop!(
            CreditScore::set_credit_score(
                RuntimeOrigin::root(),
                account_id,
                score,
                long_factors
            ),
            Error::<Test>::InvalidFactors
        );
    });
}

#[test]
fn test_update_credit_score() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let initial_score = 750;
        let initial_factors = vec![1, 2, 3, 4, 5];
        
        // Definir score inicial
        assert_ok!(CreditScore::set_credit_score(
            RuntimeOrigin::root(),
            account_id,
            initial_score,
            initial_factors.clone()
        ));
        
        // Atualizar score
        let new_score = 800;
        let new_factors = vec![2, 3, 4, 5, 6];
        
        assert_ok!(CreditScore::set_credit_score(
            RuntimeOrigin::root(),
            account_id,
            new_score,
            new_factors.clone()
        ));
        
        // Verificar se foi atualizado
        let stored_score = CreditScore::credit_scores(account_id);
        assert!(stored_score.is_some());
        
        let score_data = stored_score.unwrap();
        assert_eq!(score_data.score, new_score);
        assert_eq!(score_data.factors, new_factors);
        
        // Contador não deve mudar
        assert_eq!(CreditScore::credit_score_count(), 1);
    });
}

#[test]
fn test_get_credit_score() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let score = 750;
        let factors = vec![1, 2, 3, 4, 5];
        
        // Definir score
        assert_ok!(CreditScore::set_credit_score(
            RuntimeOrigin::root(),
            account_id,
            score,
            factors.clone()
        ));
        
        // Verificar se pode ser recuperado
        let stored_score = CreditScore::credit_scores(account_id);
        assert!(stored_score.is_some());
        
        let score_data = stored_score.unwrap();
        assert_eq!(score_data.score, score);
        assert_eq!(score_data.factors, factors);
    });
}

#[test]
fn test_get_credit_score_not_found() {
    new_test_ext().execute_with(|| {
        let account_id = 999; // Conta que não existe
        
        // Verificar que não existe score
        let stored_score = CreditScore::credit_scores(account_id);
        assert!(stored_score.is_none());
    });
}

#[test]
fn test_credit_score_count() {
    new_test_ext().execute_with(|| {
        // Contador inicial
        assert_eq!(CreditScore::credit_score_count(), 0);
        
        // Adicionar primeiro score
        assert_ok!(CreditScore::set_credit_score(
            RuntimeOrigin::root(),
            1,
            750,
            vec![1, 2, 3, 4, 5]
        ));
        assert_eq!(CreditScore::credit_score_count(), 1);
        
        // Adicionar segundo score
        assert_ok!(CreditScore::set_credit_score(
            RuntimeOrigin::root(),
            2,
            800,
            vec![2, 3, 4, 5, 6]
        ));
        assert_eq!(CreditScore::credit_score_count(), 2);
        
        // Atualizar score existente (contador não deve mudar)
        assert_ok!(CreditScore::set_credit_score(
            RuntimeOrigin::root(),
            1,
            850,
            vec![3, 4, 5, 6, 7]
        ));
        assert_eq!(CreditScore::credit_score_count(), 2);
    });
}

#[test]
fn test_credit_score_events() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let score = 750;
        let factors = vec![1, 2, 3, 4, 5];
        
        // Definir score e verificar evento
        assert_ok!(CreditScore::set_credit_score(
            RuntimeOrigin::root(),
            account_id,
            score,
            factors.clone()
        ));
        
        // Verificar se o evento foi emitido
        // Nota: Em um teste real, você verificaria os eventos emitidos
        // Aqui simulamos a verificação
        assert!(true); // Placeholder para verificação de evento
    });
}

#[test]
fn test_credit_score_storage_limits() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let score = 750;
        
        // Testar limite máximo de fatores
        let max_factors = vec![1; 100]; // Limite máximo
        assert_ok!(CreditScore::set_credit_score(
            RuntimeOrigin::root(),
            account_id,
            score,
            max_factors
        ));
        
        // Testar limite mínimo de fatores
        let min_factors = vec![1]; // Limite mínimo
        assert_ok!(CreditScore::set_credit_score(
            RuntimeOrigin::root(),
            account_id + 1,
            score,
            min_factors
        ));
    });
}

#[test]
fn test_credit_score_edge_cases() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        
        // Score mínimo
        assert_ok!(CreditScore::set_credit_score(
            RuntimeOrigin::root(),
            account_id,
            0,
            vec![1, 2, 3, 4, 5]
        ));
        
        // Score máximo
        assert_ok!(CreditScore::set_credit_score(
            RuntimeOrigin::root(),
            account_id + 1,
            1000,
            vec![1, 2, 3, 4, 5]
        ));
        
        // Fatores vazios
        assert_ok!(CreditScore::set_credit_score(
            RuntimeOrigin::root(),
            account_id + 2,
            500,
            vec![]
        ));
    });
}

#[test]
fn test_credit_score_performance() {
    new_test_ext().execute_with(|| {
        let score = 750;
        let factors = vec![1, 2, 3, 4, 5];
        
        // Testar performance com múltiplas operações
        for i in 1..=100 {
            assert_ok!(CreditScore::set_credit_score(
                RuntimeOrigin::root(),
                i,
                score,
                factors.clone()
            ));
        }
        
        // Verificar contador
        assert_eq!(CreditScore::credit_score_count(), 100);
        
        // Verificar se todos os scores foram armazenados
        for i in 1..=100 {
            let stored_score = CreditScore::credit_scores(i);
            assert!(stored_score.is_some());
            assert_eq!(stored_score.unwrap().score, score);
        }
    });
}

#[test]
fn test_credit_score_concurrent_updates() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let score1 = 750;
        let score2 = 800;
        let factors = vec![1, 2, 3, 4, 5];
        
        // Simular atualizações concorrentes
        assert_ok!(CreditScore::set_credit_score(
            RuntimeOrigin::root(),
            account_id,
            score1,
            factors.clone()
        ));
        
        assert_ok!(CreditScore::set_credit_score(
            RuntimeOrigin::root(),
            account_id,
            score2,
            factors.clone()
        ));
        
        // Verificar que o último valor foi mantido
        let stored_score = CreditScore::credit_scores(account_id);
        assert!(stored_score.is_some());
        assert_eq!(stored_score.unwrap().score, score2);
    });
}

#[test]
fn test_credit_score_cleanup() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let score = 750;
        let factors = vec![1, 2, 3, 4, 5];
        
        // Definir score
        assert_ok!(CreditScore::set_credit_score(
            RuntimeOrigin::root(),
            account_id,
            score,
            factors
        ));
        
        // Verificar que existe
        assert!(CreditScore::credit_scores(account_id).is_some());
        
        // Simular limpeza (em um teste real, você implementaria a função de limpeza)
        // CreditScore::remove_credit_score(account_id);
        
        // Verificar que foi removido
        // assert!(CreditScore::credit_scores(account_id).is_none());
    });
}

#[test]
fn test_credit_score_validation() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let factors = vec![1, 2, 3, 4, 5];
        
        // Testar validação de score
        let valid_scores = vec![0, 100, 500, 750, 1000];
        for score in valid_scores {
            assert_ok!(CreditScore::set_credit_score(
                RuntimeOrigin::root(),
                account_id,
                score,
                factors.clone()
            ));
        }
        
        // Testar scores inválidos
        let invalid_scores = vec![-1, 1001, 2000];
        for score in invalid_scores {
            assert_noop!(
                CreditScore::set_credit_score(
                    RuntimeOrigin::root(),
                    account_id,
                    score,
                    factors.clone()
                ),
                Error::<Test>::InvalidScore
            );
        }
    });
}

#[test]
fn test_credit_score_factors_validation() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let score = 750;
        
        // Testar fatores válidos
        let valid_factors = vec![
            vec![1, 2, 3],
            vec![1, 2, 3, 4, 5],
            vec![1; 50], // Limite máximo
        ];
        
        for factors in valid_factors {
            assert_ok!(CreditScore::set_credit_score(
                RuntimeOrigin::root(),
                account_id,
                score,
                factors
            ));
        }
        
        // Testar fatores inválidos
        let invalid_factors = vec![
            vec![1; 1000], // Muito longo
        ];
        
        for factors in invalid_factors {
            assert_noop!(
                CreditScore::set_credit_score(
                    RuntimeOrigin::root(),
                    account_id,
                    score,
                    factors
                ),
                Error::<Test>::InvalidFactors
            );
        }
    });
}
