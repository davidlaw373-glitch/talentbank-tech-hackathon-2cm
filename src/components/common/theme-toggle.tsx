"use client";

import { Monitor, Moon, Sun, ContrastIcon } from "lucide-react";

import { useTheme } from "@/components/common/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Theme } from "@/components/common/theme-provider";

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "hc", label: "High contrast", icon: ContrastIcon },
];

export function ThemeToggle({
  align = "end",
}: {
  align?: "start" | "center" | "end";
}) {
  const { theme, setTheme } = useTheme();
  const Active = OPTIONS.find((o) => o.value === theme)?.icon ?? Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Theme: ${theme}. Click to change.`}
        >
          <Active aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(v) => setTheme(v as Theme)}
        >
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                <Icon aria-hidden />
                <span>{opt.label}</span>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            const sys: Theme = window.matchMedia(
              "(prefers-color-scheme: dark)",
            ).matches
              ? "dark"
              : "light";
            setTheme(sys);
          }}
        >
          <Monitor aria-hidden />
          <span>Match system</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Compact cycle button (no menu). Cycles light → dark → hc → light.
 * Useful when dropdowns aren't available or when space is tight.
 */
export function ThemeCycleButton() {
  const { theme, cycleTheme } = useTheme();
  const Icon =
    theme === "light" ? Sun : theme === "dark" ? Moon : ContrastIcon;
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label={`Theme: ${theme}. Click to cycle.`}
    >
      <Icon aria-hidden />
    </Button>
  );
}