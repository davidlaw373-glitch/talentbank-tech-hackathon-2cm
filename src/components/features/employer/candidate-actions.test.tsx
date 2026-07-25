import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { getEmployerCandidateRows } from "@/lib/data-helpers";
import { CandidatePipelineProvider } from "@/components/features/employer/candidate-pipeline-provider";
import EmployerCandidatesPage from "@/app/employer/candidates/page";
import { CandidateActions, CompleteReviewButton } from "./candidate-actions";

vi.mock("@/components/common/toast", () => ({
  useToast: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/ui/confirm-dialog", () => ({
  ConfirmDialog: ({
    open,
    title,
    confirmLabel,
    noteLabel,
    noteValue,
    onNoteChange,
    onOpenChange,
    onConfirm,
  }: {
    open: boolean;
    title: string;
    confirmLabel: string;
    noteLabel?: string;
    noteValue?: string;
    onNoteChange?: (value: string) => void;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
  }) =>
    open ? (
      <div role="alertdialog" aria-label={title}>
        {noteLabel ? (
          <label>
            {noteLabel}
            <textarea
              value={noteValue}
              onChange={(event) => onNoteChange?.(event.target.value)}
            />
          </label>
        ) : null}
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onOpenChange(false);
          }}
        >
          {confirmLabel}
        </button>
      </div>
    ) : null,
}));

const appliedRow = getEmployerCandidateRows(1).find(
  (row) => row.candidate.name === "Rafael Diaz",
);

if (!appliedRow) {
  throw new Error("Rafael Diaz fixture is required for candidate action tests.");
}

describe("Candidate review actions", () => {
  it("requires confirmation before completing review and updates the pipeline", async () => {
    const user = userEvent.setup();

    render(
      <CandidatePipelineProvider>
        <CompleteReviewButton
          applicationId={appliedRow.app.id}
          candidateName={appliedRow.candidate.name}
          appliedFor={appliedRow.job.title}
          initialStage={appliedRow.app.stage}
          initialRejected={appliedRow.app.rejected}
        />
        <EmployerCandidatesPage />
      </CandidatePipelineProvider>,
    );

    const resultsBefore = screen.getByRole("list", {
      name: "Candidate results",
    });
    expect(within(resultsBefore).getByText("Rafael Diaz")).toBeTruthy();

    await user.click(
      screen.getByRole("button", {
        name: "Complete review and move to Screening",
      }),
    );
    expect(
      screen.getByRole("alertdialog", {
        name: "Complete Rafael Diaz's review?",
      }),
    ).toBeTruthy();
    expect(within(resultsBefore).getByText("Rafael Diaz")).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: "Move to Screening" }),
    );

    expect(
      within(
        screen.getByRole("list", { name: "Candidate results" }),
      ).queryByText("Rafael Diaz"),
    ).toBeNull();

    await user.click(
      screen.getByRole("button", { name: "View candidate pipeline" }),
    );
    await user.click(
      within(
        screen.getByRole("dialog", { name: "Candidate pipeline" }),
      ).getByRole("button", { name: "Screening queue" }),
    );

    expect(
      within(
        screen.getByRole("list", { name: "Candidate results" }),
      ).getByText("Rafael Diaz"),
    ).toBeTruthy();
  });

  it("confirms interview, offer, message, and rejection actions", async () => {
    const user = userEvent.setup();

    render(
      <CandidatePipelineProvider>
        <CandidateActions
          applicationId={appliedRow.app.id}
          candidateName={appliedRow.candidate.name}
          appliedFor={appliedRow.job.title}
          initialStage={appliedRow.app.stage}
          initialRejected={appliedRow.app.rejected}
        />
      </CandidatePipelineProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Interview" }));
    expect(
      screen.getByRole("alertdialog", {
        name: "Move Rafael Diaz to Interview?",
      }),
    ).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: "Confirm interview" }),
    );

    await user.click(screen.getByRole("button", { name: "Send offer" }));
    expect(
      screen.getByRole("alertdialog", {
        name: "Move Rafael Diaz to Offer?",
      }),
    ).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: "Confirm offer" }),
    );

    await user.click(screen.getByRole("button", { name: "Message" }));
    expect(
      screen.getByRole("alertdialog", { name: "Message Rafael Diaz?" }),
    ).toBeTruthy();
    await user.type(screen.getByLabelText("Message"), "Can we talk tomorrow?");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await user.click(screen.getByRole("button", { name: "Reject" }));
    expect(
      screen.getByRole("alertdialog", { name: "Reject Rafael Diaz?" }),
    ).toBeTruthy();
    expect(
      screen.getByLabelText("Reason for rejection (optional)"),
    ).toBeTruthy();
    await user.type(
      screen.getByLabelText("Reason for rejection (optional)"),
      "Role scope changed",
    );
    await user.click(
      screen.getByRole("button", { name: "Confirm rejection" }),
    );

    expect(screen.getByText(/current stage: Rejected/)).toBeTruthy();
  });
});
