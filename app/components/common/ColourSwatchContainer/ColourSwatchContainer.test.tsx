import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ColourSwatchContainer from "./ColourSwatchContainer";
import ColourSwatch from "../ColourSwatch/ColourSwatch";
import type { swatchType } from "~/types/commonTypes";
import { isSortable } from "@dnd-kit/react/sortable";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const clickOutsideCallbacks: Array<() => void> = [];

vi.mock("@dnd-kit/react", () => ({
  DragDropProvider: ({ children, onDragEnd }: any) => {
    (window as any).triggerDragEnd = onDragEnd;
    return <div data-testid="drag-drop-provider">{children}</div>;
  },
}));

vi.mock("@dnd-kit/helpers", () => ({
  move: vi.fn((list: swatchType[], event: any) => {
    const { source, target } = event.operation;
    const newList = [...list];
    const [removed] = newList.splice(source.index, 1);
    newList.splice(target.index, 0, removed);
    return newList;
  }),
}));

vi.mock("@dnd-kit/react/sortable", () => ({
  useSortable: vi.fn(() => ({
    ref: vi.fn(),
    handleRef: vi.fn(),
  })),
  isSortable: vi.fn(() => true),
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

vi.mock("../ColourSwatch/AddNewSwatchButton/AddNewSwatchButton", () => ({
  default: ({ addSwatch, index }: any) => (
    <button
      onClick={() => addSwatch(index)}
      data-testid={`add-swatch-${index}`}
    >
      Add
    </button>
  ),
}));

vi.mock("../ColourSwatch/SwatchButton/SwatchButton", () => ({
  default: ({ icon, label, onClick, closerToWhite }: any) => (
    <button onClick={onClick} data-testid={`swatch-button-${icon}`}>
      {label}
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

vi.mock("./ColourSwatchContainer.module.css", () => ({
  default: {
    swatchesContainer: "swatchesContainer",
  },
}));

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const mockSwatches: swatchType[] = [
  { id: "1", hex: "#ff0000", label: "Red" },
  { id: "2", hex: "#00ff00", label: "Green" },
  { id: "3", hex: "#0000ff", label: "Blue" },
];

const defaultProps = {
  swatchesList: mockSwatches,
  setSwatchesList: vi.fn(),
  children: (
    <>
      <ColourSwatch
        id="1"
        hex="#ff0000"
        label="Red"
        index={0}
        addSwatch={vi.fn()}
        removeSwatch={vi.fn()}
        disableDelete={false}
        editSwatch={vi.fn()}
        moveSwatch={vi.fn()}
        isSwatchLocked={false}
        toggleLockSwatch={vi.fn()}
      />
      <ColourSwatch
        id="2"
        hex="#00ff00"
        label="Green"
        index={1}
        addSwatch={vi.fn()}
        removeSwatch={vi.fn()}
        disableDelete={false}
        editSwatch={vi.fn()}
        moveSwatch={vi.fn()}
        isSwatchLocked={false}
        toggleLockSwatch={vi.fn()}
      />
      <ColourSwatch
        id="3"
        hex="#0000ff"
        label="Blue"
        index={2}
        addSwatch={vi.fn()}
        removeSwatch={vi.fn()}
        disableDelete={false}
        editSwatch={vi.fn()}
        moveSwatch={vi.fn()}
        isSwatchLocked={false}
        toggleLockSwatch={vi.fn()}
      />
    </>
  ),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setup(overrides: Partial<typeof defaultProps> = {}) {
  return render(<ColourSwatchContainer {...defaultProps} {...overrides} />);
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("ColourSwatchContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).triggerDragEnd;
  });

  it("renders the drag drop provider with children", () => {
    setup();

    expect(screen.getByTestId("drag-drop-provider")).toBeInTheDocument();
    expect(screen.getAllByTestId(/^svg-/)).toHaveLength(3); // Assuming each ColourSwatch has an svg
  });

  it("calls setSwatchesList with reordered list on drag end", () => {
    const setSwatchesList = vi.fn();
    setup({ setSwatchesList });

    const mockEvent = {
      canceled: false,
      operation: {
        source: { index: 0 },
        target: { index: 2 },
      },
    };

    (window as any).triggerDragEnd(mockEvent);

    expect(setSwatchesList).toHaveBeenCalledWith([
      { id: "2", hex: "#00ff00", label: "Green" },
      { id: "3", hex: "#0000ff", label: "Blue" },
      { id: "1", hex: "#ff0000", label: "Red" },
    ]);
  });

  it("does not call setSwatchesList if drag is canceled", () => {
    const setSwatchesList = vi.fn();
    setup({ setSwatchesList });

    const mockEvent = {
      canceled: true,
      operation: {
        source: { index: 0 },
        target: { index: 2 },
      },
    };

    (window as any).triggerDragEnd(mockEvent);

    expect(setSwatchesList).not.toHaveBeenCalled();
  });

  it("does not call setSwatchesList if source or target is not sortable", () => {
    const setSwatchesList = vi.fn();
    setup({ setSwatchesList });

    vi.mocked(isSortable).mockReturnValueOnce(false);

    const mockEvent = {
      canceled: false,
      operation: {
        source: { index: 0 },
        target: { index: 2 },
      },
    };

    (window as any).triggerDragEnd(mockEvent);

    expect(setSwatchesList).not.toHaveBeenCalled();
  });
});
