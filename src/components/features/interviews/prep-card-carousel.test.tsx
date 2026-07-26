import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { PrepCardCarousel } from "./prep-card-carousel";

const prepInterview = {
  id: "iv-1",
  company: "Northstar Labs",
  role: "Senior Frontend Engineer",
  round: "Technical round",
};

const mockQuestions = [
  "Walk me through how you would split a complex product surface into reusable components.",
  "How do you decide when to lift state up versus introduce a new context?",
];
const companyNotes = [
  "Series B SaaS serving community lenders across Southeast Asia.",
  "Engineering culture emphasises accessibility audits and shared component libraries.",
];
const scorecard = ["Technical depth & problem solving", "Communication and signal clarity"];

function renderCarousel(onPractice = vi.fn()) {
  render(
    <PrepCardCarousel
      prepInterview={prepInterview}
      mockQuestions={mockQuestions}
      companyNotes={companyNotes}
      scorecard={scorecard}
      onPractice={onPractice}
    />,
  );
  return onPractice;
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", {
    configurable: true,
    value: vi.fn(() => true),
  });
});

describe("PrepCardCarousel", () => {
  it("navigates between prep cards with controls and keyboard arrows", async () => {
    const user = userEvent.setup();
    renderCarousel();

    expect(screen.getByText("Card 1 of 3")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Next prep card" }));
    expect(screen.getByText("Card 2 of 3")).toBeTruthy();

    const track = screen.getByRole("region", {
      name: "Use the arrow keys or swipe to choose a prep card",
    });
    track.focus();
    fireEvent.keyDown(track, { key: "ArrowLeft" });
    expect(screen.getByText("Card 1 of 3")).toBeTruthy();
  });

  it("expands the chosen card and keeps the detail actions available", async () => {
    const user = userEvent.setup();
    const onPractice = renderCarousel();

    await user.click(screen.getByRole("button", { name: "Expand Mock questions" }));
    expect(
      screen.getByText(mockQuestions[0]),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Collapse Mock questions" }).getAttribute(
        "aria-expanded",
      ),
    ).toBe("true");

    await user.click(screen.getAllByRole("button", { name: "Practice" })[0]);
    expect(onPractice).toHaveBeenCalledWith(mockQuestions[0]);

    await user.click(
      screen.getByRole("button", { name: "Collapse Mock questions" }),
    );
    expect(
      screen.queryByText(mockQuestions[0]),
    ).toBeNull();
  });

  it("moves to the next card on a horizontal swipe without expanding it", () => {
    renderCarousel();
    const track = screen.getAllByRole("list")[0];

    fireEvent.pointerDown(track, {
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
      clientX: 240,
      clientY: 120,
      timeStamp: 10,
    });
    fireEvent.pointerMove(track, {
      pointerId: 1,
      isPrimary: true,
      clientX: 150,
      clientY: 122,
      timeStamp: 40,
    });
    fireEvent.pointerUp(track, {
      pointerId: 1,
      isPrimary: true,
      clientX: 150,
      clientY: 122,
      timeStamp: 80,
    });

    expect(screen.getByText("Card 2 of 3")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Expand Company research" }),
    ).toBeTruthy();
  });
});
