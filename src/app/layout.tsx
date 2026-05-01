/**
 * ============================================================================
 * KOWA RIDE - SUPERADMIN DASHBOARD
 * Root Layout Configuration
 * ============================================================================
 *
 * Provides the global HTML structure, fonts, metadata, and shared providers
 * for the entire Kowa Ride Superadmin application.
 *
 * @module app/layout
 * @version 3.0.0 (with authentication)
 * ============================================================================
 */

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth/provider";

// ============================================================================
// FONT CONFIGURATION
// ============================================================================

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: "Kowa Ride | Superadmin Dashboard",
  description:
    "Enterprise administration console for Kowa Ride — A subsidiary of Kowamart and Logistics Ltd. Manage riders, fleet operations, financial allocations, risk, and compliance.",
  keywords: [
    "Kowa Ride",
    "Superadmin",
    "Dashboard",
    "Ride-hailing",
    "Fleet Management",
    "Kowamart",
    "Logistics",
  ],
  authors: [{ name: "Kowa Ride Engineering Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

// ============================================================================
// ROOT LAYOUT
// ============================================================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-[family-name:var(--font-inter)]`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
