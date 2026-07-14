import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ApplicationDetailsLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading application">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-6 w-24 rounded-md" />
      </div>

      <header className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-56" />
      </header>

      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-52" />
        </CardHeader>
        <CardContent className="pt-6">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-52 w-full rounded-xl lg:col-span-2" />
        <Skeleton className="h-52 w-full rounded-xl" />
      </section>
    </div>
  );
}
