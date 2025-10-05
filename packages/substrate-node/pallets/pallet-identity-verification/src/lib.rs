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
        
        /// Maximum number of identity documents per user
        #[pallet::constant]
        type MaxDocumentsPerUser: Get<u32>;
        
        /// Identity verification timeout (in blocks)
        #[pallet::constant]
        type VerificationTimeout: Get<u32>;
        
        /// Required verification level
        #[pallet::constant]
        type RequiredVerificationLevel: Get<u8>;
    }

    #[pallet::pallet]
    pub struct Pallet<T>(_);

    /// Identity verification status
    #[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug, TypeInfo)]
    pub enum VerificationStatus {
        Pending,
        Verified,
        Rejected,
        Expired,
    }

    /// Identity document types
    #[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug, TypeInfo)]
    pub enum DocumentType {
        CPF,
        CNH,
        RG,
        Passport,
        BirthCertificate,
        AddressProof,
        IncomeProof,
    }

    /// Identity document structure
    #[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug, TypeInfo)]
    pub struct IdentityDocument<T: Config> {
        pub id: u64,
        pub user: T::AccountId,
        pub document_type: DocumentType,
        pub document_number: Vec<u8>,
        pub document_hash: Vec<u8>,
        pub status: VerificationStatus,
        pub submitted_at: u64,
        pub verified_at: Option<u64>,
        pub verified_by: Option<T::AccountId>,
        pub metadata: Vec<u8>,
    }

    /// User identity profile
    #[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug, TypeInfo)]
    pub struct IdentityProfile<T: Config> {
        pub user: T::AccountId,
        pub verification_level: u8,
        pub documents: Vec<u64>,
        pub kyc_status: VerificationStatus,
        pub created_at: u64,
        pub updated_at: u64,
    }

    /// Storage: Document counter
    #[pallet::storage]
    #[pallet::getter(fn document_counter)]
    pub type DocumentCounter<T: Config> = StorageValue<_, u64, ValueQuery>;

    /// Storage: Identity documents
    #[pallet::storage]
    #[pallet::getter(fn documents)]
    pub type Documents<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        u64,
        IdentityDocument<T>,
    >;

    /// Storage: User identity profiles
    #[pallet::storage]
    #[pallet::getter(fn identity_profiles)]
    pub type IdentityProfiles<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        IdentityProfile<T>,
    >;

    /// Storage: User documents
    #[pallet::storage]
    #[pallet::getter(fn user_documents)]
    pub type UserDocuments<T: Config> = StorageDoubleMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        Blake2_128Concat,
        u64,
        (),
    >;

    /// Storage: Verification queue
    #[pallet::storage]
    #[pallet::getter(fn verification_queue)]
    pub type VerificationQueue<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        u64,
        u64,
    >;

    /// Storage: Identity statistics
    #[pallet::storage]
    #[pallet::getter(fn identity_stats)]
    pub type IdentityStats<T: Config> = StorageValue<_, IdentityStatistics, ValueQuery>;

    /// Identity statistics structure
    #[derive(Encode, Decode, Clone, PartialEq, Eq, RuntimeDebug, TypeInfo, Default)]
    pub struct IdentityStatistics {
        pub total_documents: u64,
        pub verified_documents: u64,
        pub rejected_documents: u64,
        pub pending_documents: u64,
        pub total_users: u32,
        pub verified_users: u32,
    }

    #[pallet::event]
    #[pallet::generate_deposit(pub fn deposit_event)]
    pub enum Event<T: Config> {
        /// Document submitted
        DocumentSubmitted {
            document_id: u64,
            user: T::AccountId,
            document_type: DocumentType,
        },
        /// Document verified
        DocumentVerified {
            document_id: u64,
            verifier: T::AccountId,
        },
        /// Document rejected
        DocumentRejected {
            document_id: u64,
            verifier: T::AccountId,
            reason: Vec<u8>,
        },
        /// Identity profile updated
        IdentityProfileUpdated {
            user: T::AccountId,
            verification_level: u8,
        },
        /// KYC status changed
        KYCStatusChanged {
            user: T::AccountId,
            status: VerificationStatus,
        },
    }

    #[pallet::error]
    pub enum Error<T> {
        /// Document not found
        DocumentNotFound,
        /// Document already exists
        DocumentAlreadyExists,
        /// Invalid document type
        InvalidDocumentType,
        /// Invalid verification level
        InvalidVerificationLevel,
        /// Document already verified
        AlreadyVerified,
        /// Document already rejected
        AlreadyRejected,
        /// Insufficient permissions
        InsufficientPermissions,
        /// User has too many documents
        TooManyDocuments,
        /// Verification timeout
        VerificationTimeout,
        /// Invalid document hash
        InvalidDocumentHash,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        /// Submit identity document
        #[pallet::weight(10_000)]
        #[pallet::call_index(0)]
        pub fn submit_document(
            origin: OriginFor<T>,
            document_type: DocumentType,
            document_number: Vec<u8>,
            document_hash: Vec<u8>,
            metadata: Vec<u8>,
        ) -> DispatchResult {
            let user = ensure_signed(origin)?;

            // Check user document limit
            let user_document_count = UserDocuments::<T>::iter_prefix(&user).count() as u32;
            ensure!(user_document_count < T::MaxDocumentsPerUser::get(), Error::<T>::TooManyDocuments);

            // Generate document ID
            let document_id = DocumentCounter::<T>::get() + 1;
            DocumentCounter::<T>::put(document_id);

            // Create document record
            let document = IdentityDocument {
                id: document_id,
                user: user.clone(),
                document_type: document_type.clone(),
                document_number,
                document_hash,
                status: VerificationStatus::Pending,
                submitted_at: <frame_system::Pallet<T>>::block_number().saturated_into(),
                verified_at: None,
                verified_by: None,
                metadata,
            };

            // Store document
            Documents::<T>::insert(document_id, &document);
            UserDocuments::<T>::insert(&user, document_id, ());

            // Add to verification queue
            VerificationQueue::<T>::insert(document_id, <frame_system::Pallet<T>>::block_number().saturated_into());

            // Update statistics
            let mut stats = IdentityStats::<T>::get();
            stats.total_documents += 1;
            stats.pending_documents += 1;
            IdentityStats::<T>::put(stats);

            Self::deposit_event(Event::DocumentSubmitted {
                document_id,
                user,
                document_type,
            });

            Ok(())
        }

        /// Verify document
        #[pallet::weight(10_000)]
        #[pallet::call_index(1)]
        pub fn verify_document(
            origin: OriginFor<T>,
            document_id: u64,
        ) -> DispatchResult {
            let verifier = ensure_signed(origin)?;

            // Get document
            let mut document = Documents::<T>::get(document_id)
                .ok_or(Error::<T>::DocumentNotFound)?;

            // Check document status
            ensure!(document.status == VerificationStatus::Pending, Error::<T>::AlreadyVerified);

            // Update document
            document.status = VerificationStatus::Verified;
            document.verified_at = Some(<frame_system::Pallet<T>>::block_number().saturated_into());
            document.verified_by = Some(verifier.clone());

            // Store updated document
            Documents::<T>::insert(document_id, &document);

            // Remove from verification queue
            VerificationQueue::<T>::remove(document_id);

            // Update user identity profile
            Self::update_identity_profile(&document.user)?;

            // Update statistics
            let mut stats = IdentityStats::<T>::get();
            stats.verified_documents += 1;
            stats.pending_documents -= 1;
            IdentityStats::<T>::put(stats);

            Self::deposit_event(Event::DocumentVerified {
                document_id,
                verifier,
            });

            Ok(())
        }

        /// Reject document
        #[pallet::weight(10_000)]
        #[pallet::call_index(2)]
        pub fn reject_document(
            origin: OriginFor<T>,
            document_id: u64,
            reason: Vec<u8>,
        ) -> DispatchResult {
            let verifier = ensure_signed(origin)?;

            // Get document
            let mut document = Documents::<T>::get(document_id)
                .ok_or(Error::<T>::DocumentNotFound)?;

            // Check document status
            ensure!(document.status == VerificationStatus::Pending, Error::<T>::AlreadyVerified);

            // Update document
            document.status = VerificationStatus::Rejected;
            document.verified_at = Some(<frame_system::Pallet<T>>::block_number().saturated_into());
            document.verified_by = Some(verifier.clone());

            // Store updated document
            Documents::<T>::insert(document_id, &document);

            // Remove from verification queue
            VerificationQueue::<T>::remove(document_id);

            // Update statistics
            let mut stats = IdentityStats::<T>::get();
            stats.rejected_documents += 1;
            stats.pending_documents -= 1;
            IdentityStats::<T>::put(stats);

            Self::deposit_event(Event::DocumentRejected {
                document_id,
                verifier,
                reason,
            });

            Ok(())
        }

        /// Update identity profile
        #[pallet::weight(10_000)]
        #[pallet::call_index(3)]
        pub fn update_identity_profile(
            origin: OriginFor<T>,
        ) -> DispatchResult {
            let user = ensure_signed(origin)?;
            Self::update_identity_profile(&user)?;
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
        /// Update user identity profile
        fn update_identity_profile(user: &T::AccountId) -> DispatchResult {
            let user_documents = UserDocuments::<T>::iter_prefix(user)
                .map(|(_, doc_id)| doc_id)
                .collect::<Vec<_>>();

            let mut verified_count = 0;
            let mut verification_level = 0u8;

            for doc_id in user_documents {
                if let Some(document) = Documents::<T>::get(doc_id) {
                    if document.status == VerificationStatus::Verified {
                        verified_count += 1;
                        verification_level = verification_level.max(match document.document_type {
                            DocumentType::CPF => 1,
                            DocumentType::RG => 1,
                            DocumentType::CNH => 2,
                            DocumentType::Passport => 3,
                            DocumentType::BirthCertificate => 2,
                            DocumentType::AddressProof => 1,
                            DocumentType::IncomeProof => 2,
                        });
                    }
                }
            }

            let kyc_status = if verification_level >= T::RequiredVerificationLevel::get() {
                VerificationStatus::Verified
            } else {
                VerificationStatus::Pending
            };

            let profile = IdentityProfile {
                user: user.clone(),
                verification_level,
                documents: user_documents,
                kyc_status,
                created_at: <frame_system::Pallet<T>>::block_number().saturated_into(),
                updated_at: <frame_system::Pallet<T>>::block_number().saturated_into(),
            };

            IdentityProfiles::<T>::insert(user, &profile);

            Self::deposit_event(Event::IdentityProfileUpdated {
                user: user.clone(),
                verification_level,
            });

            Self::deposit_event(Event::KYCStatusChanged {
                user: user.clone(),
                status: kyc_status,
            });

            Ok(())
        }

        /// Process verification queue
        fn process_verification_queue() -> Weight {
            let current_block = <frame_system::Pallet<T>>::block_number().saturated_into();
            let timeout = T::VerificationTimeout::get();

            let mut processed = 0;
            let mut weight = 0;

            for (document_id, submitted_at) in VerificationQueue::<T>::iter() {
                if current_block - submitted_at > timeout {
                    // Auto-reject document after timeout
                    if let Some(mut document) = Documents::<T>::get(document_id) {
                        if document.status == VerificationStatus::Pending {
                            document.status = VerificationStatus::Expired;
                            Documents::<T>::insert(document_id, &document);
                            VerificationQueue::<T>::remove(document_id);
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
        pub document_counter: u64,
        pub identity_stats: IdentityStatistics,
    }

    #[cfg(feature = "std")]
    impl<T: Config> Default for GenesisConfig<T> {
        fn default() -> Self {
            Self {
                document_counter: 0,
                identity_stats: IdentityStatistics::default(),
            }
        }
    }

    #[pallet::genesis_build]
    impl<T: Config> GenesisBuild<T> for GenesisConfig<T> {
        fn build(&self) {
            DocumentCounter::<T>::put(self.document_counter);
            IdentityStats::<T>::put(&self.identity_stats);
        }
    }

    pub trait WeightInfo {
        fn submit_document() -> Weight;
        fn verify_document() -> Weight;
        fn reject_document() -> Weight;
        fn update_identity_profile() -> Weight;
    }

    impl WeightInfo for () {
        fn submit_document() -> Weight {
            Weight::from_parts(10_000, 0)
        }
        fn verify_document() -> Weight {
            Weight::from_parts(10_000, 0)
        }
        fn reject_document() -> Weight {
            Weight::from_parts(10_000, 0)
        }
        fn update_identity_profile() -> Weight {
            Weight::from_parts(10_000, 0)
        }
    }
}
