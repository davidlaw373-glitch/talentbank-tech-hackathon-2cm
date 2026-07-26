import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/common/toast";
import { get as getJob } from "@/data/jobs";
import { getEmployerCandidateRows } from "@/lib/data-helpers";
import { JobDetailView } from "./job-detail-view";

const job = getJob(7);

if (!job) {
  throw new Error("Job 7 fixture is required for job detail tests.");
}

const applicants = getEmployerCandidateRows(1)
  .filter((row) => row.job.id === job.id)
  .sort((a, b) => b.matchScore - a.matchScore);

describe("JobDetailView", () => {
  it("returns to the previous page from the back control", async () => {
    const user = userEvent.setup();
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});

    render(
      <ToastProvider>
        <JobDetailView job={job} applicants={applicants} />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Back to jobs" }));
    expect(back).toHaveBeenCalledOnce();
    back.mockRestore();
  });

  it("places vertical job actions below the details with primary edit controls", () => {
    render(
      <ToastProvider>
        <JobDetailView job={job} applicants={applicants} />
      </ToastProvider>,
    );

    const actions = screen.getByLabelText("Job actions");
    expect(actions.className).toContain("flex-col");

    const edit = screen.getByRole("button", { name: "Edit" });
    const pause = screen.getByRole("button", { name: "Pause job" });
    const close = screen.getByRole("button", { name: "Close" });

    expect(edit.className).toContain("bg-primary");
    expect(pause.className).toContain("bg-primary");
    expect(close.className).toContain("bg-destructive");
  });

  it("pages through applicants with previous and next controls", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <JobDetailView job={job} applicants={applicants} />
      </ToastProvider>,
    );

    const track = screen.getByRole("list", {
      name: "Applicants for Senior Frontend Engineer",
    });
    expect(track.children).toHaveLength(4);
    expect(track.className).toContain("overflow-hidden");
    expect(
      screen.getByRole("progressbar", {
        name: "Applicant carousel position",
      }).className,
    ).toContain("carouselProgress");
    expect(screen.getByText("Aisha Khan")).toBeTruthy();
    expect(screen.queryByText("Rafael Diaz")).toBeNull();

    const previous = screen.getByRole("button", {
      name: "Previous candidates",
    });
    const next = screen.getByRole("button", { name: "Next candidates" });

    expect((previous as HTMLButtonElement).disabled).toBe(true);
    expect((next as HTMLButtonElement).disabled).toBe(false);
    expect(previous.className).toContain("bg-surface-1");
    expect(next.className).toContain("bg-primary");

    await user.click(next);
    expect(screen.queryByText("Aisha Khan")).toBeNull();
    expect(screen.getByText("Rafael Diaz")).toBeTruthy();
    expect((next as HTMLButtonElement).disabled).toBe(true);
    expect((previous as HTMLButtonElement).disabled).toBe(false);
    expect(previous.className).toContain("bg-primary");
    expect(next.className).toContain("bg-surface-1");

    await user.click(previous);
    expect(screen.getByText("Aisha Khan")).toBeTruthy();
    expect(screen.queryByText("Rafael Diaz")).toBeNull();
    expect((previous as HTMLButtonElement).disabled).toBe(true);

    expect(
      screen.queryByRole("button", {
        name: "Show AI insight for Aisha Khan",
      }),
    ).toBeNull();
    expect(
      screen.getByRole("link", {
        name: "View Aisha Khan's full profile",
      }),
    ).toBeTruthy();
    expect(screen.queryByText("View profile")).toBeNull();
    expect(screen.queryByText("AI Match")).toBeNull();
    expect(
      screen.queryByRole("progressbar", { name: "Aisha Khan AI Match" }),
    ).toBeNull();
    expect(screen.getByText("Aisha Khan").closest("a")).toBeNull();
    expect(screen.queryByRole("button", { name: "Copy link" })).toBeNull();
  });

  it("opens the complete candidate job page inside the employer page", async () => {
    const user = userEvent.setup();
    const originalShowModal = HTMLDialogElement.prototype.showModal;
    const originalClose = HTMLDialogElement.prototype.close;

    Object.defineProperties(HTMLDialogElement.prototype, {
      showModal: {
        configurable: true,
        value(this: HTMLDialogElement) {
          this.setAttribute("open", "");
        },
      },
      close: {
        configurable: true,
        value(this: HTMLDialogElement) {
          this.removeAttribute("open");
          this.dispatchEvent(new Event("close"));
        },
      },
    });

    try {
      render(
        <ToastProvider>
          <JobDetailView job={job} applicants={applicants} />
        </ToastProvider>,
      );

      const preview = screen.getByRole("button", { name: "Preview" });
      expect(preview.getAttribute("href")).toBeNull();

      await user.click(preview);

      const previewDialog = screen.getByRole("dialog", {
          name: "Candidate preview for Senior Frontend Engineer",
      });
      expect(previewDialog).toBeTruthy();
      expect(previewDialog.style.position).toBe("fixed");
      expect(previewDialog.style.inset).toBe("0px");
      expect(previewDialog.style.width).toBe("100vw");
      expect(previewDialog.style.height).toBe("100dvh");
      expect(previewDialog.style.maxWidth).toBe("none");
      expect(
        (previewDialog.firstElementChild as HTMLElement | null)?.style.maxWidth,
      ).toBe("90rem");
      expect(
        screen
          .getByTitle("Candidate job page for Senior Frontend Engineer")
          .getAttribute("src"),
      ).toBe("/job-preview/7");
      expect(screen.queryByText("Candidate view preview")).toBeNull();
    } finally {
      Object.defineProperties(HTMLDialogElement.prototype, {
        showModal: { configurable: true, value: originalShowModal },
        close: { configurable: true, value: originalClose },
      });
    }
  });
});
