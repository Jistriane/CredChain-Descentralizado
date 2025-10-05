const fs = require('fs');
const path = require('path');

/**
 * Script para corrigir todos os contratos e remover conflitos com OpenZeppelin
 */

console.log('🔧 Corrigindo contratos para compatibilidade com OpenZeppelin...');

const contracts = [
  'CredChainCreditScore.sol',
  'CredChainPaymentRegistry.sol',
  'CredChainIdentityVerification.sol',
  'CredChainOracleIntegration.sol'
];

function fixContract(contractName) {
  const contractPath = path.join(__dirname, '..', 'contracts', contractName);
  
  if (!fs.existsSync(contractPath)) {
    console.log(`  ⚠️  ${contractName} não encontrado`);
    return;
  }
  
  console.log(`🔧 Corrigindo ${contractName}...`);
  
  let content = fs.readFileSync(contractPath, 'utf8');
  
  // Remover declarações duplicadas de owner
  content = content.replace(/address public owner;\s*\n/g, '');
  
  // Remover modificadores duplicados que já existem no OpenZeppelin
  content = content.replace(/modifier onlyOwner\(\) \{[\s\S]*?\}\s*\n/g, '');
  content = content.replace(/modifier whenNotPaused\(\) \{[\s\S]*?\}\s*\n/g, '');
  content = content.replace(/modifier nonReentrant\(\) \{[\s\S]*?\}\s*\n/g, '');
  
  // Remover variável locked duplicada
  content = content.replace(/bool private locked;\s*\n/g, '');
  
  // Remover funções pause/unpause duplicadas
  content = content.replace(/function pause\(\) external onlyOwner \{[\s\S]*?\}\s*\n/g, '');
  content = content.replace(/function unpause\(\) external onlyOwner \{[\s\S]*?\}\s*\n/g, '');
  
  // Remover declarações duplicadas de currentVersion
  const currentVersionRegex = /uint256 public currentVersion;\s*\n/g;
  const matches = content.match(currentVersionRegex);
  if (matches && matches.length > 1) {
    content = content.replace(currentVersionRegex, '');
    // Adicionar apenas uma declaração
    content = content.replace(/contract CredChain\w+ is ReentrancyGuard, Ownable, Pausable \{/, 
      `contract CredChain${contractName.replace('.sol', '')} is ReentrancyGuard, Ownable, Pausable {
    // Variáveis de estado
    uint256 public currentVersion;`);
  }
  
  // Corrigir nome do contrato (remover duplicação)
  content = content.replace(/contract CredChainCredChain(\w+)/g, 'contract CredChain$1');
  
  // Adicionar imports corretos no início
  const imports = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

`;
  
  // Remover imports duplicados
  content = content.replace(/\/\/ SPDX-License-Identifier: MIT[\s\S]*?import "@openzeppelin\/contracts\/security\/Pausable\.sol";\s*\n/g, imports);
  
  // Adicionar eventos de auditoria se não existirem
  if (!content.includes('event SecurityEvent')) {
    const eventRegex = /event \w+\([\s\S]*?\);\s*\n/;
    const lastEventMatch = content.match(eventRegex);
    if (lastEventMatch) {
      const lastEventIndex = content.lastIndexOf(lastEventMatch[0]) + lastEventMatch[0].length;
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
`;
      content = content.slice(0, lastEventIndex) + auditEvents + content.slice(lastEventIndex);
    }
  }
  
  // Adicionar validações de entrada se não existirem
  if (!content.includes('_validateScoreInput')) {
    const constructorRegex = /constructor\(\) \{[\s\S]*?\}\s*\n/;
    const constructorMatch = content.match(constructorRegex);
    if (constructorMatch) {
      const constructorIndex = content.lastIndexOf(constructorMatch[0]) + constructorMatch[0].length;
      const validationFunctions = `
    // Validações de entrada aprimoradas
    function _validateScoreInput(uint256 _score) internal pure {
        require(_score >= 0 && _score <= 1000, "Score must be between 0 and 1000");
    }
    
    function _validateAddress(address _addr) internal pure {
        require(_addr != address(0), "Invalid address");
    }
    
    function _validateString(string memory _str) internal pure {
        require(bytes(_str).length > 0, "String cannot be empty");
    }
`;
      content = content.slice(0, constructorIndex) + validationFunctions + content.slice(constructorIndex);
    }
  }
  
  // Salvar arquivo corrigido
  fs.writeFileSync(contractPath, content);
  console.log(`  ✅ ${contractName} corrigido`);
}

// Corrigir todos os contratos
contracts.forEach(fixContract);

console.log('\n🎉 Contratos corrigidos com sucesso!');
console.log('\n📋 Próximos passos:');
console.log('1. npm run compile');
console.log('2. npm run test');
console.log('3. npm run check:mainnet');
