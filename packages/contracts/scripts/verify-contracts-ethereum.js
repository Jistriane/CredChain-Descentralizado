const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verificando contratos CredChain na Ethereum...");

  // Verificar se estamos em mainnet
  const isMainnet = hre.network.name === "mainnet";
  const isTestnet = ["sepolia", "goerli"].includes(hre.network.name);

  if (isMainnet) {
    console.log("⚠️  ATENÇÃO: Verificação em ETHEREUM MAINNET!");
  } else if (isTestnet) {
    console.log("🧪 Verificação em testnet Ethereum:", hre.network.name);
  }

  // Carregar endereços dos contratos do arquivo de deployment
  const fs = require('fs');
  const path = require('path');
  
  const deploymentFile = path.join(__dirname, '..', 'deployments', `ethereum-${hre.network.name}-deployment.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Arquivo de deployment não encontrado:", deploymentFile);
    console.log("💡 Execute o deploy primeiro: npm run deploy:ethereum:mainnet");
    process.exit(1);
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  console.log("📋 Carregando endereços do deployment...");

  const contracts = [
    {
      name: "CredChainCreditScore",
      address: deploymentData.CredChainCreditScore
    },
    {
      name: "CredChainPaymentRegistry", 
      address: deploymentData.CredChainPaymentRegistry
    },
    {
      name: "CredChainIdentityVerification",
      address: deploymentData.CredChainIdentityVerification
    },
    {
      name: "CredChainOracleIntegration",
      address: deploymentData.CredChainOracleIntegration
    }
  ];

  console.log("\n🔍 Verificando contratos no Etherscan...");
  
  for (const contract of contracts) {
    try {
      console.log(`\n📊 Verificando ${contract.name}...`);
      console.log(`📍 Endereço: ${contract.address}`);
      
      // Verificar se o contrato existe
      const code = await ethers.provider.getCode(contract.address);
      if (code === "0x") {
        console.log("❌ Contrato não encontrado no endereço especificado");
        continue;
      }
      
      console.log("✅ Contrato encontrado na blockchain");
      
      // Verificar se já está verificado no Etherscan
      try {
        const response = await fetch(`https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${contract.address}&apikey=${process.env.ETHERSCAN_API_KEY}`);
        const data = await response.json();
        
        if (data.result && data.result[0] && data.result[0].SourceCode) {
          console.log("✅ Contrato já verificado no Etherscan");
        } else {
          console.log("⚠️  Contrato não verificado no Etherscan");
          console.log("💡 Execute a verificação manual:");
          console.log(`npx hardhat verify --network ${hre.network.name} ${contract.address}`);
        }
      } catch (error) {
        console.log("⚠️  Erro ao verificar no Etherscan:", error.message);
      }
      
    } catch (error) {
      console.log(`❌ Erro ao verificar ${contract.name}:`, error.message);
    }
  }

  // Verificar configurações de rede
  console.log("\n🌐 Verificando configurações de rede...");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  console.log("RPC URL:", hre.network.config.url);

  // Verificar saldo da conta
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.provider.getBalance(deployer.address);
  const balanceInEth = ethers.formatEther(balance);
  console.log("💰 Saldo da conta:", balanceInEth, "ETH");

  // Verificar se há transações pendentes
  const pendingTxCount = await deployer.provider.getTransactionCount(deployer.address, "pending");
  const confirmedTxCount = await deployer.provider.getTransactionCount(deployer.address, "confirmed");
  
  if (pendingTxCount > confirmedTxCount) {
    console.log("⚠️  Há transações pendentes:", pendingTxCount - confirmedTxCount);
  } else {
    console.log("✅ Nenhuma transação pendente");
  }

  console.log("\n📋 Resumo da Verificação:");
  console.log("========================");
  console.log("🌐 Network:", hre.network.name);
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Saldo:", balanceInEth, "ETH");
  console.log("📊 Contratos:", contracts.length);
  
  if (isMainnet) {
    console.log("\n🚨 CHECKLIST PARA MAINNET:");
    console.log("□ Todos os contratos verificados no Etherscan");
    console.log("□ Oráculos e verificadores configurados");
    console.log("□ Testes executados com sucesso");
    console.log("□ Monitoramento configurado");
    console.log("□ Documentação atualizada");
    console.log("□ Equipe notificada sobre o deploy");
  }

  console.log("\n🎉 Verificação concluída!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro durante a verificação:", error);
    process.exit(1);
  });
