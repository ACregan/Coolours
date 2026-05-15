import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LittleBigButton from "./LittleBigButton";

vi.mock("./LittleBigButton.module.css", () => ({
  default: {
    button: "button",
    big: "big",
    little: "little",
    darkMode: "darkMode",
    lightMode: "lightMode",
    buttonIconContainer: "buttonIconContainer",
    buttonLabel: "buttonLabel",
  },
}));

vi.mock("../SvgIcon/SvgIcon", () => ({
  default: ({ name, fill }: { name: string; fill: string }) => (
    <svg data-testid="svg-icon" data-name={name} data-fill={fill} />
  ),
  SvgImageList: {},
}));

const baseProps = {
  size: "big" as const,
  onClick: vi.fn(),
  svgIconName: "someIcon" as any,
  label: "Click Me",
  darkMode: false,
};

describe("LittleBigButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Rendering ---

  describe("Rendering", () => {
    it("renders without crashing", () => {
      render(<LittleBigButton {...baseProps} />);
      expect(screen.getByRole("button")).toBeDefined();
    });

    it("renders with type='button' to prevent accidental form submissions", () => {
      render(<LittleBigButton {...baseProps} />);
      expect(screen.getByRole("button").getAttribute("type")).toBe("button");
    });

    it("renders a string label", () => {
      render(<LittleBigButton {...baseProps} label="My Label" />);
      expect(screen.getByText("My Label")).toBeDefined();
    });

    it("renders a React node as the label", () => {
      const label = <span data-testid="custom-label">Custom Node</span>;
      render(<LittleBigButton {...baseProps} label={label} />);
      expect(screen.getByTestId("custom-label")).toBeDefined();
    });

    it("renders the SvgIcon", () => {
      render(<LittleBigButton {...baseProps} />);
      expect(screen.getByTestId("svg-icon")).toBeDefined();
    });

    it("always applies the base 'button' class", () => {
      render(<LittleBigButton {...baseProps} />);
      expect(screen.getByRole("button").className).toContain("button");
    });
  });

  // --- Size prop ---

  describe("size prop", () => {
    it("applies the 'big' class when size is 'big'", () => {
      render(<LittleBigButton {...baseProps} size="big" />);
      const button = screen.getByRole("button");
      expect(button.className).toContain("big");
      expect(button.className).not.toContain("little");
    });

    it("applies the 'little' class when size is 'little'", () => {
      render(<LittleBigButton {...baseProps} size="little" />);
      const button = screen.getByRole("button");
      expect(button.className).toContain("little");
      expect(button.className).not.toContain("big");
    });
  });

  // --- Dark mode prop ---

  describe("darkMode prop", () => {
    it("applies 'darkMode' class when darkMode is true", () => {
      render(<LittleBigButton {...baseProps} darkMode={true} />);
      const button = screen.getByRole("button");
      expect(button.className).toContain("darkMode");
      expect(button.className).not.toContain("lightMode");
    });

    it("applies 'lightMode' class when darkMode is false", () => {
      render(<LittleBigButton {...baseProps} darkMode={false} />);
      const button = screen.getByRole("button");
      expect(button.className).toContain("lightMode");
      expect(button.className).not.toContain("darkMode");
    });

    it("passes fill='white' to SvgIcon when darkMode is true", () => {
      render(<LittleBigButton {...baseProps} darkMode={true} />);
      expect(screen.getByTestId("svg-icon").getAttribute("data-fill")).toBe(
        "white",
      );
    });

    it("passes fill='black' to SvgIcon when darkMode is false", () => {
      render(<LittleBigButton {...baseProps} darkMode={false} />);
      expect(screen.getByTestId("svg-icon").getAttribute("data-fill")).toBe(
        "black",
      );
    });
  });

  // --- svgIconName prop ---

  describe("svgIconName prop", () => {
    it("forwards svgIconName to SvgIcon", () => {
      render(
        <LittleBigButton {...baseProps} svgIconName={"arrowRight" as any} />,
      );
      expect(screen.getByTestId("svg-icon").getAttribute("data-name")).toBe(
        "arrowRight",
      );
    });
  });

  // --- onClick prop ---

  describe("onClick prop", () => {
    it("calls onClick when the button is clicked", () => {
      const onClick = vi.fn();
      render(<LittleBigButton {...baseProps} onClick={onClick} />);
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick before any interaction", () => {
      const onClick = vi.fn();
      render(<LittleBigButton {...baseProps} onClick={onClick} />);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("accumulates calls on repeated clicks", () => {
      const onClick = vi.fn();
      render(<LittleBigButton {...baseProps} onClick={onClick} />);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(3);
    });

    it("does not call onClick when the button is disabled", () => {
      const onClick = vi.fn();
      render(
        <LittleBigButton {...baseProps} onClick={onClick} disabled={true} />,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  // --- disabled prop ---

  describe("disabled prop", () => {
    it("is not disabled when disabled is omitted", () => {
      render(<LittleBigButton {...baseProps} />);
      expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(
        false,
      );
    });

    it("is not disabled when disabled is false", () => {
      render(<LittleBigButton {...baseProps} disabled={false} />);
      expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(
        false,
      );
    });

    it("is disabled when disabled is true", () => {
      render(<LittleBigButton {...baseProps} disabled={true} />);
      expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(
        true,
      );
    });

    it("sets the disabled attribute on the DOM element", () => {
      render(<LittleBigButton {...baseProps} disabled={true} />);
      expect(
        screen.getByRole("button", { hidden: true }).hasAttribute("disabled"),
      ).toBe(true);
    });
  });
});
