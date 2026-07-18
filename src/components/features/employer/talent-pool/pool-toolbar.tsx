"use client";

import { Filter, Mail, Search, X } from "lucide-react";

import type { TalentPoolStatus } from "@/types/employer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_FILTERS: Array<{ value: TalentPoolStatus | "All"; label: string }> = [
  { value: "All", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Contacted", label: "Contacted" },
  { value: "Re-engaging", label: "Re-engaging" },
  { value: "Stale", label: "Stale" },
];

export type PoolToolbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  status: TalentPoolStatus | "All";
  onStatusChange: (s: TalentPoolStatus | "All") => void;
  matchCount: number;
  totalCount: number;
  selectedCount: number;
  onBulkOutreach: () => void;
  onClearSelection: () => void;
};

export function PoolToolbar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  matchCount,
  totalCount,
  selectedCount,
  onBulkOutreach,
  onClearSelection,
}: PoolToolbarProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <label
              htmlFor="pool-search"
              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
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
          <div className="flex w-full flex-col gap-1.5 sm:w-48">
            <label
              htmlFor="pool-status"
              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              Status
            </label>
            <div className="relative">
              <Filter
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Select
                value={status}
                onValueChange={(v) =>
                  onStatusChange(v as TalentPoolStatus | "All")
                }
              >
                <SelectTrigger id="pool-status" className="pl-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Badge variant="outline" aria-live="polite">
            {matchCount} of {totalCount}
          </Badge>
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