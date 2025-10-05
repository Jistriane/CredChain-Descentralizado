const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Iniciando deploy dos contratos CredChain na Ethereum...");

  // Obter o deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with the account:", deployer.address);
  
  // Verificar saldo da conta
  const balance = await deployer.provider.getBalance(deployer.address);
  const balanceInEth = ethers.formatEther(balance);
  console.log("💰 Account balance:", balanceInEth, "ETH");
  
  // Verificar se há saldo suficiente
  if (parseFloat(balanceInEth) < 0.01) {
    throw new Error("❌ Saldo insuficiente para deploy. Mínimo necessário: 0.01 ETH");
  }

  // Verificar se estamos em mainnet
  const isMainnet = hre.network.name === "mainnet";
  const isTestnet = ["sepolia", "goerli"].includes(hre.network.name);
  
  if (isMainnet) {
    console.log("⚠️  ATENÇÃO: Deploy em ETHEREUM MAINNET detectado!");
    console.log("🔒 Configurações de segurança aplicadas...");
  } else if (isTestnet) {
    console.log("🧪 Deploy em testnet Ethereum:", hre.network.name);
  }

  // Deploy do contrato de Credit Score
  console.log("\n📊 Deploying CredChainCreditScore...");
  const CredChainCreditScore = await ethers.getContractFactory("CredChainCreditScore");
  const creditScore = await CredChainCreditScore.deploy();
  await creditScore.waitForDeployment();
  const creditScoreAddress = await creditScore.getAddress();
  console.log("✅ CredChainCreditScore deployed to:", creditScoreAddress);

  // Deploy do contrato de Payment Registry
  console.log("\n💳 Deploying CredChainPaymentRegistry...");
  const CredChainPaymentRegistry = await ethers.getContractFactory("CredChainPaymentRegistry");
  const paymentRegistry = await CredChainPaymentRegistry.deploy();
  await paymentRegistry.waitForDeployment();
  const paymentRegistryAddress = await paymentRegistry.getAddress();
  console.log("✅ CredChainPaymentRegistry deployed to:", paymentRegistryAddress);

  // Deploy do contrato de Identity Verification
  console.log("\n🆔 Deploying CredChainIdentityVerification...");
  const CredChainIdentityVerification = await ethers.getContractFactory("CredChainIdentityVerification");
  const identityVerification = await CredChainIdentityVerification.deploy();
  await identityVerification.waitForDeployment();
  const identityVerificationAddress = await identityVerification.getAddress();
  console.log("✅ CredChainIdentityVerification deployed to:", identityVerificationAddress);

  // Deploy do contrato de Oracle Integration
  console.log("\n🔮 Deploying CredChainOracleIntegration...");
  const CredChainOracleIntegration = await ethers.getContractFactory("CredChainOracleIntegration");
  const oracleIntegration = await CredChainOracleIntegration.deploy();
  await oracleIntegration.waitForDeployment();
  const oracleIntegrationAddress = await oracleIntegration.getAddress();
  console.log("✅ CredChainOracleIntegration deployed to:", oracleIntegrationAddress);

  // Configurar autorizações baseado na rede
  console.log("\n🔐 Configurando autorizações...");
  
  if (isMainnet) {
    console.log("⚠️  MAINNET: Autorizações devem ser configuradas manualmente após o deploy");
    console.log("🔐 Use as funções authorizeCalculator, authorizeVerifier, etc.");
    console.log("📝 IMPORTANTE: Configure oráculos e verificadores antes de usar o sistema");
  } else {
    // Em testnet, autorizar o deployer para testes
    console.log("🧪 Configurando autorizações para testnet...");
    
    try {
      // Autorizar o deployer como calculador de score
      const authCalculatorTx = await creditScore.authorizeCalculator(deployer.address);
      await authCalculatorTx.wait();
      console.log("✅ Deployer autorizado como calculador de score");

      // Autorizar o deployer como verificador de pagamentos
      const authVerifierTx = await paymentRegistry.authorizeVerifier(deployer.address);
      await authVerifierTx.wait();
      console.log("✅ Deployer autorizado como verificador de pagamentos");

      // Autorizar o deployer como verificador de identidade
      const authIdentityTx = await identityVerification.authorizeVerifier(deployer.address);
      await authIdentityTx.wait();
      console.log("✅ Deployer autorizado como verificador de identidade");

      // Autorizar o deployer como oráculo
      const authOracleTx = await oracleIntegration.registerOracle(deployer.address, "CredChain Test Oracle");
      await authOracleTx.wait();
      console.log("✅ Deployer registrado como oráculo de teste");
    } catch (error) {
      console.log("⚠️  Erro ao configurar autorizações:", error.message);
      console.log("📝 Configure manualmente após o deploy");
    }
  }

  // Salvar endereços dos contratos
  const contractAddresses = {
    CredChainCreditScore: creditScoreAddress,
    CredChainPaymentRegistry: paymentRegistryAddress,
    CredChainIdentityVerification: identityVerificationAddress,
    CredChainOracleIntegration: oracleIntegrationAddress,
    Deployer: deployer.address,
    Network: hre.network.name,
    ChainId: hre.network.config.chainId,
    Timestamp: new Date().toISOString(),
    GasUsed: {
      CreditScore: "TBD", // Será preenchido após verificação
      PaymentRegistry: "TBD",
      IdentityVerification: "TBD",
      OracleIntegration: "TBD"
    }
  };

  console.log("\n📋 Resumo do Deploy:");
  console.log("===================");
  console.log("🌐 Network:", hre.network.name);
  console.log("🔗 Chain ID:", hre.network.config.chainId);
  console.log("👤 Deployer:", deployer.address);
  console.log("📊 Credit Score:", creditScoreAddress);
  console.log("💳 Payment Registry:", paymentRegistryAddress);
  console.log("🆔 Identity Verification:", identityVerificationAddress);
  console.log("🔮 Oracle Integration:", oracleIntegrationAddress);
  console.log("⏰ Timestamp:", new Date().toISOString());

  // Salvar em arquivo JSON
  const fs = require('fs');
  const path = require('path');
  
  const outputDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputFile = path.join(outputDir, `ethereum-${hre.network.name}-deployment.json`);
  fs.writeFileSync(outputFile, JSON.stringify(contractAddresses, null, 2));
  console.log(`\n💾 Deployment info saved to: ${outputFile}`);

  // Instruções para verificação
  console.log("\n🔍 Para verificar os contratos:");
  console.log("npx hardhat verify --network", hre.network.name, creditScoreAddress);
  console.log("npx hardhat verify --network", hre.network.name, paymentRegistryAddress);
  console.log("npx hardhat verify --network", hre.network.name, identityVerificationAddress);
  console.log("npx hardhat verify --network", hre.network.name, oracleIntegrationAddress);

  // Instruções específicas para mainnet
  if (isMainnet) {
    console.log("\n🚨 INSTRUÇÕES IMPORTANTES PARA MAINNET:");
    console.log("1. ✅ Verifique todos os contratos no Etherscan");
    console.log("2. 🔐 Configure oráculos e verificadores autorizados");
    console.log("3. 🧪 Teste todas as funcionalidades em testnet primeiro");
    console.log("4. 📊 Configure monitoramento e alertas");
    console.log("5. 🔒 Implemente controles de acesso adequados");
    console.log("6. 📝 Documente todos os endereços e configurações");
  }

  console.log("\n🎉 Deploy concluído com sucesso!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro durante o deploy:", error);
    process.exit(1);
  });
