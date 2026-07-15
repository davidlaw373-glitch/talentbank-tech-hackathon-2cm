import type { Metadata } from "next";
import { AuthForm } from "@/components/features/candidate/auth-form";

export const metadata: Metadata = {
  title: "Create account — CareerOS",
  description: "Build a verified profile and discover relevant roles.",
};

export default function RegisterPage() {
  return <main id="main-content" className="container mx-auto flex min-h-screen items-center justify-center p-6"><AuthForm mode="register" /></main>;
}
