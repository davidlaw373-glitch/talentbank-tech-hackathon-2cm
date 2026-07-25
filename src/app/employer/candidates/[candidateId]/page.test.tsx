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

    expect(timeline.className).toContain("flex-col");
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
