#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[frame_support::pallet]
pub mod pallet {
    use frame_support::pallet_prelude::*;
    use frame_system::pallet_prelude::*;
    use sp_std::vec::Vec;
    use codec::{Decode, Encode};
    use scale_info::TypeInfo;
    use serde::{Deserialize, Serialize};

    #[pallet::pallet]
    #[pallet::generate_store(pub(super) trait Store)]
    pub struct Pallet<T>(_);

    #[pallet::config]
    pub trait Config: frame_system::Config {
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
        type WeightInfo: WeightInfo;
        
        /// Maximum number of oracles
        #[pallet::constant]
        type MaxOracles: Get<u32>;
        
        /// Maximum number of data sources per oracle
        #[pallet::constant]
        type MaxDataSources: Get<u32>;
        
        /// Oracle update interval in blocks
        #[pallet::constant]
        type UpdateInterval: Get<u32>;
    }

    #[pallet::storage]
    #[pallet::getter(fn oracle_data)]
    pub type OracleData<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        T::AccountId,
        OracleInfo<T::AccountId>,
        OptionQuery,
    >;

    #[pallet::storage]
    #[pallet::getter(fn data_sources)]
    pub type DataSources<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        DataSourceId,
        DataSourceInfo,
        OptionQuery,
    >;

    #[pallet::storage]
    #[pallet::getter(fn external_data)]
    pub type ExternalData<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        DataType,
        ExternalDataInfo<T::AccountId>,
        OptionQuery,
    >;

    #[pallet::storage]
    #[pallet::getter(fn oracle_requests)]
    pub type OracleRequests<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        RequestId,
        OracleRequest<T::AccountId>,
        OptionQuery,
    >;

