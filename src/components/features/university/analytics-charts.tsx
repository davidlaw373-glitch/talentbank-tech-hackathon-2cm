import { cn } from "@/lib/utils";
import type { MarketSignalWithTrend } from "@/lib/university-helpers";

/* ------------------------------------------------------------------ */
/*  Shared swatch palette — keeps every chart on the page using the   */
/*  same token-driven series colours as the rest of the CareerOS UI.   */
/* ------------------------------------------------------------------ */

export const SERIES_SWATCHES = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
  "bg-chart-6",
  "bg-chart-7",
  "bg-chart-8",
] as const;

const SERIES_STROKES = [
  "stroke-chart-1",
  "stroke-chart-2",
  "stroke-chart-3",
  "stroke-chart-4",
  "stroke-chart-5",
  "stroke-chart-6",
  "stroke-chart-7",
  "stroke-chart-8",
] as const;

const SERIES_FILLS = [
  "fill-chart-1",
  "fill-chart-2",
  "fill-chart-3",
  "fill-chart-4",
  "fill-chart-5",
  "fill-chart-6",
  "fill-chart-7",
  "fill-chart-8",
] as const;

export function seriesSwatch(i: number): string {
  return SERIES_SWATCHES[i % SERIES_SWATCHES.length];
}
export function seriesStroke(i: number): string {
  return SERIES_STROKES[i % SERIES_STROKES.length];
}
export function seriesFill(i: number): string {
  return SERIES_FILLS[i % SERIES_FILLS.length];
}

/* ------------------------------------------------------------------ */
/*  MultiYearTrendChart                                              */
/* ------------------------------------------------------------------ */

const YEARS_BACK = 4; // history has 5 entries (year-4 … year-0)

/**
 * Multi-series line chart over a 5-year window. Pure SVG so we don't pull
 * in a charting library — keeps the surface calm and token-driven.
 */
