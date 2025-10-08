const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Iniciando deploy dos contratos CredChain na mainnet...");
  
  // Verificar se as variáveis de ambiente estão configuradas
  if (!process.env.PRIVATE_KEY) {
    throw new Error("❌ PRIVATE_KEY não configurada");
  }
  
  if (!process.env.ETHEREUM_RPC_URL) {
    throw new Error("❌ ETHEREUM_RPC_URL não configurada");
  }
  
  // Obter o deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer:", deployer.address);
  
  // Verificar saldo
  const balance = await deployer.getBalance();
  console.log("💰 Saldo do deployer:", ethers.utils.formatEther(balance), "ETH");
  
  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    throw new Error("❌ Saldo insuficiente para deploy");
  }
  
  // Ordem de deploy dos contratos
  const contracts = [
    "CredChainOracleIntegration",
    "CredChainIdentityVerification", 
    "CredChainPaymentRegistry",
    "CredChainCreditScore"
  ];
  
  const deployedContracts = {};
  
  // Deploy dos contratos
  for (const contractName of contracts) {
    console.log(`\n📦 Deployando ${contractName}...`);
    
    const Contract = await ethers.getContractFactory(contractName);
    const contract = await Contract.deploy({
      gasLimit: 6000000,
      gasPrice: ethers.utils.parseUnits("20", "gwei")
    });
    
    await contract.deployed();
    
    console.log(`✅ ${contractName} deployado em:`, contract.address);
    
    deployedContracts[contractName] = {
      address: contract.address,
      transactionHash: contract.deployTransaction.hash,
      blockNumber: contract.deployTransaction.blockNumber,
      gasUsed: contract.deployTransaction.gasLimit
    };
    
    // Aguardar confirmação
    await contract.deployTransaction.wait(3);
    console.log(`⏳ Aguardando confirmações para ${contractName}...`);
  }
  
  // Salvar informações de deploy
  const deploymentInfo = {
    network: "ethereum-mainnet",
    chainId: 1,
    deployer: deployer.address,
    deploymentDate: new Date().toISOString(),
    contracts: deployedContracts
  };
  
  const deploymentPath = path.join(__dirname, "../deployments/ethereum-mainnet-deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n🎉 Deploy concluído com sucesso!");
  console.log("📄 Informações salvas em:", deploymentPath);
  
  // Verificar contratos
  console.log("\n🔍 Verificando contratos...");
  for (const [name, info] of Object.entries(deployedContracts)) {
    console.log(`✅ ${name}: ${info.address}`);
  }
  
  // Instruções pós-deploy
  console.log("\n📋 Próximos passos:");
  console.log("1. Verificar contratos no Etherscan");
  console.log("2. Configurar oráculos autorizados");
  console.log("3. Configurar verificadores autorizados");
  console.log("4. Transferir ownership para multisig");
  console.log("5. Configurar timelock para mudanças administrativas");
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro no deploy:", error);
    process.exit(1);
  });
