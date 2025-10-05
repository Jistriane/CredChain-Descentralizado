# Configuração de Deploy para Vercel

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente no painel da Vercel:

### Aplicação
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL=https://credchain.vercel.app`

### Blockchain - Polkadot Mainnet
- `NEXT_PUBLIC_POLKADOT_RPC_URL=https://rpc.polkadot.io`
- `NEXT_PUBLIC_CHAIN_ID=0x0000000000000000000000000000000000000000000000000000000000000000`
- `NEXT_PUBLIC_NETWORK_NAME=Polkadot`
- `NEXT_PUBLIC_BLOCK_EXPLORER=https://polkascan.io`

### API Configuration
- `NEXT_PUBLIC_API_BASE_URL=https://api.credchain.io`
- `NEXT_PUBLIC_WS_URL=wss://api.credchain.io`

### Security
- `NEXT_PUBLIC_JWT_SECRET=your_jwt_secret_here`
- `NEXT_PUBLIC_ENCRYPTION_KEY=your_encryption_key_here`

### External Services
- `NEXT_PUBLIC_ELIZAOS_API_URL=https://elizaos.credchain.io`
- `NEXT_PUBLIC_ELIZAOS_API_KEY=your_elizaos_api_key_here`

### Analytics
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id_here`
- `NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token_here`

### Features
- `NEXT_PUBLIC_KYC_ENABLED=true`
- `NEXT_PUBLIC_ML_ENABLED=true`
- `NEXT_PUBLIC_BLOCKCHAIN_ENABLED=true`
- `NEXT_PUBLIC_BLOCKCHAIN_NETWORK=polkadot`

### Monitoring
- `NEXT_PUBLIC_LOG_LEVEL=info`
- `NEXT_PUBLIC_LOG_FORMAT=json`
