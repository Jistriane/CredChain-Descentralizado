#![cfg_attr(not(feature = "std"), no_std)]

//! CredChain Runtime
//! 
//! Runtime principal do CredChain que integra todos os pallets customizados
//! para o sistema de credit scoring descentralizado.

pub mod constants;
pub mod currency;

use frame_support::{
    construct_runtime, parameter_types,
    traits::{ConstU32, ConstU64, ConstU128, Everything},
    weights::Weight,
};
use frame_system as system;
use sp_core::H256;
use sp_runtime::{
    traits::{BlakeTwo256, IdentityLookup},
    BuildStorage, Perbill,
};

// Importa os pallets customizados
use pallet_credit_score;
use pallet_payment_registry;
use pallet_identity_verification;
use pallet_oracle_integration;

/// Configuração do sistema
pub type Block = frame_system::mocking::MockBlock<Runtime>;
pub type AccountId = sp_core::crypto::AccountId32;
pub type Balance = u128;
pub type BlockNumber = u32;
pub type Hash = H256;

/// Configuração do runtime
#[derive_impl(frame_system::config_preludes::TestDefaultConfig as frame_system::DefaultConfig)]
impl system::Config for Runtime {
    type BaseCallFilter = Everything;
    type BlockWeights = ();
    type BlockLength = ();
    type DbWeight = ();
    type RuntimeOrigin = RuntimeOrigin;
    type RuntimeCall = RuntimeCall;
    type Nonce = u32;
    type Hash = Hash;
    type Hashing = BlakeTwo256;
    type AccountId = AccountId;
    type Lookup = IdentityLookup<Self::AccountId>;
    type Block = Block;
    type RuntimeEvent = RuntimeEvent;
    type BlockHashCount = ConstU64<250>;
    type Version = ();
    type PalletInfo = PalletInfo;
    type AccountData = pallet_balances::AccountData<Balance>;
    type OnNewAccount = ();
    type OnKilledAccount = ();
    type SystemWeightInfo = ();
    type SS58Prefix = ();
    type OnSetCode = ();
    type MaxConsumers = ConstU32<16>;
}

/// Configuração do pallet Balances
impl pallet_balances::Config for Runtime {
    type MaxLocks = ConstU32<50>;
    type MaxReserves = ();
    type ReserveIdentifier = [u8; 8];
    type Balance = Balance;
    type RuntimeEvent = RuntimeEvent;
    type DustRemoval = ();
    type ExistentialDeposit = ConstU128<500>;
    type AccountStore = System;
    type WeightInfo = ();
    type FreezeIdentifier = ();
    type MaxFreezes = ();
    type RuntimeHoldReason = ();
    type RuntimeFreezeReason = ();
}

/// Configuração do pallet Timestamp
impl pallet_timestamp::Config for Runtime {
    type Moment = u64;
    type OnTimestampSet = ();
    type MinimumPeriod = ConstU64<5>;
    type WeightInfo = ();
}

/// Configuração do pallet Aura
impl pallet_aura::Config for Runtime {
    type AuthorityId = sp_consensus_aura::sr25519::AuthorityId;
    type DisabledValidators = ();
    type MaxAuthorities = ConstU32<32>;
    type AllowMultipleBlocksPerSlot = ();
}

/// Configuração do pallet Grandpa
impl pallet_grandpa::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type WeightInfo = ();
    type MaxAuthorities = ConstU32<32>;
    type MaxNominators = ConstU32<100>;
    type MaxSetIdSessionEntries = ConstU32<0>;
    type KeyOwnerProof = sp_core::Void;
    type EquivocationReportSystem = ();
}

/// Configuração do pallet Randomness
impl pallet_randomness_collective_flip::Config for Runtime {}

