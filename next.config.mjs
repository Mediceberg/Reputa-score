/** @type {import('next').NextConfig} */
const nextConfig = {
  // يحل مشكلة إعادة التوجيه التي تسبب Timeout في Pi Browser
  trailingSlash: false, 
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
};

export default nextConfig;
