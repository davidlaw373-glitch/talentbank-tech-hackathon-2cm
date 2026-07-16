import { AuthForm } from "@/components/features/candidate/auth-form";

export default function EmployerRegisterPage() {
  return (
    <main className="container mx-auto flex min-h-screen items-center justify-center p-6">
      <AuthForm mode="register" audience="employer" />
    </main>
  );
}
