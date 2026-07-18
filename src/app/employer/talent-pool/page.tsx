import Link from "next/link";
import { Bookmark, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EmployerTalentPoolPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Talent pool
        </p>
        <h1>Saved candidates</h1>
        <p className="text-muted-foreground">
          Bookmarked or starred profiles are kept here for follow-up.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" aria-hidden />
            <h2>Coming soon</h2>
          </CardTitle>
          <CardDescription>
            Save candidates from anywhere in the employer workspace and they will
            show up here for bulk outreach.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-md border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Bookmark className="h-4 w-4" aria-hidden />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">No saved candidates yet</p>
              <p className="text-xs text-muted-foreground">
                Open a candidate profile and tap the bookmark icon.
              </p>
            </div>
            <Button asChild>
              <Link href="/employer/candidates">Browse candidates</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Badge variant="secondary" className="text-xs">
        Talent pool is preview-only in this build
      </Badge>
    </div>
  );
}
