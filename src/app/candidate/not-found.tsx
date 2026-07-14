import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CandidateNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Compass className="h-6 w-6" aria-hidden />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold">We couldn&apos;t find that</h1>
            <p className="text-sm text-muted-foreground">
              The page you were looking for may have moved or no longer exists.
              Try browsing open roles instead.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild>
              <Link href="/candidate/jobs">
                Browse jobs
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/candidate/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
