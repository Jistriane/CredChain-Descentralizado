const fs = require('fs');
const path = require('path');

/**
 * Script para verificar se os contratos estão prontos para deploy em mainnet
 * Baseado nos relatórios de auditoria e prontidão
 */

console.log('🔍 Verificando prontidão para mainnet...');

// Configurações de mainnet
const mainnetConfig = {
  network: 'polkadot',
  chainId: 0,
  rpcUrl: 'https://rpc.polkadot.io',
  requiredEnvVars: [
    'PRIVATE_KEY',
    'POLKADOT_RPC_URL'
  ],
  requiredChecks: [
    'compilation',
    'security',
    'noMockData',
    'environmentVariables',
    'gasOptimization',
    'accessControl',
    'reentrancyProtection'
  ]
};

// Função para verificar variáveis de ambiente
function checkEnvironmentVariables() {
  console.log('\n🌍 Verificando variáveis de ambiente...');
  
  const envFile = path.join(__dirname, '..', '.env');
  const envExample = path.join(__dirname, '..', 'env.example');
  
  if (!fs.existsSync(envFile)) {
    console.log('  ❌ Arquivo .env não encontrado');
    console.log('  📝 Copie env.example para .env e configure as variáveis');
    return false;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const missingVars = [];
  
  mainnetConfig.requiredEnvVars.forEach(varName => {
    if (!envContent.includes(varName) || envContent.includes(`${varName}=your_`)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log('  ❌ Variáveis de ambiente faltando:', missingVars.join(', '));
    return false;
  }
  
  console.log('  ✅ Variáveis de ambiente configuradas');
  return true;
}

// Função para verificar compilação
function checkCompilation() {
  console.log('\n🔨 Verificando compilação...');
  
  const artifactsDir = path.join(__dirname, '..', 'artifacts', 'contracts');
  
  if (!fs.existsSync(artifactsDir)) {
    console.log('  ❌ Artifacts não encontrados. Execute: npx hardhat compile');
    return false;
  }
  
  const contracts = [
    'CredChainCreditScore.sol',
    'CredChainPaymentRegistry.sol',
    'CredChainIdentityVerification.sol',
    'CredChainOracleIntegration.sol'
  ];
  
  const missingArtifacts = [];
  
  contracts.forEach(contract => {
    const artifactPath = path.join(artifactsDir, contract, `${contract.replace('.sol', '')}.json`);
    if (!fs.existsSync(artifactPath)) {
      missingArtifacts.push(contract);
    }
  });
  
  if (missingArtifacts.length > 0) {
    console.log('  ❌ Artifacts faltando:', missingArtifacts.join(', '));
    return false;
  }
  
  console.log('  ✅ Todos os contratos compilados');
  return true;
}

// Função para verificar dados mockados
function checkMockData() {
  console.log('\n🚫 Verificando dados mockados...');
  
  const contractsDir = path.join(__dirname, '..', 'contracts');
  const contracts = fs.readdirSync(contractsDir).filter(file => file.endsWith('.sol'));
  
  let hasMockData = false;
  
  contracts.forEach(contract => {
    const contractPath = path.join(contractsDir, contract);
    const content = fs.readFileSync(contractPath, 'utf8');
    
    const mockPatterns = [
      /mock|Mock|test|Test|fake|Fake|dummy|Dummy/,
      /hardcoded|hardcoded|example|Example/,
      /0x0000000000000000000000000000000000000000/,
      /123456789/,
      /test@example\.com/
    ];
    
    mockPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        console.log(`  ⚠️  Possível dado mockado encontrado em ${contract}`);
        hasMockData = true;
      }
    });
  });
  
  if (hasMockData) {
    console.log('  ❌ Dados mockados encontrados');
    return false;
  }
  
  console.log('  ✅ Nenhum dado mockado encontrado');
  return true;
}

