const { run } = require("hardhat");

async function main() {
  console.log("🔍 Iniciando verificação dos contratos CredChain...");

  // Verificar se estamos em mainnet
  const isMainnet = hre.network.name === "polkadot";
  
  if (isMainnet) {
    console.log("⚠️  ATENÇÃO: Verificação em MAINNET!");
    console.log("🔒 Verificando contratos na rede principal...");
  } else {
    console.log("🧪 Verificando contratos na testnet...");
  }

  try {
    // Verificar CredChainCreditScore
    console.log("\n📊 Verificando CredChainCreditScore...");
    await run("verify:verify", {
      address: process.env.CREDIT_SCORE_ADDRESS,
      constructorArguments: [],
    });
    console.log("✅ CredChainCreditScore verificado com sucesso!");

    // Verificar CredChainPaymentRegistry
    console.log("\n💳 Verificando CredChainPaymentRegistry...");
    await run("verify:verify", {
      address: process.env.PAYMENT_REGISTRY_ADDRESS,
      constructorArguments: [],
    });
    console.log("✅ CredChainPaymentRegistry verificado com sucesso!");

    // Verificar CredChainIdentityVerification
    console.log("\n🆔 Verificando CredChainIdentityVerification...");
    await run("verify:verify", {
      address: process.env.IDENTITY_VERIFICATION_ADDRESS,
      constructorArguments: [],
    });
    console.log("✅ CredChainIdentityVerification verificado com sucesso!");

    // Verificar CredChainOracleIntegration
    console.log("\n🔮 Verificando CredChainOracleIntegration...");
    await run("verify:verify", {
      address: process.env.ORACLE_INTEGRATION_ADDRESS,
      constructorArguments: [],
    });
    console.log("✅ CredChainOracleIntegration verificado com sucesso!");

    console.log("\n🎉 Todos os contratos foram verificados com sucesso!");
    console.log("📋 Contratos verificados:");
    console.log("   - CredChainCreditScore:", process.env.CREDIT_SCORE_ADDRESS);
    console.log("   - CredChainPaymentRegistry:", process.env.PAYMENT_REGISTRY_ADDRESS);
    console.log("   - CredChainIdentityVerification:", process.env.IDENTITY_VERIFICATION_ADDRESS);
    console.log("   - CredChainOracleIntegration:", process.env.ORACLE_INTEGRATION_ADDRESS);

  } catch (error) {
    console.error("❌ Erro durante a verificação:", error.message);
    
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  Contrato já foi verificado anteriormente");
    } else if (error.message.includes("Contract source code already verified")) {
      console.log("ℹ️  Código fonte do contrato já foi verificado");
    } else {
      console.log("🔧 Verifique as configurações e tente novamente");
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro durante a verificação:", error);
    process.exit(1);
  });
