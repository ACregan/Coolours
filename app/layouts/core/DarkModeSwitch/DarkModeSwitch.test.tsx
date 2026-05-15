import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DarkModeSwitch from "./DarkModeSwitch";

vi.mock("~/components/common/SvgIcon/SvgIcon", () => ({
  default: ({ name }: { name: string }) => <svg data-testid={name} />,
  SvgImageList: { DarkMode: "DarkMode", LightMode: "LightMode" },
}));

vi.mock("./DarkModeSwitch.module.css", () => ({
  default: {
    darkModeSwitchContainer: "darkModeSwitchContainer",
    darkMode_on: "darkMode_on",
    darkMode_off: "darkMode_off",
    darkModeSwitch: "darkModeSwitch",
  },
}));

describe("DarkModeSwitch", () => {
  it("applies darkMode_on class when darkMode is true", () => {
    const { container } = render(
      <DarkModeSwitch toggleDarkMode={vi.fn()} darkMode={true} />,
    );
    expect(container.firstChild).toHaveClass("darkMode_on");
  });

  it("applies darkMode_off class when darkMode is false", () => {
    const { container } = render(
      <DarkModeSwitch toggleDarkMode={vi.fn()} darkMode={false} />,
    );
    expect(container.firstChild).toHaveClass("darkMode_off");
  });

  it("calls toggleDarkMode when clicked", () => {
    const toggleDarkMode = vi.fn();
    const { container } = render(
      <DarkModeSwitch toggleDarkMode={toggleDarkMode} darkMode={false} />,
    );
    fireEvent.click(container.firstChild!);
    expect(toggleDarkMode).toHaveBeenCalledTimes(1);
  });
});
