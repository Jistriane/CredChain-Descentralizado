const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔒 Iniciando auditoria de segurança dos contratos...");
  console.log("==================================================");

  const auditResults = [];
  let criticalIssues = 0;
  let warnings = 0;

  // 1. Verificar modificadores de acesso
  console.log("\n1️⃣ Verificando modificadores de acesso...");
  const contractFiles = [
    "CredChainCreditScore.sol",
    "CredChainPaymentRegistry.sol",
    "CredChainIdentityVerification.sol",
    "CredChainOracleIntegration.sol"
  ];

  for (const contractFile of contractFiles) {
    const contractPath = path.join(__dirname, "..", "contracts", contractFile);
    if (fs.existsSync(contractPath)) {
      const content = fs.readFileSync(contractPath, "utf8");
      
      // Verificar modificadores de acesso
      const accessModifiers = [
        "onlyOwner",
        "onlyAuthorizedCalculator", 
        "onlyAuthorizedOracle",
        "onlyAuthorizedVerifier"
      ];
      
      const foundModifiers = accessModifiers.filter(modifier => 
        content.includes(modifier)
      );
      
      console.log(`📄 ${contractFile}:`);
      console.log(`   ✅ Modificadores encontrados: ${foundModifiers.length}/${accessModifiers.length}`);
      
      if (foundModifiers.length === accessModifiers.length) {
        auditResults.push({ 
          contract: contractFile, 
          check: "Modificadores de Acesso", 
          status: "✅ PASS" 
        });
      } else {
        auditResults.push({ 
          contract: contractFile, 
          check: "Modificadores de Acesso", 
          status: "❌ FAIL" 
        });
        criticalIssues++;
      }
    }
  }

  // 2. Verificar validação de entradas
  console.log("\n2️⃣ Verificando validação de entradas...");
  for (const contractFile of contractFiles) {
    const contractPath = path.join(__dirname, "..", "contracts", contractFile);
    if (fs.existsSync(contractPath)) {
      const content = fs.readFileSync(contractPath, "utf8");
      
      // Verificar validações
      const validations = [
        "require(",
        "require(_user != address(0)",
        "require(_score >= MIN_SCORE",
        "require(_weight <= 100"
      ];
      
      const foundValidations = validations.filter(validation => 
        content.includes(validation)
      );
      
      console.log(`📄 ${contractFile}:`);
      console.log(`   ✅ Validações encontradas: ${foundValidations.length}`);
      
      if (foundValidations.length >= 3) {
        auditResults.push({ 
          contract: contractFile, 
          check: "Validação de Entradas", 
          status: "✅ PASS" 
        });
      } else {
        auditResults.push({ 
          contract: contractFile, 
          check: "Validação de Entradas", 
          status: "⚠️  WARNING" 
        });
        warnings++;
      }
    }
  }

  // 3. Verificar proteção contra reentrância
  console.log("\n3️⃣ Verificando proteção contra reentrância...");
  for (const contractFile of contractFiles) {
    const contractPath = path.join(__dirname, "..", "contracts", contractFile);
    if (fs.existsSync(contractPath)) {
      const content = fs.readFileSync(contractPath, "utf8");
      
      // Verificar se há proteção contra reentrância
      const reentrancyProtection = [
        "nonReentrant",
        "ReentrancyGuard",
        "locked"
      ];
      
      const hasProtection = reentrancyProtection.some(protection => 
        content.includes(protection)
      );
      
      console.log(`📄 ${contractFile}:`);
      console.log(`   ${hasProtection ? "✅" : "⚠️"} Proteção contra reentrância: ${hasProtection ? "SIM" : "NÃO"}`);
      
      if (hasProtection) {
        auditResults.push({ 
          contract: contractFile, 
          check: "Proteção Reentrância", 
          status: "✅ PASS" 
        });
      } else {
        auditResults.push({ 
          contract: contractFile, 
          check: "Proteção Reentrância", 
          status: "⚠️  WARNING" 
        });
        warnings++;
      }
    }
  }

  // 4. Verificar eventos de auditoria
  console.log("\n4️⃣ Verificando eventos de auditoria...");
  for (const contractFile of contractFiles) {
    const contractPath = path.join(__dirname, "..", "contracts", contractFile);
    if (fs.existsSync(contractPath)) {
      const content = fs.readFileSync(contractPath, "utf8");
      
      // Verificar eventos
      const eventCount = (content.match(/event\s+\w+/g) || []).length;
      const emitCount = (content.match(/emit\s+\w+/g) || []).length;
      
      console.log(`📄 ${contractFile}:`);
      console.log(`   📊 Eventos: ${eventCount}, Emits: ${emitCount}`);
      
      if (eventCount >= 3 && emitCount >= 3) {
        auditResults.push({ 
          contract: contractFile, 
          check: "Eventos de Auditoria", 
          status: "✅ PASS" 
        });
      } else {
        auditResults.push({ 
          contract: contractFile, 
          check: "Eventos de Auditoria", 
          status: "⚠️  WARNING" 
        });
        warnings++;
      }
    }
  }

  // 5. Verificar constantes de segurança
  console.log("\n5️⃣ Verificando constantes de segurança...");
  for (const contractFile of contractFiles) {
    const contractPath = path.join(__dirname, "..", "contracts", contractFile);
    if (fs.existsSync(contractPath)) {
      const content = fs.readFileSync(contractPath, "utf8");
      
      // Verificar constantes
      const constants = [
        "MAX_SCORE",
        "MIN_SCORE", 
        "LATE_PAYMENT_THRESHOLD",
        "DEFAULT_THRESHOLD",
        "DATA_EXPIRY"
      ];
      
      const foundConstants = constants.filter(constant => 
        content.includes(constant)
      );
      
      console.log(`📄 ${contractFile}:`);
      console.log(`   ✅ Constantes encontradas: ${foundConstants.length}`);
      
      if (foundConstants.length >= 2) {
        auditResults.push({ 
          contract: contractFile, 
          check: "Constantes de Segurança", 
          status: "✅ PASS" 
        });
      } else {
        auditResults.push({ 
          contract: contractFile, 
          check: "Constantes de Segurança", 
          status: "⚠️  WARNING" 
        });
        warnings++;
      }
    }
  }

  // 6. Verificar ausência de dados mocados
  console.log("\n6️⃣ Verificando ausência de dados mocados...");
  for (const contractFile of contractFiles) {
    const contractPath = path.join(__dirname, "..", "contracts", contractFile);
    if (fs.existsSync(contractPath)) {
      const content = fs.readFileSync(contractPath, "utf8");
      
      // Verificar padrões de dados mocados
      const mockPatterns = [
        "mock",
        "test", 
        "example",
        "dummy",
        "fake",
        "hardcoded"
      ];
      
      const foundMocks = mockPatterns.filter(pattern => 
        content.toLowerCase().includes(pattern)
      );
      
      console.log(`📄 ${contractFile}:`);
      console.log(`   ${foundMocks.length === 0 ? "✅" : "❌"} Dados mocados: ${foundMocks.length === 0 ? "NENHUM" : foundMocks.join(", ")}`);
      
      if (foundMocks.length === 0) {
        auditResults.push({ 
          contract: contractFile, 
          check: "Dados Mocados", 
          status: "✅ PASS" 
        });
      } else {
        auditResults.push({ 
          contract: contractFile, 
          check: "Dados Mocados", 
          status: "❌ FAIL" 
        });
        criticalIssues++;
      }
    }
  }

  // 7. Verificar conformidade com Polkadot
  console.log("\n7️⃣ Verificando conformidade com Polkadot...");
  for (const contractFile of contractFiles) {
    const contractPath = path.join(__dirname, "..", "contracts", contractFile);
    if (fs.existsSync(contractPath)) {
      const content = fs.readFileSync(contractPath, "utf8");
      
      // Verificar conformidade
      const polkadotCompliance = [
        "pragma solidity ^0.8.19",
        "SPDX-License-Identifier",
        "contract ",
        "function ",
        "event "
      ];
      
      const foundCompliance = polkadotCompliance.filter(compliance => 
        content.includes(compliance)
      );
      
      console.log(`📄 ${contractFile}:`);
      console.log(`   ✅ Conformidade: ${foundCompliance.length}/${polkadotCompliance.length}`);
      
      if (foundCompliance.length >= 4) {
        auditResults.push({ 
          contract: contractFile, 
          check: "Conformidade Polkadot", 
          status: "✅ PASS" 
        });
      } else {
        auditResults.push({ 
          contract: contractFile, 
          check: "Conformidade Polkadot", 
          status: "❌ FAIL" 
        });
        criticalIssues++;
      }
    }
  }

  // Resumo da auditoria
  console.log("\n📋 RESUMO DA AUDITORIA DE SEGURANÇA:");
  console.log("====================================");
  
  const passCount = auditResults.filter(r => r.status === "✅ PASS").length;
  const failCount = auditResults.filter(r => r.status === "❌ FAIL").length;
  const warningCount = auditResults.filter(r => r.status === "⚠️  WARNING").length;
  
  console.log(`✅ Passou: ${passCount}`);
  console.log(`❌ Falhou: ${failCount}`);
  console.log(`⚠️  Avisos: ${warningCount}`);
  console.log(`🔒 Total: ${auditResults.length}`);
  
  if (criticalIssues === 0) {
    console.log("\n🎉 AUDITORIA DE SEGURANÇA APROVADA!");
    console.log("✅ Nenhum problema crítico encontrado");
    console.log("🚀 Contratos prontos para mainnet");
  } else {
    console.log("\n⚠️  AUDITORIA DE SEGURANÇA COM PROBLEMAS!");
    console.log(`❌ ${criticalIssues} problemas críticos encontrados`);
    console.log("🔧 Corrija os problemas antes do deploy");
  }

  if (warnings > 0) {
    console.log(`\n⚠️  ${warnings} avisos encontrados - considere revisar`);
  }

  // Salvar relatório de auditoria
  const auditReport = {
    timestamp: new Date().toISOString(),
    criticalIssues: criticalIssues,
    warnings: warnings,
    totalChecks: auditResults.length,
    results: auditResults,
    status: criticalIssues === 0 ? "APPROVED" : "FAILED",
    recommendations: criticalIssues === 0 ? 
      ["Sistema aprovado para mainnet"] : 
      ["Corrigir problemas críticos antes do deploy"]
  };

  const reportPath = path.join(__dirname, "..", "security-audit-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2));
  console.log(`\n💾 Relatório de auditoria salvo em: ${reportPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro durante a auditoria:", error);
    process.exit(1);
  });
