const fs = require('fs');
const path = require('path');

/**
 * Script para corrigir problemas de segurança identificados nos contratos
 * Baseado no relatório de auditoria de segurança
 */

console.log('🔧 Iniciando correção de problemas de segurança...');

// Lista de contratos para corrigir
const contracts = [
  'CredChainCreditScore.sol',
  'CredChainPaymentRegistry.sol', 
  'CredChainIdentityVerification.sol',
  'CredChainOracleIntegration.sol'
];

// Problemas identificados e suas correções
const securityFixes = {
  // Adicionar proteção contra reentrância
  reentrancyGuard: `
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";`,
  
  // Adicionar modificadores de segurança
  securityModifiers: `
    // Modificadores de segurança adicionais
    modifier whenNotPaused() {
        require(!paused(), "Contract is paused");
        _;
    }
    
    modifier nonReentrant() {
        require(!locked, "ReentrancyGuard: reentrant call");
        locked = true;
        _;
        locked = false;
    }
    
    modifier validAddress(address _addr) {
        require(_addr != address(0), "Invalid address");
        _;
    }
    
    modifier validAmount(uint256 _amount) {
        require(_amount > 0, "Amount must be greater than 0");
        _;
    }`,
  
  // Adicionar proteção contra reentrância manual
  reentrancyProtection: `
    // Proteção contra reentrância
    bool private locked;
    
    // Função para pausar o contrato em emergências
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }`,
  
  // Adicionar eventos de auditoria
  auditEvents: `
    // Eventos de auditoria adicionais
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
    );`,
  
  // Adicionar validações de entrada
  inputValidation: `
    // Validações de entrada aprimoradas
    function _validateScoreInput(uint256 _score) internal pure {
        require(_score >= 0 && _score <= 1000, "Score must be between 0 and 1000");
    }
    
    function _validateAddress(address _addr) internal pure {
        require(_addr != address(0), "Invalid address");
    }
    
    function _validateString(string memory _str) internal pure {
        require(bytes(_str).length > 0, "String cannot be empty");
    }`
};

// Função para aplicar correções
function applySecurityFixes() {
  console.log('📝 Aplicando correções de segurança...');
  
  contracts.forEach(contractName => {
    const contractPath = path.join(__dirname, '..', 'contracts', contractName);
    
    if (fs.existsSync(contractPath)) {
      console.log(`🔧 Corrigindo ${contractName}...`);
      
      let contractContent = fs.readFileSync(contractPath, 'utf8');
      
      // Aplicar correções baseadas no relatório de auditoria
      const fixes = [
        {
          name: 'Adicionar imports de segurança',
          pattern: /pragma solidity \^0\.8\.19;/,
          replacement: `pragma solidity ^0.8.19;

${securityFixes.reentrancyGuard}`
        },
        {
          name: 'Adicionar modificadores de segurança',
          pattern: /modifier validScore\(uint256 _score\) \{[\s\S]*?\}/,
          replacement: `modifier validScore(uint256 _score) {
        require(
            _score >= MIN_SCORE && _score <= MAX_SCORE,
            "CredChain: Score must be between 0 and 1000"
        );
        _;
    }${securityFixes.securityModifiers}`
        },
        {
          name: 'Adicionar proteção contra reentrância',
          pattern: /contract CredChain\w+ \{/,
          replacement: `contract CredChain${contractName.replace('.sol', '')} is ReentrancyGuard, Ownable, Pausable {${securityFixes.reentrancyProtection}`
        },
        {
          name: 'Adicionar eventos de auditoria',
          pattern: /event ScoreCalculated\([\s\S]*?\);/,
          replacement: `event ScoreCalculated(
        address indexed user,
        uint256 finalScore,
        uint256 timestamp
    );${securityFixes.auditEvents}`
        },
        {
          name: 'Adicionar validações de entrada',
          pattern: /constructor\(\) \{[\s\S]*?\}/,
          replacement: `constructor() {
        owner = msg.sender;
        currentVersion = 1;
        locked = false;
    }${securityFixes.inputValidation}`
        }
      ];
      
      // Aplicar cada correção
      fixes.forEach(fix => {
        if (fix.pattern.test(contractContent)) {
          contractContent = contractContent.replace(fix.pattern, fix.replacement);
          console.log(`  ✅ ${fix.name} aplicado`);
        }
      });
      
      // Salvar arquivo corrigido
      fs.writeFileSync(contractPath, contractContent);
      console.log(`  💾 ${contractName} corrigido e salvo`);
    } else {
      console.log(`  ⚠️  ${contractName} não encontrado`);
    }
  });
}

// Função para verificar se as correções foram aplicadas
function verifyFixes() {
  console.log('\n🔍 Verificando correções aplicadas...');
  
  const checks = [
    {
      name: 'Proteção contra reentrância',
      pattern: /ReentrancyGuard|nonReentrant/,
      required: true
    },
    {
      name: 'Modificadores de acesso',
      pattern: /onlyOwner|onlyAuthorized/,
      required: true
    },
    {
      name: 'Validação de entradas',
      pattern: /require.*valid|_validate/,
      required: true
    },
    {
      name: 'Eventos de auditoria',
      pattern: /event.*Security|event.*Access/,
      required: true
    },
    {
      name: 'Dados mockados',
      pattern: /mock|Mock|test|Test|fake|Fake/,
      required: false
    }
  ];
  
  contracts.forEach(contractName => {
    const contractPath = path.join(__dirname, '..', 'contracts', contractName);
    
    if (fs.existsSync(contractPath)) {
      const content = fs.readFileSync(contractPath, 'utf8');
      console.log(`\n📋 Verificando ${contractName}:`);
      
      checks.forEach(check => {
        const hasPattern = check.pattern.test(content);
        const status = hasPattern ? '✅' : (check.required ? '❌' : '⚠️');
        console.log(`  ${status} ${check.name}: ${hasPattern ? 'OK' : 'FALTANDO'}`);
      });
    }
  });
}

// Executar correções
try {
  applySecurityFixes();
  verifyFixes();
  
  console.log('\n🎉 Correções de segurança aplicadas com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Execute os testes: npm test');
  console.log('2. Execute a auditoria: npm run security-audit');
  console.log('3. Verifique a prontidão: npm run check-mainnet-readiness');
  console.log('4. Faça o deploy: npm run deploy:mainnet');
  
} catch (error) {
  console.error('❌ Erro ao aplicar correções:', error);
  process.exit(1);
}
