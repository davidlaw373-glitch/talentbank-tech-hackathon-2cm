import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

/**
 * Empty state — a single composition pulled out so every async widget
 * shows the same shape when its list is empty. Pulls the pattern that
 * verification-pipeline and dispute-resolution already followed.
 */

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
        </div>
        <div>
          <p className="text-base font-medium">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
