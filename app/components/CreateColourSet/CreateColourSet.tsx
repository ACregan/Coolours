import React from "react";
import { GetColorName } from "hex-color-to-color-name";
import styles from "./CreateColourSet.module.css";
import ColourSwatch from "../common/ColourSwatch/ColourSwatch";
import ColourSwatchContainer from "../common/ColourSwatchContainer/ColourSwatchContainer";
import type { swatchType } from "~/types/commonTypes";
import SvgIcon, { SvgImageList } from "../common/SvgIcon/SvgIcon";
import ImportPaletteFromImageModal from "./ImportPaletteFromImage/ImportPaletteFromImage";
import ExportAsModal from "./ExportAsModal/ExportAsModal";
import Tooltip, { TooltipBubble } from "../common/Tooltip/Tooltip";
import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";
import OverwriteExistingPaletteModal from "./OverwriteExistingPaletteModal/OverwriteExistingPaletteModal";
import DeletePaletteConfirmationModal from "./DeletePaletteConfirmationModal/DeletePaletteConfirmationModal";
import useCreateColourSet from "~/hooks/useCreateColourSet";

interface CreateColourSetProps {
  swatchesFromUrl?: swatchType[];
  swatchesNameFromUrl?: string;
}

export const CreateColourSet: React.FC<CreateColourSetProps> = ({
  swatchesFromUrl,
  swatchesNameFromUrl,
}) => {
  const {
    palettes,
    savePalettes,
    removePalette,
    isClient,
    setIsClient,
    swatchesName,
    setSwatchesName,
    swatchesList,
    setSwatchesList,
    toggleLockSwatch,
    randomiseUnlockedSwatches,
    moveSwatch,
    addSwatch,
    removeSwatch,
    editSwatch,
    exportModalOpen,
    setExportModalOpen,
    exportAs,
    setExportAs,
    closeExportModal,
    paletteFromImageModalOpen,
    setPaletteFromImageModalOpen,
    importAs,
    setImportAs,
    closePaletteFromImageModal,
    darkMode,
    addToast,
    swatchTitleInputRef,
    saveModalOpen,
    setSaveModalOpen,
    savePaletteToLocalStorage,
    overwritePaletteInLocalStorage,
    deleteModalOpen,
    setDeleteModalOpen,
    deletePaletteFromLocalStorage,
    currentSwatchesAreInLocalStorage,
  } = useCreateColourSet({ swatchesFromUrl, swatchesNameFromUrl });

  return (
    <div className={styles.createContainer}>
      <div className={styles.swatchNameAndButtonsContainer}>
        <input
          id="swatch-title-input"
          ref={swatchTitleInputRef}
          className={`${styles.editableSwatchSetLabelInput} ${darkMode && styles.darkMode}`}
          type="text"
          value={swatchesName}
          onChange={(e) => setSwatchesName(e.target.value)}
        ></input>

        <Tooltip
          anchorName="Delete From Device"
          anchorPosition="bottom"
          anchorContent={
            <TooltipBubble pointerLocation="top">
              Delete Palette from the
              <br />
              browsers local system storage
              <br />
              <span className="keyboard-key">D</span>
            </TooltipBubble>
          }
        >
          <button
            className={styles.swatchActionButton}
            type="button"
            onClick={() => {
              trackClientAnalyticsEvent("delete_from_device_click");
              // randomiseUnlockedSwatches();
              setDeleteModalOpen(true);
            }}
            disabled={currentSwatchesAreInLocalStorage === false}
          >
            <SvgIcon name={SvgImageList.Delete} fill="white" />
            <span>
              DELETE FROM <br />
              DEVICE
            </span>
          </button>
        </Tooltip>

        <Tooltip
          anchorName="Save To Device"
          anchorPosition="bottom"
          anchorContent={
            <TooltipBubble pointerLocation="top">
              Save colour palette to the
              <br />
              browsers local system storage
              <br />
              <span className="keyboard-key">S</span>
            </TooltipBubble>
          }
        >
          <button
            className={styles.swatchActionButton}
            type="button"
            onClick={() => {
              trackClientAnalyticsEvent("save_to_device_click");
              // randomiseUnlockedSwatches();
              savePaletteToLocalStorage();
            }}
            disabled={currentSwatchesAreInLocalStorage === true}
          >
            <SvgIcon name={SvgImageList.Save} fill="white" />
            <span>
              SAVE TO <br />
              DEVICE
            </span>
          </button>
        </Tooltip>

        <Tooltip
          anchorName="Randomise Button"
          anchorPosition="bottom"
          anchorContent={
            <TooltipBubble pointerLocation="top">
              Change all unlocked colour
              <br />
              swatches to a random colour.
              <br />
              <span className="keyboard-key">SPACE BAR</span>
            </TooltipBubble>
          }
        >
          <button
            className={styles.swatchActionButton}
            type="button"
            disabled={swatchesList.every((swatch) => swatch.locked === true)}
            onClick={() => {
              trackClientAnalyticsEvent("randomise_unlocked_click");
              randomiseUnlockedSwatches();
            }}
          >
            <SvgIcon name={SvgImageList.Palette} fill="white" />
            <span>
              RANDOMISE <br />
              UNLOCKED
            </span>
          </button>
        </Tooltip>

        <Tooltip
          anchorName="Import Button"
          anchorPosition="bottom"
          anchorContent={
            <TooltipBubble pointerLocation="top">
              Import Colour Palette from
              <br />
              Image File or Image URL
              <br />
              <span className="keyboard-key">I</span>
            </TooltipBubble>
          }
        >
          <button
            className={styles.swatchActionButton}
            type="button"
            onClick={() => {
              trackClientAnalyticsEvent("import_button_click");
              setPaletteFromImageModalOpen(true);
            }}
          >
            <SvgIcon name={SvgImageList.Dropper} fill="white" />
            <span>IMPORT</span>
          </button>
        </Tooltip>

        <Tooltip
          anchorName="Export Button"
          anchorPosition="bottom"
          anchorContent={
            <TooltipBubble pointerLocation="top right">
              Export Colours As CSS Custom
              <br />
              Properties or as a JSON Object
              <br />
              <span className="keyboard-key">X</span>
            </TooltipBubble>
          }
        >
          <button
            className={styles.swatchActionButton}
            type="button"
            onClick={() => {
              trackClientAnalyticsEvent("export_button_click");
              setExportModalOpen(true);
            }}
          >
            <SvgIcon name={SvgImageList.Export} fill="white" />
            <span>EXPORT</span>
          </button>
        </Tooltip>
      </div>

      {isClient ? (
        <ColourSwatchContainer
          swatchesList={swatchesList}
          setSwatchesList={setSwatchesList}
        >
          {swatchesList.map((colour, i) => {
            const colorNamerNames = GetColorName(colour.hex);
            const humanReadableColourName = colorNamerNames;
            const isLastSwatch = swatchesList.length === 1;
            return (
              <ColourSwatch
                id={colour.id}
                key={colour.id}
                hex={colour.hex}
                label={humanReadableColourName}
                index={i}
                addSwatch={addSwatch}
                removeSwatch={removeSwatch}
                disableDelete={isLastSwatch}
                editSwatch={editSwatch}
                moveSwatch={moveSwatch}
                isSwatchLocked={colour?.locked ? true : false}
                toggleLockSwatch={() => toggleLockSwatch(i)}
              />
            );
          })}
        </ColourSwatchContainer>
      ) : null}

      <ExportAsModal
        modalOpen={exportModalOpen}
        onClose={closeExportModal}
        exportAs={exportAs}
        setExportAs={setExportAs}
        swatchesList={swatchesList}
      />

      <ImportPaletteFromImageModal
        modalOpen={paletteFromImageModalOpen}
        onClose={closePaletteFromImageModal}
        importAs={importAs}
        setImportAs={setImportAs}
      />

      <OverwriteExistingPaletteModal
        swatchesName={swatchesName}
        saveModalOpen={saveModalOpen}
        setSaveModalOpen={setSaveModalOpen}
        darkMode={darkMode}
        overwritePaletteInLocalStorage={overwritePaletteInLocalStorage}
      />

      <DeletePaletteConfirmationModal
        swatchesName={swatchesName}
        deleteModalOpen={deleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        darkMode={darkMode}
        deletePaletteFromLocalStorage={deletePaletteFromLocalStorage}
      />
    </div>
  );
};
