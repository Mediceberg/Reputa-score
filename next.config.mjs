/** @type {import('next').NextConfig} */
const nextConfig = {
  // هذا السطر يمنع "Paiement expiré" عبر منع إعادة التوجيه التلقائي
  trailingSlash: false, 
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

// إذا كان الملف ينتهي بـ .js استخدم module.exports
// إذا كان ينتهي بـ .mjs اتركها export default
module.exports = nextConfig;
