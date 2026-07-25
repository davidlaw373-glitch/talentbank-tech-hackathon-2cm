import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
    expect(screen.getByLabelText("Hiring stage")).toBeTruthy();
    expect(screen.getByLabelText("Verification")).toBeTruthy();
    expect(screen.getByLabelText("Sort candidates")).toBeTruthy();
    expect(screen.getByText(/candidates shown/i)).toBeTruthy();
    expect(screen.getAllByText(/AI Match/i).length).toBeGreaterThan(0);
  });

  it("uses a restrained brand palette without decorative chart accents", () => {
    const { container } = render(<EmployerCandidatesPage />);

    expect(container.querySelector('[class*="bg-chart-"]')).toBeNull();
    expect(container.querySelector(".bg-primary")).toBeTruthy();
  });
});
