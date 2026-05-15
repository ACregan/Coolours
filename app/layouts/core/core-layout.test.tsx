import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CoreLayout from "./core-layout";

vi.mock("~/components/common/SvgIcon/SvgIcon", () => ({
  default: ({ name }: { name: string }) => <svg data-testid={name} />,
  SvgImageList: { CooloursLogo_v2: "CooloursLogo_v2" },
}));

vi.mock("./core-layout.module.css", () => ({
  default: {
    coreLayout_container: "coreLayout_container",
    darkMode: "darkMode",
    lightMode: "lightMode",
    darkModeBackgroundContainer: "darkModeBackgroundContainer",
    headerButtonContainer: "headerButtonContainer",
  },
}));

vi.mock("./DarkModeSwitch/DarkModeSwitch", () => ({
  default: ({
    toggleDarkMode,
    darkMode,
  }: {
    toggleDarkMode: () => void;
    darkMode: boolean;
  }) => (
    <button
      data-testid="dark-mode-switch"
      data-darkmode={darkMode}
      onClick={toggleDarkMode}
    >
      DarkModeSwitch
    </button>
  ),
}));

vi.mock("./TopMenuButton/TopMenuButton", () => ({
  default: () => <button data-testid="top-menu-button">TopMenuButton</button>,
}));

vi.mock("react-router", () => ({
  Outlet: () => <div data-testid="outlet" />,
}));

vi.mock("~/hooks/useGoogleAnalytics", () => ({
  trackClientAnalyticsEvent: vi.fn(),
}));

const mockToggleDarkMode = vi.fn();
vi.mock("~/components/common/DarkMode/DarkModeContext", () => ({
  useTheme: vi.fn(),
}));

import { useTheme } from "~/components/common/DarkMode/DarkModeContext";
import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";

describe("CoreLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("applies darkMode class when darkMode is true", () => {
    vi.mocked(useTheme).mockReturnValue({
      darkMode: true,
      toggleDarkMode: mockToggleDarkMode,
    });

    const { container } = render(<CoreLayout />);
    expect(container.firstChild).toHaveClass("darkMode");
  });

  it("applies lightMode class when darkMode is false", () => {
    vi.mocked(useTheme).mockReturnValue({
      darkMode: false,
      toggleDarkMode: mockToggleDarkMode,
    });

    const { container } = render(<CoreLayout />);
    expect(container.firstChild).toHaveClass("lightMode");
  });

  it("renders child components", () => {
    vi.mocked(useTheme).mockReturnValue({
      darkMode: false,
      toggleDarkMode: mockToggleDarkMode,
    });

    render(<CoreLayout />);
    expect(screen.getByTestId("top-menu-button")).toBeInTheDocument();
    expect(screen.getByTestId("dark-mode-switch")).toBeInTheDocument();
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });

  it("calls toggleDarkMode and tracks event with dark mode off when darkMode is true", () => {
    vi.mocked(useTheme).mockReturnValue({
      darkMode: true,
      toggleDarkMode: mockToggleDarkMode,
    });

    render(<CoreLayout />);
    fireEvent.click(screen.getByTestId("dark-mode-switch"));

    expect(mockToggleDarkMode).toHaveBeenCalledTimes(1);
    expect(trackClientAnalyticsEvent).toHaveBeenCalledWith(
      "header_toggle_dark_mode_off",
    );
  });

  it("calls toggleDarkMode and tracks event with dark mode on when darkMode is false", () => {
    vi.mocked(useTheme).mockReturnValue({
      darkMode: false,
      toggleDarkMode: mockToggleDarkMode,
    });

    render(<CoreLayout />);
    fireEvent.click(screen.getByTestId("dark-mode-switch"));

    expect(mockToggleDarkMode).toHaveBeenCalledTimes(1);
    expect(trackClientAnalyticsEvent).toHaveBeenCalledWith(
      "header_toggle_dark_mode_on",
    );
  });
});
