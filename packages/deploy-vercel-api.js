#!/usr/bin/env node

console.log('🚀 Iniciando deploy automático do CredChain na Vercel...');

const PROJECT_CONFIG = {
  name: 'credchain-frontend',
  framework: 'nextjs',
  rootDirectory: 'packages/web-frontend',
  buildCommand: 'npm run build',
  outputDirectory: '.next'
};

const ENV_VARS = {
  'NODE_ENV': 'production',
  'NEXT_PUBLIC_APP_URL': 'https://credchain-frontend.vercel.app',
  'NEXT_PUBLIC_POLKADOT_RPC_URL': 'https://rpc.polkadot.io',
  'NEXT_PUBLIC_CHAIN_ID': '0x0000000000000000000000000000000000000000000000000000000000000000',
  'NEXT_PUBLIC_NETWORK_NAME': 'Polkadot',
  'NEXT_PUBLIC_BLOCK_EXPLORER': 'https://polkascan.io',
  'NEXT_PUBLIC_API_BASE_URL': 'https://api.credchain.io',
  'NEXT_PUBLIC_WS_URL': 'wss://api.credchain.io'
};

console.log('📋 Configurações do projeto:');
console.log(`   - Nome: ${PROJECT_CONFIG.name}`);
console.log(`   - Framework: ${PROJECT_CONFIG.framework}`);
console.log(`   - Root Directory: ${PROJECT_CONFIG.rootDirectory}`);

console.log('\n🔧 Variáveis de ambiente:');
Object.entries(ENV_VARS).forEach(([key, value]) => {
  console.log(`   - ${key}: ${value}`);
});

console.log('\n📝 Para fazer o deploy:');
console.log('1. Acesse: https://vercel.com/jistrianedroid-3423s-projects/~/activity');
console.log('2. Clique em "New Project"');
console.log('3. Selecione "Import Git Repository"');
console.log('4. Escolha: Jistriane/CredChain-Descentralizado');
console.log('5. Configure as opções acima');
console.log('6. Adicione as variáveis de ambiente');
console.log('7. Clique em "Deploy"');

console.log('\n✅ Deploy automático preparado!');
console.log('🚀 Siga as instruções para completar o deploy.');
