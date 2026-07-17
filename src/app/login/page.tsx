import { Suspense } from "react";
import { AuthForm } from "@/components/features/candidate/auth-form";

export default function LoginPage() {
  return (
    <main className="container mx-auto flex min-h-screen items-center justify-center p-6">
      <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}