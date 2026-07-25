import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/use-onboarding-status", () => ({
  useOnboardingStatus: () => ({
    complete: false,
    ready: true,
  }),
}));

import { SetupBanner } from "./setup-banner";

describe("SetupBanner", () => {
  it("can be dismissed with an unframed icon button", async () => {
    const user = userEvent.setup();
    render(<SetupBanner role="employer" />);

    const dismiss = screen.getByRole("button", {
      name: "Dismiss profile setup reminder",
    });
    expect(dismiss.className).not.toContain("border");

    await user.click(dismiss);

    expect(
      screen.queryByRole("region", { name: "Profile setup reminder" }),
    ).toBeNull();
  });
});
