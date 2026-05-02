import React, { useEffect, useState } from "react";
import {
  copyToClipboard,
  generateColorGradient,
  generateExportCSS,
  generateExportJS,
  generateRandomColor,
  isCloserToWhite,
} from "~/utilities/utilities";
import { getColorName, initColors, ORIGINAL_COLORS } from "ntc-ts";
import styles from "./CreateColourSet.module.css";
import ColourSwatch from "../common/ColourSwatch/ColourSwatch";
import ColourSwatchContainer from "../common/ColourSwatchContainer/ColourSwatchContainer";
import { useNavigate } from "react-router";
import type { swatchType } from "~/types/commonTypes";
import SvgIcon, { SvgImageList } from "../common/SvgIcon/SvgIcon";
import Modal from "../common/Modal/Modal";
import PaletteFromImage from "./PaletteFromImage/PaletteFromImage";

interface CreateColourSetProps {
  swatchesFromUrl?: swatchType[];
  swatchesNameFromUrl?: string;
}

export const CreateColourSet: React.FC<CreateColourSetProps> = ({
  swatchesFromUrl,
  swatchesNameFromUrl,
}) => {
  const [isClient, setIsClient] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsClient(true);
  }, []);

  initColors(ORIGINAL_COLORS);

  const randomlyGeneratedSixColourSet = generateColorGradient(
    generateRandomColor(),
    generateRandomColor(),
    4,
  );

  const initialColourSet = swatchesFromUrl || randomlyGeneratedSixColourSet;

  const [swatchesName, setSwatchesName] = useState(
    swatchesNameFromUrl || "Untitled Swatch",
  );
  const [swatchesList, setSwatchesList] = useState(initialColourSet);

  // SYNC SWATCHLIST TO URL BAR
  useEffect(() => {
    let swatchesUrlString = "";
    // Push swatches to 'swatchesUrlString' like so "ff0000-00ff00-0000ff"
    swatchesList.map(
      (swatch) => (swatchesUrlString = `${swatchesUrlString}-${swatch.hex}`),
    );
    // Strip leading dash where required
    const swatchesUrlStringWithoutLeadingDash = swatchesUrlString.replace(
      /^-+/,
      "",
    );
    // Create UrlString (without) params
    const partiallyComposedUrlString = `/create/${swatchesUrlStringWithoutLeadingDash}`;
    // Create params
    const partiallyComposedParamsString = `?name=${encodeURIComponent(swatchesName.trim())}`;
    // Compose them
    const fullyComposedUrlString =
      partiallyComposedUrlString + partiallyComposedParamsString;

    // Call navigate with updated path & params, replace so
    // we dont end up with a huge navigation history tree
    navigate(fullyComposedUrlString, { replace: true });
  }, [swatchesList, swatchesName]);

  function moveSwatch(index: number, direction: "left" | "right") {
    const currentIndex = index;
    const targetIndex = direction === "left" ? index - 1 : index + 1;

    if (
      currentIndex < 0 ||
      currentIndex >= swatchesList.length ||
      targetIndex < 0 ||
      targetIndex >= swatchesList.length
    ) {
      return;
    }

    const newSwatchesList = [...swatchesList];
    const temp = newSwatchesList[currentIndex];
    newSwatchesList[currentIndex] = newSwatchesList[targetIndex];
    newSwatchesList[targetIndex] = temp;

    setSwatchesList(newSwatchesList);
  }

  function addSwatch(index: number) {
    const clonedSwatchesList = swatchesList;
    let newSwatchesList = [];
    if (index === 0) {
      // -= Place new swatch at the start of the array =-
      newSwatchesList = [{ hex: generateRandomColor() }, ...clonedSwatchesList];
    } else if (clonedSwatchesList.length === index) {
      // -= Place new swatch at the end of the array =-
      newSwatchesList = [...clonedSwatchesList, { hex: generateRandomColor() }];
    } else {
      // -= Place a new swatch in between the selected one and the one after it =-
      const selectedColour = clonedSwatchesList[index - 1];
      const nextColour = clonedSwatchesList[index];

      // Generate a new colour midpoint between the before and after colours
      // NOTE: This returns an array with the 'before', (new) midpoint and
      // 'after' colours...
      const newColour = generateColorGradient(
        selectedColour.hex,
        nextColour.hex,
        1,
      );
      // ... so we need to slice those out of the clonedSwatchesList when we
      // generate the new swatch list
      newSwatchesList = [
        ...clonedSwatchesList.slice(0, index - 1),
        ...newColour,
        ...clonedSwatchesList.slice(index + 1),
      ];
    }

    setSwatchesList(newSwatchesList);
  }

  function removeSwatch(indexToRemove: number) {
    const clonedSwatchesList = swatchesList;
    const newSwatchesList = clonedSwatchesList.filter(
      (_, index) => index !== indexToRemove,
    );

    setSwatchesList(newSwatchesList);
  }

  function editSwatch(hex: string, indexToEdit: number) {
    const clonedSwatchesList = swatchesList;
    const hexWithoutHash = hex.replace("#", "");
    const updatedSwatchesList = [
      ...clonedSwatchesList.slice(0, indexToEdit),
      { hex: hexWithoutHash },
      ...clonedSwatchesList.slice(indexToEdit + 1),
    ];
    setSwatchesList(updatedSwatchesList);
  }

  // EXPORT MODAL
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportAs, setExportAs] = useState<"CSS" | "JS" | null>(null);
  const closeExportModal = () => {
    setExportModalOpen(false);
    setExportAs(null);
  };

  // PALETTE FROM IMAGE MODAL
  const [paletteFromImageModalOpen, setPaletteFromImageModalOpen] =
    useState(false);
  const closePaletteFromImageModal = () => {
    setPaletteFromImageModalOpen(false);
  };

  return (
    <div className={styles.createContainer}>
      <div className={styles.swatchNameAndButtonsContainer}>
        <input
          className={styles.editableSwatchSetLabelInput}
          type="text"
          value={swatchesName}
          onChange={(e) => setSwatchesName(e.target.value)}
        ></input>
        <button
          className={styles.swatchActionButton}
          type="button"
          onClick={() => setPaletteFromImageModalOpen(true)}
        >
          <SvgIcon name={SvgImageList.Dropper} />
          <span>IMPORT</span>
        </button>
        <button
          className={styles.swatchActionButton}
          type="button"
          onClick={() => setExportModalOpen(true)}
        >
          <SvgIcon name={SvgImageList.Export} />
          <span>EXPORT</span>
        </button>
      </div>
      {isClient ? (
        <ColourSwatchContainer>
          {swatchesList.map((colour, i) => {
            const colorNamerNames = getColorName(colour.hex);
            const humanReadableColourName = colorNamerNames.name;
            return (
              <ColourSwatch
                key={i}
                hex={colour.hex}
                label={humanReadableColourName}
                index={i}
                addSwatch={addSwatch}
                removeSwatch={removeSwatch}
                editSwatch={editSwatch}
                moveSwatch={moveSwatch}
              />
            );
          })}
        </ColourSwatchContainer>
      ) : null}

      <Modal
        title={`Export as${exportAs === null ? "..." : ` ${exportAs}`}`}
        open={exportModalOpen}
        onClose={() => closeExportModal()}
      >
        <div className={styles.exportModalContentContainer}>
          {exportAs === null && (
            <div className={styles.exportButtonsContainer}>
              <button
                className={styles.exportButton}
                onClick={() => setExportAs("CSS")}
              >
                <span className={styles.exportButtonIcon}>
                  <SvgIcon name={SvgImageList.Css} />
                </span>
                <span className={styles.exportButtonLabel}>CSS Variables</span>
              </button>
              <button
                className={styles.exportButton}
                onClick={() => setExportAs("JS")}
              >
                <span className={styles.exportButtonIcon}>
                  <SvgIcon name={SvgImageList.Js} />
                </span>
                <span className={styles.exportButtonLabel}>
                  JSON / Javascript
                </span>
              </button>
            </div>
          )}
          {exportAs === "JS" && (
            <div className={styles.codeForExport}>
              <pre>
                <code>{generateExportJS(swatchesList)}</code>
              </pre>
              <div className={styles.exportButtonContainer}>
                <button
                  type="button"
                  className={styles.exportBackButton}
                  onClick={() => setExportAs(null)}
                >
                  <SvgIcon name={SvgImageList.ArrowBack} />
                  Back
                </button>
                <button
                  type="button"
                  className={styles.exportCopyToClipboardButton}
                  onClick={() =>
                    copyToClipboard(generateExportJS(swatchesList))
                  }
                >
                  <SvgIcon name={SvgImageList.Copy} />
                  Copy To Clipboard
                </button>
              </div>
            </div>
          )}
          {exportAs === "CSS" && (
            <div className={styles.codeForExport}>
              <pre>
                <code>{generateExportCSS(swatchesList)}</code>
              </pre>
              <div className={styles.exportButtonContainer}>
                <button
                  type="button"
                  className={styles.exportBackButton}
                  onClick={() => setExportAs(null)}
                >
                  <SvgIcon name={SvgImageList.ArrowBack} />
                  Back
                </button>
                <button
                  type="button"
                  className={styles.exportCopyToClipboardButton}
                  onClick={() =>
                    copyToClipboard(generateExportCSS(swatchesList))
                  }
                >
                  <SvgIcon name={SvgImageList.Copy} />
                  Copy To Clipboard
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        title={`Import Palette from Image`}
        open={paletteFromImageModalOpen}
        onClose={() => closePaletteFromImageModal()}
      >
        <PaletteFromImage />
      </Modal>
    </div>
  );
};
