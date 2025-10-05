const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🔍 Verificando prontidão para deploy na Ethereum Mainnet...");
  
  // Verificar se estamos em ambiente Hardhat
  if (typeof hre === 'undefined') {
    console.log("⚠️  Executando fora do ambiente Hardhat");
    console.log("💡 Execute com: npx hardhat run scripts/verify-ethereum-readiness.js");
  }

  const checks = [];
  let passed = 0;
  let total = 0;

  // Configurações de mainnet Ethereum
  const mainnetConfig = {
    requiredEnvVars: [
      'PRIVATE_KEY',
      'ETHEREUM_RPC_URL',
      'ETHERSCAN_API_KEY'
    ],
    minBalance: 0.01, // ETH mínimo necessário
    requiredGasPrice: 20, // Gwei mínimo
    networkName: 'mainnet',
    chainId: 1
  };

  // 1. Verificar variáveis de ambiente
  console.log("\n🔧 Verificando variáveis de ambiente...");
  total++;
  
  const missingEnvVars = mainnetConfig.requiredEnvVars.filter(varName => {
    return !process.env[varName] || process.env[varName] === `your_${varName.toLowerCase()}_here`;
  });

  if (missingEnvVars.length === 0) {
    console.log("✅ Todas as variáveis de ambiente configuradas");
    checks.push({ name: "Variáveis de ambiente", status: "✅ PASS" });
    passed++;
  } else {
    console.log("❌ Variáveis de ambiente faltando:", missingEnvVars.join(", "));
    checks.push({ name: "Variáveis de ambiente", status: "❌ FAIL" });
  }

  // 2. Verificar configuração de rede
  console.log("\n🌐 Verificando configuração de rede...");
  total++;
  
  let network = "localhost";
  let isMainnet = false;
  
  if (typeof hre !== 'undefined') {
    network = hre.network.name;
    isMainnet = network === "mainnet";
  }
  
  if (isMainnet) {
    console.log("✅ Rede configurada para Ethereum mainnet:", network);
    checks.push({ name: "Rede Mainnet", status: "✅ PASS" });
    passed++;
  } else {
    console.log("⚠️  Rede atual:", network, "- Certifique-se de que está configurada para mainnet");
    checks.push({ name: "Rede Mainnet", status: "⚠️  WARNING" });
  }

  // 3. Verificar saldo da conta
  console.log("\n💰 Verificando saldo da conta...");
  total++;
  
  try {
    const [deployer] = await ethers.getSigners();
    const balance = await deployer.provider.getBalance(deployer.address);
    const balanceInEth = parseFloat(ethers.formatEther(balance));
    
    console.log("💰 Saldo da conta:", balanceInEth, "ETH");
    
    if (balanceInEth >= mainnetConfig.minBalance) {
      console.log("✅ Saldo suficiente para deploy");
      checks.push({ name: "Saldo da conta", status: "✅ PASS" });
      passed++;
    } else {
      console.log("❌ Saldo insuficiente. Mínimo necessário:", mainnetConfig.minBalance, "ETH");
      checks.push({ name: "Saldo da conta", status: "❌ FAIL" });
    }
  } catch (error) {
    console.log("❌ Erro ao verificar saldo:", error.message);
    checks.push({ name: "Saldo da conta", status: "❌ FAIL" });
  }

  // 4. Verificar compilação dos contratos
  console.log("\n🔨 Verificando compilação dos contratos...");
  total++;
  
  try {
    await hre.run("compile");
    console.log("✅ Contratos compilados com sucesso");
    checks.push({ name: "Compilação", status: "✅ PASS" });
    passed++;
  } catch (error) {
    console.log("❌ Erro na compilação:", error.message);
    checks.push({ name: "Compilação", status: "❌ FAIL" });
  }

  // 5. Verificar testes
  console.log("\n🧪 Verificando testes...");
  total++;
  
  try {
    await hre.run("test");
    console.log("✅ Todos os testes passaram");
    checks.push({ name: "Testes", status: "✅ PASS" });
    passed++;
  } catch (error) {
    console.log("❌ Erro nos testes:", error.message);
    checks.push({ name: "Testes", status: "❌ FAIL" });
  }

  // 6. Verificar auditoria de segurança
  console.log("\n🔒 Verificando auditoria de segurança...");
  total++;
  
  const securityReportPath = path.join(__dirname, '..', 'security-audit-report.json');
  if (fs.existsSync(securityReportPath)) {
    const securityReport = JSON.parse(fs.readFileSync(securityReportPath, 'utf8'));
    
    if (securityReport.criticalIssues === 0) {
      console.log("✅ Nenhum problema crítico de segurança encontrado");
      checks.push({ name: "Auditoria de segurança", status: "✅ PASS" });
      passed++;
    } else {
      console.log("❌ Problemas críticos de segurança encontrados:", securityReport.criticalIssues);
      checks.push({ name: "Auditoria de segurança", status: "❌ FAIL" });
    }
  } else {
    console.log("⚠️  Relatório de auditoria não encontrado");
    checks.push({ name: "Auditoria de segurança", status: "⚠️  WARNING" });
  }

  // 7. Verificar otimização de gas
  console.log("\n⛽ Verificando otimização de gas...");
  total++;
  
  try {
    const gasReport = await hre.run("gas");
    console.log("✅ Relatório de gas gerado");
    checks.push({ name: "Otimização de gas", status: "✅ PASS" });
    passed++;
  } catch (error) {
    console.log("⚠️  Erro ao gerar relatório de gas:", error.message);
    checks.push({ name: "Otimização de gas", status: "⚠️  WARNING" });
  }

  // 8. Verificar configuração de rede
  console.log("\n🌐 Verificando configuração de rede...");
  total++;
  
  const networkConfig = hre.network.config;
  if (networkConfig.chainId === 1 && networkConfig.url.includes('mainnet')) {
    console.log("✅ Configuração de rede correta para Ethereum mainnet");
    checks.push({ name: "Configuração de rede", status: "✅ PASS" });
    passed++;
  } else {
    console.log("❌ Configuração de rede incorreta");
    checks.push({ name: "Configuração de rede", status: "❌ FAIL" });
  }

  // Gerar relatório final
  console.log("\n📊 Relatório de Prontidão:");
  console.log("=========================");
  
  checks.forEach(check => {
    console.log(`${check.status} ${check.name}`);
  });

  const readinessPercentage = Math.round((passed / total) * 100);
  console.log(`\n📈 Prontidão: ${readinessPercentage}% (${passed}/${total})`);

  if (passed === total) {
    console.log("\n🎉 SISTEMA PRONTO PARA ETHEREUM MAINNET!");
    console.log("🚀 Pode proceder com o deploy na mainnet");
    console.log("\n📋 Próximos passos:");
    console.log("1. Execute: npm run deploy:ethereum:mainnet");
    console.log("2. Verifique os contratos: npm run verify:ethereum:mainnet");
    console.log("3. Configure oráculos e verificadores");
    console.log("4. Teste todas as funcionalidades");
  } else {
    console.log("\n⚠️  SISTEMA NÃO ESTÁ PRONTO PARA MAINNET!");
    console.log("🔧 Corrija os problemas identificados antes de prosseguir");
    
    const failedChecks = checks.filter(check => check.status.includes("❌"));
    if (failedChecks.length > 0) {
      console.log("\n❌ Problemas críticos:");
      failedChecks.forEach(check => {
        console.log(`- ${check.name}`);
      });
    }
  }

  // Salvar relatório
  const report = {
    timestamp: new Date().toISOString(),
    network: "ethereum",
    isMainnet: true,
    checks: checks,
    allPassed: passed === total,
    readinessPercentage: readinessPercentage,
    recommendations: passed === total ? 
      ["Sistema pronto para deploy na mainnet"] : 
      ["Corrigir problemas identificados antes do deploy"]
  };

  const reportPath = path.join(__dirname, '..', 'ethereum-readiness-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Relatório salvo em: ${reportPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro durante a verificação:", error);
    process.exit(1);
  });
