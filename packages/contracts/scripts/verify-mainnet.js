const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 Verificando contratos CredChain na mainnet...");
  
  // Carregar informações de deploy
  const deploymentPath = path.join(__dirname, "../deployments/ethereum-mainnet-deployment.json");
  
  if (!fs.existsSync(deploymentPath)) {
    throw new Error("❌ Arquivo de deploy não encontrado. Execute o deploy primeiro.");
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  
  console.log("📄 Informações de deploy carregadas");
  console.log(`🌐 Rede: ${deploymentInfo.network}`);
  console.log(`⛓️  Chain ID: ${deploymentInfo.chainId}`);
  console.log(`👤 Deployer: ${deploymentInfo.deployer}`);
  console.log(`📅 Data: ${deploymentInfo.deploymentDate}`);
  
  // Verificar cada contrato
  for (const [contractName, contractInfo] of Object.entries(deploymentInfo.contracts)) {
    console.log(`\n🔍 Verificando ${contractName}...`);
    
    try {
      // Verificar se o contrato existe
      const contract = await ethers.getContractAt(contractName, contractInfo.address);
      
      // Verificar se o contrato está pausado
      const isPaused = await contract.paused();
      console.log(`⏸️  Pausado: ${isPaused}`);
      
      // Verificar owner
      const owner = await contract.owner();
      console.log(`👑 Owner: ${owner}`);
      
      // Verificar versão (se aplicável)
      if (contractName === "CredChainCreditScore") {
        const version = await contract.currentVersion();
        console.log(`📊 Versão: ${version}`);
      }
      
      // Verificar estatísticas (se aplicável)
      if (contractName === "CredChainPaymentRegistry") {
        const stats = await contract.getContractStats();
        console.log(`📈 Total de pagamentos: ${stats.totalPayments}`);
      }
      
      console.log(`✅ ${contractName} verificado com sucesso`);
      
    } catch (error) {
      console.error(`❌ Erro ao verificar ${contractName}:`, error.message);
    }
  }
  
  // Verificar conectividade com a rede
  console.log("\n🌐 Verificando conectividade com a rede...");
  
  try {
    const network = await ethers.provider.getNetwork();
    console.log(`✅ Conectado à rede: ${network.name} (Chain ID: ${network.chainId})`);
    
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log(`📦 Bloco atual: ${blockNumber}`);
    
    const gasPrice = await ethers.provider.getGasPrice();
    console.log(`⛽ Gas price: ${ethers.utils.formatUnits(gasPrice, "gwei")} Gwei`);
    
  } catch (error) {
    console.error("❌ Erro de conectividade:", error.message);
  }
  
  // Verificar saldo do deployer
  console.log("\n💰 Verificando saldo do deployer...");
  
  try {
    const deployer = await ethers.getSigner(deploymentInfo.deployer);
    const balance = await deployer.getBalance();
    console.log(`✅ Saldo: ${ethers.utils.formatEther(balance)} ETH`);
    
    if (balance.lt(ethers.utils.parseEther("0.01"))) {
      console.log("⚠️  Saldo baixo - considere adicionar mais ETH");
    }
    
  } catch (error) {
    console.error("❌ Erro ao verificar saldo:", error.message);
  }
  
  console.log("\n🎉 Verificação concluída!");
  
  // Instruções pós-verificação
  console.log("\n📋 Próximos passos:");
  console.log("1. Verificar contratos no Etherscan");
  console.log("2. Configurar oráculos autorizados");
  console.log("3. Configurar verificadores autorizados");
  console.log("4. Transferir ownership para multisig");
  console.log("5. Configurar timelock para mudanças administrativas");
  console.log("6. Testar funcionalidades principais");
  console.log("7. Configurar monitoramento");
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro na verificação:", error);
    process.exit(1);
  });
