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
  // Production optimizations
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  trailingSlash: false,
  swcMinify: true,
  
  // Disable static generation to prevent window errors
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Force dynamic rendering for all pages
  generateStaticParams: false,
  staticPageGenerationTimeout: 1000,
  skipTrailingSlashRedirect: true,
  
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Fix for window is not defined errors during build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
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