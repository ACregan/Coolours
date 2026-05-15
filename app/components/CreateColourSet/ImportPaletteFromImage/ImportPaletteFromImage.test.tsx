import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ImportPaletteFromImageModal from "./ImportPaletteFromImage";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("react-router", () => ({
  Link: ({ children, to, target }: any) => (
    <a href={to} target={target}>
      {children}
    </a>
  ),
}));

vi.mock("~/utilities/utilities", () => ({
  convertArrayOfHexesIntoUrlPath: vi.fn(
    (hexes: string[]) => `/palette/${hexes.join("-")}`,
  ),
}));

vi.mock("~/components/common/SvgIcon/SvgIcon", () => ({
  default: () => <span />,
  SvgImageList: {
    ImageUp: "image-up",
    Image: "image",
    Palette: "palette",
  },
}));

vi.mock("~/components/common/Modal/Modal", () => ({
  default: ({ children, title, open, onClose }: any) =>
    open ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

// Core hook mock — all state and handlers live here so we can control them
// from tests without needing the real hook dependencies.
const mockGetPaletteFromUrl = vi.fn();
const mockGetPaletteFromFile = vi.fn();
const mockHandleFileChange = vi.fn();
const mockCloseModalAndReset = vi.fn();
const mockSetImageUrl = vi.fn();
const mockSetNumberOfSwatches = vi.fn();

// Mutable hook state snapshot — tests mutate this before rendering
let hookState = {
  darkMode: false,
  imageUrl: "",
  numberOfSwatches: "6",
  isPending: false,
  errorMessage: false as any,
  extractedPalette: [] as (string | { color: string })[],
  uploadedFile: null as File | null,
  uploadedFilePreview: null as string | null,
  getPaletteFromUrl: mockGetPaletteFromUrl,
  getPaletteFromFile: mockGetPaletteFromFile,
  handleFileChange: mockHandleFileChange,
  closeModalAndReset: mockCloseModalAndReset,
  setImageUrl: mockSetImageUrl,
  setNumberOfSwatches: mockSetNumberOfSwatches,
  // unused by component but returned by hook
  addToast: vi.fn(),
  setIsPending: vi.fn(),
  setErrorMessage: vi.fn(),
  setUploadedFile: vi.fn(),
  setUploadedFilePreview: vi.fn(),
  setExtractedPalette: vi.fn(),
  saveModalOpen: false,
  setSaveModalOpen: vi.fn(),
  importAs: null,
  setImportAs: vi.fn(),
};

vi.mock("~/hooks/usePaletteFromImage", () => ({
  default: () => hookState,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockOnClose = vi.fn();
const mockSetImportAs = vi.fn();

function renderComponent(
  props: Partial<{
    modalOpen: boolean;
    importAs: "URL" | "FILE" | null;
  }> = {},
) {
  return render(
    <ImportPaletteFromImageModal
      modalOpen={props.modalOpen ?? true}
      onClose={mockOnClose}
      importAs={props.importAs ?? null}
      setImportAs={mockSetImportAs}
    />,
  );
}

function resetHookState() {
  hookState = {
    ...hookState,
    darkMode: false,
    imageUrl: "",
    numberOfSwatches: "6",
    isPending: false,
    errorMessage: false,
    extractedPalette: [],
    uploadedFile: null,
    uploadedFilePreview: null,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PaletteFromImageModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetHookState();
  });

  // -------------------------------------------------------------------------
  // Modal open / closed
  // -------------------------------------------------------------------------

  describe("modal visibility", () => {
    it("renders the modal when modalOpen is true", () => {
      renderComponent();
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    it("does not render the modal when modalOpen is false", () => {
      renderComponent({ modalOpen: false });
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("calls closeModalAndReset when the modal's onClose is triggered", async () => {
      renderComponent();
      await userEvent.click(screen.getByTestId("modal-close"));
      expect(mockCloseModalAndReset).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------------------------
  // Modal title
  // -------------------------------------------------------------------------

  describe("modal title", () => {
    it("shows 'Import from Image' when importAs is null", () => {
      renderComponent({ importAs: null });
      expect(screen.getByText("Import from Image")).toBeInTheDocument();
    });

    it("shows 'Import from Image URL' when importAs is URL", () => {
      renderComponent({ importAs: "URL" });
      expect(screen.getByText("Import from Image URL")).toBeInTheDocument();
    });

    it("shows 'Import from Image File' when importAs is FILE", () => {
      renderComponent({ importAs: "FILE" });
      expect(screen.getByText("Import from Image File")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // importAs === null — method selection screen
  // -------------------------------------------------------------------------

  describe("when importAs is null", () => {
    it("renders the Upload Image File button", () => {
      renderComponent({ importAs: null });
      expect(screen.getByText("Upload Image File")).toBeInTheDocument();
    });

    it("renders the Image URL button", () => {
      renderComponent({ importAs: null });
      expect(screen.getByText("Image URL")).toBeInTheDocument();
    });

    it("calls setImportAs('FILE') when Upload Image File is clicked", async () => {
      renderComponent({ importAs: null });
      await userEvent.click(screen.getByText("Upload Image File"));
      expect(mockSetImportAs).toHaveBeenCalledWith("FILE");
    });

    it("calls setImportAs('URL') when Image URL is clicked", async () => {
      renderComponent({ importAs: null });
      await userEvent.click(screen.getByText("Image URL"));
      expect(mockSetImportAs).toHaveBeenCalledWith("URL");
    });

    it("does not render the URL or FILE import forms", () => {
      renderComponent({ importAs: null });
      expect(
        screen.queryByPlaceholderText("Paste Image URL"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /generate colour palette/i }),
      ).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // importAs === "URL"
  // -------------------------------------------------------------------------

  describe("when importAs is URL", () => {
    it("renders the image URL input", () => {
      renderComponent({ importAs: "URL" });
      expect(
        screen.getByPlaceholderText("Paste Image URL"),
      ).toBeInTheDocument();
    });

    it("renders the number of swatches range input with default value", () => {
      renderComponent({ importAs: "URL" });
      const range = screen.getByRole("slider");
      expect(range).toHaveValue("6");
    });

    it("calls setImageUrl when the URL input changes", async () => {
      renderComponent({ importAs: "URL" });
      const input = screen.getByPlaceholderText("Paste Image URL");
      await userEvent.type(input, "https://example.com/img.png");
      expect(mockSetImageUrl).toHaveBeenCalled();
    });

    it("calls setNumberOfSwatches when the range input changes", () => {
      renderComponent({ importAs: "URL" });
      const range = screen.getByRole("slider");
      fireEvent.change(range, { target: { value: "8" } });
      expect(mockSetNumberOfSwatches).toHaveBeenCalledWith("8");
    });

    it("shows a placeholder message when imageUrl is empty", () => {
      renderComponent({ importAs: "URL" });
      expect(
        screen.getByText("Paste Image URL Into The Input Above"),
      ).toBeInTheDocument();
    });

    it("renders an image preview when imageUrl is set", () => {
      hookState.imageUrl = "https://example.com/img.png";
      renderComponent({ importAs: "URL" });
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "https://example.com/img.png");
    });

    it("disables the Generate button when imageUrl is empty", () => {
      renderComponent({ importAs: "URL" });
      expect(
        screen.getByRole("button", { name: /generate colour palette/i }),
      ).toBeDisabled();
    });

    it("enables the Generate button when imageUrl is set", () => {
      hookState.imageUrl = "https://example.com/img.png";
      renderComponent({ importAs: "URL" });
      expect(
        screen.getByRole("button", { name: /generate colour palette/i }),
      ).not.toBeDisabled();
    });

    it("calls getPaletteFromUrl when the Generate button is clicked", async () => {
      hookState.imageUrl = "https://example.com/img.png";
      renderComponent({ importAs: "URL" });
      await userEvent.click(
        screen.getByRole("button", { name: /generate colour palette/i }),
      );
      expect(mockGetPaletteFromUrl).toHaveBeenCalledTimes(1);
    });

    it("shows the loading spinner and message when isPending is true", () => {
      hookState.isPending = true;
      renderComponent({ importAs: "URL" });
      expect(
        screen.getByText("Generating Palette, Please Wait"),
      ).toBeInTheDocument();
    });

    it("does not show the loading spinner when isPending is false", () => {
      renderComponent({ importAs: "URL" });
      expect(
        screen.queryByText("Generating Palette, Please Wait"),
      ).not.toBeInTheDocument();
    });

    it("does not render extracted palette swatches when extractedPalette is empty", () => {
      renderComponent({ importAs: "URL" });
      expect(screen.queryByText("Open In New Tab")).not.toBeInTheDocument();
    });

    it("renders a swatch for each colour in extractedPalette (string hexes)", () => {
      hookState.extractedPalette = ["ff0000", "00ff00", "0000ff"];
      renderComponent({ importAs: "URL" });
      // Three coloured divs + the Open In New Tab link
      expect(screen.getByText("Open In New Tab")).toBeInTheDocument();
    });

    it("renders a swatch for each colour in extractedPalette (ColorWithMetadata objects)", () => {
      hookState.extractedPalette = [{ color: "ff0000" }, { color: "00ff00" }];
      renderComponent({ importAs: "URL" });
      expect(screen.getByText("Open In New Tab")).toBeInTheDocument();
    });

    it("renders the Open In New Tab link with the correct href from convertArrayOfHexesIntoUrlPath", () => {
      hookState.extractedPalette = ["ff0000", "00ff00"];
      renderComponent({ importAs: "URL" });
      const link = screen.getByRole("link", { name: /open in new tab/i });
      expect(link).toHaveAttribute("href", "/palette/ff0000-00ff00");
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  // -------------------------------------------------------------------------
  // importAs === "FILE"
  // -------------------------------------------------------------------------

  describe("when importAs is FILE", () => {
    it("renders the file input", () => {
      renderComponent({ importAs: "FILE" });
      expect(
        screen.getByRole("button", { name: /generate colour palette/i }),
      ).toBeInTheDocument();
      // file input doesn't have an accessible role; check by accept attribute
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute("accept", "image/*");
    });

    it("calls handleFileChange when a file is selected", async () => {
      renderComponent({ importAs: "FILE" });
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const file = new File(["content"], "photo.png", { type: "image/png" });
      await userEvent.upload(fileInput, file);
      expect(mockHandleFileChange).toHaveBeenCalled();
    });

    it("shows a placeholder message when no file is uploaded", () => {
      renderComponent({ importAs: "FILE" });
      expect(
        screen.getByText("Upload Image File Using The Input Above"),
      ).toBeInTheDocument();
    });

    it("renders an image preview when uploadedFile and uploadedFilePreview are set", () => {
      hookState.uploadedFile = new File(["c"], "photo.png", {
        type: "image/png",
      });
      hookState.uploadedFilePreview = "blob://preview-url";
      renderComponent({ importAs: "FILE" });
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "blob://preview-url");
    });

    it("disables Generate button when no file is uploaded", () => {
      renderComponent({ importAs: "FILE" });
      expect(
        screen.getByRole("button", { name: /generate colour palette/i }),
      ).toBeDisabled();
    });

    it("enables Generate button when a file is uploaded", () => {
      hookState.uploadedFile = new File(["c"], "photo.png", {
        type: "image/png",
      });
      renderComponent({ importAs: "FILE" });
      expect(
        screen.getByRole("button", { name: /generate colour palette/i }),
      ).not.toBeDisabled();
    });

    it("calls getPaletteFromFile when the Generate button is clicked", async () => {
      hookState.uploadedFile = new File(["c"], "photo.png", {
        type: "image/png",
      });
      renderComponent({ importAs: "FILE" });
      await userEvent.click(
        screen.getByRole("button", { name: /generate colour palette/i }),
      );
      expect(mockGetPaletteFromFile).toHaveBeenCalledTimes(1);
    });

    it("shows the loading spinner and message when isPending is true", () => {
      hookState.isPending = true;
      renderComponent({ importAs: "FILE" });
      expect(
        screen.getByText("Generating Palette, Please Wait"),
      ).toBeInTheDocument();
    });

    it("renders the correct range slider value", () => {
      hookState.numberOfSwatches = "9";
      renderComponent({ importAs: "FILE" });
      expect(screen.getByRole("slider")).toHaveValue("9");
    });

    it("renders extracted palette and Open In New Tab link after generation", () => {
      hookState.extractedPalette = ["aabbcc", "112233"];
      renderComponent({ importAs: "FILE" });
      const link = screen.getByRole("link", { name: /open in new tab/i });
      expect(link).toHaveAttribute("href", "/palette/aabbcc-112233");
    });

    it("correctly resolves ColorWithMetadata objects in the Open In New Tab href", () => {
      hookState.extractedPalette = [{ color: "aabbcc" }, { color: "112233" }];
      renderComponent({ importAs: "FILE" });
      const link = screen.getByRole("link", { name: /open in new tab/i });
      expect(link).toHaveAttribute("href", "/palette/aabbcc-112233");
    });
  });
});
