import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DeletePaletteConfirmationModal from "./DeletePaletteConfirmationModal";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("./DeletePaletteConfirmationModal.module.css", () => ({
  default: {
    contentContainer: "contentContainer",
    overwriteButtonContainer: "overwriteButtonContainer",
  },
}));

// Modal — render children and a close button so we can test onClose behaviour
vi.mock("~/components/common/Modal/Modal", () => ({
  default: ({
    title,
    open,
    onClose,
    darkMode,
    children,
  }: {
    title: string;
    open: boolean;
    onClose: () => void;
    darkMode: boolean;
    children: React.ReactNode;
  }) =>
    open ? (
      <div
        data-testid="modal"
        data-title={title}
        data-darkmode={String(darkMode)}
      >
        <button data-testid="modal-close-btn" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    ) : null,
}));

// LittleBigButton — expose all props as data attributes so we can assert them
vi.mock("~/components/common/BigButton/LittleBigButton", () => ({
  default: ({
    size,
    onClick,
    svgIconName,
    label,
    darkMode,
    status,
  }: {
    size: string;
    onClick: () => void;
    svgIconName: string;
    label: string;
    darkMode: boolean;
    status?: string;
  }) => (
    <button
      data-testid={`lbb-${label}`}
      data-size={size}
      data-svgiconname={svgIconName}
      data-darkmode={String(darkMode)}
      data-status={status}
      onClick={onClick}
    >
      {label}
    </button>
  ),
}));

// SvgImageList values used by the component
vi.mock("~/components/common/SvgIcon/SvgIcon", () => ({
  default: () => <svg />,
  SvgImageList: {
    CircleTick: "CircleTick",
    CircleCross: "CircleCross",
  },
}));

// ---------------------------------------------------------------------------
// Shared props factory
// ---------------------------------------------------------------------------