// Função para verificar segurança
function checkSecurity() {
  console.log('\n🔒 Verificando segurança...');
  
  const contractsDir = path.join(__dirname, '..', 'contracts');
  const contracts = fs.readdirSync(contractsDir).filter(file => file.endsWith('.sol'));
  
  const securityChecks = [
    {
      name: 'Proteção contra reentrância',
      pattern: /ReentrancyGuard|nonReentrant|locked/,
      required: true
    },
    {
      name: 'Modificadores de acesso',
      pattern: /onlyOwner|onlyAuthorized|modifier/,
      required: true
    },
    {
      name: 'Validação de entradas',
      pattern: /require.*valid|_validate|require.*address/,
      required: true
    },
    {
      name: 'Eventos de auditoria',
      pattern: /event.*Security|event.*Access|event.*Update/,
      required: true
    },
    {
      name: 'Pausabilidade',
      pattern: /Pausable|pause|unpause/,
      required: false
    }
  ];
  
  let allSecure = true;
  
  contracts.forEach(contract => {
    const contractPath = path.join(contractsDir, contract);
    const content = fs.readFileSync(contractPath, 'utf8');
    
    console.log(`  📋 Verificando ${contract}:`);
    
    securityChecks.forEach(check => {
      const hasPattern = check.pattern.test(content);
      const status = hasPattern ? '✅' : (check.required ? '❌' : '⚠️');
      console.log(`    ${status} ${check.name}: ${hasPattern ? 'OK' : 'FALTANDO'}`);
      
      if (check.required && !hasPattern) {
        allSecure = false;
      }
    });
  });
  
  return allSecure;
}

// Função para verificar otimização de gas
function checkGasOptimization() {
  console.log('\n⛽ Verificando otimização de gas...');
  
  const hardhatConfig = path.join(__dirname, '..', 'hardhat.config.js');
  const configContent = fs.readFileSync(hardhatConfig, 'utf8');
  
  if (!configContent.includes('optimizer') || !configContent.includes('enabled: true')) {
    console.log('  ❌ Otimizador de gas não configurado');
    return false;
  }
  
  console.log('  ✅ Otimizador de gas configurado');
  return true;
}

// Função para verificar configuração de rede
function checkNetworkConfig() {
  console.log('\n🌐 Verificando configuração de rede...');
  
  const hardhatConfig = path.join(__dirname, '..', 'hardhat.config.js');
  const configContent = fs.readFileSync(hardhatConfig, 'utf8');
  
  if (!configContent.includes('polkadot') || !configContent.includes('chainId: 0')) {
    console.log('  ❌ Configuração de rede Polkadot não encontrada');
    return false;
  }
  
  console.log('  ✅ Configuração de rede Polkadot encontrada');
  return true;
}

// Função principal
function main() {
  console.log('🚀 Verificação de prontidão para mainnet');
  console.log('==========================================');
  
  const checks = [
    { name: 'Variáveis de ambiente', fn: checkEnvironmentVariables },
    { name: 'Compilação', fn: checkCompilation },
    { name: 'Dados mockados', fn: checkMockData },
    { name: 'Segurança', fn: checkSecurity },
    { name: 'Otimização de gas', fn: checkGasOptimization },
    { name: 'Configuração de rede', fn: checkNetworkConfig }
  ];
  
  const results = [];
  
  checks.forEach(check => {
    try {
      const result = check.fn();
      results.push({ name: check.name, status: result });
    } catch (error) {
      console.log(`  ❌ Erro ao verificar ${check.name}:`, error.message);
      results.push({ name: check.name, status: false });
    }
  });
  
  // Resumo
  console.log('\n📊 Resumo da verificação:');
  console.log('========================');
  
  const passed = results.filter(r => r.status).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.status ? '✅' : '❌';
    console.log(`  ${status} ${result.name}`);
  });
  
  console.log(`\n📈 Resultado: ${passed}/${total} verificações passaram`);
  
  if (passed === total) {
    console.log('\n🎉 CONTRATOS PRONTOS PARA MAINNET!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Configure as variáveis de ambiente em .env');
    console.log('2. Execute: npm run deploy:mainnet');
    console.log('3. Verifique os contratos: npm run verify:mainnet');
  } else {
    console.log('\n⚠️  CORREÇÕES NECESSÁRIAS ANTES DO DEPLOY');
    console.log('\n🔧 Execute os seguintes comandos:');
    console.log('1. npm run fix-security');
    console.log('2. npm run compile');
    console.log('3. npm run test');
    console.log('4. npm run security-audit');
  }
  
  // Salvar relatório
  const report = {
    timestamp: new Date().toISOString(),
    network: 'polkadot',
    isMainnet: passed === total,
    checks: results.map(r => ({
      name: r.name,
      status: r.status ? '✅ PASS' : '❌ FAIL'
    })),
    allPassed: passed === total,
    recommendations: passed === total ? 
      ['Contratos prontos para deploy em mainnet'] : 
      ['Corrigir problemas identificados antes do deploy']
  };
  
  const reportPath = path.join(__dirname, '..', 'mainnet-readiness-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Relatório salvo em: ${reportPath}`);
}

// Executar verificação
main();
