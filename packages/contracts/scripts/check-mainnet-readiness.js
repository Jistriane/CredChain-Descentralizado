const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 Verificando prontidão para deploy na mainnet...");
  
  const checks = [];
  
  // 1. Verificar variáveis de ambiente
  console.log("\n📋 Verificando variáveis de ambiente...");
  
  const requiredEnvVars = [
    "PRIVATE_KEY",
    "ETHEREUM_RPC_URL",
    "ETHERSCAN_API_KEY"
  ];
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: Configurada`);
      checks.push({ name: envVar, status: "PASS" });
    } else {
      console.log(`❌ ${envVar}: Não configurada`);
      checks.push({ name: envVar, status: "FAIL" });
    }
  }
  
  // 2. Verificar conectividade com a rede
  console.log("\n🌐 Verificando conectividade com a rede...");
  
  try {
    const network = await ethers.provider.getNetwork();
    console.log(`✅ Conectado à rede: ${network.name} (Chain ID: ${network.chainId})`);
    checks.push({ name: "Network Connection", status: "PASS" });
    
    if (network.chainId !== 1) {
      console.log("⚠️  Não está conectado à mainnet (Chain ID: 1)");
      checks.push({ name: "Mainnet Connection", status: "WARNING" });
    } else {
      checks.push({ name: "Mainnet Connection", status: "PASS" });
    }
    
  } catch (error) {
    console.log(`❌ Erro de conectividade: ${error.message}`);
    checks.push({ name: "Network Connection", status: "FAIL" });
  }
  
  // 3. Verificar saldo do deployer
  console.log("\n💰 Verificando saldo do deployer...");
  
  try {
    const [deployer] = await ethers.getSigners();
    const balance = await deployer.getBalance();
    const balanceEth = ethers.utils.formatEther(balance);
    
    console.log(`✅ Saldo: ${balanceEth} ETH`);
    checks.push({ name: "Deployer Balance", status: "PASS" });
    
    if (balance.lt(ethers.utils.parseEther("0.1"))) {
      console.log("⚠️  Saldo baixo - considere adicionar mais ETH");
      checks.push({ name: "Sufficient Balance", status: "WARNING" });
    } else {
      checks.push({ name: "Sufficient Balance", status: "PASS" });
    }
    
  } catch (error) {
    console.log(`❌ Erro ao verificar saldo: ${error.message}`);
    checks.push({ name: "Deployer Balance", status: "FAIL" });
  }
  
  // 4. Verificar compilação dos contratos
  console.log("\n🔨 Verificando compilação dos contratos...");
  
  try {
    // Verificar se os contratos compilam
    const contracts = [
      "CredChainOracleIntegration",
      "CredChainIdentityVerification",
      "CredChainPaymentRegistry",
      "CredChainCreditScore"
    ];
    
    for (const contractName of contracts) {
      try {
        await ethers.getContractFactory(contractName);
        console.log(`✅ ${contractName}: Compilado com sucesso`);
        checks.push({ name: `Compile ${contractName}`, status: "PASS" });
      } catch (error) {
        console.log(`❌ ${contractName}: Erro de compilação - ${error.message}`);
        checks.push({ name: `Compile ${contractName}`, status: "FAIL" });
      }
    }
    
  } catch (error) {
    console.log(`❌ Erro na compilação: ${error.message}`);
    checks.push({ name: "Contract Compilation", status: "FAIL" });
  }
  
  // 5. Verificar configurações de gas
  console.log("\n⛽ Verificando configurações de gas...");
  
  try {
    const gasPrice = await ethers.provider.getGasPrice();
    const gasPriceGwei = ethers.utils.formatUnits(gasPrice, "gwei");
    
    console.log(`✅ Gas price: ${gasPriceGwei} Gwei`);
    checks.push({ name: "Gas Price", status: "PASS" });
    
    if (gasPrice.gt(ethers.utils.parseUnits("100", "gwei"))) {
      console.log("⚠️  Gas price alto - considere aguardar");
      checks.push({ name: "Gas Price Reasonable", status: "WARNING" });
    } else {
      checks.push({ name: "Gas Price Reasonable", status: "PASS" });
    }
    
  } catch (error) {
    console.log(`❌ Erro ao verificar gas price: ${error.message}`);
    checks.push({ name: "Gas Price", status: "FAIL" });
  }
  
  // 6. Verificar arquivos de deploy
  console.log("\n📄 Verificando arquivos de deploy...");
  
  const deploymentPath = path.join(__dirname, "../deployments/ethereum-mainnet-deployment.json");
  
  if (fs.existsSync(deploymentPath)) {
    console.log("⚠️  Arquivo de deploy já existe - pode sobrescrever");
    checks.push({ name: "Deploy File Exists", status: "WARNING" });
  } else {
    console.log("✅ Arquivo de deploy não existe - pode prosseguir");
    checks.push({ name: "Deploy File Exists", status: "PASS" });
  }
  
  // 7. Verificar configurações de segurança
  console.log("\n🔒 Verificando configurações de segurança...");
  
  const securityConfigs = [
    "MULTISIG_ADDRESS",
    "TIMELOCK_ADDRESS",
    "EMERGENCY_PAUSE_ADDRESS",
    "EMERGENCY_RECOVERY_ADDRESS"
  ];
  
  for (const config of securityConfigs) {
    if (process.env[config]) {
      console.log(`✅ ${config}: Configurada`);
      checks.push({ name: config, status: "PASS" });
    } else {
      console.log(`⚠️  ${config}: Não configurada`);
      checks.push({ name: config, status: "WARNING" });
    }
  }
  
  // 8. Verificar configurações de oráculos
  console.log("\n🔮 Verificando configurações de oráculos...");
  
  const oracleConfigs = [
    "ORACLE_ADDRESSES",
    "VERIFIER_ADDRESSES",
    "CALCULATOR_ADDRESSES"
  ];
  
  for (const config of oracleConfigs) {
    if (process.env[config]) {
      console.log(`✅ ${config}: Configurada`);
      checks.push({ name: config, status: "PASS" });
    } else {
      console.log(`⚠️  ${config}: Não configurada`);
      checks.push({ name: config, status: "WARNING" });
    }
  }
  
  // Resumo dos checks
  console.log("\n📊 Resumo dos checks:");
  
  const passed = checks.filter(check => check.status === "PASS").length;
  const warnings = checks.filter(check => check.status === "WARNING").length;
  const failed = checks.filter(check => check.status === "FAIL").length;
  
  console.log(`✅ Passou: ${passed}`);
  console.log(`⚠️  Avisos: ${warnings}`);
  console.log(`❌ Falhou: ${failed}`);
  
  // Determinar se está pronto para deploy
  if (failed > 0) {
    console.log("\n❌ NÃO ESTÁ PRONTO PARA DEPLOY");
    console.log("Corrija os problemas identificados antes de prosseguir");
  } else if (warnings > 0) {
    console.log("\n⚠️  PRONTO PARA DEPLOY COM AVISOS");
    console.log("Considere resolver os avisos antes de prosseguir");
  } else {
    console.log("\n✅ PRONTO PARA DEPLOY");
    console.log("Todos os checks passaram com sucesso");
  }
  
  // Salvar relatório
  const report = {
    timestamp: new Date().toISOString(),
    network: "ethereum-mainnet",
    isMainnet: true,
    checks: checks,
    summary: {
      passed,
      warnings,
      failed,
      ready: failed === 0
    }
  };
  
  const reportPath = path.join(__dirname, "../mainnet-readiness-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Relatório salvo em: ${reportPath}`);
  
  return report;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro na verificação:", error);
    process.exit(1);
  });