const fs = require('fs');
const path = require('path');

/**
 * Script para adicionar eventos de auditoria aos contratos
 */

console.log('🔍 Adicionando eventos de auditoria aos contratos...');

const contracts = [
  'CredChainIdentityVerification.sol',
  'CredChainPaymentRegistry.sol'
];

const auditEvents = `
    // Eventos de auditoria
    event SecurityEvent(
        string indexed eventType,
        address indexed user,
        uint256 timestamp,
        string details
    );
    
    event AccessGranted(
        address indexed user,
        string indexed role,
        uint256 timestamp
    );
    
    event AccessRevoked(
        address indexed user,
        string indexed role,
        uint256 timestamp
    );
    
    event ContractPaused(
        address indexed admin,
        uint256 timestamp,
        string reason
    );
    
    event ContractUnpaused(
        address indexed admin,
        uint256 timestamp
    );
`;

function addAuditEvents(contractName) {
  const contractPath = path.join(__dirname, '..', 'contracts', contractName);
  
  if (!fs.existsSync(contractPath)) {
    console.log(`  ⚠️  ${contractName} não encontrado`);
    return;
  }
  
  console.log(`🔧 Adicionando eventos de auditoria ao ${contractName}...`);
  
  let content = fs.readFileSync(contractPath, 'utf8');
  
  // Encontrar o último evento e adicionar os eventos de auditoria
  const eventRegex = /event \w+\([\s\S]*?\);\s*\n/g;
  const events = content.match(eventRegex);
  
  if (events && events.length > 0) {
    const lastEvent = events[events.length - 1];
    const lastEventIndex = content.lastIndexOf(lastEvent) + lastEvent.length;
    
    content = content.slice(0, lastEventIndex) + auditEvents + content.slice(lastEventIndex);
    
    // Salvar arquivo
    fs.writeFileSync(contractPath, content);
    console.log(`  ✅ ${contractName} atualizado com eventos de auditoria`);
  } else {
    console.log(`  ⚠️  Nenhum evento encontrado em ${contractName}`);
  }
}

// Adicionar eventos de auditoria aos contratos
contracts.forEach(addAuditEvents);

console.log('\n🎉 Eventos de auditoria adicionados!');
console.log('\n📋 Próximos passos:');
console.log('1. npm run compile');
console.log('2. npm run test');
console.log('3. npm run check:mainnet');
