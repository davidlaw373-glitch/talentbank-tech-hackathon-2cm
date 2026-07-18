"use client";

/**
 * Theme provider — single source of truth for color-theme selection.
 *
 * Resolution order (first match wins):
 *   1. localStorage["careeros-theme"]            — explicit user choice
 *   2. window.matchMedia("(prefers-color-scheme: dark)")  — system pref
 *   3. "light"                                   — safe default
 *
 * "hc" (high-contrast) is opt-in only — never picked up from system pref
 * because it's a deliberate accessibility choice.
 *
 * The resolved theme is written to <html data-theme="..."> so CSS variables
 * in globals.css (light / .dark / [data-theme="hc"]) swap instantly with
 * zero React re-render.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

export type Theme = "light" | "dark" | "hc";

const STORAGE_KEY = "careeros-theme";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "light" | "dark"; // effective non-HC theme (for icons / UI)
  setTheme: (next: Theme) => void;
  cycleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Read what the OS / browser prefers. Safe to call during SSR — returns
 * "light" by default; the effect below will reconcile after hydration.
 */
function detectSystem(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStored(): Theme | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === "light" || raw === "dark" || raw === "hc") return raw;
  return null;
}

function applyToDom(theme: Theme, systemBase: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  // HC mode overrides any dark/light choice
  if (theme === "hc") {
    root.setAttribute("data-theme", "hc");
    root.classList.add("dark");
  } else {
    root.setAttribute("data-theme", theme);
    root.classList.toggle("dark", theme === "dark");
  }
  // systemBase keeps prefers-color-scheme queries accurate for `hc`
  root.style.colorScheme = systemBase;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Start with the most permissive read; SSR will render light, then we
  // reconcile on mount.
  const [theme, setThemeState] = useState<Theme>("light");
  const [systemBase, setSystemBase] = useState<"light" | "dark">("light");

  // Initial mount: read storage, fall back to system pref. This is the
  // canonical SSR-rehydration pattern for theme providers — localStorage is
  // browser-only, so the initial useState value must be a safe default that
  // is replaced on mount. The eslint rule against setState-in-effect is a
  // false positive here.
  useEffect(() => {
    const sys = detectSystem();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSystemBase(sys);
    const stored = readStored();
    const initial: Theme = stored ?? sys;
     
    setThemeState(initial);
    applyToDom(initial, sys);
  }, []);

  // Listen for OS-level theme changes (only meaningful when user hasn't
  // explicitly chosen hc).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      const next: "light" | "dark" = e.matches ? "dark" : "light";
       
      setSystemBase(next);
      // Only auto-follow when user hasn't stored an explicit choice
      const stored = readStored();
      if (stored === null) {
        setThemeState(next);
        applyToDom(next, next);
      } else if (stored === "hc") {
        // HC is opt-in only; keep it but update colorScheme
        applyToDom("hc", next);
      } else {
        applyToDom(stored, next);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
    // Read current systemBase for colorScheme sync
    const sys = detectSystem();
    applyToDom(next, sys);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: Theme =
        current === "light" ? "dark" : current === "dark" ? "hc" : "light";
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
      const sys = detectSystem();
      applyToDom(next, sys);
      return next;
    });
  }, []);

  // resolvedTheme is what non-hc-aware UI should use for icons etc.
  const resolvedTheme: "light" | "dark" = theme === "hc" ? systemBase : theme;

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, cycleTheme }),
    [theme, resolvedTheme, setTheme, cycleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}

/**
 * Inline script run before React hydrates so the correct theme is applied
 * to <html> on first paint — prevents flash-of-wrong-theme.
 *
 * Drop this inside <head> via next/script or directly into layout.tsx.
 */
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var theme = stored === 'light' || stored === 'dark' || stored === 'hc' ? stored : sys;
    var root = document.documentElement;
    if (theme === 'hc') {
      root.setAttribute('data-theme', 'hc');
      root.classList.add('dark');
    } else {
      root.setAttribute('data-theme', theme);
      root.classList.toggle('dark', theme === 'dark');
    }
    root.style.colorScheme = sys;
  } catch (e) {}
})();
`.trim();