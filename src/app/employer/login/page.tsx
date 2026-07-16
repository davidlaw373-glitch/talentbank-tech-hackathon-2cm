import { AuthForm } from "@/components/features/candidate/auth-form";

export default function EmployerLoginPage() {
  return (
    <main className="container mx-auto flex min-h-screen items-center justify-center p-6">
      <AuthForm mode="login" audience="employer" />
    </main>
  );
}
