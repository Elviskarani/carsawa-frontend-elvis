import type { NextConfig } from "next";
import withPWA from "next-pwa";

const pwaConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
};

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Using remotePatterns is the newer, more secure way to whitelist domains.
    remotePatterns: [
      
      {
        protocol: 'https',
        hostname: 'carsawa254.s3.eu-west-1.amazonaws.com',
      },
    ],
  },
};

export default withPWA(pwaConfig)(nextConfig);