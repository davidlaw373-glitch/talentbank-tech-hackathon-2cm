import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  getEmployerCandidateRows,
  getMatchScoreByPair,
} from "@/lib/data-helpers";
import { CandidateDiscoveryCard } from "./candidate-discovery-card";

const row = getEmployerCandidateRows(1).find(
  (candidateRow) => candidateRow.candidate.name === "Aisha Khan",
);

if (!row) {
  throw new Error("Aisha Khan fixture is required for candidate card tests.");
}

const match = getMatchScoreByPair(row.candidate.id, row.job.id);
const unverifiedRow = getEmployerCandidateRows(1).find(
  (candidateRow) => candidateRow.verification === "None",
);
const pendingRow = getEmployerCandidateRows(1).find(
  (candidateRow) => candidateRow.verification === "Pending",
);

if (!unverifiedRow || !pendingRow) {
  throw new Error(
    "Unverified and pending candidate fixtures are required for card tests.",
  );
}

describe("CandidateDiscoveryCard", () => {
  it("flips from the decision summary to AI insight and back", async () => {
    const user = userEvent.setup();
    render(
      <CandidateDiscoveryCard
        row={row}
        match={match}
        starred={false}
        onToggleStar={vi.fn()}
      />,
    );

    const showInsight = screen.getByRole("button", {
      name: "Show AI insight for Aisha Khan",
    });
    expect(showInsight.getAttribute("aria-pressed")).toBe("false");

    await user.click(showInsight);

    expect(showInsight.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen
        .getByRole("button", {
          name: "Show profile summary for Aisha Khan",
        })
        .getAttribute("tabindex"),
    ).toBe("0");

    await user.click(
      screen.getByRole("button", {
        name: "Show profile summary for Aisha Khan",
      }),
    );

    expect(showInsight.getAttribute("aria-pressed")).toBe("false");
  });

  it("handles Enter and Space directly on the face controls", () => {
    render(
      <CandidateDiscoveryCard
        row={row}
        match={match}
        starred={false}
        onToggleStar={vi.fn()}
      />,
    );

    const showInsight = screen.getByRole("button", {
      name: "Show AI insight for Aisha Khan",
    });
    fireEvent.keyDown(showInsight, { key: "Enter" });
    expect(showInsight.getAttribute("aria-pressed")).toBe("true");

    const showSummary = screen.getByRole("button", {
      name: "Show profile summary for Aisha Khan",
    });
    fireEvent.keyDown(showSummary, { key: " " });
    expect(showInsight.getAttribute("aria-pressed")).toBe("false");
  });

  it("stars without flipping", async () => {
    const user = userEvent.setup();
    const onToggleStar = vi.fn();
    render(
      <CandidateDiscoveryCard
        row={row}
        match={match}
        starred={false}
        onToggleStar={onToggleStar}
      />,
    );
    const showInsight = screen.getByRole("button", {
      name: "Show AI insight for Aisha Khan",
    });

    await user.click(
      screen.getByRole("button", {
        name: "Save Aisha Khan",
      }),
    );

    expect(onToggleStar).toHaveBeenCalledOnce();
    expect(showInsight.getAttribute("aria-pressed")).toBe("false");
  });

  it("links the candidate name and occupation to the complete profile", async () => {
    const user = userEvent.setup();
    render(
      <CandidateDiscoveryCard
        row={row}
        match={match}
        starred={false}
        onToggleStar={vi.fn()}
      />,
    );
    const showInsight = screen.getByRole("button", {
      name: "Show AI insight for Aisha Khan",
    });
    const profileLink = screen.getByRole("link", {
      name: "View Aisha Khan's full profile",
    });

    expect(profileLink.getAttribute("href")).toBe("/employer/candidates/2");
    expect(within(profileLink).getByText("Aisha Khan").className).toContain(
      "group-hover/profile:underline",
    );
    expect(
      within(profileLink).getByText("Senior Frontend Engineer").className,
    ).toContain("group-hover/profile:underline");

    profileLink.addEventListener("click", (event) => event.preventDefault());
    await user.click(profileLink);
    expect(showInsight.getAttribute("aria-pressed")).toBe("false");
  });

  it("does not show application stage labels on the candidate card", () => {
    render(
      <CandidateDiscoveryCard
        row={row}
        match={match}
        starred={false}
        onToggleStar={vi.fn()}
      />,
    );

    expect(screen.queryByText(row.app.stage)).toBeNull();
  });

  it("shows verification as an icon beside the name without status text", () => {
    const { rerender } = render(
      <CandidateDiscoveryCard
        row={row}
        match={match}
        starred={false}
        onToggleStar={vi.fn()}
      />,
    );

    const verifiedIcon = screen.getByRole("img", {
      name: "Verified verification for Aisha Khan",
    });
    expect(screen.queryByText("Verified")).toBeNull();
    const verifiedImage = verifiedIcon.querySelector("img");
    expect(decodeURIComponent(verifiedImage?.getAttribute("src") ?? "")).toContain(
      "/images/verified-badge-clean.png",
    );
    expect(verifiedImage?.getAttribute("width")).toBe("20");
    expect(verifiedImage?.getAttribute("height")).toBe("20");
    expect(verifiedImage?.className).toContain("block");

    rerender(
      <CandidateDiscoveryCard
        row={unverifiedRow}
        match={getMatchScoreByPair(
          unverifiedRow.candidate.id,
          unverifiedRow.job.id,
        )}
        starred={false}
        onToggleStar={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("img", {
        name: `None verification for ${unverifiedRow.candidate.name}`,
      }),
    ).toBeNull();

    rerender(
      <CandidateDiscoveryCard
        row={pendingRow}
        match={getMatchScoreByPair(
          pendingRow.candidate.id,
          pendingRow.job.id,
        )}
        starred={false}
        onToggleStar={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("img", {
        name: `None verification for ${pendingRow.candidate.name}`,
      }),
    ).toBeNull();
    expect(screen.queryByText("Pending")).toBeNull();
  });

  it("links the AI insight to the complete profile", async () => {
    const user = userEvent.setup();
    render(
      <CandidateDiscoveryCard
        row={row}
        match={match}
        starred={false}
        onToggleStar={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Show AI insight for Aisha Khan",
      }),
    );

    expect(
      screen
        .getByRole("link", {
          name: "View Aisha Khan's full profile",
        })
        .getAttribute("href"),
    ).toBe("/employer/candidates/2");
  });

  it("keeps AI insight available through the card without a separate button", () => {
    render(
      <CandidateDiscoveryCard
        row={row}
        match={match}
        starred={false}
        onToggleStar={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: "View AI insight for Aisha Khan",
      }),
    ).toBeNull();
    expect(
      screen.getByRole("button", {
        name: "Show AI insight for Aisha Khan",
      }),
    ).toBeTruthy();
  });

  it("expands the complete recent signal inside the card without flipping", async () => {
    const user = userEvent.setup();
    render(
      <CandidateDiscoveryCard
        row={row}
        match={match}
        starred={false}
        onToggleStar={vi.fn()}
      />,
    );
    const flip = screen.getByRole("button", {
      name: "Show AI insight for Aisha Khan",
    });
    const boundedSignal = screen.getByRole("region", {
      name: "Recent signal details for Aisha Khan",
    });
    const signalProgress = screen.getByRole("progressbar", {
      name: "Aisha Khan recent signal scroll position",
    });

    expect(boundedSignal.className).toContain("overflow-y-auto");
    expect(boundedSignal.className).toContain("[scrollbar-width:none]");
    expect(boundedSignal.className).toContain("[&::-webkit-scrollbar]:hidden");
    expect(signalProgress.className).toContain("group-hover:opacity-100");
    expect(signalProgress.className).toContain("h-2");
    expect(boundedSignal.parentElement?.className).toContain("h-36");
    expect(
      within(boundedSignal).getByText("Senior Frontend Engineer at Helio"),
    ).toBeTruthy();

    Object.defineProperties(boundedSignal, {
      scrollTop: { configurable: true, value: 50 },
      scrollHeight: { configurable: true, value: 100 },
      clientHeight: { configurable: true, value: 50 },
    });
    fireEvent.scroll(boundedSignal);
    expect(signalProgress.getAttribute("aria-valuenow")).toBe("100");

    await user.click(
      screen.getByRole("button", {
        name: "Expand recent signal for Aisha Khan",
      }),
    );

    expect(flip.getAttribute("aria-pressed")).toBe("false");
    const fullSignal = screen.getByRole("region", {
      name: "Full recent signal for Aisha Khan",
    });
    expect(
      within(fullSignal).getByText(
        "Owned the design-system rebuild used by 12M daily users across marketing, console, and docs.",
      ),
    ).toBeTruthy();

    await user.click(
      screen.getByRole("button", {
        name: "Close recent signal for Aisha Khan",
      }),
    );

    expect(
      screen.queryByRole("region", {
        name: "Full recent signal for Aisha Khan",
      }),
    ).toBeNull();
    expect(flip.getAttribute("aria-pressed")).toBe("false");
  });

  it("keeps hover lift and card rotation on separate elements", () => {
    const { container } = render(
      <CandidateDiscoveryCard
        row={row}
        match={match}
        starred={false}
        onToggleStar={vi.fn()}
      />,
    );
    const article = container.querySelector("article");
    const liftLayer = article?.firstElementChild;
    const rotationPlane = liftLayer?.firstElementChild;

    expect(liftLayer).not.toBe(rotationPlane);
    expect(liftLayer?.className).toContain("lift-on-hover");
    expect(rotationPlane?.className).toContain(
      "[transform-style:preserve-3d]",
    );
    expect(rotationPlane?.className).not.toContain("lift-on-hover");
  });

  it("keeps both card faces square at top-left, softer at top-right, and without top accent strips", () => {
    const { container } = render(
      <CandidateDiscoveryCard
        row={row}
        match={match}
        starred={false}
        onToggleStar={vi.fn()}
      />,
    );
    const faces = container.querySelectorAll("article > div > div > section");

    expect(faces).toHaveLength(2);
    for (const face of faces) {
      expect(face.className).toContain("rounded-tl-none");
      expect(face.className).toContain("rounded-tr-3xl");
      expect(
        Array.from(face.children).some(
          (child) =>
            child.className.includes("h-1.5") &&
            child.className.includes("bg-primary"),
        ),
      ).toBe(false);
    }
  });

  it("removes the visible return prompt while the back remains clickable", async () => {
    const user = userEvent.setup();
    render(
      <CandidateDiscoveryCard
        row={row}
        match={match}
        starred={false}
        onToggleStar={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Show AI insight for Aisha Khan",
      }),
    );

    expect(screen.queryByText("Return to summary")).toBeNull();
    await user.click(
      screen.getByRole("button", {
        name: "Show profile summary for Aisha Khan",
      }),
    );
    expect(
      screen
        .getByRole("button", {
          name: "Show AI insight for Aisha Khan",
        })
        .getAttribute("aria-pressed"),
    ).toBe("false");
  });

  it("uses a tinted back face and centers the profile action above the edge", () => {
    const { container } = render(
      <CandidateDiscoveryCard
        row={row}
        match={match}
        starred={false}
        onToggleStar={vi.fn()}
      />,
    );
    const faces = container.querySelectorAll("article > div > div > section");
    const backFace = faces.item(1);
    const profileLink = backFace.querySelector(
      'a[aria-label="View Aisha Khan\'s full profile"]',
    );

    expect(container.querySelector("article")?.className).toContain("h-[33rem]");
    expect(backFace.className).toContain("bg-surface-tint");
    expect(backFace.className).not.toContain("surface-card");
    expect(profileLink?.parentElement?.className).toContain("justify-center");
    expect(profileLink?.parentElement?.className).toContain("pb-5");
    expect(profileLink?.className).toContain("w-full");
  });

  it("uses a compact signal expansion control and removes screening notes", () => {
    const { container } = render(
      <CandidateDiscoveryCard
        row={row}
        match={match}
        starred={false}
        onToggleStar={vi.fn()}
      />,
    );
    const expandSignal = screen.getByRole("button", {
      name: "Expand recent signal for Aisha Khan",
    });

    expect(expandSignal.className).toContain("h-8");
    expect(expandSignal.parentElement?.className).not.toContain("pr-11");
    expect(container.querySelector('[data-slot="screening-note"]')).toBeNull();
    expect(screen.queryByText("Screening note")).toBeNull();
  });

  it("shows complete match reasons without line clamping", () => {
    const { container } = render(
      <CandidateDiscoveryCard
        row={row}
        match={match}
        starred={false}
        onToggleStar={vi.fn()}
      />,
    );
    const reasons = container.querySelectorAll('[data-slot="match-reason"]');

    expect(reasons).toHaveLength(3);
    for (const reason of reasons) {
      expect(reason.className).not.toContain("line-clamp");
    }
  });
});
