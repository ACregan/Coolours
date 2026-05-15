import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import usePaletteFromImage from "./useImportPaletteFromImage";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockExtractPalette = vi.fn();
vi.mock("@jimmyclchu/image-palette", () => ({
  extractPalette: (...args: unknown[]) => mockExtractPalette(...args),
}));

const mockAddToast = vi.fn();
vi.mock("~/components/common/Toast/ToastProvider", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

vi.mock("~/components/common/DarkMode/DarkModeContext", () => ({
  useTheme: () => ({ darkMode: false }),
}));

// ---------------------------------------------------------------------------
// Browser API stubs
// ---------------------------------------------------------------------------

const mockObjectUrl = "blob://mock-object-url";
const mockCreateObjectURL = vi.fn(() => mockObjectUrl);
const mockRevokeObjectURL = vi.fn();

vi.stubGlobal("URL", {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_PALETTE = ["ff0000", "00ff00", "0000ff"];

const mockOnClose = vi.fn();

const mockFile = new File(["image-content"], "photo.png", {
  type: "image/png",
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function setup(onClose = mockOnClose) {
  return renderHook(() => usePaletteFromImage({ onClose }));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("usePaletteFromImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExtractPalette.mockResolvedValue(MOCK_PALETTE);
  });

  // -------------------------------------------------------------------------
  // Initialisation
  // -------------------------------------------------------------------------

  describe("initialisation", () => {
    it("initialises imageUrl as an empty string", () => {
      const { result } = setup();
      expect(result.current.imageUrl).toBe("");
    });

    it("initialises numberOfSwatches to '6'", () => {
      const { result } = setup();
      expect(result.current.numberOfSwatches).toBe("6");
    });

    it("initialises isPending as false", () => {
      const { result } = setup();
      expect(result.current.isPending).toBe(false);
    });

    it("initialises errorMessage as false", () => {
      const { result } = setup();
      expect(result.current.errorMessage).toBe(false);
    });

    it("initialises extractedPalette as an empty array", () => {
      const { result } = setup();
      expect(result.current.extractedPalette).toEqual([]);
    });

    it("initialises uploadedFile as null", () => {
      const { result } = setup();
      expect(result.current.uploadedFile).toBeNull();
    });

    it("initialises uploadedFilePreview as null", () => {
      const { result } = setup();
      expect(result.current.uploadedFilePreview).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // getPaletteFromUrl
  // -------------------------------------------------------------------------

  describe("getPaletteFromUrl", () => {
    it("calls extractPalette with the current imageUrl and numberOfSwatches", async () => {
      const { result } = setup();
      act(() => {
        result.current.setImageUrl("https://example.com/image.png");
        result.current.setNumberOfSwatches("4");
      });
      await act(async () => {
        await result.current.getPaletteFromUrl();
      });
      expect(mockExtractPalette).toHaveBeenCalledWith(
        "https://example.com/image.png",
        { colorCount: 4, format: "hex" },
      );
    });

    it("sets isPending to true while extracting then false on success", async () => {
      // Use a deferred promise so we can observe the pending state mid-flight
      let resolvePalette!: (value: string[]) => void;
      mockExtractPalette.mockReturnValueOnce(
        new Promise((res) => (resolvePalette = res)),
      );

      const { result } = setup();

      // Start extraction (don't await yet)
      act(() => {
        result.current.getPaletteFromUrl();
      });
      expect(result.current.isPending).toBe(true);

      // Resolve and confirm cleanup
      await act(async () => {
        resolvePalette(MOCK_PALETTE);
      });
      expect(result.current.isPending).toBe(false);
    });

    it("sets extractedPalette with the returned colours on success", async () => {
      const { result } = setup();
      await act(async () => {
        await result.current.getPaletteFromUrl();
      });
      expect(result.current.extractedPalette).toEqual(MOCK_PALETTE);
    });

    it("shows a success toast on success", async () => {
      const { result } = setup();
      await act(async () => {
        await result.current.getPaletteFromUrl();
      });
      expect(mockAddToast).toHaveBeenCalledWith(
        "Palette Generated Successfully",
      );
    });

    it("sets isPending to false and sets errorMessage on failure", async () => {
      const error = new Error("CORS error");
      mockExtractPalette.mockRejectedValueOnce(error);

      const { result } = setup();
      await act(async () => {
        await result.current.getPaletteFromUrl();
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.errorMessage).toBe(error);
    });

    it("shows an error toast on failure", async () => {
      mockExtractPalette.mockRejectedValueOnce(new Error("Network error"));

      const { result } = setup();
      await act(async () => {
        await result.current.getPaletteFromUrl();
      });

      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringMatching(/ERROR DOWNLOADING IMAGE/i),
      );
    });

    it("does not populate extractedPalette on failure", async () => {
      mockExtractPalette.mockRejectedValueOnce(new Error("fail"));

      const { result } = setup();
      await act(async () => {
        await result.current.getPaletteFromUrl();
      });

      expect(result.current.extractedPalette).toEqual([]);
    });

    it("coerces numberOfSwatches string to a number when calling extractPalette", async () => {
      const { result } = setup();
      act(() => {
        result.current.setNumberOfSwatches("8");
      });
      await act(async () => {
        await result.current.getPaletteFromUrl();
      });
      expect(mockExtractPalette).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ colorCount: 8 }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // handleFileChange
  // -------------------------------------------------------------------------

  describe("handleFileChange", () => {
    it("sets uploadedFile when a file is selected", () => {
      const { result } = setup();
      const event = {
        target: { files: [mockFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleFileChange(event);
      });

      expect(result.current.uploadedFile).toBe(mockFile);
    });

    it("sets uploadedFile to null when no file is selected", () => {
      const { result } = setup();

      // First set a file...
      act(() => {
        result.current.setUploadedFile(mockFile);
      });

      // ...then clear it via handleFileChange with empty files
      const event = {
        target: { files: null },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleFileChange(event);
      });

      expect(result.current.uploadedFile).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // uploadedFilePreview (useEffect)
  // -------------------------------------------------------------------------

  describe("uploadedFilePreview", () => {
    it("creates an object URL when a file is set", async () => {
      const { result } = setup();
      act(() => {
        result.current.setUploadedFile(mockFile);
      });
      await waitFor(() => {
        expect(result.current.uploadedFilePreview).toBe(mockObjectUrl);
      });
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockFile);
    });

    it("revokes the previous object URL when the file changes", async () => {
      const { result } = setup();

      act(() => {
        result.current.setUploadedFile(mockFile);
      });
      await waitFor(() => {
        expect(result.current.uploadedFilePreview).toBe(mockObjectUrl);
      });

      const secondFile = new File(["other"], "other.png", {
        type: "image/png",
      });
      act(() => {
        result.current.setUploadedFile(secondFile);
      });

      await waitFor(() => {
        expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockObjectUrl);
      });
    });

    it("sets uploadedFilePreview to null and revokes the URL when file is cleared", async () => {
      const { result } = setup();

      act(() => {
        result.current.setUploadedFile(mockFile);
      });
      await waitFor(() => {
        expect(result.current.uploadedFilePreview).toBe(mockObjectUrl);
      });

      act(() => {
        result.current.setUploadedFile(null);
      });
      await waitFor(() => {
        expect(result.current.uploadedFilePreview).toBeNull();
      });
    });

    it("revokes the object URL on unmount", async () => {
      const { result, unmount } = setup();

      act(() => {
        result.current.setUploadedFile(mockFile);
      });
      await waitFor(() => {
        expect(result.current.uploadedFilePreview).toBe(mockObjectUrl);
      });

      unmount();

      expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockObjectUrl);
    });
  });

  // -------------------------------------------------------------------------
  // getPaletteFromFile
  // -------------------------------------------------------------------------

  describe("getPaletteFromFile", () => {
    it("is a no-op when no file has been uploaded", async () => {
      const { result } = setup();
      await act(async () => {
        await result.current.getPaletteFromFile();
      });
      expect(mockExtractPalette).not.toHaveBeenCalled();
    });

    it("calls extractPalette with the uploaded File object", async () => {
      const { result } = setup();
      act(() => {
        result.current.setUploadedFile(mockFile);
      });
      await act(async () => {
        await result.current.getPaletteFromFile();
      });
      expect(mockExtractPalette).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({ colorCount: 6, format: "hex" }),
      );
    });

    it("sets isPending to true while extracting then false on success", async () => {
      let resolvePalette!: (value: string[]) => void;
      mockExtractPalette.mockReturnValueOnce(
        new Promise((res) => (resolvePalette = res)),
      );

      const { result } = setup();
      act(() => {
        result.current.setUploadedFile(mockFile);
      });

      act(() => {
        result.current.getPaletteFromFile();
      });
      expect(result.current.isPending).toBe(true);

      await act(async () => {
        resolvePalette(MOCK_PALETTE);
      });
      expect(result.current.isPending).toBe(false);
    });

    it("sets extractedPalette with the returned colours on success", async () => {
      const { result } = setup();
      act(() => {
        result.current.setUploadedFile(mockFile);
      });
      await act(async () => {
        await result.current.getPaletteFromFile();
      });
      expect(result.current.extractedPalette).toEqual(MOCK_PALETTE);
    });

    it("shows a success toast on success", async () => {
      const { result } = setup();
      act(() => {
        result.current.setUploadedFile(mockFile);
      });
      await act(async () => {
        await result.current.getPaletteFromFile();
      });
      expect(mockAddToast).toHaveBeenCalledWith(
        "Palette Generated Successfully",
      );
    });

    it("sets isPending to false and sets errorMessage on failure", async () => {
      const error = new Error("Read error");
      mockExtractPalette.mockRejectedValueOnce(error);

      const { result } = setup();
      act(() => {
        result.current.setUploadedFile(mockFile);
      });
      await act(async () => {
        await result.current.getPaletteFromFile();
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.errorMessage).toBe(error);
    });

    it("does not show a toast on file extraction failure", async () => {
      mockExtractPalette.mockRejectedValueOnce(new Error("fail"));

      const { result } = setup();
      act(() => {
        result.current.setUploadedFile(mockFile);
      });
      await act(async () => {
        await result.current.getPaletteFromFile();
      });

      // Unlike getPaletteFromUrl, getPaletteFromFile has no error toast
      expect(mockAddToast).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // closeModalAndReset
  // -------------------------------------------------------------------------

  describe("closeModalAndReset", () => {
    it("resets imageUrl to empty string", async () => {
      const { result } = setup();
      act(() => result.current.setImageUrl("https://example.com/img.png"));
      act(() => result.current.closeModalAndReset());
      expect(result.current.imageUrl).toBe("");
    });

    it("resets numberOfSwatches to the default '6'", async () => {
      const { result } = setup();
      act(() => result.current.setNumberOfSwatches("12"));
      act(() => result.current.closeModalAndReset());
      expect(result.current.numberOfSwatches).toBe("6");
    });

    it("clears extractedPalette", async () => {
      const { result } = setup();
      await act(async () => {
        await result.current.getPaletteFromUrl();
      });
      act(() => result.current.closeModalAndReset());
      expect(result.current.extractedPalette).toEqual([]);
    });

    it("clears uploadedFile and uploadedFilePreview", async () => {
      const { result } = setup();
      act(() => result.current.setUploadedFile(mockFile));
      await waitFor(() =>
        expect(result.current.uploadedFilePreview).toBe(mockObjectUrl),
      );

      act(() => result.current.closeModalAndReset());

      expect(result.current.uploadedFile).toBeNull();
      expect(result.current.uploadedFilePreview).toBeNull();
    });

    it("calls onClose", () => {
      const { result } = setup();
      act(() => result.current.closeModalAndReset());
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("resets all state in a single call", async () => {
      const { result } = setup();

      // Dirty all state
      act(() => {
        result.current.setImageUrl("https://example.com/img.png");
        result.current.setNumberOfSwatches("10");
        result.current.setUploadedFile(mockFile);
      });
      await act(async () => {
        await result.current.getPaletteFromUrl();
      });

      act(() => result.current.closeModalAndReset());

      expect(result.current.imageUrl).toBe("");
      expect(result.current.numberOfSwatches).toBe("6");
      expect(result.current.extractedPalette).toEqual([]);
      expect(result.current.uploadedFile).toBeNull();
      expect(result.current.uploadedFilePreview).toBeNull();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
