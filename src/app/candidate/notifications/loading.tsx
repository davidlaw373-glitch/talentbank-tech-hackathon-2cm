import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading notifications">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-9 w-28" />
        </div>
      </header>

      <Card>
        <CardContent className="flex items-center justify-between gap-3 p-5">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-72" />
        </CardContent>
      </Card>

      <ul className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i}>
            <Skeleton className="h-28 w-full rounded-lg" />
          </li>
        ))}
      </ul>
    </div>
  );
}
