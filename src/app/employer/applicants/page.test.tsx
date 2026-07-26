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

function getPipelineTab(name: string) {
  return screen.getByRole("tab", { name });
}

describe("EmployerCandidatesPage", () => {
  it("keeps discovery controls visible and renders candidate cards", () => {
    renderCandidatesPage();

    expect(screen.getByLabelText("Search candidates")).toBeTruthy();
    expect(screen.getByLabelText("Applied role")).toBeTruthy();
    expect(screen.queryByLabelText("Hiring stage")).toBeNull();
    expect(screen.queryByLabelText("Candidate view")).toBeNull();
    expect(screen.getByRole("group", { name: "Hiring pipeline" })).toBeTruthy();
    expect(screen.queryByLabelText("Verification")).toBeNull();
    const sortControl = screen.getByRole("button", {
      name: "Sort candidates",
    });
    expect(sortControl).toBeTruthy();
    expect(sortControl.textContent).toContain("None");
    fireEvent.pointerDown(sortControl, { button: 0, ctrlKey: false });
    for (const option of [
      "Latest",
      "Verified",
      "Starred",
      "AI Match: high to low",
    ]) {
      expect(
        screen.getByRole("menuitemcheckbox", { name: option }),
      ).toBeTruthy();
    }
    expect(screen.getAllByRole("menuitemcheckbox")).toHaveLength(4);
    expect(screen.queryByText(/candidates shown/i)).toBeNull();
    expect(screen.queryByText("Candidate discovery")).toBeNull();
    expect(screen.queryByText("Find the right evidence")).toBeNull();
    expect(screen.queryByText(/Showing the screening view/i)).toBeNull();
    expect(screen.getAllByText(/AI Match/i).length).toBeGreaterThan(0);
  });

  it("renders the Hiring Pipeline as inline tab chips with Applied selected by default", () => {
    renderCandidatesPage();
    const pipelineGroup = screen.getByRole("group", {
      name: "Hiring pipeline",
    });

    expect(within(pipelineGroup).getByText("Hiring Pipeline")).toBeTruthy();
    const appliedTab = within(pipelineGroup).getByRole("tab", {
      name: /Applied/,
    });
    expect(appliedTab.getAttribute("aria-selected")).toBe("true");
    for (const stage of [
      "All",
      "Screening queue",
      "Interview",
      "Offer",
      "Hired",
      "Rejected",
    ]) {
      expect(
        within(pipelineGroup).getByRole("tab", { name: stage }),
      ).toBeTruthy();
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
    const sortControl = screen.getByRole("button", {
      name: "Sort candidates",
    });
    fireEvent.pointerDown(sortControl, { button: 0, ctrlKey: false });
    fireEvent.click(
      screen.getByRole("menuitemcheckbox", { name: "Starred" }),
    );
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });

    const filteredCards = within(
      screen.getByRole("list", { name: "Candidate results" }),
    ).getAllByRole("article");
    expect(filteredCards).toHaveLength(1);
    expect(filteredCards[0].getAttribute("aria-label")).toContain(
      savedCandidateName as string,
    );
  });

  it("combines multiple candidate sort filters", () => {
    renderCandidatesPage();
    const sortControl = screen.getByRole("button", {
      name: "Sort candidates",
    });

    fireEvent.pointerDown(sortControl, { button: 0, ctrlKey: false });
    fireEvent.click(
      screen.getByRole("menuitemcheckbox", { name: "Verified" }),
    );
    fireEvent.click(
      screen.getByRole("menuitemcheckbox", {
        name: "AI Match: high to low",
      }),
    );

    expect(sortControl.textContent).toContain("2 selected");
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    const visibleRows = getEmployerCandidateRows(1).filter(
      (row) =>
        !row.app.rejected &&
        row.app.stage === "Applied" &&
        row.verification === "Verified",
    );
    expect(screen.queryAllByRole("article")).toHaveLength(visibleRows.length);
  });

  it("switches the candidate view when a pipeline tab is selected", () => {
    renderCandidatesPage();

    expect(
      getPipelineTab("Applied").getAttribute("aria-selected"),
    ).toBe("true");

    fireEvent.click(getPipelineTab("All"));
    expect(getPipelineTab("All").getAttribute("aria-selected")).toBe("true");
    expect(
      getPipelineTab("Applied").getAttribute("aria-selected"),
    ).toBe("false");
    expect(screen.getAllByRole("article")).toHaveLength(
      getEmployerCandidateRows(1).length,
    );

    const offerCount = getEmployerCandidateRows(1).filter(
      (row) => !row.app.rejected && row.app.stage === "Offer",
    ).length;
    fireEvent.click(getPipelineTab("Offer"));
    expect(getPipelineTab("Offer").getAttribute("aria-selected")).toBe("true");
    expect(screen.getAllByRole("article")).toHaveLength(offerCount);

    const rejectedCount = getEmployerCandidateRows(1).filter(
      (row) => row.app.rejected,
    ).length;
    fireEvent.click(getPipelineTab("Rejected"));
    expect(getPipelineTab("Rejected").getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(screen.getAllByRole("article")).toHaveLength(rejectedCount);
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
    fireEvent.click(getPipelineTab("Screening queue"));

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
