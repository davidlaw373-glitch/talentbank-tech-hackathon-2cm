"use client";

import {
  BarChart3,
  LineChart,
} from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type AnalyticsTabsProps = {
  overview: React.ReactNode;
  advanced: React.ReactNode;
};

/**
 * Tab shell for the analytics page. Radix Tabs requires a client boundary,
 * so this thin wrapper owns the `defaultValue` and renders the
 * server-rendered `overview` and client-rendered `advanced` children as
 * Tab panels.
 */
export function AnalyticsTabs({ overview, advanced }: AnalyticsTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList aria-label="Analytics views">
        <TabsTrigger value="overview" className="gap-2">
          <BarChart3 className="h-4 w-4" aria-hidden />
          Overview
        </TabsTrigger>
        <TabsTrigger value="advanced" className="gap-2">
          <LineChart className="h-4 w-4" aria-hidden />
          Advanced analytics
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-8 focus-visible:outline-none">
        {overview}
      </TabsContent>
      <TabsContent value="advanced" className="space-y-8 focus-visible:outline-none">
        {advanced}
      </TabsContent>
    </Tabs>
  );
}