const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Configurando CredChain para Mainnet...");

  // Verificar se estamos em mainnet
  const isMainnet = hre.network.name === "mainnet";
  
  if (!isMainnet) {
    throw new Error("❌ Este script deve ser executado apenas em mainnet!");
  }

  console.log("⚠️  ATENÇÃO: Configuração em ETHEREUM MAINNET!");
  console.log("🔒 Aplicando configurações de segurança...");

  // Carregar endereços dos contratos deployados
  const fs = require('fs');
  const path = require('path');
  const deploymentFile = path.join(__dirname, '..', 'deployments', 'ethereum-mainnet-deployment.json');
  
  if (!fs.existsSync(deploymentFile)) {
    throw new Error("❌ Arquivo de deployment não encontrado. Execute o deploy primeiro!");
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  console.log("📋 Carregando contratos deployados...");

  // Conectar aos contratos
  const [deployer] = await ethers.getSigners();
  console.log("👤 Usando conta:", deployer.address);

  // Verificar saldo
  const balance = await deployer.provider.getBalance(deployer.address);
  const balanceInEth = ethers.formatEther(balance);
  console.log("💰 Saldo da conta:", balanceInEth, "ETH");

  if (parseFloat(balanceInEth) < 0.1) {
    console.log("⚠️  Saldo baixo. Considere adicionar mais ETH para transações.");
  }

  // Configurar Credit Score Contract
  console.log("\n📊 Configurando CredChainCreditScore...");
  const creditScore = await ethers.getContractAt("CredChainCreditScore", deployment.CredChainCreditScore);
  
  // Configurar Payment Registry
  console.log("💳 Configurando CredChainPaymentRegistry...");
  const paymentRegistry = await ethers.getContractAt("CredChainPaymentRegistry", deployment.CredChainPaymentRegistry);
  
  // Configurar Identity Verification
  console.log("🆔 Configurando CredChainIdentityVerification...");
  const identityVerification = await ethers.getContractAt("CredChainIdentityVerification", deployment.CredChainIdentityVerification);
  
  // Configurar Oracle Integration
  console.log("🔮 Configurando CredChainOracleIntegration...");
  const oracleIntegration = await ethers.getContractAt("CredChainOracleIntegration", deployment.CredChainOracleIntegration);

  console.log("\n🔐 Configurações de Segurança:");
  console.log("=============================");

  // 1. Configurar oráculos autorizados
  console.log("\n1️⃣ Configurando Oráculos...");
  const authorizedOracles = [
    "0x1234567890123456789012345678901234567890", // Substitua por endereços reais
    "0x2345678901234567890123456789012345678901",
    "0x3456789012345678901234567890123456789012"
  ];

  for (const oracle of authorizedOracles) {
    try {
      const tx = await oracleIntegration.registerOracle(oracle, "CredChain Authorized Oracle");
      await tx.wait();
      console.log(`✅ Oráculo autorizado: ${oracle}`);
    } catch (error) {
      console.log(`⚠️  Erro ao autorizar oráculo ${oracle}:`, error.message);
    }
  }

  // 2. Configurar verificadores de identidade
  console.log("\n2️⃣ Configurando Verificadores de Identidade...");
  const identityVerifiers = [
    "0x4567890123456789012345678901234567890123", // Substitua por endereços reais
    "0x5678901234567890123456789012345678901234"
  ];

  for (const verifier of identityVerifiers) {
    try {
      const tx = await identityVerification.authorizeVerifier(verifier);
      await tx.wait();
      console.log(`✅ Verificador de identidade autorizado: ${verifier}`);
    } catch (error) {
      console.log(`⚠️  Erro ao autorizar verificador ${verifier}:`, error.message);
    }
  }

  // 3. Configurar calculadores de score
  console.log("\n3️⃣ Configurando Calculadores de Score...");
  const scoreCalculators = [
    "0x6789012345678901234567890123456789012345", // Substitua por endereços reais
    "0x7890123456789012345678901234567890123456"
  ];

  for (const calculator of scoreCalculators) {
    try {
      const tx = await creditScore.authorizeCalculator(calculator);
      await tx.wait();
      console.log(`✅ Calculador de score autorizado: ${calculator}`);
    } catch (error) {
      console.log(`⚠️  Erro ao autorizar calculador ${calculator}:`, error.message);
    }
  }

  // 4. Configurar verificadores de pagamento
  console.log("\n4️⃣ Configurando Verificadores de Pagamento...");
  const paymentVerifiers = [
    "0x8901234567890123456789012345678901234567", // Substitua por endereços reais
    "0x9012345678901234567890123456789012345678"
  ];

  for (const verifier of paymentVerifiers) {
    try {
      const tx = await paymentRegistry.authorizeVerifier(verifier);
      await tx.wait();
      console.log(`✅ Verificador de pagamento autorizado: ${verifier}`);
    } catch (error) {
      console.log(`⚠️  Erro ao autorizar verificador ${verifier}:`, error.message);
    }
  }

  // 5. Configurar parâmetros do sistema
  console.log("\n5️⃣ Configurando Parâmetros do Sistema...");
  
  try {
    // Configurar taxa mínima para score
    const minScoreFee = ethers.parseEther("0.001"); // 0.001 ETH
    const tx1 = await creditScore.setMinScoreFee(minScoreFee);
    await tx1.wait();
    console.log("✅ Taxa mínima de score configurada:", ethers.formatEther(minScoreFee), "ETH");
  } catch (error) {
    console.log("⚠️  Erro ao configurar taxa mínima:", error.message);
  }

  try {
    // Configurar taxa de verificação de identidade
    const identityFee = ethers.parseEther("0.002"); // 0.002 ETH
    const tx2 = await identityVerification.setVerificationFee(identityFee);
    await tx2.wait();
    console.log("✅ Taxa de verificação de identidade configurada:", ethers.formatEther(identityFee), "ETH");
  } catch (error) {
    console.log("⚠️  Erro ao configurar taxa de verificação:", error.message);
  }

  // 6. Configurar pausas de emergência (desabilitadas por padrão)
  console.log("\n6️⃣ Configurando Controles de Emergência...");
  
  try {
    // Desabilitar pausas de emergência (sistema ativo)
    const tx3 = await creditScore.unpause();
    await tx3.wait();
    console.log("✅ Sistema de credit score ativo");
  } catch (error) {
    console.log("⚠️  Erro ao ativar sistema:", error.message);
  }

  try {
    const tx4 = await paymentRegistry.unpause();
    await tx4.wait();
    console.log("✅ Sistema de pagamentos ativo");
  } catch (error) {
    console.log("⚠️  Erro ao ativar pagamentos:", error.message);
  }

  // 7. Configurar monitoramento
  console.log("\n7️⃣ Configurando Monitoramento...");
  
  // Eventos importantes para monitorar
  const importantEvents = [
    "ScoreCalculated",
    "PaymentVerified", 
    "IdentityVerified",
    "OracleDataUpdated",
    "EmergencyPause",
    "EmergencyUnpause"
  ];

  console.log("📊 Eventos importantes para monitoramento:");
  importantEvents.forEach(event => {
    console.log(`   - ${event}`);
  });

  // Salvar configuração
  const config = {
    timestamp: new Date().toISOString(),
    network: "mainnet",
    chainId: 1,
    contracts: deployment,
    authorizedOracles,
    identityVerifiers,
    scoreCalculators,
    paymentVerifiers,
    systemParameters: {
      minScoreFee: "0.001 ETH",
      identityVerificationFee: "0.002 ETH",
      systemStatus: "ACTIVE"
    },
    monitoring: {
      importantEvents,
      blockExplorer: "https://etherscan.io",
      recommendedAlerts: [
        "Emergency pause events",
        "High gas usage",
        "Failed transactions",
        "Unusual score patterns"
      ]
    }
  };

  const configFile = path.join(__dirname, '..', 'deployments', 'mainnet-config.json');
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  console.log(`\n💾 Configuração salva em: ${configFile}`);

  console.log("\n🎉 Configuração da Mainnet concluída!");
  console.log("\n📋 Próximos passos:");
  console.log("1. ✅ Verificar todos os contratos no Etherscan");
  console.log("2. 🧪 Testar todas as funcionalidades");
  console.log("3. 📊 Configurar monitoramento e alertas");
  console.log("4. 🔒 Implementar controles de acesso");
  console.log("5. 📝 Documentar endereços e configurações");
  console.log("6. 🚀 Deploy do frontend na Vercel");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro durante a configuração:", error);
    process.exit(1);
  });
