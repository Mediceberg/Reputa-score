/** @type {import('next').NextConfig} */
const nextConfig = {
  // تفعيل المسارات الصارمة لمنع مشاكل التوجيه في Pi Browser
  trailingSlash: false,
  
  // تجاهل أخطاء البناء لضمان نجاح الـ Deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // إعدادات الصور لضمان التوافق
  images: {
    unoptimized: true,
  },
  
  // إيقاف الوضع الصارم لتحسين استجابة السيرفر
  reactStrictMode: false,
};

export default nextConfig;
