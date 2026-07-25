import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/features/employer/candidate-actions", () => ({
  CandidateActions: () => <div>Candidate actions</div>,
}));

import EmployerCandidateDetailPage from "./page";

describe("EmployerCandidateDetailPage", () => {
  it("places a complete resume preview beside a vertical timeline", async () => {
    const { container } = render(
      await EmployerCandidateDetailPage({
        params: Promise.resolve({ candidateId: "5" }),
      }),
    );
    const profileOverview = screen.getByRole("region", {
      name: "Candidate resume and hiring progress",
    });
    const timeline = within(profileOverview).getByRole("list", {
      name: "Hiring progress for Rafael Diaz",
    });
    const resume = within(profileOverview).getByRole("article", {
      name: "Resume preview for Rafael Diaz",
    });
    const timelineContainer = timeline.closest("aside");

    expect(timeline.className).toContain("flex-col");
    expect(timeline.className).toContain("h-full");
    expect(profileOverview.className).toContain("items-stretch");
    expect(timelineContainer?.className).not.toContain("border");
    expect(timelineContainer?.className).not.toContain("bg-surface");
    expect(timelineContainer?.className).not.toContain("shadow");
    expect(
      within(timeline).getByText("Applied").className,
    ).toContain("text-base");
    const timelineLineFills = timeline.querySelectorAll(
      '[data-slot="timeline-line-fill"]',
    );
    const timelineNodeWaves = timeline.querySelectorAll(
      '[data-slot="timeline-node-wave"]',
    );
    const timelineTracks = timeline.querySelectorAll(
      '[data-slot="timeline-track-glow"]',
    );
    const currentTransitionSweeps = timeline.querySelectorAll(
      '[data-slot="timeline-current-sweep"]',
    );
    expect(timelineLineFills).toHaveLength(0);
    expect(timelineTracks).toHaveLength(0);
    expect(timelineNodeWaves).toHaveLength(1);
    expect(currentTransitionSweeps).toHaveLength(1);
    for (const lineFill of timelineLineFills) {
      expect(lineFill.className).toContain("animate-timeline-line-fill");
    }
    for (const track of timelineTracks) {
      expect(track.className).toContain("animate-timeline-track-glow");
    }
    for (const nodeWave of timelineNodeWaves) {
      expect(nodeWave.className).toContain("animate-pulse-ring-soft");
    }
    expect(currentTransitionSweeps.item(0).className).toContain(
      "animate-timeline-current-sweep",
    );
    expect(currentTransitionSweeps.item(0).className).toContain("w-2");
    expect(currentTransitionSweeps.item(0).className).toContain(
      "shadow-[0_0_14px_var(--primary)]",
    );
    expect(
      (currentTransitionSweeps.item(0) as HTMLElement).style.animationDelay,
    ).toBe("");
    expect(
      currentTransitionSweeps
        .item(0)
        .closest('[data-slot="timeline-connector"]')?.className,
    ).not.toContain("overflow-hidden");
    expect(
      timeline
        .querySelector('[aria-label="Screening, upcoming"]')
        ?.querySelector('[data-slot="timeline-node-wave"]'),
    ).toBeNull();
    expect(
      timeline.querySelector('[data-slot="timeline-line-runner"]'),
    ).toBeNull();
    expect(within(profileOverview).queryByText("Timeline")).toBeNull();
    expect(
      within(profileOverview).queryByText(
        "Where this candidate sits in your hiring flow.",
      ),
    ).toBeNull();
    expect(within(resume).getByText("Summary")).toBeTruthy();
    expect(within(resume).getByText("Experience")).toBeTruthy();
    expect(within(resume).getByText("Education")).toBeTruthy();
    expect(within(resume).getByText("Skills")).toBeTruthy();
    expect(resume.className).not.toContain("overflow-y-auto");
    expect(screen.queryByText("Candidate profile")).toBeNull();

    const evaluation = container.querySelector(
      '[data-slot="candidate-evaluation"]',
    );
    expect(evaluation).toBeTruthy();
    expect(
      within(evaluation as HTMLElement).getByRole("heading", {
        name: "Match overview",
      }),
    ).toBeTruthy();
    expect(
      within(evaluation as HTMLElement).getByRole("heading", {
        name: "Application",
      }),
    ).toBeTruthy();
    expect(
      profileOverview.compareDocumentPosition(evaluation as Node) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps the current transition sweep free of falling runner balls", async () => {
    render(
      await EmployerCandidateDetailPage({
        params: Promise.resolve({ candidateId: "3" }),
      }),
    );

    const timeline = screen.getByRole("list", {
      name: "Hiring progress for Marco Okafor",
    });
    const currentSweep = timeline.querySelector(
      '[data-slot="timeline-current-sweep"]',
    ) as HTMLElement;

    expect(
      timeline.querySelector('[data-slot="timeline-line-runner"]'),
    ).toBeNull();
    expect(currentSweep.style.animationDelay).toBe("");
  });
});
