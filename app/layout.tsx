import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";

import GlobalMaintenanceCheck from "@/components/GlobalMaintenanceCheck";

export const metadata: Metadata = {
  title: "SVSU Campus Control Center | Entry-Exit System",
  description: "Entry and exit management system for SVSU campus | Security management system for SVSU campus | ",
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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0D1117" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground transition-colors duration-300">
        <div className="watermark" />
        <ThemeProvider>
          <GlobalMaintenanceCheck>
            <Toaster position="top-right" richColors />
            <Navbar />
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </GlobalMaintenanceCheck>
        </ThemeProvider>
      </body>
    </html>
  );
}


