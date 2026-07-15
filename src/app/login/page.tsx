import type { Metadata } from "next";
import { AuthForm } from "@/components/features/candidate/auth-form";

export const metadata: Metadata = {
  title: "Log in — CareerOS",
  description: "Continue your CareerOS journey.",
};

export default function LoginPage() {
  return <main id="main-content" className="container mx-auto flex min-h-screen items-center justify-center p-6"><AuthForm mode="login" /></main>;
}
