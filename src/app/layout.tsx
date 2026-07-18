import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { ToastProvider } from "@/components/common/toast";
import {
  ThemeProvider,
  themeInitScript,
} from "@/components/common/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareerOS — The career operating system",
  description:
    "CareerOS connects candidates, employers, and universities on one platform. AI career insights, university-verified credentials, and structured interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/*
         * Apply theme before React hydrates so first paint matches the
         * user's stored choice or system pref. Prevents flash-of-wrong-theme.
         * `next/script` with strategy="beforeInteractive" is the canonical
         * Next.js way to inject a blocking pre-hydration script — the plain
         * <script> tag in a React component is ignored by Turbopack.
         */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
        >
          {themeInitScript}
        </Script>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}