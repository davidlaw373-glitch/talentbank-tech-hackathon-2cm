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
    const timelineFlows = timeline.querySelectorAll(
      '[data-slot="timeline-flow"]',
    );
    const timelineNodeWaves = timeline.querySelectorAll(
      '[data-slot="timeline-node-wave"]',
    );
    expect(timelineFlows).toHaveLength(4);
    expect(timelineNodeWaves).toHaveLength(5);
    for (const flow of timelineFlows) {
      expect(flow.className).toContain("animate-timeline-flow-down");
    }
    for (const nodeWave of timelineNodeWaves) {
      expect(nodeWave.className).toContain("animate-pulse-ring-soft");
    }
    expect((timelineFlows.item(0) as HTMLElement).style.animationDelay).toBe(
      "0s",
    );
    expect((timelineFlows.item(1) as HTMLElement).style.animationDelay).toBe(
      "0.45s",
    );
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
});
