/** @type {import('next').NextConfig} */
const nextConfig = {
  // هذا السطر يحل مشكلة Turbopack التي تظهر في السجلات عندك
  experimental: {
    turbo: false 
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
