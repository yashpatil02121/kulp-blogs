import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@xenova/transformers': 'commonjs @xenova/transformers',
      });
    }
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['@xenova/transformers', 'pg', 'drizzle-orm'],
  },
};

export default nextConfig;
