import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getEmployerCandidateRows } from "@/lib/data-helpers";

vi.mock("@/components/common/toast", () => ({
  useToast: () => ({ push: vi.fn() }),
}));

vi.mock(
  "@/components/features/employer/talent-pool/pool-provider",
  () => ({
    useTalentPool: () => ({
      add: vi.fn(),
      remove: vi.fn(),
      isInPool: () => false,
      getByCandidate: () => undefined,
    }),
  }),
);

import EmployerCandidatesPage from "./page";

describe("EmployerCandidatesPage", () => {
  it("keeps discovery controls visible and renders candidate cards", () => {
    render(<EmployerCandidatesPage />);

    expect(screen.getByLabelText("Search candidates")).toBeTruthy();
    expect(screen.getByLabelText("Applied role")).toBeTruthy();
    expect(screen.queryByLabelText("Hiring stage")).toBeNull();
    expect(screen.getByLabelText("Candidate view")).toBeTruthy();
    expect(screen.getByLabelText("Verification")).toBeTruthy();
    expect(screen.getByLabelText("Sort candidates")).toBeTruthy();
    expect(screen.getByText(/candidates shown/i)).toBeTruthy();
    expect(screen.getAllByText(/AI Match/i).length).toBeGreaterThan(0);
  });

  it("defaults to screening candidates without stage labels on cards", () => {
    render(<EmployerCandidatesPage />);
    const screeningCount = getEmployerCandidateRows(1).filter(
      (row) => !row.app.rejected && row.app.stage === "Screening",
    ).length;
    const cards = screen.getAllByRole("article");

    expect(cards).toHaveLength(screeningCount);
    for (const card of cards) {
      expect(within(card).queryByText("Screening")).toBeNull();
      expect(within(card).queryByText("Interview")).toBeNull();
      expect(within(card).queryByText("Applied")).toBeNull();
      expect(within(card).queryByText("Offer")).toBeNull();
      expect(within(card).queryByText("Rejected")).toBeNull();
    }
  });

  it("uses the candidate-view entry for other pipeline stages without pending", () => {
    render(<EmployerCandidatesPage />);
    const candidateView = screen.getByLabelText("Candidate view");
    const appliedCount = getEmployerCandidateRows(1).filter(
      (row) => !row.app.rejected && row.app.stage === "Applied",
    ).length;

    expect(within(candidateView).queryByText("Pending")).toBeNull();
    fireEvent.change(candidateView, { target: { value: "Applied" } });

    expect(screen.getAllByRole("article")).toHaveLength(appliedCount);
  });

  it("uses a restrained brand palette without decorative chart accents", () => {
    const { container } = render(<EmployerCandidatesPage />);

    expect(container.querySelector('[class*="bg-chart-"]')).toBeNull();
    expect(container.querySelector(".bg-primary")).toBeTruthy();
  });
});
