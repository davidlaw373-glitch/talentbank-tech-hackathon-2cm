import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getEmployerOfferSeedRows } from "./offer-data";
import { OfferDetailsDialog } from "./offer-details-dialog";

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
});

describe("OfferDetailsDialog", () => {
  it("shows the complete offer record and closes", async () => {
    const user = userEvent.setup();
    const row = getEmployerOfferSeedRows()[0]!;
    const onOpenChange = vi.fn();

    render(
      <OfferDetailsDialog
        row={row}
        open
        onOpenChange={onOpenChange}
      />,
    );

    expect(
      screen.getByRole("heading", { name: `${row.candidate.name}'s offer` }),
    ).toBeTruthy();
    for (const value of [
      row.job.title,
      row.offer.baseSalary,
      row.offer.startDate,
      row.offer.sentDate,
      `${row.offer.matchScore}%`,
    ]) {
      expect(screen.getByText(value)).toBeTruthy();
    }
    expect(
      screen.getAllByText(row.offer.decision).length,
    ).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
