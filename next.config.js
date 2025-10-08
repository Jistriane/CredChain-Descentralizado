/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'api.credchain.io',
      },
      {
        protocol: 'https',
        hostname: 'rpc.polkadot.io',
      },
      {
        protocol: 'https',
        hostname: 'polkascan.io',
      },
      {
        protocol: 'https',
        hostname: 'blockscout-passet-hub.parity-testnet.parity.io',
      },
      {
        protocol: 'https',
        hostname: 'render.com',
      },
      {
        protocol: 'https',
        hostname: 'credchain.onrender.com',
      }
    ],
  },
  env: {
    POLKADOT_RPC: process.env.NEXT_PUBLIC_POLKADOT_RPC_URL || 'https://rpc.polkadot.io',
    CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || '0x1',
    BLOCK_EXPLORER: process.env.NEXT_PUBLIC_BLOCK_EXPLORER || 'https://polkascan.io',
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.credchain.io',
  },
  
  // Render.com optimizations
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  trailingSlash: false,
  swcMinify: true,
  
  // Disable static generation
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  webpack: (config, { isServer }) => {
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