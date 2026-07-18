import { Suspense } from "react";
import { CardListSkeleton } from "@/components/common/loading-skeleton";
import { AuthForm } from "@/components/features/candidate/auth-form";

export default function RegisterPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="container mx-auto flex min-h-screen items-center justify-center p-4 sm:p-6"
    >
      <div
        className="w-full max-w-2xl"
        aria-label="Loading registration form"
      >
        <Suspense fallback={<CardListSkeleton rows={1} />}>
          <AuthForm mode="register" />
        </Suspense>
      </div>
    </main>
  );
}