export function MultiYearTrendChart({
  signals,
  height = 220,
}: {
  signals: readonly MarketSignalWithTrend[];
  height?: number;
}) {
  if (signals.length === 0) {
    return null;
  }
  const width = 640;
  const padding = { top: 16, right: 16, bottom: 28, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const allValues = signals.flatMap((s) => s.history);
  const max = Math.max(...allValues, 1);
  const min = 0;

  const xStep = chartW / YEARS_BACK;
  const yScale = (v: number) =>
    chartH - ((v - min) / (max - min)) * chartH + padding.top;
  const xScale = (i: number) => i * xStep + padding.left;

  const yearLabels = Array.from({ length: YEARS_BACK + 1 }, (_, i) => {
    const year = 2026 - (YEARS_BACK - i);
    return `'${String(year).slice(2)}`;
  });

  return (
    <figure className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`5-year skill demand trend across ${signals.length} skills`}
        className="h-auto w-full"
      >
        {/* Y-axis baseline gridlines (4 ticks) */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padding.top + chartH * t;
          return (
            <line
              key={t}
              x1={padding.left}
              x2={padding.left + chartW}
              y1={y}
              y2={y}
              className="stroke-border"
              strokeDasharray="2 4"
              strokeWidth={1}
            />
          );
        })}

        {/* X-axis year labels */}
        {yearLabels.map((label, i) => (
          <text
            key={label}
            x={xScale(i)}
            y={height - 8}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {label}
          </text>
        ))}

        {/* Y-axis tick labels (4 ticks) */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const v = Math.round(max * (1 - t));
          const y = padding.top + chartH * t;
          return (
            <text
              key={t}
              x={padding.left - 6}
              y={y + 3}
              textAnchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              {v}
            </text>
          );
        })}

        {/* One line per skill */}
        {signals.map((signal, i) => {
          const points = signal.history
            .map((v, j) => `${xScale(j)},${yScale(v)}`)
            .join(" ");
          const last = signal.history[signal.history.length - 1];
          return (
            <g key={signal.skill}>
              <polyline
                points={points}
                fill="none"
                strokeWidth={2}
                className={cn(seriesStroke(i), "drop-shadow-sm")}
              />
              {/* Last-point marker */}
              <circle
                cx={xScale(signal.history.length - 1)}
                cy={yScale(last)}
                r={3}
                className={seriesFill(i)}
              />
            </g>
          );
        })}
      </svg>
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {signals.map((s, i) => (
          <span key={s.skill} className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className={cn("h-3 w-3 rounded-sm", seriesSwatch(i))}
            />
            {s.skill}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/*  HorizontalBarList                                                */
/* ------------------------------------------------------------------ */

export type HorizontalBarItem = {
  key: string;
  label: string;
  /** Optional secondary line — sub-label or count. */
  hint?: string;
  /** Pre-computed 0-100 percentage used for the bar width. */
  value: number;
  /** Right-side label rendered in the row (e.g. "23 hires", "42%"). */
  rightLabel?: string;
  /** Initials avatar shown next to the label when present. */
  initials?: string;
  /** Optional swatch override (defaults to seriesSwatch(i)). */
  swatch?: string;
};

/**
 * Generic ranked horizontal bar list — used for top employers, industry
 * distribution, etc. Animates fills in on first render via `animate-progress-x`.
 */
export function HorizontalBarList({
  items,
  emptyHint = "Nothing to plot yet.",
}: {
  items: readonly HorizontalBarItem[];
  emptyHint?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{emptyHint}</p>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((item, i) => {
        const swatch = item.swatch ?? seriesSwatch(i);
        const width = Math.max(2, Math.min(100, Math.round(item.value)));
        return (
          <li key={item.key} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                {item.initials ? (
                  <span
                    aria-hidden
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium"
                  >
                    {item.initials}
                  </span>
                ) : (
                  <small className="w-6 text-sm text-muted-foreground tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </small>
                )}
                <div className="min-w-0">
                  <p className="truncate text-base">{item.label}</p>
                  {item.hint ? (
                    <p className="truncate text-sm text-muted-foreground">
                      {item.hint}
                    </p>
                  ) : null}
                </div>
              </div>
              {item.rightLabel ? (
                <span className="text-sm font-medium tabular-nums">
                  {item.rightLabel}
                </span>
              ) : null}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full animate-progress-x", swatch)}
                style={{ width: `${width}%` }}
                aria-hidden
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  DistributionBars                                                 */
/* ------------------------------------------------------------------ */

export type DistributionBar = {
  key: string;
  band: string;
  count: number;
  widthPct: number;
  swatch?: string;
};

/**
 * Banded histogram for time-to-employment distribution. Each row shows the
 * band label, count, and a proportional bar.
 */
export function DistributionBars({
  bars,
  emptyHint = "Not enough data yet.",
}: {
  bars: readonly DistributionBar[];
  emptyHint?: string;
}) {
  if (bars.length === 0 || bars.every((b) => b.count === 0)) {
    return (
      <p className="text-sm text-muted-foreground">{emptyHint}</p>
    );
  }
  return (
    <ul className="space-y-3">
      {bars.map((bar, i) => (
        <li key={bar.key} className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-base">{bar.band}</p>
            <span className="text-sm font-medium tabular-nums">
              {bar.count} {bar.count === 1 ? "graduate" : "graduates"}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full animate-progress-x",
                bar.swatch ?? seriesSwatch(i),
              )}
              style={{ width: `${Math.max(2, bar.widthPct)}%` }}
              aria-hidden
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  ApplicationFunnel                                                */
/* ------------------------------------------------------------------ */

const FUNNEL_STAGES = [
  { key: "applied", label: "Applied", swatch: "bg-chart-1" },
  { key: "screened", label: "Screened", swatch: "bg-chart-2" },
  { key: "interviewed", label: "Interviewed", swatch: "bg-chart-3" },
  { key: "offered", label: "Offered", swatch: "bg-chart-4" },
  { key: "hired", label: "Hired", swatch: "bg-chart-5" },
] as const;

export type FunnelData = {
  applied: number;
  screened: number;
  interviewed: number;
  offered: number;
  hired: number;
  conversionRate: number;
};

/**
 * 5-stage application funnel. Each row's bar width is the count relative
 * to the top of the funnel (`applied`). The conversion-rate badge on the
 * right shows offer-to-application %.
 */
export function ApplicationFunnel({ data }: { data: FunnelData }) {
  const max = data.applied || 1;
  return (
    <div className="space-y-3">
      {FUNNEL_STAGES.map((stage) => {
        const count = data[stage.key];
        const widthPct = Math.max(2, Math.round((count / max) * 100));
        return (
          <div key={stage.key} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-base">{stage.label}</p>
              <span className="text-sm font-medium tabular-nums">
                {count.toLocaleString()}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full animate-progress-x",
                  stage.swatch,
                )}
                style={{ width: `${widthPct}%` }}
                aria-hidden
              />
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between border-t pt-3 text-sm">
        <span className="text-muted-foreground">Offer rate</span>
        <span className="font-semibold tabular-nums">
          {data.conversionRate}%
        </span>
      </div>
    </div>
  );
}