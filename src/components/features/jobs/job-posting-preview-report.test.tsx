import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { get as getEmployer } from "@/data/employers";
import { get as getJob } from "@/data/jobs";
import { JobPostingPreviewReport } from "./job-posting-preview-report";

const job = getJob(7);

if (!job) {
  throw new Error("Job 7 fixture is required for preview report tests.");
}

describe("JobPostingPreviewReport", () => {
  it("shows the complete candidate-facing job requirements", () => {
    const employer = getEmployer(job.employerId);
    const { container } = render(
      <JobPostingPreviewReport
        job={job}
        employer={employer}
      />,
    );

    for (const heading of [
      "Description",
      "Responsibilities",
      "Requirements and qualifications",
      "Job details",
      "Skills",
    ]) {
      expect(
        screen.getByRole("heading", { name: heading }),
      ).toBeTruthy();
    }

    expect(screen.getByText(job.description)).toBeTruthy();
    expect(screen.getByText(job.responsibilities[0])).toBeTruthy();
    expect(screen.getByText(job.requirements[0])).toBeTruthy();
    expect(screen.getByText(job.mustHave[0])).toBeTruthy();
    expect(screen.getByText(job.mustHave[0]).parentElement?.style.display).toBe(
      "grid",
    );
    expect(
      screen.getByText(job.mustHave[0]).parentElement?.style.gridTemplateColumns,
    ).toBe("0.5rem minmax(0, 1fr)");
    expect(screen.getByText("careers@northstarlabs.com")).toBeTruthy();
    expect(screen.getByText("+65 6123 4567")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Company and application contact" })).toBeNull();
    expect(screen.getByText("Employment type:").parentElement?.textContent).toBe(
      "Employment type: Full-time",
    );
    expect(screen.getByText("Company:").parentElement?.textContent).toBe(
      "Company:Northstar Labs",
    );
    expect(screen.queryByText("AI Match")).toBeNull();
    expect(screen.queryByText("Live")).toBeNull();
    expect(screen.queryByText(/Date posted:/)).toBeNull();
    expect(
      screen.queryByText(
        `${job.department} · ${job.location} · ${job.workMode} · ${job.employmentType} · ${job.workMode}`,
      ),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Apply now" })).toBeNull();
    expect(container.querySelector("svg")).toBeNull();
  });
});
