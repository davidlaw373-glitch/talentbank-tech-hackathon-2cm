"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.2;
const ZOOM_STEP = 0.1;

export function JobPreviewZoom({ children }: { children: React.ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const measure = () => setContentHeight(content.scrollHeight);
    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();

      setZoom((current) => {
        const direction = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        return Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, Number((current + direction).toFixed(1))),
        );
      });
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div
      ref={viewportRef}
      data-testid="job-preview-zoom"
      className="relative w-full"
      style={{
        height: contentHeight > 0 ? `${contentHeight * zoom}px` : undefined,
      }}
    >
      <div
        ref={contentRef}
        className="absolute left-1/2 top-0 w-full"
        style={{
          transform: `translateX(-50%) scale(${zoom})`,
          transformOrigin: "top center",
        }}
      >
        {children}
      </div>
      <span className="sr-only" aria-live="polite">
        Preview zoom {Math.round(zoom * 100)}%
      </span>
    </div>
  );
}
