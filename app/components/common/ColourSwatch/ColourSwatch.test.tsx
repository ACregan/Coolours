import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ColourSwatch from "./ColourSwatch";
import { useClickOutside } from "~/hooks/useClickOutside";
import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";
import * as utilities from "~/utilities/utilities";
import { useToast } from "../Toast/ToastProvider";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const clickOutsideCallbacks: Array<() => void> = [];

vi.mock("@dnd-kit/react/sortable", () => ({
  useSortable: vi.fn(() => ({
    ref: vi.fn(),
    handleRef: vi.fn(),
  })),
}));

vi.mock("~/hooks/useClickOutside", () => ({
  useClickOutside: vi.fn((ref, callback) => {
    clickOutsideCallbacks.push(callback);
  }),
}));

vi.mock("~/hooks/useGoogleAnalytics", () => ({
  trackClientAnalyticsEvent: vi.fn(),
}));

vi.mock("../Toast/ToastProvider", () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

vi.mock("~/utilities/utilities", () => ({
  debounce: vi.fn((fn) => fn),
  isCloserToWhite: vi.fn(() => false),
  copyToClipboard: vi.fn(),
  normalizeHex: vi.fn((hex) => hex),
}));

vi.mock("react-colorful", () => ({
  HexColorPicker: ({ onChange }: any) => (
    <div data-testid="hex-color-picker" onClick={() => onChange("#ff0000")} />
  ),
  HexColorInput: ({ onChange }: any) => (
    <input
      data-testid="hex-color-input"
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock("./AddNewSwatchButton/AddNewSwatchButton", () => ({
  default: ({ addSwatch, index }: any) => (
    <button
      onClick={() => addSwatch(index)}
      data-testid={`add-swatch-${index}`}
    >
      Add
    </button>
  ),
}));

vi.mock("../SvgIcon/SvgIcon", () => ({
  __esModule: true,
  default: ({ name }: any) => <span data-testid={`svg-${name}`}>{name}</span>,
  SvgImageList: {
    DragHandle: "DragHandle",
    ArrowBack: "ArrowBack",
    ArrowForward: "ArrowForward",
    LockLocked: "LockLocked",
    LockUnlocked: "LockUnlocked",
    Copy: "Copy",
    Palette: "Palette",
    Delete: "Delete",
    Plus: "Plus",
  },
}));

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const defaultProps = {
  id: "test-id",
  hex: "ff0000",
  label: "Red",
  index: 1,
  addSwatch: vi.fn(),
  removeSwatch: vi.fn(),
  disableDelete: false,
  editSwatch: vi.fn(),
  moveSwatch: vi.fn(),
  isSwatchLocked: false,
  toggleLockSwatch: vi.fn(),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setup(overrides: Partial<typeof defaultProps> = {}) {
  return render(<ColourSwatch {...defaultProps} {...overrides} />);
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("ColourSwatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clickOutsideCallbacks.length = 0;
  });

  describe("rendering", () => {
    it("renders the swatch with the correct background color", () => {
      const { container } = setup();
      const swatch = container.firstElementChild;
      expect(swatch).toHaveStyle({ backgroundColor: "rgb(255, 0, 0)" });
    });

    it("displays the normalized hex color", () => {
      setup();
      expect(
        screen.getByText(
          (content) => content?.replace(/\s+/g, "").toLowerCase() === "#ff0000",
        ),
      ).toBeInTheDocument();
    });

    it("displays the label when provided", () => {
      setup();
      expect(screen.getByText("Red")).toBeInTheDocument();
    });

    it("does not display label when not provided", () => {
      setup({ label: undefined });
      expect(screen.queryByText("Red")).not.toBeInTheDocument();
    });

    it("renders AddSwatchButton at index 0 when index is 0", () => {
      setup({ index: 0 });
      expect(screen.getByTestId("add-swatch-0")).toBeInTheDocument();
      expect(screen.getByTestId("add-swatch-1")).toBeInTheDocument();
    });

    it("does not render AddSwatchButton at start when index is not 0", () => {
      setup();
      expect(screen.queryByTestId("add-swatch-0")).not.toBeInTheDocument();
      expect(screen.getByTestId("add-swatch-2")).toBeInTheDocument();
    });
  });

  describe("color picker", () => {
    it("opens the color picker when edit button is clicked", async () => {
      setup();
      const editButton = screen.getByText("EDIT").parentElement!;
      fireEvent.click(editButton);
      await waitFor(() => {
        expect(screen.getByTestId("hex-color-picker")).toBeInTheDocument();
      });
    });

    it("closes the color picker when clicking outside", async () => {
      setup();
      const editButton = screen.getByText("EDIT").closest("button");
      fireEvent.click(editButton!);
      await waitFor(() => {
        expect(screen.getByTestId("hex-color-picker")).toBeInTheDocument();
      });
      await act(async () => {
        clickOutsideCallbacks.pop()?.();
      });
      await waitFor(() => {
        expect(
          screen.queryByTestId("hex-color-picker"),
        ).not.toBeInTheDocument();
      });
    });

    it("calls editSwatch when color picker changes", () => {
      setup();
      const editButton = screen.getByText("EDIT").closest("button");
      fireEvent.click(editButton!);
      const picker = screen.getByTestId("hex-color-picker");
      fireEvent.click(picker);
      expect(defaultProps.editSwatch).toHaveBeenCalledWith("#ff0000", 1);
    });

    it("calls editSwatch when hex input changes", () => {
      setup();
      const editButton = screen.getByText("EDIT").closest("button");
      fireEvent.click(editButton!);
      const input = screen.getByTestId("hex-color-input");
      fireEvent.change(input, { target: { value: "#00ff00" } });
      expect(defaultProps.editSwatch).toHaveBeenCalledWith("#00ff00", 1);
    });
  });

  describe("button actions", () => {
    it("calls moveSwatch left when left arrow is clicked", () => {
      setup();
      const leftButton = screen.getByText("LEFT").parentElement!;
      fireEvent.click(leftButton);
      expect(defaultProps.moveSwatch).toHaveBeenCalledWith(1, "left");
    });

    it("calls moveSwatch right when right arrow is clicked", () => {
      setup();
      const rightButton = screen.getByText("RIGHT").parentElement!;
      fireEvent.click(rightButton);
      expect(defaultProps.moveSwatch).toHaveBeenCalledWith(1, "right");
    });

    it("calls toggleLockSwatch when lock button is clicked", () => {
      setup();
      const lockButton = screen.getByText("LOCK: Off").parentElement!;
      fireEvent.click(lockButton);
      expect(defaultProps.toggleLockSwatch).toHaveBeenCalledWith(1);
    });

    it("calls copyToClipboard when copy button is clicked", () => {
      const mockCopyToClipboard = vi.mocked(utilities.copyToClipboard);
      setup();
      const copyButton = screen.getByText("COPY").closest("button");
      fireEvent.click(copyButton!);
      expect(mockCopyToClipboard).toHaveBeenCalledWith(
        "#ff0000",
        expect.any(Function),
        expect.any(Function),
      );
    });

    it("calls removeSwatch when delete button is clicked", () => {
      setup();
      const deleteButton = screen.getByText("DELETE").parentElement!;
      fireEvent.click(deleteButton);
      expect(defaultProps.removeSwatch).toHaveBeenCalledWith(1);
    });

    it("disables delete button when disableDelete is true", () => {
      setup({ disableDelete: true });
      const deleteButton = screen.getByText("DELETE").parentElement!;
      expect(deleteButton).toBeDisabled();
    });
  });

  describe("analytics tracking", () => {
    it("tracks move_swatch_left_click when left arrow is clicked", () => {
      const mockTrack = vi.mocked(trackClientAnalyticsEvent);
      setup();
      const leftButton = screen.getByText("LEFT").closest("button");
      fireEvent.click(leftButton!);
      expect(mockTrack).toHaveBeenCalledWith("move_swatch_left_click");
    });

    it("tracks lock_swatch_click when locking", () => {
      const mockTrack = vi.mocked(trackClientAnalyticsEvent);
      setup();
      const lockButton = screen.getByText("LOCK: Off").closest("button");
      fireEvent.click(lockButton!);
      expect(mockTrack).toHaveBeenCalledWith("lock_swatch_click");
    });

    it("tracks unlock_swatch_click when unlocking", () => {
      const mockTrack = vi.mocked(trackClientAnalyticsEvent);
      setup({ isSwatchLocked: true });
      const lockButton = screen.getByText("LOCK: On").closest("button");
      fireEvent.click(lockButton!);
      expect(mockTrack).toHaveBeenCalledWith("unlock_swatch_click");
    });

    it("tracks copy_colour_to_clipboard_click when copy is clicked", () => {
      const mockTrack = vi.mocked(trackClientAnalyticsEvent);
      setup();
      const copyButton = screen.getByText("COPY").closest("button");
      fireEvent.click(copyButton!);
      expect(mockTrack).toHaveBeenCalledWith("copy_colour_to_clipboard_click");
    });

    it("tracks open_colour_picker_click when edit is clicked", () => {
      const mockTrack = vi.mocked(trackClientAnalyticsEvent);
      setup();
      const editButton = screen.getByText("EDIT").closest("button");
      fireEvent.click(editButton!);
      expect(mockTrack).toHaveBeenCalledWith("open_colour_picker_click");
    });

    it("tracks delete_swatch_click when delete is clicked", () => {
      const mockTrack = vi.mocked(trackClientAnalyticsEvent);
      setup();
      const deleteButton = screen.getByText("DELETE").closest("button");
      fireEvent.click(deleteButton!);
      expect(mockTrack).toHaveBeenCalledWith("delete_swatch_click");
    });
  });
});
