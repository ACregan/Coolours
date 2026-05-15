import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import OverwriteExistingPaletteModal from "./OverwriteExistingPaletteModal";

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
  SvgImageList: { CircleTick: "circle-tick", CircleCross: "circle-cross" },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockSetSaveModalOpen = vi.fn();
const mockOverwritePaletteInLocalStorage = vi.fn();

function renderComponent(
  props: Partial<{
    swatchesName: string;
    saveModalOpen: boolean;
    darkMode: boolean;
  }> = {},
) {
  return render(
    <OverwriteExistingPaletteModal
      swatchesName={props.swatchesName ?? "My Palette"}
      saveModalOpen={props.saveModalOpen ?? true}
      setSaveModalOpen={mockSetSaveModalOpen}
      darkMode={props.darkMode ?? false}
      overwritePaletteInLocalStorage={mockOverwritePaletteInLocalStorage}
    />,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("OverwriteExistingPaletteModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Visibility
  // -------------------------------------------------------------------------

  describe("visibility", () => {
    it("renders the modal when saveModalOpen is true", () => {
      renderComponent({ saveModalOpen: true });
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    it("does not render the modal when saveModalOpen is false", () => {
      renderComponent({ saveModalOpen: false });
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Title
  // -------------------------------------------------------------------------

  describe("title", () => {
    it("includes the swatchesName in the modal title", () => {
      renderComponent({ swatchesName: "Sunset Vibes" });
      expect(
        screen.getByText("Overwrite Existing Palette: Sunset Vibes"),
      ).toBeInTheDocument();
    });

    it("reflects a different swatchesName in the title", () => {
      renderComponent({ swatchesName: "Ocean Blues" });
      expect(
        screen.getByText("Overwrite Existing Palette: Ocean Blues"),
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // YES button
  // -------------------------------------------------------------------------

  describe("YES button", () => {
    it("renders the YES button", () => {
      renderComponent();
      expect(screen.getByRole("button", { name: /yes/i })).toBeInTheDocument();
    });

    it("calls overwritePaletteInLocalStorage when YES is clicked", async () => {
      renderComponent();
      await userEvent.click(screen.getByRole("button", { name: /yes/i }));
      expect(mockOverwritePaletteInLocalStorage).toHaveBeenCalledTimes(1);
    });

    it("does not call setSaveModalOpen when YES is clicked", async () => {
      renderComponent();
      await userEvent.click(screen.getByRole("button", { name: /yes/i }));
      expect(mockSetSaveModalOpen).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // NO button
  // -------------------------------------------------------------------------

  describe("NO button", () => {
    it("renders the NO button", () => {
      renderComponent();
      expect(screen.getByRole("button", { name: /no/i })).toBeInTheDocument();
    });

    it("calls setSaveModalOpen(false) when NO is clicked", async () => {
      renderComponent();
      await userEvent.click(screen.getByRole("button", { name: /no/i }));
      expect(mockSetSaveModalOpen).toHaveBeenCalledWith(false);
    });

    it("does not call overwritePaletteInLocalStorage when NO is clicked", async () => {
      renderComponent();
      await userEvent.click(screen.getByRole("button", { name: /no/i }));
      expect(mockOverwritePaletteInLocalStorage).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Modal onClose (X / backdrop)
  // -------------------------------------------------------------------------

  describe("modal onClose", () => {
    it("calls setSaveModalOpen(false) when the modal is dismissed", async () => {
      renderComponent();
      await userEvent.click(screen.getByTestId("modal-close"));
      expect(mockSetSaveModalOpen).toHaveBeenCalledWith(false);
    });

    it("does not call overwritePaletteInLocalStorage when the modal is dismissed", async () => {
      renderComponent();
      await userEvent.click(screen.getByTestId("modal-close"));
      expect(mockOverwritePaletteInLocalStorage).not.toHaveBeenCalled();
    });
  });
});
