/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
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
  // Enable static optimization
  trailingSlash: false,
  // Optimize for Vercel
  swcMinify: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
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