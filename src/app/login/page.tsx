import { Suspense } from "react";
import { CardListSkeleton } from "@/components/common/loading-skeleton";
import { AuthForm } from "@/components/features/candidate/auth-form";

export default function LoginPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="container mx-auto flex min-h-screen items-center justify-center p-4 sm:p-6"
    >
      <div className="w-full max-w-md" aria-label="Loading sign-in form">
        <Suspense fallback={<CardListSkeleton rows={1} />}>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </main>
  );
}