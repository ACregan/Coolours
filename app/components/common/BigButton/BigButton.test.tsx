import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BigButton from "./BigButton";
import { SvgImageList } from "../SvgIcon/SvgIcon";

vi.mock("../SvgIcon/SvgIcon", () => ({
  default: ({ name, fill }: { name: string; fill: string }) => (
    <svg data-testid="svg-icon" data-name={name} data-fill={fill} />
  ),
  SvgImageList: {},
}));

vi.mock("./BigButton.module.css", () => ({
  default: {
    bigButton: "bigButton",
    bigButtonIcon: "bigButtonIcon",
    bigButtonLabel: "bigButtonLabel",
  },
}));

describe("BigButton", () => {
  const mockOnClick = vi.fn();
  const defaultProps = {
    onClick: mockOnClick,
    svgIconName: "someIcon" as keyof typeof SvgImageList,
    label: "Click Me",
    darkMode: false,
  };

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe("Rendering", () => {
    it("renders a button element", () => {
      render(<BigButton {...defaultProps} />);
      expect(screen.getByRole("button")).toBeDefined();
    });

    it("renders the label text", () => {
      render(<BigButton {...defaultProps} />);
      expect(screen.getByText("Click Me")).toBeDefined();
    });

    it("renders a React node as label", () => {
      render(
        <BigButton
          {...defaultProps}
          label={<span data-testid="node-label">Node Label</span>}
        />,
      );
      expect(screen.getByTestId("node-label")).toBeDefined();
    });

    it("renders the SvgIcon component", () => {
      render(<BigButton {...defaultProps} />);
      expect(screen.getByTestId("svg-icon")).toBeDefined();
    });

    it("passes the correct icon name to SvgIcon", () => {
      render(<BigButton {...defaultProps} />);
      expect(screen.getByTestId("svg-icon").getAttribute("data-name")).toBe(
        "someIcon",
      );
    });
  });

  describe("Dark mode", () => {
    it("passes white fill to SvgIcon when darkMode is true", () => {
      render(<BigButton {...defaultProps} darkMode={true} />);
      expect(screen.getByTestId("svg-icon").getAttribute("data-fill")).toBe(
        "white",
      );
    });

    it("passes black fill to SvgIcon when darkMode is false", () => {
      render(<BigButton {...defaultProps} darkMode={false} />);
      expect(screen.getByTestId("svg-icon").getAttribute("data-fill")).toBe(
        "black",
      );
    });
  });

  describe("Interaction", () => {
    it("calls onClick when the button is clicked", () => {
      render(<BigButton {...defaultProps} />);
      fireEvent.click(screen.getByRole("button"));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick before interaction", () => {
      render(<BigButton {...defaultProps} />);
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("calls onClick multiple times on multiple clicks", () => {
      render(<BigButton {...defaultProps} />);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe("CSS classes", () => {
    it("applies bigButton class to the button", () => {
      render(<BigButton {...defaultProps} />);
      expect(screen.getByRole("button").classList.contains("bigButton")).toBe(
        true,
      );
    });

    it("applies bigButtonIcon class to the icon wrapper", () => {
      render(<BigButton {...defaultProps} />);
      const icon = screen.getByTestId("svg-icon").parentElement;
      expect(icon?.classList.contains("bigButtonIcon")).toBe(true);
    });

    it("applies bigButtonLabel class to the label wrapper", () => {
      render(<BigButton {...defaultProps} />);
      const labelSpan = screen
        .getByRole("button")
        .querySelector(".bigButtonLabel");
      expect(labelSpan).toBeDefined();
      expect(labelSpan?.textContent).toBe("Click Me");
    });
  });
});
