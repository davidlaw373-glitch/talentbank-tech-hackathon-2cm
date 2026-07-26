import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { ToastProvider } from "@/components/common/toast";
import { OfferOverview } from "./offer-overview";
import { OfferWorkflowProvider } from "./offer-workflow-provider";

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
});

function renderOverview() {
  return render(
    <ToastProvider>
      <OfferWorkflowProvider>
        <OfferOverview />
      </OfferWorkflowProvider>
    </ToastProvider>,
  );
}

describe("OfferOverview", () => {
  it("renders the priority overview and links to complete management", () => {
    renderOverview();

    expect(
      screen.getByRole("heading", { name: "Priority offers" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "View all offers" }),
    ).toHaveProperty("href", "http://localhost:3000/employer/offers/all");
    expect(
      screen.getByRole("button", { name: "Send offer" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("textbox", { name: "Search offers" }),
    ).toBeNull();
  });

  it("keeps withdraw actions out of priority rows", () => {
    renderOverview();

    expect(
      screen.queryAllByRole("button", { name: /Withdraw offer/ }),
    ).toHaveLength(0);
    expect(screen.getAllByText("Send").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Remind").length).toBeGreaterThan(0);
  });

  it("keeps resolved offers out of the priority queue", () => {
    renderOverview();

    expect(
      screen.getByRole("heading", { name: "Aisha Khan" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Tomoko Yamamoto" }),
    ).toBeTruthy();
    for (const resolvedCandidate of [
      "Alex Morgan",
      "Marco Okafor",
      "Rafael Diaz",
    ]) {
      expect(
        screen.queryByRole("heading", { name: resolvedCandidate }),
      ).toBeNull();
    }
  });

  it("switches an unsent offer from Send to Remind", async () => {
    const user = userEvent.setup();
    renderOverview();

    await user.click(
      screen.getByRole("button", { name: "Send offer to Aisha Khan" }),
    );

    expect(
      screen.queryByRole("button", {
        name: "Send offer to Aisha Khan",
      }),
    ).toBeNull();
    expect(
      screen.getByRole("button", {
        name: "Remind Aisha Khan about offer",
      }),
    ).toBeTruthy();
    expect(screen.getByText("Sent: Just now")).toBeTruthy();
  });

  it("opens complete offer details from a priority row", async () => {
    const user = userEvent.setup();
    renderOverview();

    await user.click(
      screen.getByRole("button", {
        name: "Open offer details for Aisha Khan",
      }),
    );

    expect(
      screen.getByRole("dialog", { name: "Aisha Khan's offer" }),
    ).toBeTruthy();
    expect(screen.getByText("SGD 135,000")).toBeTruthy();
  });

  it("disables Remind during its cooldown", async () => {
    const user = userEvent.setup();
    renderOverview();

    await user.click(
      screen.getByRole("button", {
        name: "Remind Tomoko Yamamoto about offer",
      }),
    );

    const reminded = screen.getByRole("button", {
      name: "Reminder cooling down for Tomoko Yamamoto",
    }) as HTMLButtonElement;
    expect(reminded.disabled).toBe(true);
    expect(screen.getByText("Reminder sent to Tomoko Yamamoto")).toBeTruthy();
  });
});
