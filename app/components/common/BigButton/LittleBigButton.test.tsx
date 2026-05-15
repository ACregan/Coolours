import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LittleBigButton from "./LittleBigButton";

// Mock classnames/bind so cx() returns a plain space-joined string of
// truthy keys — identical behaviour to the real library, zero side-effects.
vi.mock("classnames/bind", () => ({
  default: {
    bind: (styles: Record<string, string>) => (map: Record<string, boolean>) =>
      Object.entries(map)
        .filter(([, v]) => v)
        .map(([k]) => styles[k] ?? k)
        .join(" "),
  },
}));

vi.mock("./LittleBigButton.module.css", () => ({
  default: {
    button: "button",
    big: "big",
    little: "little",
    darkMode: "darkMode",
    lightMode: "lightMode",
    success: "success",
    warning: "warning",
    danger: "danger",
    buttonIconContainer: "buttonIconContainer",
    buttonLabel: "buttonLabel",
  },
}));

vi.mock("../SvgIcon/SvgIcon", () => ({
  default: ({ name, fill }: { name: string; fill: string }) => (
    <svg data-testid="svg-icon" data-name={name} data-fill={fill} />
  ),
}));

const baseProps = {
  size: "big" as const,
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

    it("always has type='button'", () => {
      render(<LittleBigButton {...baseProps} />);
      expect(screen.getByRole("button").getAttribute("type")).toBe("button");
    });

    it("renders a string label", () => {
      render(<LittleBigButton {...baseProps} label="My Label" />);
      expect(screen.getByText("My Label")).toBeDefined();
    });

    it("renders a React node as the label", () => {
      render(
        <LittleBigButton
          {...baseProps}
          label={<span data-testid="custom-label">Node Label</span>}
        />,
      );
      expect(screen.getByTestId("custom-label")).toBeDefined();
    });

    it("always applies the base 'button' class", () => {
      render(<LittleBigButton {...baseProps} />);
      expect(screen.getByRole("button").className).toContain("button");
    });
  });

  // --- svgIconName prop (now optional) ---

  describe("svgIconName prop", () => {
    it("renders the icon container and SvgIcon when svgIconName is provided", () => {
      render(
        <LittleBigButton {...baseProps} svgIconName={"arrowRight" as any} />,
      );
      expect(screen.getByTestId("svg-icon")).toBeDefined();
    });

    it("does not render the icon container when svgIconName is omitted", () => {
      render(<LittleBigButton {...baseProps} />);
      expect(screen.queryByTestId("svg-icon")).toBeNull();
    });

    it("forwards svgIconName to SvgIcon", () => {
      render(
        <LittleBigButton {...baseProps} svgIconName={"arrowRight" as any} />,
      );
      expect(screen.getByTestId("svg-icon").getAttribute("data-name")).toBe(
        "arrowRight",
      );
    });

    it("passes fill='white' to SvgIcon when darkMode is true", () => {
      render(
        <LittleBigButton
          {...baseProps}
          svgIconName={"arrowRight" as any}
          darkMode={true}
        />,
      );
      expect(screen.getByTestId("svg-icon").getAttribute("data-fill")).toBe(
        "white",
      );
    });

    it("passes fill='black' to SvgIcon when darkMode is false", () => {
      render(
        <LittleBigButton
          {...baseProps}
          svgIconName={"arrowRight" as any}
          darkMode={false}
        />,
      );
      expect(screen.getByTestId("svg-icon").getAttribute("data-fill")).toBe(
        "black",
      );
    });
  });

  // --- size prop ---

  describe("size prop", () => {
    it("applies 'big' class and not 'little' when size='big'", () => {
      render(<LittleBigButton {...baseProps} size="big" />);
      const { className } = screen.getByRole("button");
      expect(className).toContain("big");
      expect(className).not.toContain("little");
    });

    it("applies 'little' class and not 'big' when size='little'", () => {
      render(<LittleBigButton {...baseProps} size="little" />);
      const { className } = screen.getByRole("button");
      expect(className).toContain("little");
      expect(className).not.toContain("big");
    });
  });

  // --- darkMode prop ---

  describe("darkMode prop", () => {
    it("applies 'darkMode' class and not 'lightMode' when darkMode=true", () => {
      render(<LittleBigButton {...baseProps} darkMode={true} />);
      const { className } = screen.getByRole("button");
      expect(className).toContain("darkMode");
      expect(className).not.toContain("lightMode");
    });

    it("applies 'lightMode' class and not 'darkMode' when darkMode=false", () => {
      render(<LittleBigButton {...baseProps} darkMode={false} />);
      const { className } = screen.getByRole("button");
      expect(className).toContain("lightMode");
      expect(className).not.toContain("darkMode");
    });
  });

  // --- status prop ---

  describe("status prop", () => {
    it("applies no status class when status is omitted", () => {
      render(<LittleBigButton {...baseProps} />);
      const { className } = screen.getByRole("button");
      expect(className).not.toContain("success");
      expect(className).not.toContain("warning");
      expect(className).not.toContain("danger");
    });

    it("applies 'success' class when status='success'", () => {
      render(<LittleBigButton {...baseProps} status="success" />);
      const { className } = screen.getByRole("button");
      expect(className).toContain("success");
      expect(className).not.toContain("warning");
      expect(className).not.toContain("danger");
    });

    it("applies 'warning' class when status='warning'", () => {
      render(<LittleBigButton {...baseProps} status="warning" />);
      const { className } = screen.getByRole("button");
      expect(className).toContain("warning");
      expect(className).not.toContain("success");
      expect(className).not.toContain("danger");
    });

    it("applies 'danger' class when status='danger'", () => {
      render(<LittleBigButton {...baseProps} status="danger" />);
      const { className } = screen.getByRole("button");
      expect(className).toContain("danger");
      expect(className).not.toContain("success");
      expect(className).not.toContain("warning");
    });

    it("only ever applies one status class at a time", () => {
      const statuses = ["success", "warning", "danger"] as const;
      statuses.forEach((status) => {
        const { unmount } = render(
          <LittleBigButton {...baseProps} status={status} />,
        );
        const { className } = screen.getByRole("button");
        const applied = statuses.filter((s) => className.includes(s));
        expect(applied).toHaveLength(1);
        unmount();
      });
    });
  });

  // --- onClick prop (now optional) ---

  describe("onClick prop", () => {
    it("calls onClick when provided and the button is clicked", () => {
      const onClick = vi.fn();
      render(<LittleBigButton {...baseProps} onClick={onClick} />);
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not throw when onClick is omitted and the button is clicked", () => {
      render(<LittleBigButton {...baseProps} />);
      expect(() => fireEvent.click(screen.getByRole("button"))).not.toThrow();
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

    it("does not call onClick when disabled", () => {
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

    it("is not disabled when disabled=false", () => {
      render(<LittleBigButton {...baseProps} disabled={false} />);
      expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(
        false,
      );
    });

    it("is disabled when disabled=true", () => {
      render(<LittleBigButton {...baseProps} disabled={true} />);
      expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(
        true,
      );
    });

    it("sets the disabled HTML attribute on the DOM element", () => {
      render(<LittleBigButton {...baseProps} disabled={true} />);
      expect(
        screen.getByRole("button", { hidden: true }).hasAttribute("disabled"),
      ).toBe(true);
    });
  });
});