    #[pallet::storage]
    #[pallet::getter(fn last_update)]
    pub type LastUpdate<T: Config> = StorageValue<_, T::BlockNumber, ValueQuery>;

    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
        /// Oracle registered
        OracleRegistered { oracle: T::AccountId, data_sources: Vec<DataSourceId> },
        /// Data source added
        DataSourceAdded { source_id: DataSourceId, name: Vec<u8>, url: Vec<u8> },
        /// External data updated
        ExternalDataUpdated { 
            data_type: DataType, 
            oracle: T::AccountId, 
            value: Vec<u8>,
            timestamp: u64,
        },
        /// Oracle request created
        OracleRequestCreated { 
            request_id: RequestId, 
            requester: T::AccountId, 
            data_type: DataType,
        },
        /// Oracle request fulfilled
        OracleRequestFulfilled { 
            request_id: RequestId, 
            oracle: T::AccountId, 
            data: Vec<u8>,
        },
        /// Oracle request failed
        OracleRequestFailed { 
            request_id: RequestId, 
            oracle: T::AccountId, 
            reason: Vec<u8>,
        },
    }

    #[pallet::error]
    pub enum Error<T> {
        /// Oracle already exists
        OracleAlreadyExists,
        /// Oracle not found
        OracleNotFound,
        /// Data source not found
        DataSourceNotFound,
        /// Invalid data source URL
        InvalidDataSourceUrl,
        /// Request not found
        RequestNotFound,
        /// Request already fulfilled
        RequestAlreadyFulfilled,
        /// Insufficient permissions
        InsufficientPermissions,
        /// Data source limit exceeded
        DataSourceLimitExceeded,
        /// Oracle limit exceeded
        OracleLimitExceeded,
        /// Invalid data format
        InvalidDataFormat,
        /// Update interval not reached
        UpdateIntervalNotReached,
    }

    #[pallet::call]
    impl<T: Config> Pallet<T> {
        /// Register a new oracle
        #[pallet::weight(10_000)]
        pub fn register_oracle(
            origin: OriginFor<T>,
            data_sources: Vec<DataSourceId>,
        ) -> DispatchResult {
            let oracle = ensure_signed(origin)?;
            
            ensure!(
                !OracleData::<T>::contains_key(&oracle),
                Error::<T>::OracleAlreadyExists,
            );
            
            ensure!(
                data_sources.len() <= T::MaxDataSources::get() as usize,
                Error::<T>::DataSourceLimitExceeded,
            );
            
            // Verify all data sources exist
            for source_id in &data_sources {
                ensure!(
                    DataSources::<T>::contains_key(source_id),
                    Error::<T>::DataSourceNotFound,
                );
            }
            
            let oracle_info = OracleInfo {
                account: oracle.clone(),
                data_sources,
                is_active: true,
                last_update: 0,
                reputation: 100,
            };
            
            OracleData::<T>::insert(&oracle, oracle_info);
            
            Self::deposit_event(Event::OracleRegistered {
                oracle,
                data_sources: data_sources.clone(),
            });
            
            Ok(())
        }

        /// Add a new data source
        #[pallet::weight(10_000)]
        pub fn add_data_source(
            origin: OriginFor<T>,
            source_id: DataSourceId,
            name: Vec<u8>,
            url: Vec<u8>,
            data_type: DataType,
        ) -> DispatchResult {
            let _ = ensure_signed(origin)?;
            
            ensure!(
                !DataSources::<T>::contains_key(&source_id),
                Error::<T>::DataSourceNotFound,
            );
            
            // Validate URL format
            ensure!(
                Self::is_valid_url(&url),
                Error::<T>::InvalidDataSourceUrl,
            );
            
            let data_source = DataSourceInfo {
                id: source_id.clone(),
                name,
                url,
                data_type,
                is_active: true,
                last_update: 0,
            };
            
            DataSources::<T>::insert(&source_id, data_source);
            
            Self::deposit_event(Event::DataSourceAdded {
                source_id,
                name: name.clone(),
                url: url.clone(),
            });
            
            Ok(())
        }

        /// Update external data
        #[pallet::weight(10_000)]
        pub fn update_external_data(
            origin: OriginFor<T>,
            data_type: DataType,
            value: Vec<u8>,
            timestamp: u64,
        ) -> DispatchResult {
            let oracle = ensure_signed(origin)?;
            
            ensure!(
                OracleData::<T>::contains_key(&oracle),
                Error::<T>::OracleNotFound,
            );
            
            // Check if oracle has permission for this data type
            let oracle_info = OracleData::<T>::get(&oracle).ok_or(Error::<T>::OracleNotFound)?;
            let has_permission = oracle_info.data_sources.iter().any(|source_id| {
                if let Some(source) = DataSources::<T>::get(source_id) {
                    source.data_type == data_type
                } else {
                    false
                }
            });
            
            ensure!(has_permission, Error::<T>::InsufficientPermissions);
            
            // Validate data format
            ensure!(
                Self::validate_data_format(&data_type, &value),
                Error::<T>::InvalidDataFormat,
            );
            
            let external_data = ExternalDataInfo {
                data_type,
                oracle: oracle.clone(),
                value: value.clone(),
                timestamp,
                block_number: frame_system::Pallet::<T>::block_number(),
            };
            
            ExternalData::<T>::insert(&data_type, external_data);
            
            Self::deposit_event(Event::ExternalDataUpdated {
                data_type,
                oracle,
                value,
                timestamp,
            });
            
            Ok(())
        }

        /// Create an oracle request
        #[pallet::weight(10_000)]
        pub fn create_oracle_request(
            origin: OriginFor<T>,
            data_type: DataType,
            max_fee: u128,
        ) -> DispatchResult {
            let requester = ensure_signed(origin)?;
            
            let request_id = Self::generate_request_id();
            
            let request = OracleRequest {
                id: request_id,
                requester: requester.clone(),
                data_type,
                max_fee,
                status: RequestStatus::Pending,
                created_at: frame_system::Pallet::<T>::block_number(),
                fulfilled_at: None,
                oracle: None,
                data: None,
                error: None,
            };
            
            OracleRequests::<T>::insert(&request_id, request);
            
            Self::deposit_event(Event::OracleRequestCreated {
                request_id,
                requester,
                data_type,
            });
            
            Ok(())
        }

        /// Fulfill an oracle request
        #[pallet::weight(10_000)]
        pub fn fulfill_oracle_request(
            origin: OriginFor<T>,
            request_id: RequestId,
            data: Vec<u8>,
        ) -> DispatchResult {
            let oracle = ensure_signed(origin)?;
            
            let mut request = OracleRequests::<T>::get(&request_id)
                .ok_or(Error::<T>::RequestNotFound)?;
            
            ensure!(
                request.status == RequestStatus::Pending,
                Error::<T>::RequestAlreadyFulfilled,
            );
            
            // Update request
            request.status = RequestStatus::Fulfilled;
            request.fulfilled_at = Some(frame_system::Pallet::<T>::block_number());
            request.oracle = Some(oracle.clone());
            request.data = Some(data.clone());
            
            OracleRequests::<T>::insert(&request_id, request);
            
            Self::deposit_event(Event::OracleRequestFulfilled {
                request_id,
                oracle,
                data,
            });
            
            Ok(())
        }

        /// Fail an oracle request
        #[pallet::weight(10_000)]
        pub fn fail_oracle_request(
            origin: OriginFor<T>,
            request_id: RequestId,
            reason: Vec<u8>,
        ) -> DispatchResult {
            let oracle = ensure_signed(origin)?;
            
            let mut request = OracleRequests::<T>::get(&request_id)
                .ok_or(Error::<T>::RequestNotFound)?;
            
            ensure!(
                request.status == RequestStatus::Pending,
                Error::<T>::RequestAlreadyFulfilled,
            );
            
            // Update request
            request.status = RequestStatus::Failed;
            request.fulfilled_at = Some(frame_system::Pallet::<T>::block_number());
            request.oracle = Some(oracle.clone());
            request.error = Some(reason.clone());
            
            OracleRequests::<T>::insert(&request_id, request);
            
            Self::deposit_event(Event::OracleRequestFailed {
                request_id,
                oracle,
                reason,
            });
            
            Ok(())
        }
    }

    // Helper functions
    impl<T: Config> Pallet<T> {
        fn is_valid_url(url: &[u8]) -> bool {
            // Basic URL validation
            let url_str = match sp_std::str::from_utf8(url) {
                Ok(s) => s,
                Err(_) => return false,
            };
            
            url_str.starts_with("http://") || url_str.starts_with("https://")
        }
        
        fn validate_data_format(data_type: &DataType, value: &[u8]) -> bool {
            match data_type {
                DataType::CreditScore => {
                    // Validate credit score format (0-1000)
                    if let Ok(score_str) = sp_std::str::from_utf8(value) {
                        if let Ok(score) = score_str.parse::<u32>() {
                            return score <= 1000;
                        }
                    }
                    false
                },
                DataType::PaymentHistory => {
                    // Validate JSON format for payment history
                    sp_std::str::from_utf8(value).is_ok()
                },
                DataType::IdentityVerification => {
                    // Validate identity verification data
                    value.len() > 0
                },
                DataType::ExternalData => {
                    // Generic external data validation
                    value.len() > 0
                },
            }
        }
        
        fn generate_request_id() -> RequestId {
            // Generate unique request ID
            let block_number = frame_system::Pallet::<T>::block_number();
            let extrinsic_index = frame_system::Pallet::<T>::extrinsic_index()
                .unwrap_or(0);
            
            (block_number, extrinsic_index).encode().into()
        }
    }
}

