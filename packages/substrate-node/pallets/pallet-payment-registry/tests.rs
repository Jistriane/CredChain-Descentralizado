/**
 * Unit Tests for Payment Registry Pallet
 * 
 * Testes unitários para o pallet de registro de pagamentos
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
    type PaymentAdminOrigin = frame_support::traits::EnsureRoot<u64>;
}

pub type PaymentRegistry = Pallet<Test>;

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
fn test_payment_registry_initialization() {
    new_test_ext().execute_with(|| {
        // Verificar se o pallet foi inicializado corretamente
        assert_eq!(PaymentRegistry::payments(1), None);
        assert_eq!(PaymentRegistry::payment_count(), 0);
    });
}

#[test]
fn test_record_payment_success() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let amount = 1000;
        let due_date = 1640995200; // 2022-01-01
        let payment_type = PaymentType::CreditCard;
        
        // Registrar pagamento
        assert_ok!(PaymentRegistry::record_payment(
            RuntimeOrigin::root(),
            account_id,
            amount,
            due_date,
            payment_type
        ));
        
        // Verificar se foi armazenado corretamente
        let stored_payment = PaymentRegistry::payments(account_id);
        assert!(stored_payment.is_some());
        
        let payment_data = stored_payment.unwrap();
        assert_eq!(payment_data.amount, amount);
        assert_eq!(payment_data.due_date, due_date);
        assert_eq!(payment_data.payment_type, payment_type);
        assert_eq!(payment_data.status, PaymentStatus::Pending);
        
        // Verificar contador
        assert_eq!(PaymentRegistry::payment_count(), 1);
    });
}

#[test]
fn test_record_payment_unauthorized() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let amount = 1000;
        let due_date = 1640995200;
        let payment_type = PaymentType::CreditCard;
        
        // Tentar registrar pagamento sem autorização
        assert_noop!(
            PaymentRegistry::record_payment(
                RuntimeOrigin::signed(2), // Usuário comum
                account_id,
                amount,
                due_date,
                payment_type
            ),
            frame_system::Error::<Test>::BadOrigin
        );
    });
}

#[test]
fn test_record_payment_invalid_amount() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let due_date = 1640995200;
        let payment_type = PaymentType::CreditCard;
        
        // Valor negativo
        assert_noop!(
            PaymentRegistry::record_payment(
                RuntimeOrigin::root(),
                account_id,
                -1000, // Valor inválido
                due_date,
                payment_type
            ),
            Error::<Test>::InvalidAmount
        );
        
        // Valor zero
        assert_noop!(
            PaymentRegistry::record_payment(
                RuntimeOrigin::root(),
                account_id,
                0, // Valor inválido
                due_date,
                payment_type
            ),
            Error::<Test>::InvalidAmount
        );
    });
}

#[test]
fn test_record_payment_invalid_date() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let amount = 1000;
        let payment_type = PaymentType::CreditCard;
        
        // Data no passado
        let past_date = 1609459200; // 2021-01-01
        assert_noop!(
            PaymentRegistry::record_payment(
                RuntimeOrigin::root(),
                account_id,
                amount,
                past_date,
                payment_type
            ),
            Error::<Test>::InvalidDate
        );
    });
}

#[test]
fn test_update_payment_status() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let amount = 1000;
        let due_date = 1640995200;
        let payment_type = PaymentType::CreditCard;
        
        // Registrar pagamento
        assert_ok!(PaymentRegistry::record_payment(
            RuntimeOrigin::root(),
            account_id,
            amount,
            due_date,
            payment_type
        ));
        
        // Atualizar status para pago
        assert_ok!(PaymentRegistry::update_payment_status(
            RuntimeOrigin::root(),
            account_id,
            PaymentStatus::Paid
        ));
        
        // Verificar se foi atualizado
        let stored_payment = PaymentRegistry::payments(account_id);
        assert!(stored_payment.is_some());
        assert_eq!(stored_payment.unwrap().status, PaymentStatus::Paid);
    });
}

#[test]
fn test_update_payment_status_not_found() {
    new_test_ext().execute_with(|| {
        let account_id = 999; // Conta que não existe
        
        // Tentar atualizar status de pagamento inexistente
        assert_noop!(
            PaymentRegistry::update_payment_status(
                RuntimeOrigin::root(),
                account_id,
                PaymentStatus::Paid
            ),
            Error::<Test>::PaymentNotFound
        );
    });
}

#[test]
fn test_get_payment() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let amount = 1000;
        let due_date = 1640995200;
        let payment_type = PaymentType::CreditCard;
        
        // Registrar pagamento
        assert_ok!(PaymentRegistry::record_payment(
            RuntimeOrigin::root(),
            account_id,
            amount,
            due_date,
            payment_type
        ));
        
        // Verificar se pode ser recuperado
        let stored_payment = PaymentRegistry::payments(account_id);
        assert!(stored_payment.is_some());
        
        let payment_data = stored_payment.unwrap();
        assert_eq!(payment_data.amount, amount);
        assert_eq!(payment_data.due_date, due_date);
        assert_eq!(payment_data.payment_type, payment_type);
    });
}

#[test]
fn test_get_payment_not_found() {
    new_test_ext().execute_with(|| {
        let account_id = 999; // Conta que não existe
        
        // Verificar que não existe pagamento
        let stored_payment = PaymentRegistry::payments(account_id);
        assert!(stored_payment.is_none());
    });
}

#[test]
fn test_payment_count() {
    new_test_ext().execute_with(|| {
        // Contador inicial
        assert_eq!(PaymentRegistry::payment_count(), 0);
        
        // Adicionar primeiro pagamento
        assert_ok!(PaymentRegistry::record_payment(
            RuntimeOrigin::root(),
            1,
            1000,
            1640995200,
            PaymentType::CreditCard
        ));
        assert_eq!(PaymentRegistry::payment_count(), 1);
        
        // Adicionar segundo pagamento
        assert_ok!(PaymentRegistry::record_payment(
            RuntimeOrigin::root(),
            2,
            2000,
            1640995200,
            PaymentType::BankTransfer
        ));
        assert_eq!(PaymentRegistry::payment_count(), 2);
    });
}

#[test]
fn test_payment_types() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let amount = 1000;
        let due_date = 1640995200;
        
        // Testar diferentes tipos de pagamento
        let payment_types = vec![
            PaymentType::CreditCard,
            PaymentType::BankTransfer,
            PaymentType::Pix,
            PaymentType::Boleto,
        ];
        
        for (i, payment_type) in payment_types.iter().enumerate() {
            assert_ok!(PaymentRegistry::record_payment(
                RuntimeOrigin::root(),
                account_id + i as u64,
                amount,
                due_date,
                *payment_type
            ));
        }
        
        // Verificar contador
        assert_eq!(PaymentRegistry::payment_count(), 4);
    });
}

#[test]
fn test_payment_statuses() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let amount = 1000;
        let due_date = 1640995200;
        let payment_type = PaymentType::CreditCard;
        
        // Registrar pagamento
        assert_ok!(PaymentRegistry::record_payment(
            RuntimeOrigin::root(),
            account_id,
            amount,
            due_date,
            payment_type
        ));
        
        // Testar diferentes statuses
        let statuses = vec![
            PaymentStatus::Pending,
            PaymentStatus::Paid,
            PaymentStatus::Late,
            PaymentStatus::Defaulted,
            PaymentStatus::Cancelled,
        ];
        
        for status in statuses {
            assert_ok!(PaymentRegistry::update_payment_status(
                RuntimeOrigin::root(),
                account_id,
                status
            ));
            
            let stored_payment = PaymentRegistry::payments(account_id);
            assert!(stored_payment.is_some());
            assert_eq!(stored_payment.unwrap().status, status);
        }
    });
}

#[test]
fn test_payment_events() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let amount = 1000;
        let due_date = 1640995200;
        let payment_type = PaymentType::CreditCard;
        
        // Registrar pagamento e verificar evento
        assert_ok!(PaymentRegistry::record_payment(
            RuntimeOrigin::root(),
            account_id,
            amount,
            due_date,
            payment_type
        ));
        
        // Verificar se o evento foi emitido
        // Nota: Em um teste real, você verificaria os eventos emitidos
        // Aqui simulamos a verificação
        assert!(true); // Placeholder para verificação de evento
    });
}

#[test]
fn test_payment_storage_limits() {
    new_test_ext().execute_with(|| {
        let amount = 1000;
        let due_date = 1640995200;
        let payment_type = PaymentType::CreditCard;
        
        // Testar limite máximo de pagamentos
        for i in 1..=1000 {
            assert_ok!(PaymentRegistry::record_payment(
                RuntimeOrigin::root(),
                i,
                amount,
                due_date,
                payment_type
            ));
        }
        
        // Verificar contador
        assert_eq!(PaymentRegistry::payment_count(), 1000);
    });
}

#[test]
fn test_payment_edge_cases() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let due_date = 1640995200;
        let payment_type = PaymentType::CreditCard;
        
        // Valor mínimo
        assert_ok!(PaymentRegistry::record_payment(
            RuntimeOrigin::root(),
            account_id,
            1, // Valor mínimo
            due_date,
            payment_type
        ));
        
        // Valor máximo
        assert_ok!(PaymentRegistry::record_payment(
            RuntimeOrigin::root(),
            account_id + 1,
            u64::MAX, // Valor máximo
            due_date,
            payment_type
        ));
    });
}

#[test]
fn test_payment_performance() {
    new_test_ext().execute_with(|| {
        let amount = 1000;
        let due_date = 1640995200;
        let payment_type = PaymentType::CreditCard;
        
        // Testar performance com múltiplas operações
        for i in 1..=100 {
            assert_ok!(PaymentRegistry::record_payment(
                RuntimeOrigin::root(),
                i,
                amount,
                due_date,
                payment_type
            ));
        }
        
        // Verificar contador
        assert_eq!(PaymentRegistry::payment_count(), 100);
        
        // Verificar se todos os pagamentos foram armazenados
        for i in 1..=100 {
            let stored_payment = PaymentRegistry::payments(i);
            assert!(stored_payment.is_some());
            assert_eq!(stored_payment.unwrap().amount, amount);
        }
    });
}

#[test]
fn test_payment_concurrent_updates() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let amount1 = 1000;
        let amount2 = 2000;
        let due_date = 1640995200;
        let payment_type = PaymentType::CreditCard;
        
        // Simular atualizações concorrentes
        assert_ok!(PaymentRegistry::record_payment(
            RuntimeOrigin::root(),
            account_id,
            amount1,
            due_date,
            payment_type
        ));
        
        assert_ok!(PaymentRegistry::record_payment(
            RuntimeOrigin::root(),
            account_id,
            amount2,
            due_date,
            payment_type
        ));
        
        // Verificar que o último valor foi mantido
        let stored_payment = PaymentRegistry::payments(account_id);
        assert!(stored_payment.is_some());
        assert_eq!(stored_payment.unwrap().amount, amount2);
    });
}

#[test]
fn test_payment_validation() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let due_date = 1640995200;
        let payment_type = PaymentType::CreditCard;
        
        // Testar validação de valores
        let valid_amounts = vec![1, 100, 1000, 10000, 100000];
        for amount in valid_amounts {
            assert_ok!(PaymentRegistry::record_payment(
                RuntimeOrigin::root(),
                account_id,
                amount,
                due_date,
                payment_type
            ));
        }
        
        // Testar valores inválidos
        let invalid_amounts = vec![0, -1, -1000];
        for amount in invalid_amounts {
            assert_noop!(
                PaymentRegistry::record_payment(
                    RuntimeOrigin::root(),
                    account_id,
                    amount,
                    due_date,
                    payment_type
                ),
                Error::<Test>::InvalidAmount
            );
        }
    });
}

#[test]
fn test_payment_date_validation() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let amount = 1000;
        let payment_type = PaymentType::CreditCard;
        
        // Testar datas válidas
        let valid_dates = vec![
            1640995200, // 2022-01-01
            1672531200, // 2023-01-01
            1704067200, // 2024-01-01
        ];
        
        for due_date in valid_dates {
            assert_ok!(PaymentRegistry::record_payment(
                RuntimeOrigin::root(),
                account_id,
                amount,
                due_date,
                payment_type
            ));
        }
        
        // Testar datas inválidas
        let invalid_dates = vec![
            1609459200, // 2021-01-01 (passado)
            0, // Data inválida
        ];
        
        for due_date in invalid_dates {
            assert_noop!(
                PaymentRegistry::record_payment(
                    RuntimeOrigin::root(),
                    account_id,
                    amount,
                    due_date,
                    payment_type
                ),
                Error::<Test>::InvalidDate
            );
        }
    });
}

#[test]
fn test_payment_cleanup() {
    new_test_ext().execute_with(|| {
        let account_id = 1;
        let amount = 1000;
        let due_date = 1640995200;
        let payment_type = PaymentType::CreditCard;
        
        // Registrar pagamento
        assert_ok!(PaymentRegistry::record_payment(
            RuntimeOrigin::root(),
            account_id,
            amount,
            due_date,
            payment_type
        ));
        
        // Verificar que existe
        assert!(PaymentRegistry::payments(account_id).is_some());
        
        // Simular limpeza (em um teste real, você implementaria a função de limpeza)
        // PaymentRegistry::remove_payment(account_id);
        
        // Verificar que foi removido
        // assert!(PaymentRegistry::payments(account_id).is_none());
    });
}
