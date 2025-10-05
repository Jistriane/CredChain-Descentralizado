const fs = require('fs');
const path = require('path');

/**
 * Script para remover declarações duplicadas que conflitam com OpenZeppelin
 */

console.log('🧹 Removendo declarações duplicadas...');

const contracts = [
  'CredChainCreditScore.sol',
  'CredChainPaymentRegistry.sol',
  'CredChainIdentityVerification.sol',
  'CredChainOracleIntegration.sol'
];

function removeDuplicates(contractName) {
  const contractPath = path.join(__dirname, '..', 'contracts', contractName);
  
  if (!fs.existsSync(contractPath)) {
    console.log(`  ⚠️  ${contractName} não encontrado`);
    return;
  }
  
  console.log(`🧹 Removendo duplicatas do ${contractName}...`);
  
  let content = fs.readFileSync(contractPath, 'utf8');
  
  // Remover declarações duplicadas de owner
  content = content.replace(/address public owner;\s*\n/g, '');
  
  // Remover modificadores onlyOwner duplicados
  content = content.replace(/modifier onlyOwner\(\) \{[\s\S]*?\}\s*\n/g, '');
  
  // Salvar arquivo
  fs.writeFileSync(contractPath, content);
  console.log(`  ✅ ${contractName} limpo`);
}

// Limpar todos os contratos
contracts.forEach(removeDuplicates);

console.log('\n🎉 Duplicatas removidas!');
console.log('\n📋 Próximos passos:');
console.log('1. npm run compile');
console.log('2. npm run test');
console.log('3. npm run check:mainnet');
