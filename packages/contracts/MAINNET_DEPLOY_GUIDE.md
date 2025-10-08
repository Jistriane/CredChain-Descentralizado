# 🚀 Guia de Deploy dos Contratos CredChain na Mainnet

## 📋 Pré-requisitos

### 1. Configuração de Ambiente
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.production
```

### 2. Variáveis de Ambiente Obrigatórias
```bash
# Chave privada do deployer (NUNCA commitar)
PRIVATE_KEY=your_private_key_here

# URLs de RPC para mainnet
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
POLKADOT_RPC_URL=https://rpc.polkadot.io

# Chaves de API para verificação
ETHERSCAN_API_KEY=your_etherscan_api_key
POLKASCAN_API_KEY=your_polkascan_api_key

# Configurações de gas
GAS_PRICE=20000000000
GAS_LIMIT=8000000

# Configurações de rede
NETWORK=mainnet
CHAIN_ID=1

# Configurações de deploy
DEPLOYER_ADDRESS=your_deployer_address
OWNER_ADDRESS=your_owner_address

# Configurações de segurança
MULTISIG_ADDRESS=your_multisig_address
TIMELOCK_ADDRESS=your_timelock_address

# Configurações de oráculos
ORACLE_ADDRESSES=oracle1,oracle2,oracle3
VERIFIER_ADDRESSES=verifier1,verifier2,verifier3
CALCULATOR_ADDRESSES=calculator1,calculator2

# Configurações de emergência
EMERGENCY_PAUSE_ADDRESS=your_emergency_pause_address
EMERGENCY_RECOVERY_ADDRESS=your_emergency_recovery_address
```

## 🔧 Preparação

### 1. Verificar Configuração
```bash
# Verificar se as variáveis estão configuradas
npm run check:env

# Verificar se a rede está acessível
npm run check:network
```

### 2. Compilar Contratos
```bash
# Compilar contratos
npx hardhat compile

# Verificar se não há erros
npx hardhat test
```

### 3. Verificar Saldo
```bash
# Verificar saldo do deployer
npx hardhat run scripts/check-balance.js --network mainnet
```

## 🚀 Deploy

### 1. Deploy dos Contratos
```bash
# Deploy na mainnet
npx hardhat run scripts/deploy-mainnet.js --network mainnet
```

### 2. Verificar Deploy
```bash
# Verificar contratos deployados
npx hardhat run scripts/verify-mainnet.js --network mainnet
```

### 3. Configurar Contratos
```bash
# Configurar oráculos, verificadores e calculadores
npx hardhat run scripts/configure-mainnet.js --network mainnet
```

### 4. Testar Contratos
```bash
# Testar funcionalidades principais
npx hardhat run scripts/test-mainnet.js --network mainnet
```

## 🔍 Verificação

### 1. Verificar no Etherscan
```bash
# Verificar contratos no Etherscan
npx hardhat verify --network mainnet <CONTRACT_ADDRESS>
```

### 2. Verificar Configurações
```bash
# Verificar configurações pós-deploy
npx hardhat run scripts/verify-config.js --network mainnet
```

## 🛡️ Segurança

### 1. Transferir Ownership
```bash
# Transferir ownership para multisig
npx hardhat run scripts/transfer-ownership.js --network mainnet
```

### 2. Configurar Timelock
```bash
# Configurar timelock para mudanças administrativas
npx hardhat run scripts/configure-timelock.js --network mainnet
```

### 3. Configurar Multisig
```bash
# Configurar multisig para operações administrativas
npx hardhat run scripts/configure-multisig.js --network mainnet
```

## 📊 Monitoramento

### 1. Configurar Alertas
```bash
# Configurar alertas de segurança
npx hardhat run scripts/configure-alerts.js --network mainnet
```

### 2. Configurar Backup
```bash
# Configurar backup dos contratos
npx hardhat run scripts/configure-backup.js --network mainnet
```

## 🚨 Procedimentos de Emergência

### 1. Pausar Contratos
```bash
# Pausar contratos em caso de emergência
npx hardhat run scripts/emergency-pause.js --network mainnet
```

### 2. Recuperar Contratos
```bash
# Recuperar contratos após emergência
npx hardhat run scripts/emergency-recovery.js --network mainnet
```

## 📋 Checklist Pós-Deploy

- [ ] Contratos deployados com sucesso
- [ ] Contratos verificados no Etherscan
- [ ] Oráculos autorizados e configurados
- [ ] Verificadores autorizados e configurados
- [ ] Calculadores autorizados e configurados
- [ ] Ownership transferido para multisig
- [ ] Timelock configurado
- [ ] Multisig configurado
- [ ] Alertas de segurança configurados
- [ ] Backup configurado
- [ ] Monitoramento configurado
- [ ] Equipe treinada em procedimentos
- [ ] Documentação atualizada
- [ ] Procedimentos de emergência testados

## 🔗 Links Úteis

- [Etherscan](https://etherscan.io)
- [Polkascan](https://polkascan.io)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Documentation](https://docs.openzeppelin.com/)

## 📞 Suporte

Em caso de problemas:
1. Verificar logs de deploy
2. Verificar configurações
3. Verificar conectividade com a rede
4. Verificar saldo do deployer
5. Verificar permissões
6. Contatar equipe de desenvolvimento

## ⚠️ Avisos Importantes

- **NUNCA** commitar chaves privadas
- **SEMPRE** verificar endereços antes do deploy
- **SEMPRE** testar em testnet primeiro
- **SEMPRE** ter backup das configurações
- **SEMPRE** ter plano de recuperação
- **SEMPRE** monitorar contratos após deploy
- **SEMPRE** manter documentação atualizada
