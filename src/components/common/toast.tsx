"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastTone = "success" | "info" | "error";

export type Toast = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  push: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}

const ICONS: Record<ToastTone, LucideIcon> = {
  success: CheckCircle2,
  info: Info,
  error: XCircle,
};

const TONE_CLASSES: Record<ToastTone, string> = {
  success: "border-foreground/20 bg-foreground text-background",
  info: "border bg-card text-card-foreground",
  error: "border-destructive/40 bg-card text-card-foreground",
};

const ICON_CLASSES: Record<ToastTone, string> = {
  success: "text-background",
  info: "text-foreground",
  error: "text-destructive",
};

const AUTO_DISMISS_MS = 3500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast: Omit<Toast, "id">) => {
      counter.current += 1;
      const id = `t-${counter.current}-${Date.now()}`;
      setToasts((prev) => [...prev, { ...toast, id }]);
    },
    [],
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const Icon = ICONS[toast.tone];

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-lg",
        TONE_CLASSES[toast.tone],
      )}
    >
      <Icon
        className={cn("mt-0.5 h-5 w-5 shrink-0", ICON_CLASSES[toast.tone])}
        aria-hidden
      />
      <div className="flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && (
          <p
            className={cn(
              "mt-0.5 text-xs",
              toast.tone === "success"
                ? "text-background/80"
                : "text-muted-foreground",
            )}
          >
            {toast.description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className={cn(
          "rounded-md p-1 transition-colors",
          toast.tone === "success"
            ? "text-background/70 hover:bg-background/10 hover:text-background"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}