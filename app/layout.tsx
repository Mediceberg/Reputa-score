import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import Script from "next/script"
import "./globals.css"

export const metadata: Metadata = {
  title: "Reputa Score",
  description: "Pi Network Reputation Score Terminal",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* تحميل مكتبة Pi SDK قبل أي تفاعل */}
        <Script 
          src="https://sdk.minepi.com/pi-sdk.js" 
          strategy="beforeInteractive" 
        />
        
        {/* تفعيل المكتبة بالوضع الرسمي لضمان الربط مع السيرفر */}
        <Script id="pi-sdk-init" strategy="afterInteractive">
          {`
            if (window.Pi) {
              // تم إزالة sandbox: true لضمان إرسال طلبات الموافقة لملف /api/pi/approve
              window.Pi.init({ version: "2.0" });
              console.log("Pi SDK Initialized: Real Mode Enabled");
            }
          `}
        </Script>
        
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
