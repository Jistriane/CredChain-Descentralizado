const fs = require('fs');
const path = require('path');

/**
 * Script para adicionar apenas as proteções de segurança essenciais
 */

console.log('🔒 Adicionando proteções de segurança essenciais...');

const contracts = [
  'CredChainCreditScore.sol',
  'CredChainPaymentRegistry.sol',
  'CredChainIdentityVerification.sol',
  'CredChainOracleIntegration.sol'
];

function addSecurityToContract(contractName) {
  const contractPath = path.join(__dirname, '..', 'contracts', contractName);
  
  if (!fs.existsSync(contractPath)) {
    console.log(`  ⚠️  ${contractName} não encontrado`);
    return;
  }
  
  console.log(`🔧 Adicionando segurança ao ${contractName}...`);
  
  let content = fs.readFileSync(contractPath, 'utf8');
  
  // Adicionar imports de segurança no início
  if (!content.includes('@openzeppelin/contracts')) {
    content = content.replace(
      /pragma solidity \^0\.8\.19;/,
      `pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";`
    );
  }
  
  // Adicionar herança de contratos de segurança
  const contractNameOnly = contractName.replace('.sol', '');
  content = content.replace(
    new RegExp(`contract ${contractNameOnly} \\{`),
    `contract ${contractNameOnly} is ReentrancyGuard, Ownable, Pausable {`
  );
  
  // Adicionar eventos de auditoria
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
  
  // Adicionar funções de pausa
  if (!content.includes('function pause()')) {
    const constructorRegex = /constructor\(\) \{[\s\S]*?\}\s*\n/;
    const constructorMatch = content.match(constructorRegex);
    if (constructorMatch) {
      const constructorIndex = content.lastIndexOf(constructorMatch[0]) + constructorMatch[0].length;
      const pauseFunctions = `
    // Funções de pausa para emergências
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
`;
      content = content.slice(0, constructorIndex) + pauseFunctions + content.slice(constructorIndex);
    }
  }
  
  // Adicionar validações de entrada
  if (!content.includes('_validateAddress')) {
    const constructorRegex = /constructor\(\) \{[\s\S]*?\}\s*\n/;
    const constructorMatch = content.match(constructorRegex);
    if (constructorMatch) {
      const constructorIndex = content.lastIndexOf(constructorMatch[0]) + constructorMatch[0].length;
      const validationFunctions = `
    // Validações de entrada
    function _validateAddress(address _addr) internal pure {
        require(_addr != address(0), "Invalid address");
    }
    
    function _validateString(string memory _str) internal pure {
        require(bytes(_str).length > 0, "String cannot be empty");
    }
    
    function _validateAmount(uint256 _amount) internal pure {
        require(_amount > 0, "Amount must be greater than 0");
    }
`;
      content = content.slice(0, constructorIndex) + validationFunctions + content.slice(constructorIndex);
    }
  }
  
  // Adicionar modificador nonReentrant às funções críticas
  const criticalFunctions = [
    'updateScore',
    'addScoreFactor',
    'registerPayment',
    'verifyPayment',
    'requestVerification',
    'completeVerification',
    'updateOracleData',
    'registerOracle'
  ];
  
  criticalFunctions.forEach(funcName => {
    const funcRegex = new RegExp(`function ${funcName}\\([^)]*\\)`, 'g');
    content = content.replace(funcRegex, `function ${funcName}(...) nonReentrant whenNotPaused`);
  });
  
  // Salvar arquivo
  fs.writeFileSync(contractPath, content);
  console.log(`  ✅ ${contractName} atualizado com segurança`);
}

// Aplicar segurança a todos os contratos
contracts.forEach(addSecurityToContract);

console.log('\n🎉 Proteções de segurança adicionadas!');
console.log('\n📋 Próximos passos:');
console.log('1. npm run compile');
console.log('2. npm run test');
console.log('3. npm run check:mainnet');