/// Configuração do pallet Session
impl pallet_session::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type ValidatorId = <Self as frame_system::Config>::AccountId;
    type ValidatorIdOf = pallet_session::historical::IdentityValidatorIdOf<Self>;
    type ShouldEndSession = pallet_session::PeriodicSessions<ConstU64<1>, ConstU64<0>, ()>;
    type NextSessionRotation = pallet_session::PeriodicSessions<ConstU64<1>, ConstU64<0>, ()>;
    type SessionManager = ();
    type SessionHandler = ();
    type Keys = pallet_session::historical::Keys<Self>;
    type WeightInfo = ();
    type DisabledValidatorsThreshold = ();
}

/// Configuração do pallet Sudo
impl pallet_sudo::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type RuntimeCall = RuntimeCall;
    type WeightInfo = ();
}

/// Configuração do pallet Transaction Payment
impl pallet_transaction_payment::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type OnChargeTransaction = pallet_transaction_payment::CurrencyAdapter<Balances, ()>;
    type OperationalFeeMultiplier = ConstU8<5>;
    type WeightToFee = ();
    type LengthToFee = ();
    type FeeMultiplierUpdate = ();
}

/// Configuração do pallet Credit Score
impl pallet_credit_score::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type WeightInfo = ();
    type MinScore = ConstU32<0>;
    type MaxScore = ConstU32<1000>;
    type MaxScoreFactors = ConstU32<10>;
    type Randomness = pallet_randomness_collective_flip::RandomnessCollectiveFlip<Runtime>;
}

/// Configuração do pallet Payment Registry
impl pallet_payment_registry::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type WeightInfo = ();
    type MaxPaymentHistory = ConstU32<1000>;
    type MaxPaymentAmount = ConstU128<1_000_000_000_000>;
}

/// Configuração do pallet Identity Verification
impl pallet_identity_verification::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type WeightInfo = ();
    type MaxVerificationAttempts = ConstU32<3>;
    type VerificationTimeout = ConstU64<86400>; // 24 horas
}

/// Configuração do pallet Oracle Integration
impl pallet_oracle_integration::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type WeightInfo = ();
    type MaxOracleSources = ConstU32<10>;
    type OracleTimeout = ConstU64<300>; // 5 minutos
}

/// Construção do runtime
construct_runtime!(
    pub enum Runtime
    {
        System: frame_system,
        Timestamp: pallet_timestamp,
        Aura: pallet_aura,
        Grandpa: pallet_grandpa,
        Balances: pallet_balances,
        TransactionPayment: pallet_transaction_payment,
        Sudo: pallet_sudo,
        RandomnessCollectiveFlip: pallet_randomness_collective_flip,
        Session: pallet_session,
        
        // CredChain Custom Pallets
        CreditScore: pallet_credit_score,
        PaymentRegistry: pallet_payment_registry,
        IdentityVerification: pallet_identity_verification,
        OracleIntegration: pallet_oracle_integration,
    }
);

/// Constantes do runtime
pub mod constants {
    use super::*;
    
    /// Saldo mínimo para uma conta
    pub const EXISTENTIAL_DEPOSIT: Balance = 500;
    
    /// Score mínimo permitido
    pub const MIN_SCORE: u32 = 0;
    
    /// Score máximo permitido
    pub const MAX_SCORE: u32 = 1000;
    
    /// Número máximo de fatores de score
    pub const MAX_SCORE_FACTORS: u32 = 10;
    
    /// Número máximo de tentativas de verificação
    pub const MAX_VERIFICATION_ATTEMPTS: u32 = 3;
    
    /// Timeout para verificação (em segundos)
    pub const VERIFICATION_TIMEOUT: u64 = 86400; // 24 horas
}

/// Configuração de moeda
pub mod currency {
    use super::*;
    
    /// Unidade base da moeda
    pub const UNIT: Balance = 1_000_000_000_000;
    
    /// Cents (1/100 da unidade)
    pub const CENTS: Balance = UNIT / 100;
    
    /// Millicents (1/1000 da unidade)
    pub const MILLICENTS: Balance = UNIT / 1_000;
    
    /// Microcents (1/1_000_000 da unidade)
    pub const MICROCENTS: Balance = UNIT / 1_000_000;
}
