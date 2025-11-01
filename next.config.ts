import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wjcedxejhoukflcdfrad.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/task_bk/**',
        search: '',
      },
    ],
  },
};

export default nextConfig;
