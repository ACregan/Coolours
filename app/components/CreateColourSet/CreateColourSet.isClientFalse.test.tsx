import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("~/hooks/useCreateColourSet", () => ({
  default: () => ({
    palettes: [],
    savePalettes: vi.fn(),
    removePalette: vi.fn(),
    isClient: false,
    setIsClient: vi.fn(),
    swatchesName: "Test Palette",
    setSwatchesName: vi.fn(),
    swatchesList: [],
    setSwatchesList: vi.fn(),
    toggleLockSwatch: vi.fn(),
    randomiseUnlockedSwatches: vi.fn(),
    moveSwatch: vi.fn(),
    addSwatch: vi.fn(),
    removeSwatch: vi.fn(),
    editSwatch: vi.fn(),
    exportModalOpen: false,
    setExportModalOpen: vi.fn(),
    exportAs: null,
    setExportAs: vi.fn(),
    closeExportModal: vi.fn(),
    paletteFromImageModalOpen: false,
    setPaletteFromImageModalOpen: vi.fn(),
    importAs: null,
    setImportAs: vi.fn(),
    closePaletteFromImageModal: vi.fn(),
    darkMode: false,
    addToast: vi.fn(),
    swatchTitleInputRef: React.createRef<HTMLInputElement>(),
    saveModalOpen: false,
    setSaveModalOpen: vi.fn(),
    savePaletteToLocalStorage: vi.fn(),
    overwritePaletteInLocalStorage: vi.fn(),
    deleteModalOpen: false,
    setDeleteModalOpen: vi.fn(),
    deletePaletteFromLocalStorage: vi.fn(),
    currentSwatchesAreInLocalStorage: false,
  }),
}));

vi.mock("../common/ColourSwatch/ColourSwatch", () => ({
  default: () => <div data-testid="swatch-placeholder" />,
}));

vi.mock("../common/ColourSwatchContainer/ColourSwatchContainer", () => ({
  default: ({ children }: any) => (
    <div data-testid="swatch-container">{children}</div>
  ),
}));

vi.mock("../common/SvgIcon/SvgIcon", () => ({
  default: () => <span data-testid="icon-placeholder" />,
  SvgImageList: {
    Delete: "delete",
    Save: "save",
    Palette: "palette",
    Dropper: "dropper",
    Export: "export",
  },
}));

vi.mock("./ExportAsModal/ExportAsModal", () => ({
  default: ({ modalOpen }: any) =>
    modalOpen ? <div data-testid="export-modal" /> : null,
}));

vi.mock("./ImportPaletteFromImage/ImportPaletteFromImage", () => ({
  default: ({ modalOpen }: any) =>
    modalOpen ? <div data-testid="import-modal" /> : null,
}));

vi.mock(
  "./OverwriteExistingPaletteModal/OverwriteExistingPaletteModal",
  () => ({
    default: () => <div data-testid="overwrite-modal" />,
  }),
);

vi.mock(
  "./DeletePaletteConfirmationModal/DeletePaletteConfirmationModal",
  () => ({
    default: () => <div data-testid="delete-modal" />,
  }),
);

vi.mock("../common/Tooltip/Tooltip", () => ({
  default: ({ children }: any) => <>{children}</>,
  TooltipBubble: ({ children }: any) => <>{children}</>,
}));

vi.mock("~/hooks/useGoogleAnalytics", () => ({
  trackClientAnalyticsEvent: vi.fn(),
}));

import { CreateColourSet } from "./CreateColourSet";

describe("CreateColourSet with isClient false", () => {
  it("does not render the swatch container when isClient is false", () => {
    render(<CreateColourSet swatchesFromUrl={[]} swatchesNameFromUrl="Test" />);

    expect(screen.queryByTestId("swatch-container")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("Test Palette");
  });
});
