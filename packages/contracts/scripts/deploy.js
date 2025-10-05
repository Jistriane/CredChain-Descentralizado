const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Iniciando deploy dos contratos CredChain...");

  // Obter o deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with the account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

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

  // Configurar autorizações para produção
  console.log("\n🔐 Configurando autorizações para produção...");
  
  // Verificar se estamos em mainnet
  const isMainnet = hre.network.name === "polkadot";
  
  if (isMainnet) {
    console.log("⚠️  ATENÇÃO: Deploy em MAINNET detectado!");
    console.log("🔒 Configurações de segurança aplicadas...");
    
    // Em mainnet, apenas o owner pode fazer autorizações
    // As autorizações devem ser feitas manualmente após o deploy
    console.log("📝 Autorizações devem ser configuradas manualmente após o deploy");
    console.log("🔐 Use as funções authorizeCalculator, authorizeVerifier, etc.");
  } else {
    // Em testnet, autorizar o deployer para testes
    console.log("🧪 Configurando autorizações para testnet...");
    
    // Autorizar o deployer como calculador de score
    await creditScore.authorizeCalculator(deployer.address);
    console.log("✅ Deployer autorizado como calculador de score");

    // Autorizar o deployer como verificador de pagamentos
    await paymentRegistry.authorizeVerifier(deployer.address);
    console.log("✅ Deployer autorizado como verificador de pagamentos");

    // Autorizar o deployer como verificador de identidade
    await identityVerification.authorizeVerifier(deployer.address);
    console.log("✅ Deployer autorizado como verificador de identidade");

    // Autorizar o deployer como oráculo
    await oracleIntegration.registerOracle(deployer.address, "CredChain Test Oracle");
    console.log("✅ Deployer registrado como oráculo de teste");
  }

  // Salvar endereços dos contratos
  const contractAddresses = {
    CredChainCreditScore: creditScoreAddress,
    CredChainPaymentRegistry: paymentRegistryAddress,
    CredChainIdentityVerification: identityVerificationAddress,
    CredChainOracleIntegration: oracleIntegrationAddress,
    Deployer: deployer.address,
    Network: hre.network.name,
    Timestamp: new Date().toISOString()
  };

  console.log("\n📋 Resumo do Deploy:");
  console.log("===================");
  console.log("🌐 Network:", hre.network.name);
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
  
  const outputFile = path.join(outputDir, `${hre.network.name}-deployment.json`);
  fs.writeFileSync(outputFile, JSON.stringify(contractAddresses, null, 2));
  console.log(`\n💾 Deployment info saved to: ${outputFile}`);

  // Instruções para verificação
  console.log("\n🔍 Para verificar os contratos:");
  console.log("npx hardhat verify --network", hre.network.name, creditScoreAddress);
  console.log("npx hardhat verify --network", hre.network.name, paymentRegistryAddress);
  console.log("npx hardhat verify --network", hre.network.name, identityVerificationAddress);
  console.log("npx hardhat verify --network", hre.network.name, oracleIntegrationAddress);

  console.log("\n🎉 Deploy concluído com sucesso!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro durante o deploy:", error);
    process.exit(1);
  });
