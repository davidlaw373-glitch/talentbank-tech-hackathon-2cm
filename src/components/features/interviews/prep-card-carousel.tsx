"use client";

import * as React from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Maximize2,
  MessageSquare,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PrepInterview = {
  id: string;
  company: string;
  role: string;
  round: string;
};

type PrepCardId = "questions" | "company" | "scorecard";

type PrepCard = {
  id: PrepCardId;
  title: string;
  description: string;
  preview: string;
  icon: LucideIcon;
};

type PrepCardCarouselProps = {
  prepInterview: PrepInterview;
  mockQuestions: readonly string[];
  companyNotes: readonly string[];
  scorecard: readonly string[];
  onPractice: (question: string) => void;
};

type PointerGesture = {
  pointerId: number;
  startX: number;
  startY: number;
  startTime: number;
  deltaX: number;
  dragging: boolean;
  captured: boolean;
  target: HTMLElement;
};

const CARDS: PrepCard[] = [
  {
    id: "questions",
    title: "Mock questions",
    description: "Practice the prompts most likely to come up.",
    preview: "4 prompts · practice out loud",
    icon: MessageSquare,
  },
  {
    id: "company",
    title: "Company research",
    description: "Keep the signals that matter about the team in view.",
    preview: "3 research signals · company snapshot",
    icon: Building2,
  },
  {
    id: "scorecard",
    title: "Scorecard preview",
    description: "Know what your interviewers will be listening for.",
    preview: "4 dimensions · rated 1–5",
    icon: ClipboardList,
  },
];

const SWIPE_DISTANCE = 48;
const SWIPE_VELOCITY = 0.35;
const SWIPE_INTENT_DISTANCE = 8;

function releasePointerCapture(gesture: PointerGesture) {
  if (
    gesture.captured &&
    gesture.target.hasPointerCapture(gesture.pointerId)
  ) {
    gesture.target.releasePointerCapture(gesture.pointerId);
  }
}