// Types
#[derive(Encode, Decode, Clone, PartialEq, Eq, Debug, TypeInfo, Serialize, Deserialize)]
pub struct OracleInfo<AccountId> {
    pub account: AccountId,
    pub data_sources: Vec<DataSourceId>,
    pub is_active: bool,
    pub last_update: u64,
    pub reputation: u32,
}

#[derive(Encode, Decode, Clone, PartialEq, Eq, Debug, TypeInfo, Serialize, Deserialize)]
pub struct DataSourceInfo {
    pub id: DataSourceId,
    pub name: Vec<u8>,
    pub url: Vec<u8>,
    pub data_type: DataType,
    pub is_active: bool,
    pub last_update: u64,
}

#[derive(Encode, Decode, Clone, PartialEq, Eq, Debug, TypeInfo, Serialize, Deserialize)]
pub struct ExternalDataInfo<AccountId> {
    pub data_type: DataType,
    pub oracle: AccountId,
    pub value: Vec<u8>,
    pub timestamp: u64,
    pub block_number: u32,
}

#[derive(Encode, Decode, Clone, PartialEq, Eq, Debug, TypeInfo, Serialize, Deserialize)]
pub struct OracleRequest<AccountId> {
    pub id: RequestId,
    pub requester: AccountId,
    pub data_type: DataType,
    pub max_fee: u128,
    pub status: RequestStatus,
    pub created_at: u32,
    pub fulfilled_at: Option<u32>,
    pub oracle: Option<AccountId>,
    pub data: Option<Vec<u8>>,
    pub error: Option<Vec<u8>>,
}

#[derive(Encode, Decode, Clone, PartialEq, Eq, Debug, TypeInfo, Serialize, Deserialize)]
pub enum DataType {
    CreditScore,
    PaymentHistory,
    IdentityVerification,
    ExternalData,
}

#[derive(Encode, Decode, Clone, PartialEq, Eq, Debug, TypeInfo, Serialize, Deserialize)]
pub enum RequestStatus {
    Pending,
    Fulfilled,
    Failed,
}

pub type DataSourceId = Vec<u8>;
pub type RequestId = Vec<u8>;

// Weight information
pub trait WeightInfo {
    fn register_oracle() -> Weight;
    fn add_data_source() -> Weight;
    fn update_external_data() -> Weight;
    fn create_oracle_request() -> Weight;
    fn fulfill_oracle_request() -> Weight;
    fn fail_oracle_request() -> Weight;
}

impl WeightInfo for () {
    fn register_oracle() -> Weight {
        Weight::from_ref_time(10_000)
    }
    
    fn add_data_source() -> Weight {
        Weight::from_ref_time(10_000)
    }
    
    fn update_external_data() -> Weight {
        Weight::from_ref_time(10_000)
    }
    
    fn create_oracle_request() -> Weight {
        Weight::from_ref_time(10_000)
    }
    
    fn fulfill_oracle_request() -> Weight {
        Weight::from_ref_time(10_000)
    }
    
    fn fail_oracle_request() -> Weight {
        Weight::from_ref_time(10_000)
    }
}
