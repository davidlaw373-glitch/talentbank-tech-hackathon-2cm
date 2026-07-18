import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SkipLink } from "@/components/common/skip-link";
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
      <head>
        {/*
         * Apply theme before React hydrates so first paint matches the
         * user's stored choice or system pref. Prevents flash-of-wrong-theme.
         */}
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <ToastProvider>
            <SkipLink />
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}