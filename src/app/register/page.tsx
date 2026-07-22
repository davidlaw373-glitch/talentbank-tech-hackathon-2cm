import { Suspense } from "react";
import Link from "next/link";

import { BrandMark } from "@/components/common/brand-mark";
import { CardListSkeleton } from "@/components/common/loading-skeleton";
import { AuthForm } from "@/components/features/candidate/auth-form";

export default function RegisterPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="container relative mx-auto flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8"
    >
      {/* Brand overlays the top-left corner so it does not push the role
          cards / form down — the centered area below can use the full
          viewport height. The whole chip is a link back to "/". */}
      <header className="absolute inset-x-0 top-0 flex items-center gap-2 p-4 sm:p-6 lg:p-8">
        <Link
          href="/"
          aria-label="CareerOS — back to home"
          className="flex items-center gap-2 rounded-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <BrandMark />
          <p className="text-base font-semibold leading-tight tracking-tight">
            CareerOS
          </p>
        </Link>
      </header>
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