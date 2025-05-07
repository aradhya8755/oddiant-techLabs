/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

// Create __dirname equivalent for ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,
  
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    // During development, type errors won't stop the build
    // But we're removing ignoreBuildErrors to ensure proper TypeScript checking
    ignoreBuildErrors: false,
  },

  images: {
    unoptimized: true,
    domains: [
      "source.unsplash.com", 
      "images.unsplash.com", 
      "ext.same-assets.com", 
      "ugc.same-assets.com"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  transpilePackages: ["mongoose", "exceljs", "nodemailer"],

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
