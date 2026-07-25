import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ToastProvider } from "@/components/common/toast";
import { CandidateStarButton } from "./candidate-star-button";

describe("CandidateStarButton", () => {
  it("toggles the candidate's starred state from the icon-only control", async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <CandidateStarButton candidateName="Marco Okafor" />
      </ToastProvider>,
    );

    const button = screen.getByRole("button", {
      name: "Star Marco Okafor",
    });
    expect(button.getAttribute("aria-pressed")).toBe("false");

    await user.click(button);

    expect(
      screen.getByRole("button", {
        name: "Remove Marco Okafor from starred",
      }).getAttribute("aria-pressed"),
    ).toBe("true");
  });
});
