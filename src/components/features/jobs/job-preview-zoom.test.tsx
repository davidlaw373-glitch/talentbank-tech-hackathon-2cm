import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobPreviewZoom } from "./job-preview-zoom";

describe("JobPreviewZoom", () => {
  it("zooms the report with Ctrl plus wheel without changing normal scrolling", () => {
    render(
      <JobPreviewZoom>
        <div>Formal job report</div>
      </JobPreviewZoom>,
    );

    const viewport = screen.getByTestId("job-preview-zoom");
    const content = screen.getByText("Formal job report").parentElement;

    fireEvent.wheel(viewport, { ctrlKey: false, deltaY: 100 });
    expect(content?.style.transform).toContain("scale(1)");

    fireEvent.wheel(viewport, { ctrlKey: true, deltaY: 100 });
    expect(content?.style.transform).toContain("scale(0.9)");

    fireEvent.wheel(viewport, { ctrlKey: true, deltaY: -100 });
    expect(content?.style.transform).toContain("scale(1)");
  });
});
