import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Tooltip, { TooltipBubble } from "./Tooltip";

vi.mock("./Tooltip.module.css", () => ({
  default: {
    anchoredElement: "anchoredElement",
    tooltipElement: "tooltipElement",
    tooltipBubble: "tooltipBubble",
    top: "top",
    left: "left",
    bottom: "bottom",
    right: "right",
    topRight: "topRight",
    topLeft: "topLeft",
    bottomLeft: "bottomLeft",
    bottomRight: "bottomRight",
  },
}));

describe("Tooltip", () => {
  it("clones child elements with anchorName style and anchoredElement class", () => {
    render(
      <Tooltip
        anchorName="Test Anchor"
        anchorPosition="top"
        anchorContent={<span>Anchor</span>}
      >
        <button
          data-testid="anchor-button"
          style={{ color: "red" }}
          className="base-class"
        >
          Child
        </button>
      </Tooltip>,
    );

    const button = screen.getByTestId("anchor-button");
    expect(button).toHaveClass("base-class", "anchoredElement");
    expect(button.style.anchorName).toBe("--test-anchor");
  });

  it("renders tooltip element with sanitized positionAnchor and positionArea values", () => {
    render(
      <Tooltip
        anchorName="My Tooltip"
        anchorPosition="bottom right"
        anchorContent={<span>Tooltip content</span>}
      >
        <span>Child</span>
      </Tooltip>,
    );

    const tooltip = screen.getByText("Tooltip content").parentElement;
    expect(tooltip).toHaveClass("tooltipElement");
    expect(tooltip).toHaveStyle({
      positionAnchor: "--my-tooltip",
      positionArea: "bottom right",
      zIndex: "500",
    });
  });

  it("uses the provided zIndex prop on the tooltip element", () => {
    render(
      <Tooltip
        anchorName="Another Anchor"
        anchorPosition="left"
        zIndex="1000"
        anchorContent={<span>Tooltip content</span>}
      >
        <span>Child</span>
      </Tooltip>,
    );

    const tooltip = screen.getByText("Tooltip content").parentElement;
    expect(tooltip).toHaveStyle({ zIndex: "1000" });
  });

  it("renders correctly when children are plain text instead of React elements", () => {
    render(
      <Tooltip
        anchorName="Text Anchor"
        anchorPosition="right"
        anchorContent={<span>Text anchor content</span>}
      >
        Plain text child
      </Tooltip>,
    );

    expect(screen.getByText("Text anchor content")).toBeInTheDocument();
  });
});

describe("TooltipBubble", () => {
  it("applies the top pointer class when pointerLocation is top", () => {
    const { container } = render(
      <TooltipBubble pointerLocation="top">Bubble</TooltipBubble>,
    );

    expect(container.firstChild).toHaveClass("tooltipBubble", "top");
  });

  it("applies the topRight pointer class when pointerLocation is right top", () => {
    const { container } = render(
      <TooltipBubble pointerLocation="right top">Bubble</TooltipBubble>,
    );

    expect(container.firstChild).toHaveClass("tooltipBubble", "topRight");
  });

  it("applies the bottomLeft pointer class when pointerLocation is left bottom", () => {
    const { container } = render(
      <TooltipBubble pointerLocation="left bottom">Bubble</TooltipBubble>,
    );

    expect(container.firstChild).toHaveClass("tooltipBubble", "bottomLeft");
  });
});
