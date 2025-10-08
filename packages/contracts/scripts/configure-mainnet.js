const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("⚙️  Configurando contratos CredChain na mainnet...");
  
  // Carregar informações de deploy
  const deploymentPath = path.join(__dirname, "../deployments/ethereum-mainnet-deployment.json");
  
  if (!fs.existsSync(deploymentPath)) {
    throw new Error("❌ Arquivo de deploy não encontrado. Execute o deploy primeiro.");
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  
  // Obter o deployer
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  
  // Configurar oráculos autorizados
  console.log("\n🔮 Configurando oráculos autorizados...");
  
  const oracleAddresses = process.env.ORACLE_ADDRESSES ? 
    process.env.ORACLE_ADDRESSES.split(',') : [];
  
  if (oracleAddresses.length > 0) {
    for (const oracleAddress of oracleAddresses) {
      console.log(`📡 Autorizando oráculo: ${oracleAddress}`);
      
      // Autorizar em todos os contratos que suportam oráculos
      const contracts = [
        "CredChainOracleIntegration",
        "CredChainIdentityVerification",
        "CredChainPaymentRegistry",
        "CredChainCreditScore"
      ];
      
      for (const contractName of contracts) {
        try {
          const contract = await ethers.getContractAt(
            contractName, 
            deploymentInfo.contracts[contractName].address
          );
          
          // Verificar se o contrato tem função authorizeOracle
          if (contractName === "CredChainOracleIntegration") {
            await contract.registerOracle(oracleAddress, `Oracle-${oracleAddress.slice(0, 6)}`);
            console.log(`✅ Oráculo registrado em ${contractName}`);
          } else {
            await contract.authorizeOracle(oracleAddress);
            console.log(`✅ Oráculo autorizado em ${contractName}`);
          }
          
        } catch (error) {
          console.log(`⚠️  Erro ao autorizar oráculo em ${contractName}:`, error.message);
        }
      }
    }
  } else {
    console.log("⚠️  Nenhum oráculo configurado");
  }
  
  // Configurar verificadores autorizados
  console.log("\n🔍 Configurando verificadores autorizados...");
  
  const verifierAddresses = process.env.VERIFIER_ADDRESSES ? 
    process.env.VERIFIER_ADDRESSES.split(',') : [];
  
  if (verifierAddresses.length > 0) {
    for (const verifierAddress of verifierAddresses) {
      console.log(`👮 Autorizando verificador: ${verifierAddress}`);
      
      // Autorizar em contratos que suportam verificadores
      const contracts = [
        "CredChainIdentityVerification",
        "CredChainPaymentRegistry"
      ];
      
      for (const contractName of contracts) {
        try {
          const contract = await ethers.getContractAt(
            contractName, 
            deploymentInfo.contracts[contractName].address
          );
          
          await contract.authorizeVerifier(verifierAddress);
          console.log(`✅ Verificador autorizado em ${contractName}`);
          
        } catch (error) {
          console.log(`⚠️  Erro ao autorizar verificador em ${contractName}:`, error.message);
        }
      }
    }
  } else {
    console.log("⚠️  Nenhum verificador configurado");
  }
  
  // Configurar calculadores autorizados
  console.log("\n🧮 Configurando calculadores autorizados...");
  
  const calculatorAddresses = process.env.CALCULATOR_ADDRESSES ? 
    process.env.CALCULATOR_ADDRESSES.split(',') : [];
  
  if (calculatorAddresses.length > 0) {
    for (const calculatorAddress of calculatorAddresses) {
      console.log(`📊 Autorizando calculador: ${calculatorAddress}`);
      
      try {
        const contract = await ethers.getContractAt(
          "CredChainCreditScore", 
          deploymentInfo.contracts.CredChainCreditScore.address
        );
        
        await contract.authorizeCalculator(calculatorAddress);
        console.log(`✅ Calculador autorizado em CredChainCreditScore`);
        
      } catch (error) {
        console.log(`⚠️  Erro ao autorizar calculador:`, error.message);
      }
    }
  } else {
    console.log("⚠️  Nenhum calculador configurado");
  }
  
  // Transferir ownership para multisig (se configurado)
  console.log("\n🏛️  Configurando ownership...");
  
  const multisigAddress = process.env.MULTISIG_ADDRESS;
  
  if (multisigAddress) {
    console.log(`🔄 Transferindo ownership para multisig: ${multisigAddress}`);
    
    const contracts = [
      "CredChainOracleIntegration",
      "CredChainIdentityVerification",
      "CredChainPaymentRegistry",
      "CredChainCreditScore"
    ];
    
    for (const contractName of contracts) {
      try {
        const contract = await ethers.getContractAt(
          contractName, 
          deploymentInfo.contracts[contractName].address
        );
        
        await contract.transferOwnership(multisigAddress);
        console.log(`✅ Ownership transferido para ${contractName}`);
        
      } catch (error) {
        console.log(`⚠️  Erro ao transferir ownership de ${contractName}:`, error.message);
      }
    }
  } else {
    console.log("⚠️  Multisig não configurado - ownership permanece com deployer");
  }
  
  // Configurar timelock (se configurado)
  console.log("\n⏰ Configurando timelock...");
  
  const timelockAddress = process.env.TIMELOCK_ADDRESS;
  
  if (timelockAddress) {
    console.log(`⏰ Timelock configurado: ${timelockAddress}`);
    console.log("ℹ️  Timelock deve ser configurado manualmente nos contratos");
  } else {
    console.log("⚠️  Timelock não configurado");
  }
  
  // Configurar endereços de emergência
  console.log("\n🚨 Configurando endereços de emergência...");
  
  const emergencyPauseAddress = process.env.EMERGENCY_PAUSE_ADDRESS;
  const emergencyRecoveryAddress = process.env.EMERGENCY_RECOVERY_ADDRESS;
  
  if (emergencyPauseAddress) {
    console.log(`⏸️  Endereço de pausa de emergência: ${emergencyPauseAddress}`);
  }
  
  if (emergencyRecoveryAddress) {
    console.log(`🔄 Endereço de recuperação de emergência: ${emergencyRecoveryAddress}`);
  }
  
  console.log("\n🎉 Configuração concluída!");
  
  // Instruções pós-configuração
  console.log("\n📋 Próximos passos:");
  console.log("1. Verificar todas as autorizações");
  console.log("2. Testar funcionalidades principais");
  console.log("3. Configurar monitoramento");
  console.log("4. Configurar alertas de segurança");
  console.log("5. Documentar endereços e configurações");
  console.log("6. Configurar backup e recuperação");
  console.log("7. Treinar equipe em procedimentos de emergência");
  
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro na configuração:", error);
    process.exit(1);
  });
