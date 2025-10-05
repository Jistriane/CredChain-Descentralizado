/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'api.credchain.io',
      'rpc.polkadot.io',
      'polkascan.io',
      'blockscout-passet-hub.parity-testnet.parity.io',
      'vercel.app',
      'credchain.vercel.app'
    ],
  },
  env: {
    POLKADOT_RPC: process.env.NEXT_PUBLIC_POLKADOT_RPC_URL || 'https://rpc.polkadot.io',
    CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || '0x0000000000000000000000000000000000000000000000000000000000000000',
    BLOCK_EXPLORER: process.env.NEXT_PUBLIC_BLOCK_EXPLORER || 'https://polkascan.io',
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.credchain.io',
  },
  
  // Disable ALL static generation
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'dist',
  
  // Force dynamic rendering for all pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Disable static optimization completely
  generateStaticParams: false,
  staticPageGenerationTimeout: 1000,
  
  webpack: (config, { isServer, dev }) => {
    // Fix for window is not defined errors
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    
    // Disable static optimization
    config.optimization = {
      ...config.optimization,
      splitChunks: false,
    };
    
    return config;
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig