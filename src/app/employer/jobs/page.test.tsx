import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { getByEmployer as getJobsByEmployer } from "@/data/jobs";
import { JobRow } from "./page";

describe("JobRow actions panel", () => {
  it("flips between hiring progress and job actions without navigating", async () => {
    const user = userEvent.setup();
    const job = getJobsByEmployer(1).find((item) => item.status === "Live");
    const onRequestPause = vi.fn();
    const onRequestClose = vi.fn();

    expect(job).toBeDefined();

    render(
      <JobRow
        job={job!}
        onRequestPause={onRequestPause}
        onRequestClose={onRequestClose}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: `Show actions for ${job!.title}`,
      }),
    );

    await user.click(
      screen.getByRole("button", { name: `Pause ${job!.title}` }),
    );
    expect(onRequestPause).toHaveBeenCalledWith(job);

    await user.click(
      screen.getByRole("button", {
        name: `Show applicants and hiring progress for ${job!.title}`,
      }),
    );

    expect(
      screen
        .getByRole("button", {
          name: `Show actions for ${job!.title}`,
        })
        .getAttribute("aria-hidden"),
    ).toBe("false");
  });
});
