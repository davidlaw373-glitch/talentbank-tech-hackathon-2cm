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
    expect(screen.queryByLabelText("Candidate view")).toBeNull();
    expect(
      screen.getByRole("button", { name: "View candidate pipeline" }),
    ).toBeTruthy();
    expect(screen.queryByLabelText("Verification")).toBeNull();
    const sortControl = screen.getByLabelText("Sort candidates");
    expect(sortControl).toBeTruthy();
    expect(
      within(sortControl).getByRole("option", {
        name: "None",
      }),
    ).toBeTruthy();
    expect(
      within(sortControl).getByRole("option", {
        name: "Latest",
      }),
    ).toBeTruthy();
    expect(
      within(sortControl).getByRole("option", {
        name: "Verified",
      }),
    ).toBeTruthy();
    expect(within(sortControl).queryByText(/AI Match/i)).toBeNull();
    expect(within(sortControl).getAllByRole("option")).toHaveLength(3);
    expect((sortControl as HTMLSelectElement).value).toBe("none");
    expect(screen.queryByText(/candidates shown/i)).toBeNull();
    expect(screen.queryByText("Candidate discovery")).toBeNull();
    expect(screen.queryByText("Find the right evidence")).toBeNull();
    expect(screen.queryByText(/Showing the screening view/i)).toBeNull();
    expect(screen.getAllByText(/AI Match/i).length).toBeGreaterThan(0);
  });

  it("places the pipeline entry in the page heading", () => {
    render(<EmployerCandidatesPage />);
    const pageHeader = screen
      .getByRole("heading", { name: "Candidate management" })
      .closest("header");

    expect(pageHeader).toBeTruthy();
    expect(
      within(pageHeader as HTMLElement).getByRole("button", {
        name: "View candidate pipeline",
      }),
    ).toBeTruthy();
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

  it("opens a left pipeline panel and switches stages without pending", () => {
    render(<EmployerCandidatesPage />);
    const offerCount = getEmployerCandidateRows(1).filter(
      (row) => !row.app.rejected && row.app.stage === "Offer",
    ).length;
    const rejectedCount = getEmployerCandidateRows(1).filter(
      (row) => row.app.rejected,
    ).length;

    fireEvent.click(
      screen.getByRole("button", { name: "View candidate pipeline" }),
    );
    const pipeline = screen.getByRole("dialog", {
      name: "Candidate pipeline",
    });
    expect(pipeline.className).toContain("left-0");
    expect(pipeline.className).toContain("border-r-2");
    expect(within(pipeline).queryByText("Pending")).toBeNull();

    fireEvent.click(
      within(pipeline).getByRole("button", { name: "Offer" }),
    );

    expect(
      screen.queryByRole("dialog", { name: "Candidate pipeline" }),
    ).toBeNull();
    expect(screen.getAllByRole("article")).toHaveLength(offerCount);

    fireEvent.click(
      screen.getByRole("button", { name: "View candidate pipeline" }),
    );
    fireEvent.click(
      within(
        screen.getByRole("dialog", { name: "Candidate pipeline" }),
      ).getByRole("button", { name: "Rejected" }),
    );

    expect(screen.getAllByRole("article")).toHaveLength(rejectedCount);
  });

  it("uses a restrained brand palette without decorative chart accents", () => {
    const { container } = render(<EmployerCandidatesPage />);

    expect(container.querySelector('[class*="bg-chart-"]')).toBeNull();
    expect(container.querySelector(".bg-primary")).toBeTruthy();
  });
});
