import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DeletePaletteConfirmationModal from "./DeletePaletteConfirmationModal";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock("~/components/common/Modal/Modal", () => ({
  default: ({ children, title, open, onClose, darkMode }: any) =>
    open ? (
      <div data-testid="modal" data-dark-mode={darkMode}>
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

const mockSetDeleteModalOpen = vi.fn();
const mockDeletePaletteFromLocalStorage = vi.fn();

function renderComponent(
  props: Partial<{
    swatchesName: string;
    deleteModalOpen: boolean;
    darkMode: boolean;
  }> = {},
) {
  return render(
    <DeletePaletteConfirmationModal
      swatchesName={props.swatchesName ?? "My Palette"}
      deleteModalOpen={props.deleteModalOpen ?? true}
      setDeleteModalOpen={mockSetDeleteModalOpen}
      darkMode={props.darkMode ?? false}
      deletePaletteFromLocalStorage={mockDeletePaletteFromLocalStorage}
    />,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DeletePaletteConfirmationModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Visibility
  // -------------------------------------------------------------------------

  describe("visibility", () => {
    it("renders the modal when deleteModalOpen is true", () => {
      renderComponent({ deleteModalOpen: true });
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    it("does not render the modal when deleteModalOpen is false", () => {
      renderComponent({ deleteModalOpen: false });
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
        screen.getByText("Delete Palette: Sunset Vibes"),
      ).toBeInTheDocument();
    });

    it("reflects a different swatchesName in the title", () => {
      renderComponent({ swatchesName: "Ocean Blues" });
      expect(
        screen.getByText("Delete Palette: Ocean Blues"),
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // darkMode prop
  // -------------------------------------------------------------------------

  describe("darkMode", () => {
    it("passes darkMode=true to the Modal", () => {
      renderComponent({ darkMode: true });
      expect(screen.getByTestId("modal")).toHaveAttribute(
        "data-dark-mode",
        "true",
      );
    });

    it("passes darkMode=false to the Modal", () => {
      renderComponent({ darkMode: false });
      expect(screen.getByTestId("modal")).toHaveAttribute(
        "data-dark-mode",
        "false",
      );
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

    it("calls deletePaletteFromLocalStorage when YES is clicked", async () => {
      renderComponent();
      await userEvent.click(screen.getByRole("button", { name: /yes/i }));
      expect(mockDeletePaletteFromLocalStorage).toHaveBeenCalledTimes(1);
    });

    it("does not call setDeleteModalOpen when YES is clicked", async () => {
      renderComponent();
      await userEvent.click(screen.getByRole("button", { name: /yes/i }));
      expect(mockSetDeleteModalOpen).not.toHaveBeenCalled();
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

    it("calls setDeleteModalOpen(false) when NO is clicked", async () => {
      renderComponent();
      await userEvent.click(screen.getByRole("button", { name: /no/i }));
      expect(mockSetDeleteModalOpen).toHaveBeenCalledWith(false);
    });

    it("does not call deletePaletteFromLocalStorage when NO is clicked", async () => {
      renderComponent();
      await userEvent.click(screen.getByRole("button", { name: /no/i }));
      expect(mockDeletePaletteFromLocalStorage).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Modal onClose (X / backdrop)
  // -------------------------------------------------------------------------

  describe("modal onClose", () => {
    it("calls setDeleteModalOpen(false) when the modal is dismissed", async () => {
      renderComponent();
      await userEvent.click(screen.getByTestId("modal-close"));
      expect(mockSetDeleteModalOpen).toHaveBeenCalledWith(false);
    });

    it("does not call deletePaletteFromLocalStorage when the modal is dismissed", async () => {
      renderComponent();
      await userEvent.click(screen.getByTestId("modal-close"));
      expect(mockDeletePaletteFromLocalStorage).not.toHaveBeenCalled();
    });
  });
});
