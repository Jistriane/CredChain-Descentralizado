#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod credit_score_contract {
    use ink_prelude::string::String;
    use ink_prelude::vec::Vec;
    use ink_storage::traits::{PackedLayout, SpreadLayout};
    use scale::{Decode, Encode};

    /// Estrutura para armazenar informações de score de crédito
    #[derive(Encode, Decode, Debug, Clone, PartialEq, PackedLayout, SpreadLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct CreditScore {
        pub user_id: String,
        pub score: u32,
        pub factors: Vec<ScoreFactor>,
        pub calculated_at: u64,
        pub blockchain_tx: String,
        pub metadata: String,
    }

    /// Fatores que influenciam o score
    #[derive(Encode, Decode, Debug, Clone, PartialEq, PackedLayout, SpreadLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct ScoreFactor {
        pub name: String,
        pub value: u32,
        pub weight: u32,
        pub impact: String,
    }

    /// Histórico de pagamentos
    #[derive(Encode, Decode, Debug, Clone, PartialEq, PackedLayout, SpreadLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct PaymentHistory {
        pub payment_id: String,
        pub user_id: String,
        pub amount: u64,
        pub currency: String,
        pub due_date: u64,
        pub paid_date: Option<u64>,
        pub status: PaymentStatus,
        pub proof_hash: String,
    }

    /// Status do pagamento
    #[derive(Encode, Decode, Debug, Clone, PartialEq, PackedLayout, SpreadLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum PaymentStatus {
        Pending,
        Paid,
        Late,
        Defaulted,
        Cancelled,
    }

    /// Eventos do contrato
    #[ink(event)]
    pub struct CreditScoreUpdated {
        #[ink(topic)]
        pub user_id: String,
        pub score: u32,
        pub calculated_at: u64,
    }

    #[ink(event)]
    pub struct PaymentRegistered {
        #[ink(topic)]
        pub user_id: String,
        pub payment_id: String,
        pub amount: u64,
        pub status: PaymentStatus,
    }

    #[ink(event)]
    pub struct PaymentStatusChanged {
        #[ink(topic)]
        pub payment_id: String,
        pub old_status: PaymentStatus,
        pub new_status: PaymentStatus,
    }

    /// Erros do contrato
    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        Unauthorized,
        InvalidScore,
        InvalidPayment,
        PaymentNotFound,
        InsufficientFunds,
        InvalidUser,
        ScoreNotFound,
        InvalidFactor,
        CalculationError,
    }

    /// Resultado das operações
    pub type Result<T> = core::result::Result<T, Error>;

    #[ink(storage)]
    pub struct CreditScoreContract {
        /// Mapeamento de usuários para seus scores
        credit_scores: ink_storage::collections::HashMap<String, CreditScore>,
        /// Mapeamento de usuários para histórico de pagamentos
        payment_histories: ink_storage::collections::HashMap<String, Vec<PaymentHistory>>,
        /// Mapeamento de IDs de pagamento para histórico
        payments: ink_storage::collections::HashMap<String, PaymentHistory>,
        /// Administrador do contrato
        admin: AccountId,
        /// Versão do contrato
        version: String,
    }

    impl CreditScoreContract {
        /// Construtor do contrato
        #[ink(constructor)]
        pub fn new(admin: AccountId) -> Self {
            Self {
                credit_scores: ink_storage::collections::HashMap::new(),
                payment_histories: ink_storage::collections::HashMap::new(),
                payments: ink_storage::collections::HashMap::new(),
                admin,
                version: String::from("1.0.0"),
            }
        }

        /// Atualizar score de crédito
        #[ink(message)]
        pub fn update_credit_score(
            &mut self,
            user_id: String,
            score: u32,
            factors: Vec<ScoreFactor>,
            metadata: String,
        ) -> Result<()> {
            self.ensure_authorized()?;
            self.ensure_valid_score(score)?;

            let calculated_at = self.env().block_timestamp();
            let blockchain_tx = self.env().caller().to_string();

            let credit_score = CreditScore {
                user_id: user_id.clone(),
                score,
                factors,
                calculated_at,
                blockchain_tx,
                metadata,
            };

            self.credit_scores.insert(user_id.clone(), credit_score);

            self.env().emit_event(CreditScoreUpdated {
                user_id,
                score,
                calculated_at,
            });

            Ok(())
        }

        /// Obter score de crédito de um usuário
        #[ink(message)]
        pub fn get_credit_score(&self, user_id: String) -> Result<CreditScore> {
            self.credit_scores
                .get(&user_id)
                .ok_or(Error::ScoreNotFound)
                .map(|score| score.clone())
        }

        /// Registrar pagamento
        #[ink(message)]
        pub fn register_payment(
            &mut self,
            user_id: String,
            payment_id: String,
            amount: u64,
            currency: String,
            due_date: u64,
        ) -> Result<()> {
            self.ensure_authorized()?;

            let payment = PaymentHistory {
                payment_id: payment_id.clone(),
                user_id: user_id.clone(),
                amount,
                currency,
                due_date,
                paid_date: None,
                status: PaymentStatus::Pending,
                proof_hash: String::new(),
            };

            // Adicionar ao histórico do usuário
            let mut user_payments = self
                .payment_histories
                .get(&user_id)
                .unwrap_or_default();
            user_payments.push(payment.clone());
            self.payment_histories.insert(user_id, user_payments);

            // Adicionar ao mapeamento de pagamentos
            self.payments.insert(payment_id.clone(), payment.clone());

            self.env().emit_event(PaymentRegistered {
                user_id,
                payment_id,
                amount,
                status: PaymentStatus::Pending,
            });

            Ok(())
        }

        /// Atualizar status de pagamento
        #[ink(message)]
        pub fn update_payment_status(
            &mut self,
            payment_id: String,
            new_status: PaymentStatus,
            paid_date: Option<u64>,
            proof_hash: String,
        ) -> Result<()> {
            self.ensure_authorized()?;

            let mut payment = self
                .payments
                .get(&payment_id)
                .ok_or(Error::PaymentNotFound)?
                .clone();

            let old_status = payment.status.clone();
            payment.status = new_status.clone();
            payment.paid_date = paid_date;
            payment.proof_hash = proof_hash;

            self.payments.insert(payment_id.clone(), payment.clone());

            // Atualizar no histórico do usuário
            if let Some(mut user_payments) = self.payment_histories.get(&payment.user_id) {
                if let Some(user_payment) = user_payments.iter_mut().find(|p| p.payment_id == payment_id) {
                    user_payment.status = new_status.clone();
                    user_payment.paid_date = paid_date;
                    user_payment.proof_hash = proof_hash;
                }
                self.payment_histories.insert(payment.user_id, user_payments);
            }

            self.env().emit_event(PaymentStatusChanged {
                payment_id,
                old_status,
                new_status,
            });

            Ok(())
        }

        /// Obter histórico de pagamentos de um usuário
        #[ink(message)]
        pub fn get_payment_history(&self, user_id: String) -> Vec<PaymentHistory> {
            self.payment_histories
                .get(&user_id)
                .unwrap_or_default()
        }

        /// Obter pagamento específico
        #[ink(message)]
        pub fn get_payment(&self, payment_id: String) -> Result<PaymentHistory> {
            self.payments
                .get(&payment_id)
                .ok_or(Error::PaymentNotFound)
                .map(|payment| payment.clone())
        }

        /// Calcular score baseado em histórico de pagamentos
        #[ink(message)]
        pub fn calculate_score_from_payments(&mut self, user_id: String) -> Result<u32> {
            self.ensure_authorized()?;

            let payments = self.get_payment_history(user_id.clone());
            if payments.is_empty() {
                return Err(Error::InvalidUser);
            }

            let score = self.calculate_credit_score(&payments);
            let factors = self.generate_score_factors(&payments);
            let metadata = String::from("Calculated from payment history");

            self.update_credit_score(user_id, score, factors, metadata)?;

            Ok(score)
        }

        /// Obter estatísticas do contrato
        #[ink(message)]
        pub fn get_contract_stats(&self) -> (u32, u32, u32) {
            let total_users = self.credit_scores.len() as u32;
            let total_payments = self.payments.len() as u32;
            let total_volume = self.payments
                .values()
                .map(|p| p.amount)
                .sum::<u64>() as u32;

            (total_users, total_payments, total_volume)
        }

        /// Verificar se usuário tem score válido
        #[ink(message)]
        pub fn has_valid_score(&self, user_id: String) -> bool {
            self.credit_scores.contains_key(&user_id)
        }

        /// Obter versão do contrato
        #[ink(message)]
        pub fn get_version(&self) -> String {
            self.version.clone()
        }

        /// Funções privadas auxiliares
        fn ensure_authorized(&self) -> Result<()> {
            if self.env().caller() != self.admin {
                return Err(Error::Unauthorized);
            }
            Ok(())
        }

        fn ensure_valid_score(&self, score: u32) -> Result<()> {
            if score > 1000 {
                return Err(Error::InvalidScore);
            }
            Ok(())
        }

        fn calculate_credit_score(&self, payments: &[PaymentHistory]) -> u32 {
            let mut score = 500u32; // Score base

            // Fator 1: Pontualidade (35% do peso)
            let on_time_payments = payments.iter()
                .filter(|p| p.status == PaymentStatus::Paid && p.paid_date.is_some())
                .filter(|p| {
                    if let Some(paid_date) = p.paid_date {
                        paid_date <= p.due_date
                    } else {
                        false
                    }
                })
                .count();

            let punctuality_score = if payments.is_empty() {
                0
            } else {
                (on_time_payments * 100) / payments.len()
            };

            score += (punctuality_score * 35) / 100;

            // Fator 2: Histórico de pagamentos (30% do peso)
            let paid_payments = payments.iter()
                .filter(|p| p.status == PaymentStatus::Paid)
                .count();

            let payment_history_score = if payments.is_empty() {
                0
            } else {
                (paid_payments * 100) / payments.len()
            };

            score += (payment_history_score * 30) / 100;

            // Fator 3: Diversidade de pagamentos (15% do peso)
            let unique_currencies = payments.iter()
                .map(|p| &p.currency)
                .collect::<std::collections::HashSet<_>>()
                .len();

            let diversity_score = (unique_currencies * 100) / 10.min(payments.len()); // Máximo 10 tipos
            score += (diversity_score * 15) / 100;

            // Fator 4: Volume de pagamentos (10% do peso)
            let total_amount: u64 = payments.iter().map(|p| p.amount).sum();
            let volume_score = (total_amount / 1000).min(100) as u32; // Normalizar para 0-100
            score += (volume_score * 10) / 100;

            // Fator 5: Tempo no sistema (10% do peso)
            let oldest_payment = payments.iter()
                .map(|p| p.due_date)
                .min()
                .unwrap_or(0);

            let current_time = self.env().block_timestamp();
            let time_in_system = (current_time - oldest_payment) / (30 * 24 * 60 * 60 * 1000); // Meses
            let time_score = (time_in_system * 10).min(100);
            score += (time_score * 10) / 100;

            score.min(1000) // Máximo 1000
        }

        fn generate_score_factors(&self, payments: &[PaymentHistory]) -> Vec<ScoreFactor> {
            let mut factors = Vec::new();

            // Fator de pontualidade
            let on_time_payments = payments.iter()
                .filter(|p| p.status == PaymentStatus::Paid && p.paid_date.is_some())
                .filter(|p| {
                    if let Some(paid_date) = p.paid_date {
                        paid_date <= p.due_date
                    } else {
                        false
                    }
                })
                .count();

            let punctuality_percentage = if payments.is_empty() {
                0
            } else {
                (on_time_payments * 100) / payments.len()
            };

            factors.push(ScoreFactor {
                name: String::from("Pontualidade"),
                value: punctuality_percentage as u32,
                weight: 35,
                impact: String::from("Histórico de pagamentos em dia"),
            });

            // Fator de volume
            let total_amount: u64 = payments.iter().map(|p| p.amount).sum();
            factors.push(ScoreFactor {
                name: String::from("Volume de Transações"),
                value: (total_amount / 1000) as u32,
                weight: 10,
                impact: String::from("Valor total movimentado"),
            });

            // Fator de diversidade
            let unique_currencies = payments.iter()
                .map(|p| &p.currency)
                .collect::<std::collections::HashSet<_>>()
                .len();

            factors.push(ScoreFactor {
                name: String::from("Diversidade"),
                value: unique_currencies as u32,
                weight: 15,
                impact: String::from("Variedade de tipos de transação"),
            });

            factors
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn test_contract_creation() {
            let admin = AccountId::from([1u8; 32]);
            let contract = CreditScoreContract::new(admin);
            assert_eq!(contract.get_version(), "1.0.0");
        }

        #[ink::test]
        fn test_update_credit_score() {
            let admin = AccountId::from([1u8; 32]);
            let mut contract = CreditScoreContract::new(admin);
            
            let user_id = String::from("user123");
            let score = 750u32;
            let factors = vec![];
            let metadata = String::from("Test score");

            let result = contract.update_credit_score(user_id.clone(), score, factors, metadata);
            assert!(result.is_ok());

            let retrieved_score = contract.get_credit_score(user_id);
            assert!(retrieved_score.is_ok());
            assert_eq!(retrieved_score.unwrap().score, score);
        }

        #[ink::test]
        fn test_register_payment() {
            let admin = AccountId::from([1u8; 32]);
            let mut contract = CreditScoreContract::new(admin);
            
            let user_id = String::from("user123");
            let payment_id = String::from("payment123");
            let amount = 1000u64;
            let currency = String::from("BRL");
            let due_date = 1234567890u64;

            let result = contract.register_payment(user_id, payment_id.clone(), amount, currency, due_date);
            assert!(result.is_ok());

            let payment = contract.get_payment(payment_id);
            assert!(payment.is_ok());
            assert_eq!(payment.unwrap().amount, amount);
        }
    }
}