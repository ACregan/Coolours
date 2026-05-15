import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ExportAsModal from "./ExportAsModal";
import type { swatchType } from "~/types/commonTypes";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

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

vi.mock("~/components/common/SvgIcon/SvgIcon", () => ({
  default: () => <span />,
  SvgImageList: {
    Css: "css",
    Js: "js",
    ArrowBack: "arrow-back",
    Copy: "copy",
  },
}));

const {
  mockAddToast,
  mockCopyToClipboard,
  mockGenerateExportCSS,
  mockGenerateExportJS,
} = vi.hoisted(() => ({
  mockAddToast: vi.fn(),
  mockCopyToClipboard: vi.fn(),
  mockGenerateExportCSS: vi.fn(() => ":root { --color-0: #ff0000; }"),
  mockGenerateExportJS: vi.fn(() => 'const colors = { color0: "#ff0000" };'),
}));

vi.mock("~/components/common/Toast/ToastProvider", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

vi.mock("~/components/common/DarkMode/DarkModeContext", () => ({
  useTheme: () => ({ darkMode: false }),
}));

vi.mock("~/utilities/utilities", () => ({
  copyToClipboard: mockCopyToClipboard,
  generateExportCSS: mockGenerateExportCSS,
  generateExportJS: mockGenerateExportJS,
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_SWATCHES: swatchType[] = [
  { hex: "ff0000", id: "1" },
  { hex: "00ff00", id: "2" },
  { hex: "0000ff", id: "3" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockOnClose = vi.fn();
const mockSetExportAs = vi.fn();

function renderComponent(
  props: Partial<{
    modalOpen: boolean;
    exportAs: "CSS" | "JS" | null;
    swatchesList: swatchType[];
  }> = {},
) {
  return render(
    <ExportAsModal
      modalOpen={props.modalOpen ?? true}
      onClose={mockOnClose}
      exportAs={props.exportAs ?? null}
      setExportAs={mockSetExportAs}
      swatchesList={props.swatchesList ?? MOCK_SWATCHES}
    />,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ExportAsModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Visibility
  // -------------------------------------------------------------------------

  describe("visibility", () => {
    it("renders the modal when modalOpen is true", () => {
      renderComponent({ modalOpen: true });
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    it("does not render the modal when modalOpen is false", () => {
      renderComponent({ modalOpen: false });
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    it("calls onClose when the modal is dismissed", async () => {
      renderComponent();
      await userEvent.click(screen.getByTestId("modal-close"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------------------------
  // Title
  // -------------------------------------------------------------------------

  describe("title", () => {
    it("shows 'Export as...' when exportAs is null", () => {
      renderComponent({ exportAs: null });
      expect(screen.getByText("Export as...")).toBeInTheDocument();
    });

    it("shows 'Export as CSS' when exportAs is CSS", () => {
      renderComponent({ exportAs: "CSS" });
      expect(screen.getByText("Export as CSS")).toBeInTheDocument();
    });

    it("shows 'Export as JS' when exportAs is JS", () => {
      renderComponent({ exportAs: "JS" });
      expect(screen.getByText("Export as JS")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // exportAs === null — format selection screen
  // -------------------------------------------------------------------------

  describe("when exportAs is null", () => {
    it("renders the CSS Variables button", () => {
      renderComponent({ exportAs: null });
      expect(screen.getByText("CSS Variables")).toBeInTheDocument();
    });

    it("renders the JSON / Javascript button", () => {
      renderComponent({ exportAs: null });
      expect(screen.getByText("JSON / Javascript")).toBeInTheDocument();
    });

    it("calls setExportAs('CSS') when CSS Variables is clicked", async () => {
      renderComponent({ exportAs: null });
      await userEvent.click(screen.getByText("CSS Variables"));
      expect(mockSetExportAs).toHaveBeenCalledWith("CSS");
    });

    it("calls setExportAs('JS') when JSON / Javascript is clicked", async () => {
      renderComponent({ exportAs: null });
      await userEvent.click(screen.getByText("JSON / Javascript"));
      expect(mockSetExportAs).toHaveBeenCalledWith("JS");
    });

    it("does not render the code block or action buttons", () => {
      renderComponent({ exportAs: null });
      expect(
        screen.queryByRole("button", { name: /back/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /copy to clipboard/i }),
      ).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // exportAs === "CSS"
  // -------------------------------------------------------------------------

  describe("when exportAs is CSS", () => {
    it("calls generateExportCSS with the swatches list", () => {
      renderComponent({ exportAs: "CSS" });
      expect(mockGenerateExportCSS).toHaveBeenCalledWith(MOCK_SWATCHES);
    });

    it("renders the generated CSS output in a code block", () => {
      renderComponent({ exportAs: "CSS" });
      expect(
        screen.getByText(":root { --color-0: #ff0000; }"),
      ).toBeInTheDocument();
    });

    it("renders the Back button", () => {
      renderComponent({ exportAs: "CSS" });
      expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    });

    it("calls setExportAs(null) when Back is clicked", async () => {
      renderComponent({ exportAs: "CSS" });
      await userEvent.click(screen.getByRole("button", { name: /back/i }));
      expect(mockSetExportAs).toHaveBeenCalledWith(null);
    });

    it("renders the Copy To Clipboard button", () => {
      renderComponent({ exportAs: "CSS" });
      expect(
        screen.getByRole("button", { name: /copy to clipboard/i }),
      ).toBeInTheDocument();
    });

    it("calls copyToClipboard with the CSS output when Copy To Clipboard is clicked", async () => {
      renderComponent({ exportAs: "CSS" });
      await userEvent.click(
        screen.getByRole("button", { name: /copy to clipboard/i }),
      );
      expect(mockCopyToClipboard).toHaveBeenCalledWith(
        ":root { --color-0: #ff0000; }",
      );
    });

    it("shows the correct CSS toast message when Copy To Clipboard is clicked", async () => {
      renderComponent({ exportAs: "CSS" });
      await userEvent.click(
        screen.getByRole("button", { name: /copy to clipboard/i }),
      );
      expect(mockAddToast).toHaveBeenCalledWith(
        "Colours Copied To Clipboard As CSS Custom Properties",
      );
    });

    it("does not render the format selection buttons", () => {
      renderComponent({ exportAs: "CSS" });
      expect(screen.queryByText("CSS Variables")).not.toBeInTheDocument();
      expect(screen.queryByText("JSON / Javascript")).not.toBeInTheDocument();
    });

    it("does not call generateExportJS", () => {
      renderComponent({ exportAs: "CSS" });
      expect(mockGenerateExportJS).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // exportAs === "JS"
  // -------------------------------------------------------------------------

  describe("when exportAs is JS", () => {
    it("calls generateExportJS with the swatches list", () => {
      renderComponent({ exportAs: "JS" });
      expect(mockGenerateExportJS).toHaveBeenCalledWith(MOCK_SWATCHES);
    });

    it("renders the generated JS output in a code block", () => {
      renderComponent({ exportAs: "JS" });
      expect(
        screen.getByText('const colors = { color0: "#ff0000" };'),
      ).toBeInTheDocument();
    });

    it("renders the Back button", () => {
      renderComponent({ exportAs: "JS" });
      expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    });

    it("calls setExportAs(null) when Back is clicked", async () => {
      renderComponent({ exportAs: "JS" });
      await userEvent.click(screen.getByRole("button", { name: /back/i }));
      expect(mockSetExportAs).toHaveBeenCalledWith(null);
    });

    it("renders the Copy To Clipboard button", () => {
      renderComponent({ exportAs: "JS" });
      expect(
        screen.getByRole("button", { name: /copy to clipboard/i }),
      ).toBeInTheDocument();
    });

    it("calls copyToClipboard with the JS output when Copy To Clipboard is clicked", async () => {
      renderComponent({ exportAs: "JS" });
      await userEvent.click(
        screen.getByRole("button", { name: /copy to clipboard/i }),
      );
      expect(mockCopyToClipboard).toHaveBeenCalledWith(
        'const colors = { color0: "#ff0000" };',
      );
    });

    it("shows the correct JS toast message when Copy To Clipboard is clicked", async () => {
      renderComponent({ exportAs: "JS" });
      await userEvent.click(
        screen.getByRole("button", { name: /copy to clipboard/i }),
      );
      expect(mockAddToast).toHaveBeenCalledWith(
        "Colours Copied To Clipboard As JS Object",
      );
    });

    it("does not render the format selection buttons", () => {
      renderComponent({ exportAs: "JS" });
      expect(screen.queryByText("CSS Variables")).not.toBeInTheDocument();
      expect(screen.queryByText("JSON / Javascript")).not.toBeInTheDocument();
    });

    it("does not call generateExportCSS", () => {
      renderComponent({ exportAs: "JS" });
      expect(mockGenerateExportCSS).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Copy To Clipboard — shared behaviour
  // -------------------------------------------------------------------------

  describe("copy to clipboard", () => {
    it("calls both addToast and copyToClipboard together on a single click (CSS)", async () => {
      renderComponent({ exportAs: "CSS" });
      await userEvent.click(
        screen.getByRole("button", { name: /copy to clipboard/i }),
      );
      expect(mockAddToast).toHaveBeenCalledTimes(1);
      expect(mockCopyToClipboard).toHaveBeenCalledTimes(1);
    });

    it("calls both addToast and copyToClipboard together on a single click (JS)", async () => {
      renderComponent({ exportAs: "JS" });
      await userEvent.click(
        screen.getByRole("button", { name: /copy to clipboard/i }),
      );
      expect(mockAddToast).toHaveBeenCalledTimes(1);
      expect(mockCopyToClipboard).toHaveBeenCalledTimes(1);
    });

    it("passes the same generated string to copyToClipboard as what is rendered in the code block (CSS)", async () => {
      const cssOutput = "/* custom output */";
      mockGenerateExportCSS.mockReturnValue(cssOutput);
      renderComponent({ exportAs: "CSS" });
      await userEvent.click(
        screen.getByRole("button", { name: /copy to clipboard/i }),
      );
      expect(screen.getByText(cssOutput)).toBeInTheDocument();
      expect(mockCopyToClipboard).toHaveBeenCalledWith(cssOutput);
    });

    it("passes the same generated string to copyToClipboard as what is rendered in the code block (JS)", async () => {
      const jsOutput = "/* custom js output */";
      mockGenerateExportJS.mockReturnValue(jsOutput);
      renderComponent({ exportAs: "JS" });
      await userEvent.click(
        screen.getByRole("button", { name: /copy to clipboard/i }),
      );
      expect(screen.getByText(jsOutput)).toBeInTheDocument();
      expect(mockCopyToClipboard).toHaveBeenCalledWith(jsOutput);
    });
  });
});
