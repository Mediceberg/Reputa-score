import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from "next/script"; // استيراد مكون Script من Next.js
import "./globals.css";

export const metadata: Metadata = {
  title: "Reputa Score - Pi Network",
  description: "Pi Network app for reputation scoring",
  generator: 'v0.app'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* إضافة مكتبة Pi SDK - ضروري للخطوة رقم 4 */}
        <Script 
          src="https://sdk.minepi.com/pi-sdk.js" 
          strategy="beforeInteractive" 
        />
        
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}`</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
