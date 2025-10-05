const fs = require('fs');
const path = require('path');

/**
 * Script para corrigir referências ao owner (OpenZeppelin usa função, não variável)
 */

console.log('🔧 Corrigindo referências ao owner...');

const contracts = [
  'CredChainCreditScore.sol',
  'CredChainPaymentRegistry.sol',
  'CredChainIdentityVerification.sol',
  'CredChainOracleIntegration.sol'
];

function fixOwnerReferences(contractName) {
  const contractPath = path.join(__dirname, '..', 'contracts', contractName);
  
  if (!fs.existsSync(contractPath)) {
    console.log(`  ⚠️  ${contractName} não encontrado`);
    return;
  }
  
  console.log(`🔧 Corrigindo referências do ${contractName}...`);
  
  let content = fs.readFileSync(contractPath, 'utf8');
  
  // Substituir msg.sender == owner por msg.sender == owner()
  content = content.replace(/msg\.sender == owner/g, 'msg.sender == owner()');
  
  // Remover atribuições owner = msg.sender (já é feito pelo OpenZeppelin)
  content = content.replace(/owner = msg\.sender;\s*\n/g, '');
  
  // Salvar arquivo
  fs.writeFileSync(contractPath, content);
  console.log(`  ✅ ${contractName} corrigido`);
}

// Corrigir todos os contratos
contracts.forEach(fixOwnerReferences);

console.log('\n🎉 Referências ao owner corrigidas!');
console.log('\n📋 Próximos passos:');
console.log('1. npm run compile');
console.log('2. npm run test');
console.log('3. npm run check:mainnet');