export function PrepCardCarousel({
  prepInterview,
  mockQuestions,
  companyNotes,
  scorecard,
  onPractice,
}: PrepCardCarouselProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);
  const [dragOffset, setDragOffset] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const gestureRef = React.useRef<PointerGesture | null>(null);
  const suppressClickRef = React.useRef(false);

  const goTo = React.useCallback((index: number) => {
    setActiveIndex((index + CARDS.length) % CARDS.length);
    setExpandedIndex(null);
    setDragOffset(0);
  }, []);

  const goBy = React.useCallback(
    (delta: number) => {
      setActiveIndex((current) => (current + delta + CARDS.length) % CARDS.length);
      setExpandedIndex(null);
      setDragOffset(0);
    },
    [],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLUListElement>) => {
    if (!event.isPrimary) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTime: event.timeStamp,
      deltaX: 0,
      dragging: false,
      captured: false,
      target: event.currentTarget,
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLUListElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    gesture.deltaX = deltaX;

    if (!gesture.dragging) {
      const horizontalIntent =
        Math.abs(deltaX) > SWIPE_INTENT_DISTANCE &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.25;
      if (!horizontalIntent) return;
      gesture.dragging = true;
      gesture.target.setPointerCapture(event.pointerId);
      gesture.captured = true;
      setIsDragging(true);
    }

    event.preventDefault();
    setDragOffset(deltaX * 0.7);
  };

  const finishPointer = (
    event: React.PointerEvent<HTMLUListElement>,
    shouldNavigate: boolean,
  ) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    if (shouldNavigate && gesture.dragging) {
      const elapsed = Math.max(1, event.timeStamp - gesture.startTime);
      const velocity = Math.abs(gesture.deltaX) / elapsed;
      const crossedThreshold =
        Math.abs(gesture.deltaX) >= SWIPE_DISTANCE || velocity >= SWIPE_VELOCITY;

      if (crossedThreshold) {
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
        goBy(gesture.deltaX < 0 ? 1 : -1);
      }
    }

    releasePointerCapture(gesture);
    gestureRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLUListElement>) => {
    finishPointer(event, true);
  };

  const onPointerCancel = (event: React.PointerEvent<HTMLUListElement>) => {
    finishPointer(event, false);
  };

  const onTrackKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      goBy(1);
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      goBy(-1);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      goTo(CARDS.length - 1);
      return;
    }
    if (event.key === "Escape" && expandedIndex !== null) {
      event.preventDefault();
      setExpandedIndex(null);
    }
  };

  const handleCardClick = (index: number) => {
    if (suppressClickRef.current || isDragging) return;
    if (index !== activeIndex) {
      goTo(index);
      return;
    }
    setExpandedIndex((current) => (current === index ? null : index));
  };

  const trackTransform = `${dragOffset}px`;
  const activeCard = CARDS[activeIndex];

  return (
    <section
      aria-label={`Interview prep for ${prepInterview.company}`}
      aria-roledescription="carousel"
      className="space-y-4"
    >
      <div className="space-y-0.5">
        <p className="text-caption">Choose a prep focus</p>
        <p className="text-sm font-medium">
          Card {activeIndex + 1} of {CARDS.length}
          <span className="text-muted-foreground"> · {activeCard.title}</span>
        </p>
      </div>

      <div className="flex items-stretch gap-3">
        <button
          type="button"
          aria-label="Previous prep card"
          onClick={() => goBy(-1)}
          className={cn(
            "group flex w-12 shrink-0 items-center justify-center self-stretch rounded-xl border border-border/60 bg-surface-1 text-muted-foreground transition-colors duration-300",
            "hover:bg-surface-2 hover:text-foreground hover:border-foreground/30",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "press-feedback",
          )}
        >
          <ChevronLeft
            aria-hidden
            className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-0.5"
          />
        </button>

        <div
          role="region"
          tabIndex={0}
          aria-label="Use the arrow keys or swipe to choose a prep card"
          onKeyDown={onTrackKeyDown}
          className={cn(
            "min-w-0 flex-1 overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "md:overflow-visible",
            isDragging && "cursor-grabbing",
          )}
        >
        <ul
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          style={
            {
              "--prep-track-transform": trackTransform,
            } as React.CSSProperties
          }
          className={cn(
            "w-full translate-x-[var(--prep-track-transform)] transform-gpu",
            "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "[touch-action:pan-y]",
            isDragging && "transition-none",
          )}
        >
          {[activeCard].map((card) => {
            const index = activeIndex;
            const isExpanded = index === expandedIndex;
            const Icon = card.icon;

            return (
              <li
                key={card.id}
                id={`prep-slide-${card.id}`}
                aria-label={`${index + 1} of ${CARDS.length}: ${card.title}`}
                aria-roledescription="slide"
                className="w-full"
              >
                <Card
                  className={cn(
                    "h-full overflow-hidden border-border/60 bg-surface-1 transition-[box-shadow,transform,opacity] duration-300",
                    "lift-on-hover",
                    "border-foreground/20 shadow-md",
                    isExpanded && "border-foreground/30 shadow-lg ring-1 ring-ring/30",
                  )}
                >
                  {!isExpanded ? (
                    <button
                      type="button"
                      className="block h-full w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                      aria-current="true"
                      aria-expanded={false}
                      aria-label={`Expand ${card.title}`}
                      onClick={() => handleCardClick(index)}
                    >
                      <div className="flex h-full min-h-48 flex-col justify-between gap-8 p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <span
                            aria-hidden
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-highlight-soft text-foreground"
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="text-caption text-muted-foreground">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <h3 className="text-card-title">{card.title}</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {card.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
                            <span className="text-xs font-medium text-foreground/80">
                              {card.preview}
                            </span>
                            <Maximize2
                              aria-hidden
                              className="h-4 w-4 shrink-0 text-muted-foreground"
                            />
                          </div>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <>
                      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0 border-b border-border/60 bg-surface-tint/50 p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                          <span
                            aria-hidden
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-highlight-soft text-foreground"
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="space-y-1">
                            <CardTitle>
                              <h3>{card.title}</h3>
                            </CardTitle>
                            <CardDescription>
                              {card.id === "company"
                                ? `${prepInterview.company} snapshot`
                                : card.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label={`Collapse ${card.title}`}
                          aria-expanded={isExpanded}
                          onClick={() => setExpandedIndex(null)}
                        >
                          <ChevronUp aria-hidden className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-3 p-5 sm:p-6">
                        {card.id === "questions" ? (
                          <ol className="space-y-2">
                            {mockQuestions.map((question, questionIndex) => (
                              <li
                                key={question}
                                className="rounded-lg border border-border/60 bg-surface-1 p-3"
                              >
                                <div className="flex items-start gap-3">
                                  <span
                                    aria-hidden
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold"
                                  >
                                    {questionIndex + 1}
                                  </span>
                                  <p className="min-w-0 flex-1 text-sm leading-relaxed">
                                    {question}
                                  </p>
                                </div>
                                <div className="mt-3 flex justify-end">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onPractice(question)}
                                  >
                                    Practice
                                  </Button>
                                </div>
                              </li>
                            ))}
                          </ol>
                        ) : null}

                        {card.id === "company" ? (
                          <ul className="space-y-2">
                            {companyNotes.map((note) => (
                              <li
                                key={note}
                                className="flex items-start gap-2 rounded-lg border border-border/60 bg-surface-1 p-3 text-sm leading-relaxed"
                              >
                                <span
                                  aria-hidden
                                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-highlight"
                                />
                                <span>{note}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}

                        {card.id === "scorecard" ? (
                          <ul className="space-y-2">
                            {scorecard.map((line) => (
                              <li
                                key={line}
                                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-surface-1 p-3 text-sm"
                              >
                                <span className="min-w-0 flex-1 leading-relaxed">
                                  {line}
                                </span>
                                <Badge variant="outline" className="shrink-0">
                                  1–5
                                </Badge>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </CardContent>
                    </>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      </div>
        <button
          type="button"
          aria-label="Next prep card"
          onClick={() => goBy(1)}
          className={cn(
            "group flex w-12 shrink-0 items-center justify-center self-stretch rounded-xl border border-border/60 bg-surface-1 text-muted-foreground transition-colors duration-300",
            "hover:bg-surface-2 hover:text-foreground hover:border-foreground/30",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "press-feedback",
          )}
        >
          <ChevronRight
            aria-hidden
            className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Swipe to browse, then open a card to practice.
        </p>
        <div
          role="tablist"
          aria-label="Interview prep sections"
          className="flex items-center gap-1.5"
        >
          {CARDS.map((card, index) => (
            <button
              key={card.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-controls={`prep-slide-${card.id}`}
              aria-label={`Show ${card.title}`}
              onClick={() => goTo(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                index === activeIndex
                  ? "w-8 bg-foreground"
                  : "w-1.5 bg-border hover:bg-foreground/50",
              )}
            />
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {`Card ${activeIndex + 1} of ${CARDS.length}: ${activeCard.title}${
          expandedIndex === activeIndex ? ", expanded" : ""
        }`}
      </p>
    </section>
  );
}
