import Link from "next/link";

import { BrandMark } from "@/components/common/brand-mark";
import { ScrollProgress } from "@/components/common/scroll-progress";

/**
 * Minimal centered shell for the onboarding wizard. No app shell, no
 * primary navigation — the wizard owns the screen and the user's full
 * attention. Brand mark sits in the top-left corner as a back-to-home
 * escape hatch.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative flex min-h-screen w-full flex-col items-center bg-background px-4 pb-12 pt-14 sm:px-6 sm:pt-16 lg:px-8 lg:pb-6 lg:pt-6"
    >
      <ScrollProgress />
      <header className="absolute inset-x-0 top-0 flex items-center gap-2 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
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
      <div className="w-full max-w-3xl lg:max-w-5xl">{children}</div>
    </main>
  );
}