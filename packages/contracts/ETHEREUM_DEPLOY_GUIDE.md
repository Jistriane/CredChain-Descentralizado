# Guia de Deploy para Ethereum Mainnet

## 📋 Pré-requisitos

### 1. Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na pasta `packages/contracts/` com as seguintes variáveis:

```bash
# Chave privada para deploy (NUNCA commite este arquivo)
PRIVATE_KEY=your_private_key_here

# URLs RPC para Ethereum
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# API Keys para verificação de contratos
ETHERSCAN_API_KEY=your_etherscan_api_key_here
ALCHEMY_API_KEY=your_alchemy_api_key_here
INFURA_API_KEY=your_infura_api_key_here

# Configurações de Gas
GAS_PRICE=auto
GAS_LIMIT=auto
```

### 2. Saldo de ETH Necessário

- **Mínimo recomendado**: 0.1 ETH
- **Para deploy completo**: 0.2-0.5 ETH
- **Para verificação**: +0.01 ETH

## 🚀 Processo de Deploy

### Passo 1: Verificar Prontidão

```bash
# Verificar se tudo está pronto para mainnet
npm run check:ethereum:mainnet
```

### Passo 2: Deploy em Testnet (Recomendado)

```bash
# Deploy em Sepolia testnet primeiro
npm run deploy:ethereum:sepolia

# Verificar contratos
npm run verify:ethereum:sepolia
```

### Passo 3: Deploy na Mainnet

```bash
# Deploy na Ethereum mainnet
npm run deploy:ethereum:mainnet

# Verificar contratos
npm run verify:ethereum:mainnet
```

## 🔧 Scripts Disponíveis

### Deploy
- `npm run deploy:ethereum:mainnet` - Deploy na mainnet
- `npm run deploy:ethereum:sepolia` - Deploy na testnet Sepolia
- `npm run deploy:ethereum:goerli` - Deploy na testnet Goerli

### Verificação
- `npm run verify:ethereum:mainnet` - Verificar contratos na mainnet
- `npm run verify:ethereum:sepolia` - Verificar contratos na Sepolia

### Verificação de Prontidão
- `npm run check:ethereum:mainnet` - Verificar se está pronto para mainnet

## 📊 Contratos que Serão Deployados

1. **CredChainCreditScore** - Sistema de credit scoring
2. **CredChainPaymentRegistry** - Registro de pagamentos
3. **CredChainIdentityVerification** - Verificação de identidade
4. **CredChainOracleIntegration** - Integração com oráculos

## 🔒 Configurações de Segurança

### Após o Deploy

1. **Configure Oráculos Autorizados**
   ```javascript
   await oracleIntegration.registerOracle(oracleAddress, "Oracle Name");
   ```

2. **Configure Verificadores**
   ```javascript
   await identityVerification.authorizeVerifier(verifierAddress);
   await paymentRegistry.authorizeVerifier(verifierAddress);
   ```

3. **Configure Calculadores de Score**
   ```javascript
   await creditScore.authorizeCalculator(calculatorAddress);
   ```

## ⚠️ Avisos Importantes

### Para Mainnet

- **NUNCA** use chaves privadas reais em arquivos de configuração
- **SEMPRE** teste em testnet primeiro
- **VERIFIQUE** todos os contratos no Etherscan
- **CONFIGURE** oráculos e verificadores antes de usar
- **MONITORE** o sistema após o deploy

### Checklist de Segurança

- [ ] Variáveis de ambiente configuradas
- [ ] Saldo suficiente de ETH
- [ ] Testes executados com sucesso
- [ ] Auditoria de segurança aprovada
- [ ] Configuração de rede correta
- [ ] Oráculos e verificadores configurados
- [ ] Monitoramento ativo

## 📞 Suporte

Em caso de problemas:

1. Verifique os logs de deploy
2. Confirme o saldo de ETH
3. Verifique as configurações de rede
4. Execute testes em testnet primeiro

## 🔗 Links Úteis

- [Etherscan](https://etherscan.io/) - Explorador da blockchain Ethereum
- [Alchemy](https://www.alchemy.com/) - Provedor de RPC
- [Infura](https://infura.io/) - Provedor de RPC
- [OpenZeppelin](https://openzeppelin.com/) - Bibliotecas de segurança
