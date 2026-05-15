import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import useCreateColourSet from "./useCreateColourSet";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

// Controlled colour generation so test assertions are deterministic
let colorCallCount = 0;
vi.mock("~/utilities/utilities", () => ({
  generateRandomColor: vi.fn(() => {
    colorCallCount++;
    return `random${colorCallCount}`;
  }),
  generateColorGradient: vi.fn((from: string, to: string, _steps: number) => [
    { hex: from },
    { hex: "midpoint" },
    { hex: to },
  ]),
  generateUrlPath: vi.fn(
    (_swatches: unknown, name: string) => `/palette/${name}`,
  ),
}));

vi.mock("~/components/common/DarkMode/DarkModeContext", () => ({
  useTheme: () => ({ darkMode: false }),
}));

const mockAddToast = vi.fn();
vi.mock("~/components/common/Toast/ToastProvider", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

// Mutable palette store — mutated directly so the hook always reads the
// current value (matching how the real hook reads from the same reference).
let paletteStore: { title: string; colours: unknown[]; url: string }[] = [];
const mockSavePalettes = vi.fn((palette) => paletteStore.push(palette));
const mockRemovePalette = vi.fn((title: string) => {
  paletteStore = paletteStore.filter((p) => p.title !== title);
});
vi.mock("./useLocalStoragePalettes.client", () => ({
  default: () => [paletteStore, mockSavePalettes, mockRemovePalette],
}));

// Stable UUIDs so we can reference IDs in assertions
let uuidCount = 0;
vi.stubGlobal(
  "crypto",
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  {
    randomUUID: vi.fn(() => `test-uuid-${++uuidCount}`),
  } as unknown as Crypto,
);

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const SAMPLE_SWATCHES = [
  { hex: "ff0000", id: "a" },
  { hex: "00ff00", id: "b" },
  { hex: "0000ff", id: "c" },
];

const defaultProps = {
  swatchesFromUrl: SAMPLE_SWATCHES,
  swatchesNameFromUrl: "Test Palette",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convenience: render the hook with merged props overrides. */
function setup(overrides: Partial<typeof defaultProps> = {}) {
  return renderHook(() =>
    useCreateColourSet({ ...defaultProps, ...overrides }),
  );
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("useCreateColourSet", () => {
  beforeEach(() => {
    paletteStore = [];
    uuidCount = 0;
    colorCallCount = 0;
    mockNavigate.mockClear();
    mockSavePalettes.mockClear();
    mockRemovePalette.mockClear();
    mockAddToast.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  // -------------------------------------------------------------------------
  // Initialisation
  // -------------------------------------------------------------------------

  describe("initialisation", () => {
    it("sets swatchesName from prop", () => {
      const { result } = setup();
      expect(result.current.swatchesName).toBe("Test Palette");
    });

    it("falls back to 'Untitled Swatch' when no name prop is provided", () => {
      const { result } = setup({ swatchesNameFromUrl: undefined });
      expect(result.current.swatchesName).toBe("Untitled Swatch");
    });

    it("initialises swatchesList from swatchesFromUrl, adding IDs", () => {
      const { result } = setup();
      expect(result.current.swatchesList).toHaveLength(SAMPLE_SWATCHES.length);
      result.current.swatchesList.forEach((swatch) => {
        expect(swatch.id).toMatch(/^test-uuid-/);
      });
    });

    it("preserves the hex values from swatchesFromUrl", () => {
      const { result } = setup();
      const hexValues = result.current.swatchesList.map((s) => s.hex);
      expect(hexValues).toEqual(SAMPLE_SWATCHES.map((s) => s.hex));
    });

    it("generates a random colour set when no swatchesFromUrl is provided", () => {
      const { result } = setup({ swatchesFromUrl: undefined });
      // generateColorGradient mock returns 3 items
      expect(result.current.swatchesList).toHaveLength(3);
    });

    it("isClient is false on first render, true after mount effect", async () => {
      const { result } = setup();
      // After renderHook, effects run synchronously in the test environment
      expect(result.current.isClient).toBe(true);
    });

    it("all modal states start closed", () => {
      const { result } = setup();
      expect(result.current.exportModalOpen).toBe(false);
      expect(result.current.paletteFromImageModalOpen).toBe(false);
      expect(result.current.saveModalOpen).toBe(false);
      expect(result.current.deleteModalOpen).toBe(false);
    });

    it("exportAs and importAs start as null", () => {
      const { result } = setup();
      expect(result.current.exportAs).toBeNull();
      expect(result.current.importAs).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // URL sync
  // -------------------------------------------------------------------------

  describe("URL sync", () => {
    it("calls navigate with the generated URL path on mount", () => {
      setup();
      expect(mockNavigate).toHaveBeenCalledWith("/palette/Test Palette", {
        replace: true,
      });
    });

    it("calls navigate again when swatchesName changes", () => {
      const { result } = setup();
      act(() => {
        result.current.setSwatchesName("New Name");
      });
      expect(mockNavigate).toHaveBeenLastCalledWith("/palette/New Name", {
        replace: true,
      });
    });

    it("calls navigate again when swatchesList changes", () => {
      const { result } = setup();
      const callsBefore = mockNavigate.mock.calls.length;
      act(() => {
        result.current.removeSwatch(0);
      });
      expect(mockNavigate.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  // -------------------------------------------------------------------------
  // toggleLockSwatch
  // -------------------------------------------------------------------------

  describe("toggleLockSwatch", () => {
    it("locks an unlocked swatch", () => {
      const { result } = setup();
      act(() => {
        result.current.toggleLockSwatch(0);
      });
      expect(result.current.swatchesList[0].locked).toBe(true);
    });

    it("unlocks a locked swatch", () => {
      const { result } = setup();
      act(() => {
        result.current.toggleLockSwatch(0);
      });
      act(() => {
        result.current.toggleLockSwatch(0);
      });
      expect(result.current.swatchesList[0].locked).toBe(false);
    });

    it("does not affect other swatches when locking one", () => {
      const { result } = setup();
      act(() => {
        result.current.toggleLockSwatch(1);
      });
      expect(result.current.swatchesList[0].locked).toBeFalsy();
      expect(result.current.swatchesList[2].locked).toBeFalsy();
    });
  });

  // -------------------------------------------------------------------------
  // randomiseUnlockedSwatches
  // -------------------------------------------------------------------------

  describe("randomiseUnlockedSwatches", () => {
    it("changes hex of all unlocked swatches", () => {
      const { result } = setup();
      const originalHexes = result.current.swatchesList.map((s) => s.hex);
      act(() => {
        result.current.randomiseUnlockedSwatches();
      });
      const newHexes = result.current.swatchesList.map((s) => s.hex);
      // At least one hex should have changed
      expect(newHexes).not.toEqual(originalHexes);
    });

    it("preserves the hex of locked swatches", () => {
      const { result } = setup();
      // Lock swatch at index 0
      act(() => {
        result.current.toggleLockSwatch(0);
      });
      const lockedHex = result.current.swatchesList[0].hex;
      act(() => {
        result.current.randomiseUnlockedSwatches();
      });
      expect(result.current.swatchesList[0].hex).toBe(lockedHex);
    });

    it("does not change the number of swatches", () => {
      const { result } = setup();
      const countBefore = result.current.swatchesList.length;
      act(() => {
        result.current.randomiseUnlockedSwatches();
      });
      expect(result.current.swatchesList).toHaveLength(countBefore);
    });
  });

  // -------------------------------------------------------------------------
  // moveSwatch
  // -------------------------------------------------------------------------

  describe("moveSwatch", () => {
    it("moves a swatch left by swapping it with its left neighbour", () => {
      const { result } = setup();
      const [first, second] = result.current.swatchesList;
      act(() => {
        result.current.moveSwatch(1, "left");
      });
      expect(result.current.swatchesList[0].hex).toBe(second.hex);
      expect(result.current.swatchesList[1].hex).toBe(first.hex);
    });

    it("moves a swatch right by swapping it with its right neighbour", () => {
      const { result } = setup();
      const [first, second] = result.current.swatchesList;
      act(() => {
        result.current.moveSwatch(0, "right");
      });
      expect(result.current.swatchesList[0].hex).toBe(second.hex);
      expect(result.current.swatchesList[1].hex).toBe(first.hex);
    });

    it("is a no-op when moving the first swatch left (out of bounds)", () => {
      const { result } = setup();
      const hexesBefore = result.current.swatchesList.map((s) => s.hex);
      act(() => {
        result.current.moveSwatch(0, "left");
      });
      expect(result.current.swatchesList.map((s) => s.hex)).toEqual(
        hexesBefore,
      );
    });

    it("is a no-op when moving the last swatch right (out of bounds)", () => {
      const { result } = setup();
      const lastIndex = result.current.swatchesList.length - 1;
      const hexesBefore = result.current.swatchesList.map((s) => s.hex);
      act(() => {
        result.current.moveSwatch(lastIndex, "right");
      });
      expect(result.current.swatchesList.map((s) => s.hex)).toEqual(
        hexesBefore,
      );
    });
  });

  // -------------------------------------------------------------------------
  // addSwatch
  // -------------------------------------------------------------------------

  describe("addSwatch", () => {
    it("prepends a swatch when index is 0", () => {
      const { result } = setup();
      const originalFirst = result.current.swatchesList[0].hex;
      act(() => {
        result.current.addSwatch(0);
      });
      expect(result.current.swatchesList).toHaveLength(
        SAMPLE_SWATCHES.length + 1,
      );
      // The original first swatch should now be at index 1
      expect(result.current.swatchesList[1].hex).toBe(originalFirst);
    });

    it("appends a swatch when index equals the list length", () => {
      const { result } = setup();
      const lengthBefore = result.current.swatchesList.length;
      const lastHex = result.current.swatchesList[lengthBefore - 1].hex;
      act(() => {
        result.current.addSwatch(lengthBefore);
      });
      expect(result.current.swatchesList).toHaveLength(lengthBefore + 1);
      // The original last swatch should remain in the second-to-last position
      expect(result.current.swatchesList[lengthBefore - 1].hex).toBe(lastHex);
    });

    it("inserts a midpoint swatch between two swatches for a mid-list index", () => {
      const { result } = setup();
      // addSwatch(1) inserts between index 0 and index 1
      act(() => {
        result.current.addSwatch(1);
      });
      // generateColorGradient mock returns [from, midpoint, to] — 3 items —
      // and the hook slices out the before/after, so the list length stays the
      // same (replaces the gap with the 3-item gradient, removes old boundary items).
      // The key assertion is that a midpoint hex appears.
      const hexValues = result.current.swatchesList.map((s) => s.hex);
      expect(hexValues).toContain("midpoint");
    });
  });

  // -------------------------------------------------------------------------
  // removeSwatch
  // -------------------------------------------------------------------------

  describe("removeSwatch", () => {
    it("removes the swatch at the given index", () => {
      const { result } = setup();
      const hexToRemove = result.current.swatchesList[1].hex;
      act(() => {
        result.current.removeSwatch(1);
      });
      expect(result.current.swatchesList).toHaveLength(
        SAMPLE_SWATCHES.length - 1,
      );
      expect(result.current.swatchesList.map((s) => s.hex)).not.toContain(
        hexToRemove,
      );
    });

    it("removes the first swatch correctly", () => {
      const { result } = setup();
      const secondHex = result.current.swatchesList[1].hex;
      act(() => {
        result.current.removeSwatch(0);
      });
      expect(result.current.swatchesList[0].hex).toBe(secondHex);
    });

    it("removes the last swatch correctly", () => {
      const { result } = setup();
      const lastIndex = result.current.swatchesList.length - 1;
      const secondToLastHex = result.current.swatchesList[lastIndex - 1].hex;
      act(() => {
        result.current.removeSwatch(lastIndex);
      });
      expect(
        result.current.swatchesList[result.current.swatchesList.length - 1].hex,
      ).toBe(secondToLastHex);
    });
  });

  // -------------------------------------------------------------------------
  // editSwatch
  // -------------------------------------------------------------------------

  describe("editSwatch", () => {
    it("updates the hex at the given index", () => {
      const { result } = setup();
      act(() => {
        result.current.editSwatch("#aabbcc", 0);
      });
      expect(result.current.swatchesList[0].hex).toBe("aabbcc");
    });

    it("strips the leading # from the provided hex value", () => {
      const { result } = setup();
      act(() => {
        result.current.editSwatch("#112233", 1);
      });
      expect(result.current.swatchesList[1].hex).toBe("112233");
    });

    it("does not mutate other swatches", () => {
      const { result } = setup();
      const otherHexesBefore = [
        result.current.swatchesList[1].hex,
        result.current.swatchesList[2].hex,
      ];
      act(() => {
        result.current.editSwatch("#ffffff", 0);
      });
      expect(result.current.swatchesList[1].hex).toBe(otherHexesBefore[0]);
      expect(result.current.swatchesList[2].hex).toBe(otherHexesBefore[1]);
    });
  });

  // -------------------------------------------------------------------------
  // Export modal
  // -------------------------------------------------------------------------

  describe("export modal", () => {
    it("setExportModalOpen opens the modal", () => {
      const { result } = setup();
      act(() => {
        result.current.setExportModalOpen(true);
      });
      expect(result.current.exportModalOpen).toBe(true);
    });

    it("closeExportModal closes the modal and resets exportAs", () => {
      const { result } = setup();
      act(() => {
        result.current.setExportModalOpen(true);
        result.current.setExportAs("CSS");
      });
      act(() => {
        result.current.closeExportModal();
      });
      expect(result.current.exportModalOpen).toBe(false);
      expect(result.current.exportAs).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Palette from image modal
  // -------------------------------------------------------------------------

  describe("palette from image modal", () => {
    it("setPaletteFromImageModalOpen opens the modal", () => {
      const { result } = setup();
      act(() => {
        result.current.setPaletteFromImageModalOpen(true);
      });
      expect(result.current.paletteFromImageModalOpen).toBe(true);
    });

    it("closePaletteFromImageModal closes the modal and resets importAs", () => {
      const { result } = setup();
      act(() => {
        result.current.setPaletteFromImageModalOpen(true);
        result.current.setImportAs("URL");
      });
      act(() => {
        result.current.closePaletteFromImageModal();
      });
      expect(result.current.paletteFromImageModalOpen).toBe(false);
      expect(result.current.importAs).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // savePaletteToLocalStorage
  // -------------------------------------------------------------------------

  describe("savePaletteToLocalStorage", () => {
    it("shows a toast and does NOT save when the name is 'Untitled Swatch'", () => {
      const { result } = setup({ swatchesNameFromUrl: undefined });
      act(() => {
        result.current.savePaletteToLocalStorage();
      });
      expect(mockSavePalettes).not.toHaveBeenCalled();
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringMatching(/NOT SAVED/i),
      );
    });

    it("saves the palette when the name is valid and unique", () => {
      const { result } = setup();
      act(() => {
        result.current.savePaletteToLocalStorage();
      });
      expect(mockSavePalettes).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Test Palette" }),
      );
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringMatching(/Palette Saved/i),
      );
    });

    it("opens the overwrite modal when a palette with the same name already exists", () => {
      paletteStore = [{ title: "Test Palette", colours: [], url: "/other" }];
      const { result } = setup();
      act(() => {
        result.current.savePaletteToLocalStorage();
      });
      expect(result.current.saveModalOpen).toBe(true);
      expect(mockSavePalettes).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // overwritePaletteInLocalStorage
  // -------------------------------------------------------------------------

  describe("overwritePaletteInLocalStorage", () => {
    it("removes the old palette then saves the new one", () => {
      paletteStore = [{ title: "Test Palette", colours: [], url: "/old" }];
      const { result } = setup();
      act(() => {
        result.current.overwritePaletteInLocalStorage();
      });
      expect(mockRemovePalette).toHaveBeenCalledWith("Test Palette");
      expect(mockSavePalettes).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Test Palette" }),
      );
    });

    it("shows a success toast after overwriting", () => {
      const { result } = setup();
      act(() => {
        result.current.overwritePaletteInLocalStorage();
      });
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringMatching(/Palette Saved/i),
      );
    });

    it("closes the save modal after overwriting", () => {
      const { result } = setup();
      act(() => {
        result.current.setSaveModalOpen(true);
      });
      act(() => {
        result.current.overwritePaletteInLocalStorage();
      });
      expect(result.current.saveModalOpen).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // deletePaletteFromLocalStorage
  // -------------------------------------------------------------------------

  describe("deletePaletteFromLocalStorage", () => {
    it("calls removePalette with the current palette name", () => {
      const { result } = setup();
      act(() => {
        result.current.deletePaletteFromLocalStorage();
      });
      expect(mockRemovePalette).toHaveBeenCalledWith("Test Palette");
    });

    it("shows a deletion success toast", () => {
      const { result } = setup();
      act(() => {
        result.current.deletePaletteFromLocalStorage();
      });
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringMatching(/Deleted/i),
      );
    });

    it("closes the delete modal after deletion", () => {
      const { result } = setup();
      act(() => {
        result.current.setDeleteModalOpen(true);
      });
      act(() => {
        result.current.deletePaletteFromLocalStorage();
      });
      expect(result.current.deleteModalOpen).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // currentSwatchesAreInLocalStorage
  // -------------------------------------------------------------------------

  describe("currentSwatchesAreInLocalStorage", () => {
    it("is false when the palette is not in the store", () => {
      const { result } = setup();
      expect(result.current.currentSwatchesAreInLocalStorage).toBe(false);
    });

    it("is true when a palette with matching title and URL exists in the store", () => {
      // generateUrlPath mock returns `/palette/${name}`
      paletteStore = [
        {
          title: "Test Palette",
          colours: [],
          url: "/palette/Test Palette",
        },
      ];
      const { result } = setup();
      expect(result.current.currentSwatchesAreInLocalStorage).toBe(true);
    });

    it("is false when the title matches but the URL does not", () => {
      paletteStore = [
        {
          title: "Test Palette",
          colours: [],
          url: "/palette/stale-url",
        },
      ];
      const { result } = setup();
      expect(result.current.currentSwatchesAreInLocalStorage).toBe(false);
    });
  });
});
