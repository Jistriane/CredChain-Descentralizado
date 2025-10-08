// Configurações de Produção para Deploy em Mainnet
module.exports = {
  // Configurações de rede
  networks: {
    mainnet: {
      url: process.env.ETHEREUM_RPC_URL || "https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY",
      chainId: 1,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: process.env.GAS_PRICE || "20000000000",
      gas: process.env.GAS_LIMIT || "8000000",
    },
    polkadot: {
      url: process.env.POLKADOT_RPC_URL || "https://rpc.polkadot.io",
      chainId: 0,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
      gas: "auto",
    },
  },
  
  // Configurações de deploy
  deploy: {
    // Ordem de deploy dos contratos
    order: [
      "CredChainOracleIntegration",
      "CredChainIdentityVerification", 
      "CredChainPaymentRegistry",
      "CredChainCreditScore"
    ],
    
    // Configurações específicas por contrato
    contracts: {
      CredChainOracleIntegration: {
        constructorArgs: [],
        gasLimit: 6000000,
        gasPrice: "20000000000"
      },
      CredChainIdentityVerification: {
        constructorArgs: [],
        gasLimit: 6000000,
        gasPrice: "20000000000"
      },
      CredChainPaymentRegistry: {
        constructorArgs: [],
        gasLimit: 6000000,
        gasPrice: "20000000000"
      },
      CredChainCreditScore: {
        constructorArgs: [],
        gasLimit: 6000000,
        gasPrice: "20000000000"
      }
    }
  },
  
  // Configurações de verificação
  verification: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY,
      apiUrl: "https://api.etherscan.io/api"
    },
    polkascan: {
      apiKey: process.env.POLKASCAN_API_KEY,
      apiUrl: "https://api.polkascan.io/api"
    }
  },
  
  // Configurações de segurança
  security: {
    multisig: process.env.MULTISIG_ADDRESS,
    timelock: process.env.TIMELOCK_ADDRESS,
    emergencyPause: process.env.EMERGENCY_PAUSE_ADDRESS,
    emergencyRecovery: process.env.EMERGENCY_RECOVERY_ADDRESS
  },
  
  // Configurações de oráculos
  oracles: {
    addresses: process.env.ORACLE_ADDRESSES ? process.env.ORACLE_ADDRESSES.split(',') : [],
    verifiers: process.env.VERIFIER_ADDRESSES ? process.env.VERIFIER_ADDRESSES.split(',') : []
  }
};
