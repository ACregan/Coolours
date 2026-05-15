import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Modal from "./Modal";

const clickOutsideCallbacks: Array<() => void> = [];

vi.mock("~/hooks/useClickOutside", () => ({
  useClickOutside: vi.fn((ref, callback) => {
    clickOutsideCallbacks.push(callback);
  }),
}));

vi.mock("../SvgIcon/SvgIcon", () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => (
    <span data-testid={`svg-${name}`}>{name}</span>
  ),
  SvgImageList: {
    Close: "Close",
  },
}));

vi.mock("./Modal.module.css", () => ({
  default: {
    modalContainer: "modalContainer",
    modalWindow: "modalWindow",
    darkMode: "darkMode",
    lightMode: "lightMode",
    modalHeader: "modalHeader",
  },
}));

describe("Modal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clickOutsideCallbacks.length = 0;
  });

  it("renders nothing when open is false", () => {
    const { container } = render(
      <Modal open={false} onClose={vi.fn()}>
        <div>Content</div>
      </Modal>,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders children and default title when open is true", () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <div>Modal content</div>
      </Modal>,
    );

    expect(screen.getByText("Modal content")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 6 })).toHaveTextContent(
      "Modal",
    );
  });

  it("renders a custom title when provided", () => {
    render(
      <Modal open={true} title="Custom Title" onClose={vi.fn()}>
        <div>Modal content</div>
      </Modal>,
    );

    expect(screen.getByRole("heading", { level: 6 })).toHaveTextContent(
      "Custom Title",
    );
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();

    render(
      <Modal open={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("applies darkMode class when darkMode is true", () => {
    const { container } = render(
      <Modal open={true} onClose={vi.fn()} darkMode={true}>
        <div>Modal content</div>
      </Modal>,
    );

    expect(container.querySelector(".modalWindow")).toHaveClass("darkMode");
  });

  it("calls onClose when click outside is detected", () => {
    const onClose = vi.fn();

    render(
      <Modal open={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>,
    );

    expect(clickOutsideCallbacks).toHaveLength(1);
    clickOutsideCallbacks[0]();

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
