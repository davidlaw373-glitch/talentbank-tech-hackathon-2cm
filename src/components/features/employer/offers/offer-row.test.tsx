import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getEmployerOfferSeedRows } from "./offer-data";
import { OfferRow, type OfferRowActions } from "./offer-row";

const actions: OfferRowActions = {
  onSend: vi.fn(),
  onRemind: vi.fn(),
  onWithdraw: vi.fn(),
  onView: vi.fn(),
};

const rows = getEmployerOfferSeedRows();
const unsentPending = rows.find(
  (row) => row.offer.sentDate === "Not yet sent",
)!;
const sentPending = rows.find(
  (row) =>
    row.offer.decision === "Pending" &&
    row.offer.sentDate !== "Not yet sent",
)!;
const declined = rows.find((row) => row.offer.decision === "Declined")!;

describe("OfferRow", () => {
  it("shows Send and View for an unsent pending offer", () => {
    render(
      <OfferRow
        row={unsentPending}
        mode="priority"
        reminderCoolingDown={false}
        actions={actions}
      />,
    );

    expect(
      screen.getByRole("button", { name: /Send offer/ }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /View offer/ }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /Remind/ }),
    ).toBeNull();
  });

  it("shows Remind and View for a sent pending offer", () => {
    render(
      <OfferRow
        row={sentPending}
        mode="priority"
        reminderCoolingDown={false}
        actions={actions}
      />,
    );

    expect(
      screen.getByRole("button", { name: /Remind/ }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /View offer/ }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /Send offer/ }),
    ).toBeNull();
  });

  it("shows a disabled Reminded action during cooldown", () => {
    render(
      <OfferRow
        row={sentPending}
        mode="priority"
        reminderCoolingDown
        actions={actions}
      />,
    );

    const remindedButton = screen.getByRole("button", {
      name: /Reminder cooling down/,
    }) as HTMLButtonElement;
    expect(
      remindedButton.disabled,
    ).toBe(true);
  });

  it("keeps a declined offer read-only in complete management", () => {
    render(
      <OfferRow
        row={declined}
        mode="all"
        reminderCoolingDown={false}
        actions={actions}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /Withdraw offer/ }),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: /View offer/ }),
    ).toBeTruthy();
  });
});
