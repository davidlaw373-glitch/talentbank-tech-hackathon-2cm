"use client";

import { Mail, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type PoolToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  selectedCount: number;
  onBulkOutreach: () => void;
  onClearSelection: () => void;
};

export function PoolToolbar({
  query,
  onQueryChange,
  selectedCount,
  onBulkOutreach,
  onClearSelection,
}: PoolToolbarProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="pool-search" className="text-eyebrow">
            Search pool
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="pool-search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Filter by name, role, or skill"
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {selectedCount > 0 ? (
            <>
              <Badge variant="secondary">{selectedCount} selected</Badge>
              <Button size="sm" onClick={onBulkOutreach}>
                <Mail />
                Reach out to {selectedCount}
              </Button>
              <Button size="sm" variant="outline" onClick={onClearSelection}>
                <X />
                Clear
              </Button>
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
