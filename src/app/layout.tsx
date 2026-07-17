import type { Metadata } from "next";
import { Inter } from "next/font/google";
<<<<<<< Updated upstream
=======
import { SkipLink } from "@/components/common/skip-link";
import { ToastProvider } from "@/components/common/toast";
>>>>>>> Stashed changes
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
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
<<<<<<< Updated upstream
        {children}
=======
        <ToastProvider>
          <SkipLink />
          {children}
        </ToastProvider>
>>>>>>> Stashed changes
      </body>
    </html>
  );
}
