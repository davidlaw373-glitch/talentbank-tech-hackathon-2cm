import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  OfferWorkflowProvider,
  useOfferWorkflow,
} from "./offer-workflow-provider";

function WorkflowHarness() {
  const workflow = useOfferWorkflow();
  const unsent = workflow.rows.find(
    (row) => row.offer.sentDate === "Not yet sent",
  );

  if (!unsent) {
    return <p>No unsent offer</p>;
  }

  return (
    <>
      <p>{unsent.offer.sentDate}</p>
      <p>
        {workflow.isReminderCoolingDown(unsent.offer.id)
          ? "cooling"
          : "ready"}
      </p>
      <p>{workflow.rows.length} rows</p>
      <button onClick={() => workflow.sendOffer(unsent.offer.id)}>Send</button>
      <button onClick={() => workflow.remindOffer(unsent.offer.id)}>
        Remind
      </button>
      <button onClick={() => workflow.withdrawOffer(unsent.offer.id)}>
        Withdraw
      </button>
    </>
  );
}

function renderWorkflow() {
  return render(
    <OfferWorkflowProvider>
      <WorkflowHarness />
    </OfferWorkflowProvider>,
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("OfferWorkflowProvider", () => {
  it("marks an unsent offer as sent", async () => {
    const user = userEvent.setup();
    renderWorkflow();

    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(screen.getByText("No unsent offer")).toBeTruthy();
  });

  it("holds reminder cooldown for thirty seconds", async () => {
    vi.useFakeTimers();
    renderWorkflow();

    fireEvent.click(screen.getByRole("button", { name: "Remind" }));
    expect(screen.getByText("cooling")).toBeTruthy();

    act(() => vi.advanceTimersByTime(29_999));
    expect(screen.getByText("cooling")).toBeTruthy();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText("ready")).toBeTruthy();
  });

  it("removes a withdrawn offer from the shared rows", async () => {
    const user = userEvent.setup();
    renderWorkflow();

    expect(screen.getByText("5 rows")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Withdraw" }));

    expect(screen.getByText("No unsent offer")).toBeTruthy();
  });
});
