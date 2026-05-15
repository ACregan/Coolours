import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ToastProvider, useToast } from "./ToastProvider";

vi.mock("./ToastProvider.module.css", () => ({
  default: {
    toastContainer: "toastContainer",
    toast: "toast",
  },
}));

const TestConsumer = () => {
  const { addToast } = useToast();

  return (
    <button data-testid="add-toast" onClick={() => addToast("hello world")}>
      Add toast
    </button>
  );
};

describe("ToastProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("throws when useToast is used outside ToastProvider", () => {
    const OutsideConsumer = () => {
      useToast();
      return null;
    };

    expect(() => render(<OutsideConsumer />)).toThrow(
      "useToast must be used within a ToastProvider",
    );
  });

  it("renders children inside the provider", () => {
    render(
      <ToastProvider>
        <div data-testid="child">child content</div>
      </ToastProvider>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("adds a toast when addToast is called", () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByTestId("add-toast"));

    expect(screen.getByText("hello world")).toBeInTheDocument();
  });

  it("removes the toast after 3 seconds", () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByTestId("add-toast"));
    expect(screen.getByText("hello world")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText("hello world")).not.toBeInTheDocument();
  });

  it("renders multiple toasts independently", async () => {
    const MultiToastConsumer = () => {
      const { addToast } = useToast();
      return (
        <>
          <button data-testid="add-toast-1" onClick={() => addToast("toast 1")}>
            Add 1
          </button>
          <button data-testid="add-toast-2" onClick={() => addToast("toast 2")}>
            Add 2
          </button>
        </>
      );
    };

    render(
      <ToastProvider>
        <MultiToastConsumer />
      </ToastProvider>,
    );

    vi.setSystemTime(1);
    fireEvent.click(screen.getByTestId("add-toast-1"));
    vi.setSystemTime(2);
    fireEvent.click(screen.getByTestId("add-toast-2"));

    expect(screen.getByText("toast 1")).toBeInTheDocument();
    expect(screen.getByText("toast 2")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText("toast 1")).not.toBeInTheDocument();
    expect(screen.queryByText("toast 2")).not.toBeInTheDocument();
  });
});