const makeProps = (overrides = {}) => ({
  swatchesName: "My Palette",
  deleteModalOpen: true,
  setDeleteModalOpen: vi.fn(),
  darkMode: false,
  deletePaletteFromLocalStorage: vi.fn(),
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DeletePaletteConfirmationModal", () => {
  beforeEach(() => vi.clearAllMocks());

  // --- Modal visibility ---

  describe("Modal visibility", () => {
    it("renders the modal when deleteModalOpen is true", () => {
      render(<DeletePaletteConfirmationModal {...makeProps()} />);
      expect(screen.getByTestId("modal")).toBeDefined();
    });

    it("does not render the modal when deleteModalOpen is false", () => {
      render(
        <DeletePaletteConfirmationModal
          {...makeProps({ deleteModalOpen: false })}
        />,
      );
      expect(screen.queryByTestId("modal")).toBeNull();
    });
  });

  // --- Modal props ---

  describe("Modal props", () => {
    it("passes the correct title to Modal", () => {
      render(<DeletePaletteConfirmationModal {...makeProps()} />);
      expect(screen.getByTestId("modal").getAttribute("data-title")).toBe(
        "Delete Palette?",
      );
    });

    it("passes darkMode=false to Modal", () => {
      render(
        <DeletePaletteConfirmationModal {...makeProps({ darkMode: false })} />,
      );
      expect(screen.getByTestId("modal").getAttribute("data-darkmode")).toBe(
        "false",
      );
    });

    it("passes darkMode=true to Modal", () => {
      render(
        <DeletePaletteConfirmationModal {...makeProps({ darkMode: true })} />,
      );
      expect(screen.getByTestId("modal").getAttribute("data-darkmode")).toBe(
        "true",
      );
    });

    it("calls setDeleteModalOpen(false) when Modal's onClose fires", () => {
      const setDeleteModalOpen = vi.fn();
      render(
        <DeletePaletteConfirmationModal
          {...makeProps({ setDeleteModalOpen })}
        />,
      );
      fireEvent.click(screen.getByTestId("modal-close-btn"));
      expect(setDeleteModalOpen).toHaveBeenCalledWith(false);
      expect(setDeleteModalOpen).toHaveBeenCalledTimes(1);
    });
  });

  // --- Confirmation message ---

  describe("Confirmation message", () => {
    it("renders the confirmation question", () => {
      render(<DeletePaletteConfirmationModal {...makeProps()} />);
      expect(
        screen.getByText(/Are you sure you want to delete the palette/i),
      ).toBeDefined();
    });

    it("displays the palette name in the message", () => {
      render(
        <DeletePaletteConfirmationModal
          {...makeProps({ swatchesName: "Sunset Hues" })}
        />,
      );
      expect(screen.getByText(/"Sunset Hues"/)).toBeDefined();
    });

    it("updates the displayed name when swatchesName changes", () => {
      render(
        <DeletePaletteConfirmationModal
          {...makeProps({ swatchesName: "Ocean Blues" })}
        />,
      );
      expect(screen.getByText(/"Ocean Blues"/)).toBeDefined();
    });
  });

  // --- YES button (confirm delete) ---

  describe("YES button", () => {
    it("renders the YES button", () => {
      render(<DeletePaletteConfirmationModal {...makeProps()} />);
      expect(screen.getByTestId("lbb-YES")).toBeDefined();
    });

    it("calls deletePaletteFromLocalStorage when YES is clicked", () => {
      const deletePaletteFromLocalStorage = vi.fn();
      render(
        <DeletePaletteConfirmationModal
          {...makeProps({ deletePaletteFromLocalStorage })}
        />,
      );
      fireEvent.click(screen.getByTestId("lbb-YES"));
      expect(deletePaletteFromLocalStorage).toHaveBeenCalledTimes(1);
    });

    it("does not call setDeleteModalOpen when YES is clicked", () => {
      const setDeleteModalOpen = vi.fn();
      const deletePaletteFromLocalStorage = vi.fn();
      render(
        <DeletePaletteConfirmationModal
          {...makeProps({ setDeleteModalOpen, deletePaletteFromLocalStorage })}
        />,
      );
      fireEvent.click(screen.getByTestId("lbb-YES"));
      expect(setDeleteModalOpen).not.toHaveBeenCalled();
    });

    it("passes size='little' to the YES button", () => {
      render(<DeletePaletteConfirmationModal {...makeProps()} />);
      expect(screen.getByTestId("lbb-YES").getAttribute("data-size")).toBe(
        "little",
      );
    });

    it("passes status='danger' to the YES button", () => {
      render(<DeletePaletteConfirmationModal {...makeProps()} />);
      expect(screen.getByTestId("lbb-YES").getAttribute("data-status")).toBe(
        "danger",
      );
    });

    it("passes CircleTick icon to the YES button", () => {
      render(<DeletePaletteConfirmationModal {...makeProps()} />);
      expect(
        screen.getByTestId("lbb-YES").getAttribute("data-svgiconname"),
      ).toBe("CircleTick");
    });

    it("passes darkMode to the YES button", () => {
      render(
        <DeletePaletteConfirmationModal {...makeProps({ darkMode: true })} />,
      );
      expect(screen.getByTestId("lbb-YES").getAttribute("data-darkmode")).toBe(
        "true",
      );
    });
  });

  // --- NO button (cancel) ---

  describe("NO button", () => {
    it("renders the NO button", () => {
      render(<DeletePaletteConfirmationModal {...makeProps()} />);
      expect(screen.getByTestId("lbb-NO")).toBeDefined();
    });

    it("calls setDeleteModalOpen(false) when NO is clicked", () => {
      const setDeleteModalOpen = vi.fn();
      render(
        <DeletePaletteConfirmationModal
          {...makeProps({ setDeleteModalOpen })}
        />,
      );
      fireEvent.click(screen.getByTestId("lbb-NO"));
      expect(setDeleteModalOpen).toHaveBeenCalledWith(false);
      expect(setDeleteModalOpen).toHaveBeenCalledTimes(1);
    });

    it("does not call deletePaletteFromLocalStorage when NO is clicked", () => {
      const deletePaletteFromLocalStorage = vi.fn();
      render(
        <DeletePaletteConfirmationModal
          {...makeProps({ deletePaletteFromLocalStorage })}
        />,
      );
      fireEvent.click(screen.getByTestId("lbb-NO"));
      expect(deletePaletteFromLocalStorage).not.toHaveBeenCalled();
    });

    it("passes size='little' to the NO button", () => {
      render(<DeletePaletteConfirmationModal {...makeProps()} />);
      expect(screen.getByTestId("lbb-NO").getAttribute("data-size")).toBe(
        "little",
      );
    });

    it("passes status='success' to the NO button", () => {
      render(<DeletePaletteConfirmationModal {...makeProps()} />);
      expect(screen.getByTestId("lbb-NO").getAttribute("data-status")).toBe(
        "success",
      );
    });

    it("passes CircleCross icon to the NO button", () => {
      render(<DeletePaletteConfirmationModal {...makeProps()} />);
      expect(
        screen.getByTestId("lbb-NO").getAttribute("data-svgiconname"),
      ).toBe("CircleCross");
    });

    it("passes darkMode to the NO button", () => {
      render(
        <DeletePaletteConfirmationModal {...makeProps({ darkMode: true })} />,
      );
      expect(screen.getByTestId("lbb-NO").getAttribute("data-darkmode")).toBe(
        "true",
      );
    });
  });

  // --- Side-effect isolation ---

  describe("Side-effect isolation", () => {
    it("clicking YES does not also trigger the NO action", () => {
      const setDeleteModalOpen = vi.fn();
      const deletePaletteFromLocalStorage = vi.fn();
      render(
        <DeletePaletteConfirmationModal
          {...makeProps({ setDeleteModalOpen, deletePaletteFromLocalStorage })}
        />,
      );
      fireEvent.click(screen.getByTestId("lbb-YES"));
      expect(setDeleteModalOpen).not.toHaveBeenCalled();
    });

    it("clicking NO does not also trigger the YES action", () => {
      const setDeleteModalOpen = vi.fn();
      const deletePaletteFromLocalStorage = vi.fn();
      render(
        <DeletePaletteConfirmationModal
          {...makeProps({ setDeleteModalOpen, deletePaletteFromLocalStorage })}
        />,
      );
      fireEvent.click(screen.getByTestId("lbb-NO"));
      expect(deletePaletteFromLocalStorage).not.toHaveBeenCalled();
    });
  });
});
