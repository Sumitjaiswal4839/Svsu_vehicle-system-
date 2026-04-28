import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SVSU Vehicle Info | Entry-Exit System",
  description: "Secure QR-based vehicle management for SVSU campus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.png" />
        <meta name="theme-color" content="#0a0a0c" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#0a0a0c] text-neutral-100 transition-colors duration-300`}>
        <div className="watermark" />
        <ThemeProvider>
          <Toaster position="top-right" richColors />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}


