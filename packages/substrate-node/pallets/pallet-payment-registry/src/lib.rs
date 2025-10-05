#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::pallet_prelude::*;
    use frame_system::pallet_prelude::*;
    use sp_std::prelude::*;
    use sp_runtime::traits::Hash;

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        type WeightInfo: WeightInfo;
        
        /// Maximum number of payments per user
        #[pallet::constant]
        type MaxPaymentsPerUser: Get<u32>;
        
        /// Maximum payment amount
        #[pallet::constant]
        type MaxPaymentAmount: Get<u128>;
        
        /// Minimum payment amount
        #[pallet::constant]
        type MinPaymentAmount: Get<u128>;
        
        /// Payment verification period (in blocks)
        #[pallet::constant]
        type PaymentVerificationPeriod: Get<u32>;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    /// Payment status enumeration
    #[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug, TypeInfo)]
    pub enum PaymentStatus {
        Pending,
        Verified,
        Completed,
        Failed,
        Disputed,
    }

    /// Payment record structure
    #[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug, TypeInfo)]
    pub struct PaymentRecord<T: Config> {
        pub id: u64,
        pub payer: T::AccountId,
        pub payee: T::AccountId,
        pub amount: u128,
        pub currency: Vec<u8>,
        pub description: Vec<u8>,
        pub status: PaymentStatus,
        pub created_at: u64,
        pub verified_at: Option<u64>,
        pub completed_at: Option<u64>,
        pub transaction_hash: Option<Vec<u8>>,
        pub metadata: Vec<u8>,
    }

    /// Storage: Payment counter
    #[pallet::storage]
    #[pallet::getter(fn payment_counter)]
    pub type PaymentCounter<T: Config> = StorageValue<_, u64, ValueQuery>;

    /// Storage: Payments by ID
    #[pallet::storage]
    #[pallet::getter(fn payments)]
    pub type Payments<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        u64,
        PaymentRecord<T>,
    >;

    /// Storage: User payments
    #[pallet::storage]
    #[pallet::getter(fn user_payments)]
    pub type UserPayments<T: Config> = StorageDoubleMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        Blake2_128Concat,
        u64,
        (),
    >;

    /// Storage: Payment verification queue
    #[pallet::storage]
    #[pallet::getter(fn verification_queue)]
    pub type VerificationQueue<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        u64,
        u64,
    >;

    /// Storage: Payment statistics
    #[pallet::storage]
    #[pallet::getter(fn payment_stats)]
    pub type PaymentStats<T: Config> = StorageValue<_, PaymentStatistics, ValueQuery>;

    /// Payment statistics structure
    #[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug, TypeInfo, Default)]
    pub struct PaymentStatistics {
        pub total_payments: u64,
        pub total_volume: u128,
        pub successful_payments: u64,
        pub failed_payments: u64,
        pub disputed_payments: u64,
    }

    #[pallet::event]
    #[pallet::generate_deposit(pub fn deposit_event)]
    pub enum Event<T: Config> {
        /// Payment created
        PaymentCreated {
            payment_id: u64,
            payer: T::AccountId,
            payee: T::AccountId,
            amount: u128,
        },
        /// Payment verified
        PaymentVerified {
            payment_id: u64,
            verifier: T::AccountId,
        },
        /// Payment completed
        PaymentCompleted {
            payment_id: u64,
            transaction_hash: Vec<u8>,
        },
        /// Payment failed
        PaymentFailed {
            payment_id: u64,
            reason: Vec<u8>,
        },
        /// Payment disputed
        PaymentDisputed {
            payment_id: u64,
            disputer: T::AccountId,
            reason: Vec<u8>,
        },
        /// Payment dispute resolved
        PaymentDisputeResolved {
            payment_id: u64,
            resolution: Vec<u8>,
        },
    }

    #[pallet::error]
    pub enum Error<T> {
        /// Payment amount too low
        AmountTooLow,
        /// Payment amount too high
        AmountTooHigh,
        /// Payment not found
        PaymentNotFound,
        /// Payment already exists
        PaymentAlreadyExists,
        /// Invalid payment status
        InvalidPaymentStatus,
        /// User has too many payments
        TooManyPayments,
        /// Payment verification failed
        VerificationFailed,
        /// Payment already verified
        AlreadyVerified,
        /// Payment already completed
        AlreadyCompleted,
        /// Payment already failed
        AlreadyFailed,
        /// Insufficient permissions
        InsufficientPermissions,
        /// Invalid transaction hash
        InvalidTransactionHash,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        /// Create a new payment
        #[pallet::weight(10_000)]
        #[pallet::call_index(0)]
        pub fn create_payment(
            origin: OriginFor<T>,
            payee: T::AccountId,
            amount: u128,
            currency: Vec<u8>,
            description: Vec<u8>,
            metadata: Vec<u8>,
        ) -> DispatchResult {
            let payer = ensure_signed(origin)?;

            // Validate amount
            ensure!(amount >= T::MinPaymentAmount::get(), Error::<T>::AmountTooLow);
            ensure!(amount <= T::MaxPaymentAmount::get(), Error::<T>::AmountTooHigh);

            // Check user payment limit
            let user_payment_count = UserPayments::<T>::iter_prefix(&payer).count() as u32;
            ensure!(user_payment_count < T::MaxPaymentsPerUser::get(), Error::<T>::TooManyPayments);

            // Generate payment ID
            let payment_id = PaymentCounter::<T>::get() + 1;
            PaymentCounter::<T>::put(payment_id);

            // Create payment record
            let payment = PaymentRecord {
                id: payment_id,
                payer: payer.clone(),
                payee: payee.clone(),
                amount,
                currency,
                description,
                status: PaymentStatus::Pending,
                created_at: <frame_system::Pallet<T>>::block_number().saturated_into(),
                verified_at: None,
                completed_at: None,
                transaction_hash: None,
                metadata,
            };

            // Store payment
            Payments::<T>::insert(payment_id, &payment);
            UserPayments::<T>::insert(&payer, payment_id, ());

            // Add to verification queue
            VerificationQueue::<T>::insert(payment_id, <frame_system::Pallet<T>>::block_number().saturated_into());

            // Update statistics
            let mut stats = PaymentStats::<T>::get();
            stats.total_payments += 1;
            stats.total_volume += amount;
            PaymentStats::<T>::put(stats);

            Self::deposit_event(Event::PaymentCreated {
                payment_id,
                payer,
                payee,
                amount,
            });

            Ok(())
        }

        /// Verify a payment
        #[pallet::weight(10_000)]
        #[pallet::call_index(1)]
        pub fn verify_payment(
            origin: OriginFor<T>,
            payment_id: u64,
            transaction_hash: Vec<u8>,
        ) -> DispatchResult {
            let verifier = ensure_signed(origin)?;

            // Get payment
            let mut payment = Payments::<T>::get(payment_id)
                .ok_or(Error::<T>::PaymentNotFound)?;

            // Check payment status
            ensure!(payment.status == PaymentStatus::Pending, Error::<T>::InvalidPaymentStatus);

            // Update payment
            payment.status = PaymentStatus::Verified;
            payment.verified_at = Some(<frame_system::Pallet<T>>::block_number().saturated_into());
            payment.transaction_hash = Some(transaction_hash);

            // Store updated payment
            Payments::<T>::insert(payment_id, &payment);

            // Remove from verification queue
            VerificationQueue::<T>::remove(payment_id);

            Self::deposit_event(Event::PaymentVerified {
                payment_id,
                verifier,
            });

            Ok(())
        }

        /// Complete a payment
        #[pallet::weight(10_000)]
        #[pallet::call_index(2)]
        pub fn complete_payment(
            origin: OriginFor<T>,
            payment_id: u64,
        ) -> DispatchResult {
            let _completer = ensure_signed(origin)?;

            // Get payment
            let mut payment = Payments::<T>::get(payment_id)
                .ok_or(Error::<T>::PaymentNotFound)?;

            // Check payment status
            ensure!(payment.status == PaymentStatus::Verified, Error::<T>::InvalidPaymentStatus);

            // Update payment
            payment.status = PaymentStatus::Completed;
            payment.completed_at = Some(<frame_system::Pallet<T>>::block_number().saturated_into());

            // Store updated payment
            Payments::<T>::insert(payment_id, &payment);

            // Update statistics
            let mut stats = PaymentStats::<T>::get();
            stats.successful_payments += 1;
            PaymentStats::<T>::put(stats);

            Self::deposit_event(Event::PaymentCompleted {
                payment_id,
                transaction_hash: payment.transaction_hash.unwrap_or_default(),
            });

            Ok(())
        }

        /// Mark payment as failed
        #[pallet::weight(10_000)]
        #[pallet::call_index(3)]
        pub fn fail_payment(
            origin: OriginFor<T>,
            payment_id: u64,
            reason: Vec<u8>,
        ) -> DispatchResult {
            let _filer = ensure_signed(origin)?;

            // Get payment
            let mut payment = Payments::<T>::get(payment_id)
                .ok_or(Error::<T>::PaymentNotFound)?;

            // Check payment status
            ensure!(payment.status == PaymentStatus::Pending || payment.status == PaymentStatus::Verified, 
                Error::<T>::InvalidPaymentStatus);

            // Update payment
            payment.status = PaymentStatus::Failed;

            // Store updated payment
            Payments::<T>::insert(payment_id, &payment);

            // Update statistics
            let mut stats = PaymentStats::<T>::get();
            stats.failed_payments += 1;
            PaymentStats::<T>::put(stats);

            Self::deposit_event(Event::PaymentFailed {
                payment_id,
                reason,
            });

            Ok(())
        }

        /// Dispute a payment
        #[pallet::weight(10_000)]
        #[pallet::call_index(4)]
        pub fn dispute_payment(
            origin: OriginFor<T>,
            payment_id: u64,
            reason: Vec<u8>,
        ) -> DispatchResult {
            let disputer = ensure_signed(origin)?;

            // Get payment
            let mut payment = Payments::<T>::get(payment_id)
                .ok_or(Error::<T>::PaymentNotFound)?;

            // Check if disputer is payer or payee
            ensure!(payment.payer == disputer || payment.payee == disputer, 
                Error::<T>::InsufficientPermissions);

            // Check payment status
            ensure!(payment.status == PaymentStatus::Verified || payment.status == PaymentStatus::Completed, 
                Error::<T>::InvalidPaymentStatus);

            // Update payment
            payment.status = PaymentStatus::Disputed;

            // Store updated payment
            Payments::<T>::insert(payment_id, &payment);

            // Update statistics
            let mut stats = PaymentStats::<T>::get();
            stats.disputed_payments += 1;
            PaymentStats::<T>::put(stats);

            Self::deposit_event(Event::PaymentDisputed {
                payment_id,
                disputer,
                reason,
            });

            Ok(())
        }

        /// Resolve payment dispute
        #[pallet::weight(10_000)]
        #[pallet::call_index(5)]
        pub fn resolve_dispute(
            origin: OriginFor<T>,
            payment_id: u64,
            resolution: Vec<u8>,
        ) -> DispatchResult {
            let _resolver = ensure_signed(origin)?;

            // Get payment
            let mut payment = Payments::<T>::get(payment_id)
                .ok_or(Error::<T>::PaymentNotFound)?;

            // Check payment status
            ensure!(payment.status == PaymentStatus::Disputed, Error::<T>::InvalidPaymentStatus);

            // Update payment based on resolution
            // This would need more complex logic based on resolution type
            payment.status = PaymentStatus::Completed;

            // Store updated payment
            Payments::<T>::insert(payment_id, &payment);

            Self::deposit_event(Event::PaymentDisputeResolved {
                payment_id,
                resolution,
            });

            Ok(())
        }
    }

    #[pallet::hooks]
    impl<T: Config> Hooks<BlockNumberFor<T>> for Pallet<T> {
        fn on_initialize(_n: BlockNumberFor<T>) -> Weight {
            // Process verification queue
            Self::process_verification_queue()
        }
    }

    impl<T: Config> Pallet<T> {
        /// Process verification queue
        fn process_verification_queue() -> Weight {
            let current_block = <frame_system::Pallet<T>>::block_number().saturated_into();
            let verification_period = T::PaymentVerificationPeriod::get();

            let mut processed = 0;
            let mut weight = 0;

            for (payment_id, queued_at) in VerificationQueue::<T>::iter() {
                if current_block - queued_at > verification_period {
                    // Auto-verify payment after verification period
                    if let Some(mut payment) = Payments::<T>::get(payment_id) {
                        if payment.status == PaymentStatus::Pending {
                            payment.status = PaymentStatus::Verified;
                            payment.verified_at = Some(current_block);
                            Payments::<T>::insert(payment_id, &payment);
                            VerificationQueue::<T>::remove(payment_id);
                            processed += 1;
                        }
                    }
                }
                weight += 1;
            }

            Weight::from_parts(weight, 0)
        }
    }

    #[pallet::genesis_config]
    pub struct GenesisConfig<T: Config> {
        pub payment_counter: u64,
        pub payment_stats: PaymentStatistics,
    }

    #[cfg(feature = "std")]
    impl<T: Config> Default for GenesisConfig<T> {
        fn default() -> Self {
            Self {
                payment_counter: 0,
                payment_stats: PaymentStatistics::default(),
            }
        }
    }

    #[pallet::genesis_build]
    impl<T: Config> GenesisBuild<T> for GenesisConfig<T> {
        fn build(&self) {
            PaymentCounter::<T>::put(self.payment_counter);
            PaymentStats::<T>::put(&self.payment_stats);
        }
    }

    pub trait WeightInfo {
        fn create_payment() -> Weight;
        fn verify_payment() -> Weight;
        fn complete_payment() -> Weight;
        fn fail_payment() -> Weight;
        fn dispute_payment() -> Weight;
        fn resolve_dispute() -> Weight;
    }

    impl WeightInfo for () {
        fn create_payment() -> Weight {
            Weight::from_parts(10_000, 0)
        }
        fn verify_payment() -> Weight {
            Weight::from_parts(10_000, 0)
        }
        fn complete_payment() -> Weight {
            Weight::from_parts(10_000, 0)
        }
        fn fail_payment() -> Weight {
            Weight::from_parts(10_000, 0)
        }
        fn dispute_payment() -> Weight {
            Weight::from_parts(10_000, 0)
        }
        fn resolve_dispute() -> Weight {
            Weight::from_parts(10_000, 0)
        }
    }
}
