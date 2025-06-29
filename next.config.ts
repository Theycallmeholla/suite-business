import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Environment variables
  env: {
    SMART_INTAKE_ENABLED: process.env.SMART_INTAKE_ENABLED,
    INTAKE_EXPECTED_THRESHOLD: process.env.INTAKE_EXPECTED_THRESHOLD,
    NEXT_PUBLIC_SMART_INTAKE_ENABLED: process.env.SMART_INTAKE_ENABLED,
  },
  
  // Server-side only variables
  serverRuntimeConfig: {
    SMART_INTAKE_ENABLED: process.env.SMART_INTAKE_ENABLED,
    INTAKE_EXPECTED_THRESHOLD: process.env.INTAKE_EXPECTED_THRESHOLD,
  },
  
  // Client-side accessible variables
  publicRuntimeConfig: {
    SMART_INTAKE_ENABLED: process.env.SMART_INTAKE_ENABLED,
    NEXT_PUBLIC_SMART_INTAKE_ENABLED: process.env.SMART_INTAKE_ENABLED,
  },
};

export default nextConfig;
