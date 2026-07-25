import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getEmployerCandidateRows } from "@/lib/data-helpers";
import { CandidatePipelineProvider } from "@/components/features/employer/candidate-pipeline-provider";

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

function renderCandidatesPage() {
  return render(
    <CandidatePipelineProvider>
      <EmployerCandidatesPage />
    </CandidatePipelineProvider>,
  );
}

describe("EmployerCandidatesPage", () => {
  it("keeps discovery controls visible and renders candidate cards", () => {
    renderCandidatesPage();

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
    expect(
      within(sortControl).getByRole("option", {
        name: "Starred",
      }),
    ).toBeTruthy();
    expect(within(sortControl).queryByText(/AI Match/i)).toBeNull();
    expect(within(sortControl).getAllByRole("option")).toHaveLength(4);
    expect((sortControl as HTMLSelectElement).value).toBe("none");
    expect(screen.queryByText(/candidates shown/i)).toBeNull();
    expect(screen.queryByText("Candidate discovery")).toBeNull();
    expect(screen.queryByText("Find the right evidence")).toBeNull();
    expect(screen.queryByText(/Showing the screening view/i)).toBeNull();
    expect(screen.getAllByText(/AI Match/i).length).toBeGreaterThan(0);
  });

  it("places the pipeline entry in the page heading", () => {
    renderCandidatesPage();
    const pageHeader = screen
      .getByRole("heading", { name: "Candidate management" })
      .closest("header");

    expect(pageHeader).toBeTruthy();
    const pipelineButton = within(pageHeader as HTMLElement).getByRole(
      "button",
      {
        name: "View candidate pipeline",
      },
    );
    expect(pipelineButton).toBeTruthy();
    expect(pipelineButton.querySelector("svg")).toBeNull();
    expect(pipelineButton.className).toContain("bg-surface-1");
  });

  it("defaults to applied candidates and shows their status on every card", () => {
    renderCandidatesPage();
    const appliedCount = getEmployerCandidateRows(1).filter(
      (row) => !row.app.rejected && row.app.stage === "Applied",
    ).length;
    const cards = screen.getAllByRole("article");

    expect(cards).toHaveLength(appliedCount);
    for (const card of cards) {
      const status = card.querySelector('[data-slot="candidate-status"]');
      expect(status?.textContent).toBe("Applied");
    }
  });

  it("filters the current view to starred candidates", () => {
    renderCandidatesPage();
    const results = screen.getByRole("list", { name: "Candidate results" });
    const firstCard = within(results).getAllByRole("article")[0];
    const savedCandidateName = firstCard.getAttribute("aria-label")?.split(",")[0];
    expect(savedCandidateName).toBeTruthy();

    fireEvent.click(
      within(firstCard).getByRole("button", { name: /^Save / }),
    );
    fireEvent.change(screen.getByLabelText("Sort candidates"), {
      target: { value: "starred" },
    });

    const filteredCards = within(
      screen.getByRole("list", { name: "Candidate results" }),
    ).getAllByRole("article");
    expect(filteredCards).toHaveLength(1);
    expect(filteredCards[0].getAttribute("aria-label")).toContain(
      savedCandidateName as string,
    );
  });

  it("shows every pipeline record from View all", () => {
    renderCandidatesPage();
    fireEvent.click(
      screen.getByRole("button", { name: "View candidate pipeline" }),
    );
    fireEvent.click(
      within(
        screen.getByRole("dialog", { name: "Candidate pipeline" }),
      ).getByRole("button", { name: "View all" }),
    );

    expect(screen.getAllByRole("article")).toHaveLength(
      getEmployerCandidateRows(1).length,
    );
  });

  it("adds six varied examples to the applied queue", () => {
    renderCandidatesPage();

    for (const candidateName of [
      "Daniel Okafor",
      "Elena García",
      "Priya Nair",
      "Jonas Berg",
      "Leo Martinez",
      "Sophie Laurent",
    ]) {
      expect(screen.getByText(candidateName)).toBeTruthy();
    }
  });

  it("keeps two of the added examples in screening after moving four out", () => {
    renderCandidatesPage();
    fireEvent.click(
      screen.getByRole("button", { name: "View candidate pipeline" }),
    );
    fireEvent.click(
      within(
        screen.getByRole("dialog", { name: "Candidate pipeline" }),
      ).getByRole("button", { name: "Screening queue" }),
    );

    for (const candidateName of ["Maya Chen", "Amara Williams"]) {
      expect(screen.getByText(candidateName)).toBeTruthy();
    }
    for (const movedCandidateName of [
      "Daniel Okafor",
      "Elena García",
      "Priya Nair",
      "Jonas Berg",
    ]) {
      expect(screen.queryByText(movedCandidateName)).toBeNull();
    }
  });

  it("opens a left pipeline panel and switches stages without pending", () => {
    renderCandidatesPage();
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
    expect(
      within(pipeline).getByRole("button", { name: "View all" }),
    ).toBeTruthy();

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
    const { container } = renderCandidatesPage();

    expect(container.querySelector('[class*="bg-chart-"]')).toBeNull();
    expect(container.querySelector(".bg-primary")).toBeTruthy();
  });

  it("uses soft top corners and no top accent strip on the search panel", () => {
    const { container } = renderCandidatesPage();
    const searchPanel = container.querySelector(
      '[data-slot="candidate-filter-panel"]',
    );

    expect(searchPanel?.className).toContain("rounded-tl-3xl");
    expect(searchPanel?.className).toContain("rounded-tr-3xl");
    expect(searchPanel?.className).toContain("shadow-none");
    expect(
      Array.from(searchPanel?.children ?? []).some(
        (child) =>
          child.className.includes("h-1.5") &&
          child.className.includes("bg-primary"),
      ),
    ).toBe(false);
  });
});
