import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ThemeProvider, useTheme, ThemeContext } from "./DarkModeContext";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock matchMedia
const matchMediaMock = vi.fn();
Object.defineProperty(window, "matchMedia", {
  value: matchMediaMock,
});

// Test component that uses the hook
const TestComponent: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  return (
    <div>
      <span data-testid="dark-mode">{darkMode ? "dark" : "light"}</span>
      <button data-testid="toggle" onClick={toggleDarkMode}>
        Toggle
      </button>
    </div>
  );
};

describe("DarkModeContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    matchMediaMock.mockReturnValue({ matches: false });
  });

  describe("useTheme hook", () => {
    it("throws error when used outside ThemeProvider", () => {
      expect(() => render(<TestComponent />)).toThrow(
        "useTheme must be used within a ThemeProvider",
      );
    });

    it("returns theme context when used inside ThemeProvider", async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("dark-mode")).toHaveTextContent("light");
      });
    });
  });

  describe("ThemeProvider", () => {
    it("initializes with prefers-color-scheme: dark when no localStorage value", async () => {
      matchMediaMock.mockReturnValue({ matches: true });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("dark-mode")).toHaveTextContent("dark");
      });
    });

    it("initializes with localStorage value over prefers-color-scheme", async () => {
      localStorageMock.getItem.mockReturnValue("true");
      matchMediaMock.mockReturnValue({ matches: false });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("dark-mode")).toHaveTextContent("dark");
      });
    });

    it("initializes with light mode when localStorage is false", async () => {
      localStorageMock.getItem.mockReturnValue("false");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("dark-mode")).toHaveTextContent("light");
      });
    });

    it("toggles dark mode and updates localStorage", async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("dark-mode")).toHaveTextContent("light");
      });

      fireEvent.click(screen.getByTestId("toggle"));

      await waitFor(() => {
        expect(screen.getByTestId("dark-mode")).toHaveTextContent("dark");
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "dark-mode",
        "true",
      );
    });

    it("renders children after localStorage check is complete", () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      // useLayoutEffect runs synchronously in tests, so children should be rendered
      expect(screen.getByTestId("dark-mode")).toBeInTheDocument();
    });

    it("updates localStorage when darkMode changes", async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "dark-mode",
          "false",
        );
      });

      fireEvent.click(screen.getByTestId("toggle"));

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "dark-mode",
          "true",
        );
      });
    });
  });

  describe("ThemeContext", () => {
    it("provides correct context value", async () => {
      let contextValue: any = null;

      const ContextConsumer = () => {
        contextValue = useTheme();
        return <div>Consumer</div>;
      };

      render(
        <ThemeProvider>
          <ContextConsumer />
        </ThemeProvider>,
      );

      await waitFor(() => {
        expect(contextValue).toEqual({
          darkMode: false,
          toggleDarkMode: expect.any(Function),
        });
      });
    });
  });
});
