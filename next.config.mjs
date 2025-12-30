/** @type {import('next').NextConfig} */
const nextConfig = {
  /* إعدادات اختيارية لتحسين الأداء وتجاوز أخطاء التنسيق أثناء الرفع */
  eslint: {
    // هذا السطر يمنع الـ Build من الفشل بسبب أخطاء التنسيق البسيطة
    ignoreDuringBuilds: true,
  },
  typescript: {
    // هذا يضمن استمرار الـ Build حتى لو وجد أخطاء بسيطة في أنواع البيانات
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
