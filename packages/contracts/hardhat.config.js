require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Rede local para desenvolvimento
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    // Polkadot Mainnet - Configuração correta conforme documentação
    polkadot: {
      url: process.env.POLKADOT_RPC_URL || "https://rpc.polkadot.io",
      chainId: 0, // Chain ID correto para Polkadot mainnet
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
      gas: "auto",
    },
    // Polkadot Testnet (Paseo)
    paseo: {
      url: process.env.PASEO_RPC_URL || "https://testnet-passet-hub-eth-rpc.polkadot.io",
      chainId: 420420422,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Polkadot Asset Hub
    assetHub: {
      url: process.env.ASSET_HUB_RPC_URL || "https://polkadot-asset-hub-rpc.polkadot.io",
      chainId: 1000,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  // Configurações específicas do Polkadot conforme documentação
  polkadot: {
    // Configurações para deploy na mainnet
    mainnet: {
      url: "https://rpc.polkadot.io",
      chainId: 0, // Chain ID correto para Polkadot mainnet
    },
    // Configurações para testnet (Paseo)
    testnet: {
      url: "https://testnet-passet-hub-eth-rpc.polkadot.io",
      chainId: 420420422, // Chain ID correto conforme documentação
    },
  },
};
