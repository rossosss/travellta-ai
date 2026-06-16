import type { NextConfig } from 'next';
import path from 'path';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(path.join(__dirname, '../..'));

const nextConfig: NextConfig = {
  turbopack: {
    root: '../..',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
