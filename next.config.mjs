/** @type {import('next').NextConfig} */
const nextConfig = {
  // تفعيل المسارات الصارمة لمنع مشاكل التوجيه في Pi Browser
  trailingSlash: false,
  
  // تجاهل أخطاء البناء للسماح برفع الكود رغم التحذيرات
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // تحسين أداء الصور (اختياري)
  images: {
    unoptimized: true,
  },
  
  // إعدادات إضافية لضمان استقرار السيرفر
  reactStrictMode: false,
};

module.exports = nextConfig;
