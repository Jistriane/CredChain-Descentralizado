const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🧪 Testando contratos CredChain na mainnet...");
  
  // Carregar informações de deploy
  const deploymentPath = path.join(__dirname, "../deployments/ethereum-mainnet-deployment.json");
  
  if (!fs.existsSync(deploymentPath)) {
    throw new Error("❌ Arquivo de deploy não encontrado. Execute o deploy primeiro.");
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  
  // Obter o deployer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  
  // Testar CredChainOracleIntegration
  console.log("\n🔮 Testando CredChainOracleIntegration...");
  
  try {
    const oracleContract = await ethers.getContractAt(
      "CredChainOracleIntegration", 
      deploymentInfo.contracts.CredChainOracleIntegration.address
    );
    
    // Testar registro de oráculo
    const testOracleAddress = "0x1234567890123456789012345678901234567890";
    const testOracleName = "Test Oracle";
    
    await oracleContract.registerOracle(testOracleAddress, testOracleName);
    console.log("✅ Oráculo registrado com sucesso");
    
    // Testar atualização de dados
    await oracleContract.updateOracleData(
      "test_key",
      "test_value",
      "test_metadata"
    );
    console.log("✅ Dados de oráculo atualizados com sucesso");
    
    // Testar obtenção de dados
    const oracleData = await oracleContract.getOracleData("test_key");
    console.log("✅ Dados de oráculo obtidos:", oracleData);
    
  } catch (error) {
    console.error("❌ Erro ao testar CredChainOracleIntegration:", error.message);
  }
  
  // Testar CredChainIdentityVerification
  console.log("\n🆔 Testando CredChainIdentityVerification...");
  
  try {
    const identityContract = await ethers.getContractAt(
      "CredChainIdentityVerification", 
      deploymentInfo.contracts.CredChainIdentityVerification.address
    );
    
    // Testar registro de identidade
    await identityContract.registerIdentity(
      "João Silva",
      "12345678901",
      "CPF",
      "Brasil",
      "joao@email.com",
      "+5511999999999",
      Math.floor(Date.now() / 1000) - 30 * 365 * 24 * 60 * 60, // 30 anos atrás
      "test_metadata"
    );
    console.log("✅ Identidade registrada com sucesso");
    
    // Testar solicitação de verificação
    const requestId = await identityContract.requestVerification("test_document_hash");
    console.log("✅ Solicitação de verificação criada:", requestId.toString());
    
    // Testar obtenção de informações
    const identityInfo = await identityContract.getIdentityInfo(deployer.address);
    console.log("✅ Informações de identidade obtidas:", identityInfo);
    
  } catch (error) {
    console.error("❌ Erro ao testar CredChainIdentityVerification:", error.message);
  }
  
  // Testar CredChainPaymentRegistry
  console.log("\n💳 Testando CredChainPaymentRegistry...");
  
  try {
    const paymentContract = await ethers.getContractAt(
      "CredChainPaymentRegistry", 
      deploymentInfo.contracts.CredChainPaymentRegistry.address
    );
    
    // Testar criação de pagamento
    const dueDate = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 dias no futuro
    const paymentId = await paymentContract.createPayment(
      "0x1234567890123456789012345678901234567890", // payee
      ethers.utils.parseEther("1.0"), // amount
      dueDate,
      "Test Payment",
      "test_metadata"
    );
    console.log("✅ Pagamento criado com sucesso:", paymentId.toString());
    
    // Testar marcação como pago
    await paymentContract.markAsPaid(paymentId);
    console.log("✅ Pagamento marcado como pago");
    
    // Testar obtenção de informações
    const paymentInfo = await paymentContract.getPayment(paymentId);
    console.log("✅ Informações de pagamento obtidas:", paymentInfo);
    
    // Testar estatísticas
    const stats = await paymentContract.getContractStats();
    console.log("✅ Estatísticas do contrato:", stats);
    
  } catch (error) {
    console.error("❌ Erro ao testar CredChainPaymentRegistry:", error.message);
  }
  
  // Testar CredChainCreditScore
  console.log("\n📊 Testando CredChainCreditScore...");
  
  try {
    const scoreContract = await ethers.getContractAt(
      "CredChainCreditScore", 
      deploymentInfo.contracts.CredChainCreditScore.address
    );
    
    // Testar atualização de score
    await scoreContract.updateCreditScore(
      deployer.address,
      750,
      "test_metadata"
    );
    console.log("✅ Score de crédito atualizado com sucesso");
    
    // Testar adição de fator de score
    await scoreContract.addScoreFactor(
      deployer.address,
      "payment_history",
      30,
      80
    );
    console.log("✅ Fator de score adicionado com sucesso");
    
    // Testar cálculo de score
    const calculatedScore = await scoreContract.calculateScore(deployer.address);
    console.log("✅ Score calculado:", calculatedScore.toString());
    
    // Testar obtenção de score
    const creditScore = await scoreContract.getCreditScore(deployer.address);
    console.log("✅ Score de crédito obtido:", creditScore.toString());
    
    // Testar informações completas
    const scoreInfo = await scoreContract.getCreditScoreInfo(deployer.address);
    console.log("✅ Informações completas do score:", scoreInfo);
    
    // Testar estatísticas
    const contractInfo = await scoreContract.getContractInfo();
    console.log("✅ Informações do contrato:", contractInfo);
    
  } catch (error) {
    console.error("❌ Erro ao testar CredChainCreditScore:", error.message);
  }
  
  // Testar funcionalidades de segurança
  console.log("\n🔒 Testando funcionalidades de segurança...");
  
  try {
    // Testar pausa de contrato
    const scoreContract = await ethers.getContractAt(
      "CredChainCreditScore", 
      deploymentInfo.contracts.CredChainCreditScore.address
    );
    
    const isPaused = await scoreContract.paused();
    console.log("✅ Status de pausa verificado:", isPaused);
    
    // Testar owner
    const owner = await scoreContract.owner();
    console.log("✅ Owner verificado:", owner);
    
    // Testar versão
    const version = await scoreContract.currentVersion();
    console.log("✅ Versão verificada:", version.toString());
    
  } catch (error) {
    console.error("❌ Erro ao testar funcionalidades de segurança:", error.message);
  }
  
  // Testar conectividade com a rede
  console.log("\n🌐 Testando conectividade com a rede...");
  
  try {
    const network = await ethers.provider.getNetwork();
    console.log(`✅ Conectado à rede: ${network.name} (Chain ID: ${network.chainId})`);
    
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log(`✅ Bloco atual: ${blockNumber}`);
    
    const gasPrice = await ethers.provider.getGasPrice();
    console.log(`✅ Gas price: ${ethers.utils.formatUnits(gasPrice, "gwei")} Gwei`);
    
  } catch (error) {
    console.error("❌ Erro de conectividade:", error.message);
  }
  
  console.log("\n🎉 Testes concluídos!");
  
  // Instruções pós-teste
  console.log("\n📋 Próximos passos:");
  console.log("1. Verificar todos os testes passaram");
  console.log("2. Configurar monitoramento");
  console.log("3. Configurar alertas de segurança");
  console.log("4. Documentar resultados dos testes");
  console.log("5. Configurar backup e recuperação");
  console.log("6. Treinar equipe em procedimentos");
  console.log("7. Configurar procedimentos de emergência");
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro nos testes:", error);
    process.exit(1);
  });
