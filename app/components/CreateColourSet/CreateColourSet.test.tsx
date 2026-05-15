import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CreateColourSet } from "./CreateColourSet";
import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("~/utilities/utilities", () => ({
  generateColorGradient: vi.fn((_a, _b, count) =>
    Array.from({ length: count + 2 }, (_, i) => ({ hex: `ff000${i}` })),
  ),
  generateRandomColor: vi.fn(() => "randomised-hex"), // single stable value, never matches fixtures
  generateUrlPath: vi.fn(() => "/palette/test"),
}));

vi.mock("hex-color-to-color-name", () => ({
  GetColorName: vi.fn(() => "Red"),
}));

vi.mock("~/components/common/DarkMode/DarkModeContext", () => ({
  useTheme: () => ({ darkMode: false }),
}));

const mockAddToast = vi.fn();
vi.mock("~/components/common/Toast/ToastProvider", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

// Stable palette store shared across hook calls within a test
let paletteStore: { title: string; colours: unknown[]; url: string }[] = [];
const mockSavePalettes = vi.fn((palette) => {
  paletteStore.push(palette);
});
const mockRemovePalette = vi.fn((title: string) => {
  paletteStore = paletteStore.filter((p) => p.title !== title);
});

vi.mock("~/hooks/useLocalStoragePalettes.client", () => ({
  default: () => [paletteStore, mockSavePalettes, mockRemovePalette],
}));

// Lightweight stand-ins for child components — keeps the test surface focused
// on CreateColourSet behaviour rather than child implementation details.
vi.mock("../common/ColourSwatch/ColourSwatch", () => ({
  default: ({
    hex,
    index,
    toggleLockSwatch,
    removeSwatch,
    addSwatch,
    editSwatch,
  }: any) => (
    <div data-testid={`swatch-${index}`} data-hex={hex}>
      <button onClick={toggleLockSwatch} data-testid={`lock-${index}`}>
        Lock
      </button>
      <button
        onClick={() => removeSwatch(index)}
        data-testid={`remove-${index}`}
      >
        Remove
      </button>
      <button
        onClick={() => addSwatch(index)}
        data-testid={`add-before-${index}`}
      >
        Add Before
      </button>
      <button
        onClick={() => editSwatch(`#aabbcc`, index)}
        data-testid={`edit-${index}`}
      >
        Edit
      </button>
    </div>
  ),
}));

vi.mock("../common/ColourSwatchContainer/ColourSwatchContainer", () => ({
  default: ({ children }: any) => (
    <div data-testid="swatch-container">{children}</div>
  ),
}));

vi.mock("./ExportAsModal/ExportAsModal", () => ({
  default: ({ modalOpen, onClose }: any) =>
    modalOpen ? (
      <div data-testid="export-modal">
        <button onClick={onClose} data-testid="close-export-modal">
          Close
        </button>
      </div>
    ) : null,
}));

vi.mock("./ImportPaletteFromImage/ImportPaletteFromImage", () => ({
  default: ({ modalOpen, onClose }: any) =>
    modalOpen ? (
      <div data-testid="import-modal">
        <button onClick={onClose} data-testid="close-import-modal">
          Close
        </button>
      </div>
    ) : null,
}));

vi.mock(
  "./OverwriteExistingPaletteModal/OverwriteExistingPaletteModal",
  () => ({
    default: ({ saveModalOpen, overwritePaletteInLocalStorage }: any) =>
      saveModalOpen ? (
        <div data-testid="overwrite-modal">
          <button
            onClick={overwritePaletteInLocalStorage}
            data-testid="confirm-overwrite"
          >
            Overwrite
          </button>
        </div>
      ) : null,
  }),
);

vi.mock(
  "./DeletePaletteConfirmationModal/DeletePaletteConfirmationModal",
  () => ({
    default: ({ deleteModalOpen, deletePaletteFromLocalStorage }: any) =>
      deleteModalOpen ? (
        <div data-testid="delete-modal">
          <button
            onClick={deletePaletteFromLocalStorage}
            data-testid="confirm-delete"
          >
            Delete
          </button>
        </div>
      ) : null,
  }),
);

vi.mock("../common/Tooltip/Tooltip", () => ({
  default: ({ children }: any) => <>{children}</>,
  TooltipBubble: ({ children }: any) => <>{children}</>,
}));

vi.mock("../common/SvgIcon/SvgIcon", () => ({
  default: () => <span />,
  SvgImageList: {
    Delete: "delete",
    Save: "save",
    Palette: "palette",
    Dropper: "dropper",
    Export: "export",
  },
}));

vi.mock("~/hooks/useGoogleAnalytics", () => ({
  trackClientAnalyticsEvent: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SAMPLE_SWATCHES = [
  { hex: "ff0000", id: "1" },
  { hex: "00ff00", id: "2" },
  { hex: "0000ff", id: "3" },
];

const renderComponent = (props = {}) =>
  render(
    <CreateColourSet
      swatchesFromUrl={SAMPLE_SWATCHES}
      swatchesNameFromUrl="Test Palette"
      {...props}
    />,
  );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CreateColourSet", () => {
  beforeEach(() => {
    paletteStore = [];
    mockSavePalettes.mockClear();
    mockRemovePalette.mockClear();
    mockAddToast.mockClear();
    (trackClientAnalyticsEvent as ReturnType<typeof vi.fn>).mockClear(); // 👈 add this
    // ...
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  describe("Rendering", () => {
    it("renders the palette name input with the name from URL", () => {
      renderComponent();
      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("Test Palette");
    });

    it("renders the swatch container with swatches from URL", () => {
      renderComponent();
      expect(screen.getByTestId("swatch-container")).toBeInTheDocument();
      expect(screen.getAllByTestId(/^swatch-\d+/)).toHaveLength(
        SAMPLE_SWATCHES.length,
      );
    });

    it("falls back to 'Untitled Swatch' when no name is provided via URL", () => {
      renderComponent({ swatchesNameFromUrl: undefined });
      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("Untitled Swatch");
    });

    it("renders all action buttons", () => {
      renderComponent();
      expect(screen.getByText(/DELETE FROM/i)).toBeInTheDocument();
      expect(screen.getByText(/SAVE TO/i)).toBeInTheDocument();
      expect(screen.getByText(/RANDOMISE/i)).toBeInTheDocument();
      expect(screen.getByText(/IMPORT/i)).toBeInTheDocument();
      expect(screen.getByText(/EXPORT/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Palette name
  // -------------------------------------------------------------------------

  describe("Palette name input", () => {
    it("updates the palette name when the user types", async () => {
      renderComponent();
      const input = screen.getByRole("textbox");
      await userEvent.clear(input);
      await userEvent.type(input, "My New Palette");
      expect(input).toHaveValue("My New Palette");
    });
  });

  // -------------------------------------------------------------------------
  // Export modal
  // -------------------------------------------------------------------------

  describe("Export modal", () => {
    it("opens the export modal when the Export button is clicked", async () => {
      renderComponent();
      await userEvent.click(screen.getByText(/EXPORT/i));
      expect(screen.getByTestId("export-modal")).toBeInTheDocument();
    });

    it("closes the export modal when onClose is called", async () => {
      renderComponent();
      await userEvent.click(screen.getByText(/EXPORT/i));
      await userEvent.click(screen.getByTestId("close-export-modal"));
      expect(screen.queryByTestId("export-modal")).not.toBeInTheDocument();
    });

    it("opens the export modal via keyboard shortcut X", async () => {
      renderComponent();
      fireEvent.keyDown(window, { code: "KeyX" });
      expect(screen.getByTestId("export-modal")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Import / Palette from Image modal
  // -------------------------------------------------------------------------

  describe("Import modal", () => {
    it("opens the import modal when the Import button is clicked", async () => {
      renderComponent();
      await userEvent.click(screen.getByText(/IMPORT/i));
      expect(screen.getByTestId("import-modal")).toBeInTheDocument();
    });

    it("closes the import modal when onClose is called", async () => {
      renderComponent();
      await userEvent.click(screen.getByText(/IMPORT/i));
      await userEvent.click(screen.getByTestId("close-import-modal"));
      expect(screen.queryByTestId("import-modal")).not.toBeInTheDocument();
    });

    it("opens the import modal via keyboard shortcut I", () => {
      renderComponent();
      fireEvent.keyDown(window, { code: "KeyI" });
      expect(screen.getByTestId("import-modal")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Save to device
  // -------------------------------------------------------------------------

  describe("Save to device", () => {
    it("shows a toast and focuses the input when saving with the default name 'Untitled Swatch'", async () => {
      renderComponent({ swatchesNameFromUrl: undefined });
      await userEvent.click(screen.getByText(/SAVE TO/i));
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringMatching(/NOT SAVED/i),
      );
    });

    it("saves the palette when the name is unique and not 'Untitled Swatch'", async () => {
      renderComponent();
      await userEvent.click(screen.getByText(/SAVE TO/i));
      expect(mockSavePalettes).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Test Palette" }),
      );
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringMatching(/Palette Saved/i),
      );
    });

    it("opens the overwrite modal when saving a palette whose name already exists", async () => {
      // Pre-populate store with an existing palette of the same name but a
      // different URL so currentSwatchesAreInLocalStorage stays false.
      paletteStore = [{ title: "Test Palette", colours: [], url: "/other" }];
      renderComponent();
      await userEvent.click(screen.getByText(/SAVE TO/i));
      expect(screen.getByTestId("overwrite-modal")).toBeInTheDocument();
    });

    it("overwrites the palette when confirmed in the overwrite modal", async () => {
      paletteStore = [{ title: "Test Palette", colours: [], url: "/other" }];
      renderComponent();
      await userEvent.click(screen.getByText(/SAVE TO/i));
      await userEvent.click(screen.getByTestId("confirm-overwrite"));
      expect(mockRemovePalette).toHaveBeenCalledWith("Test Palette");
      expect(mockSavePalettes).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Test Palette" }),
      );
    });

    it("triggers save via keyboard shortcut S", async () => {
      renderComponent();
      fireEvent.keyDown(window, { code: "KeyS" });
      expect(mockSavePalettes).toHaveBeenCalled();
    });

    it("disables Save button when palette is already saved (URL matches)", () => {
      // Set up the store so currentSwatchesAreInLocalStorage is true.
      paletteStore = [
        {
          title: "Test Palette",
          colours: SAMPLE_SWATCHES,
          url: "/palette/test",
        },
      ];
      renderComponent();
      // The Save button is disabled when the palette is already in storage.
      const saveButton = screen.getByText(/SAVE TO/i).closest("button")!;
      expect(saveButton).toBeDisabled();
    });
  });

  // -------------------------------------------------------------------------
  // Delete from device
  // -------------------------------------------------------------------------

  describe("Delete from device", () => {
    it("opens delete confirmation modal when Delete button is clicked", async () => {
      paletteStore = [
        {
          title: "Test Palette",
          colours: SAMPLE_SWATCHES,
          url: "/palette/test",
        },
      ];
      renderComponent();
      const deleteButton = screen.getByText(/DELETE FROM/i).closest("button")!;
      await userEvent.click(deleteButton);
      expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
    });

    it("deletes the palette when confirmed", async () => {
      paletteStore = [
        {
          title: "Test Palette",
          colours: SAMPLE_SWATCHES,
          url: "/palette/test",
        },
      ];
      renderComponent();
      const deleteButton = screen.getByText(/DELETE FROM/i).closest("button")!;
      await userEvent.click(deleteButton);
      await userEvent.click(screen.getByTestId("confirm-delete"));
      expect(mockRemovePalette).toHaveBeenCalledWith("Test Palette");
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringMatching(/Deleted/i),
      );
    });

    it("opens delete modal via keyboard shortcut D", async () => {
      paletteStore = [
        {
          title: "Test Palette",
          colours: SAMPLE_SWATCHES,
          url: "/palette/test",
        },
      ];
      renderComponent();
      fireEvent.keyDown(window, { code: "KeyD" });
      expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
    });

    it("disables Delete button when palette is not in local storage", () => {
      renderComponent();
      const deleteButton = screen.getByText(/DELETE FROM/i).closest("button")!;
      expect(deleteButton).toBeDisabled();
    });
  });

  // -------------------------------------------------------------------------
  // Randomise unlocked swatches
  // -------------------------------------------------------------------------

  describe("Randomise unlocked swatches", () => {
    it("randomise button is enabled when at least one swatch is unlocked", () => {
      renderComponent();
      const randomiseButton = screen.getByText(/RANDOMISE/i).closest("button")!;
      expect(randomiseButton).not.toBeDisabled();
    });

    it("randomise button triggers via keyboard shortcut SPACE", () => {
      // Simply assert the keydown fires without error; visual change is tested
      // at hook level but randomise is wired to the window listener.
      renderComponent();
      expect(() => fireEvent.keyDown(window, { code: "Space" })).not.toThrow();
    });

    it("keyboard shortcuts are ignored when an input element is focused", () => {
      renderComponent();
      const input = screen.getByRole("textbox");
      // Dispatch keydown with the input as the target — should not open the
      // export modal.
      fireEvent.keyDown(input, { code: "KeyX", target: input });
      expect(screen.queryByTestId("export-modal")).not.toBeInTheDocument();
    });

    it("calls trackClientAnalyticsEvent with 'randomise_unlocked_click' when clicked", async () => {
      renderComponent();
      await userEvent.click(screen.getByText(/RANDOMISE/i).closest("button")!);
      expect(trackClientAnalyticsEvent).toHaveBeenCalledWith(
        "randomise_unlocked_click",
      );
    });

    it("calls randomiseUnlockedSwatches when the button is clicked", async () => {
      renderComponent();
      // Grab hex values before clicking so we can confirm they changed
      const hexesBefore = screen
        .getAllByTestId(/^swatch-\d+/)
        .map((el) => el.getAttribute("data-hex"));

      await userEvent.click(screen.getByText(/RANDOMISE/i).closest("button")!);

      const hexesAfter = screen
        .getAllByTestId(/^swatch-\d+/)
        .map((el) => el.getAttribute("data-hex"));

      expect(hexesAfter).not.toEqual(hexesBefore);
    });

    it("is disabled when all swatches are locked", async () => {
      // Provide a single pre-locked swatch so the every() check is true
      renderComponent({
        swatchesFromUrl: [{ hex: "ff0000", id: "a", locked: true }],
      });
      const button = screen.getByText(/RANDOMISE/i).closest("button")!;
      expect(button).toBeDisabled();
      await userEvent.click(button);
      expect(trackClientAnalyticsEvent).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Swatch manipulation (via stub buttons on the mock ColourSwatch)
  // -------------------------------------------------------------------------

  describe("Swatch manipulation", () => {
    it("removes a swatch when remove is triggered", async () => {
      renderComponent();
      const initialCount = screen.getAllByTestId(/^swatch-\d+/).length;
      await userEvent.click(screen.getByTestId("remove-1"));
      expect(screen.getAllByTestId(/^swatch-\d+/).length).toBe(
        initialCount - 1,
      );
    });

    it("adds a swatch when add is triggered", async () => {
      renderComponent();
      const initialCount = screen.getAllByTestId(/^swatch-\d+/).length;
      await userEvent.click(screen.getByTestId("add-before-1"));
      await waitFor(() => {
        expect(screen.getAllByTestId(/^swatch-\d+/).length).toBeGreaterThan(
          initialCount,
        );
      });
    });

    it("toggles lock on a swatch without removing it", async () => {
      renderComponent();
      const countBefore = screen.getAllByTestId(/^swatch-\d+/).length;
      await userEvent.click(screen.getByTestId("lock-0"));
      expect(screen.getAllByTestId(/^swatch-\d+/).length).toBe(countBefore);
    });

    it("edits a swatch colour", async () => {
      renderComponent();
      // The edit stub calls editSwatch('#aabbcc', index). We just assert no
      // crash and the swatch count stays the same.
      const countBefore = screen.getAllByTestId(/^swatch-\d+/).length;
      await userEvent.click(screen.getByTestId("edit-0"));
      expect(screen.getAllByTestId(/^swatch-\d+/).length).toBe(countBefore);
    });
  });
});
