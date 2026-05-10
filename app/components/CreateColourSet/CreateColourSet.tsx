import React, { useEffect, useState } from "react";
import {
  generateColorGradient,
  generateRandomColor,
  normalizeHex,
} from "~/utilities/utilities";
import { GetColorName } from "hex-color-to-color-name";
import styles from "./CreateColourSet.module.css";
import ColourSwatch from "../common/ColourSwatch/ColourSwatch";
import ColourSwatchContainer from "../common/ColourSwatchContainer/ColourSwatchContainer";
import { useNavigate } from "react-router";
import type { swatchType } from "~/types/commonTypes";
import SvgIcon, { SvgImageList } from "../common/SvgIcon/SvgIcon";
import PaletteFromImageModal from "./PaletteFromImage/PaletteFromImage";
import ExportAsModal from "./ExportAsModal/ExportAsModal";
import Tooltip, { TooltipBubble } from "../common/Tooltip/Tooltip";
import { useTheme } from "../common/DarkMode/DarkModeContext";

interface CreateColourSetProps {
  swatchesFromUrl?: swatchType[];
  swatchesNameFromUrl?: string;
}

export const CreateColourSet: React.FC<CreateColourSetProps> = ({
  swatchesFromUrl,
  swatchesNameFromUrl,
}) => {
  const [isClient, setIsClient] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const randomlyGeneratedSixColourSet = generateColorGradient(
    generateRandomColor(),
    generateRandomColor(),
    4,
  );

  const initialColourSet = swatchesFromUrl || randomlyGeneratedSixColourSet;

  const initialColourSetWithId = initialColourSet.map((item) => {
    return {
      ...item,
      id: crypto.randomUUID(),
    };
  });

  const [swatchesName, setSwatchesName] = useState<string>(
    swatchesNameFromUrl || "Untitled Swatch",
  );
  const [swatchesList, setSwatchesList] = useState<swatchType[]>(
    initialColourSetWithId,
  );

  // Listen for 'space' key press
  const handleKeyDown = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement;
    const isInput =
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable;
    // ignore if 'space' is pressed when an input is focused
    if (event.code === "Space" && !isInput) {
      event.preventDefault();
      randomiseUnlockedSwatches();
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [swatchesList]);

  // Toggle Lock
  const toggleLockSwatch = (index: number) => {
    const cloneSwatchesList = swatchesList;
    const itemsBeforeIndex = cloneSwatchesList.slice(0, index);
    const indexItem = cloneSwatchesList[index];
    const itemsAfterIndex = cloneSwatchesList.slice(index + 1);
    setSwatchesList([
      ...itemsBeforeIndex,
      {
        ...indexItem,
        locked: indexItem.locked ? false : true,
      },
      ...itemsAfterIndex,
    ]);
  };

  // Randomise Unlocked Swatches
  const randomiseUnlockedSwatches = () => {
    console.log(swatchesList);
    const cloneSwatchesList = swatchesList;
    const randomisedUnlockedSwatchList = cloneSwatchesList.map((swatch) => {
      const isSwatchLocked = swatch.locked === true;
      if (isSwatchLocked) {
        return {
          ...swatch,
        };
      }
      return {
        ...swatch,
        hex: generateRandomColor(),
      };
    });
    setSwatchesList(randomisedUnlockedSwatchList);
  };

  // SYNC SWATCHLIST TO URL BAR
  useEffect(() => {
    console.log(swatchesList);
    let swatchesUrlString = "";
    // Push swatches to 'swatchesUrlString' like so "ff0000-00ff00-0000ff"
    swatchesList.map(
      (swatch) =>
        (swatchesUrlString = `${swatchesUrlString}-${normalizeHex(swatch.hex)}`),
    );
    // Strip leading dash where required
    const swatchesUrlStringWithoutLeadingDash = swatchesUrlString.replace(
      /^-+/,
      "",
    );
    // Create UrlString (without params)
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
      newSwatchesList = [
        { hex: generateRandomColor(), id: crypto.randomUUID() },
        ...clonedSwatchesList,
      ];
    } else if (clonedSwatchesList.length === index) {
      // -= Place new swatch at the end of the array =-
      newSwatchesList = [
        ...clonedSwatchesList,
        { hex: generateRandomColor(), id: crypto.randomUUID() },
      ];
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
    const itemInClonedSwatchesList = clonedSwatchesList[indexToEdit];
    const updatedSwatchesList = [
      ...clonedSwatchesList.slice(0, indexToEdit),
      {
        ...itemInClonedSwatchesList,
        hex: hexWithoutHash,
      },
      ...clonedSwatchesList.slice(indexToEdit + 1),
    ];
    setSwatchesList(updatedSwatchesList);
  }

  // EXPORT MODAL
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportAs, setExportAs] = useState<"CSS" | "JS" | null>(null);
  const closeExportModal = () => {
    setExportModalOpen(false);
    setExportAs(null);
  };

  // PALETTE FROM IMAGE MODAL
  const [paletteFromImageModalOpen, setPaletteFromImageModalOpen] =
    useState<boolean>(false);
  const [importAs, setImportAs] = useState<"URL" | "FILE" | null>(null);
  const closePaletteFromImageModal = () => {
    setPaletteFromImageModalOpen(false);
    setImportAs(null);
  };

  const { darkMode } = useTheme();

  return (
    <div className={styles.createContainer}>
      <div className={styles.swatchNameAndButtonsContainer}>
        <input
          className={`${styles.editableSwatchSetLabelInput} ${darkMode && styles.darkMode}`}
          type="text"
          value={swatchesName}
          onChange={(e) => setSwatchesName(e.target.value)}
        ></input>

        <Tooltip
          anchorName="Randomise Button"
          anchorPosition="bottom"
          anchorContent={
            <TooltipBubble pointerLocation="top">
              Change all unlocked colour
              <br />
              swatches to a random colour.
            </TooltipBubble>
          }
        >
          <button
            className={styles.swatchActionButton}
            type="button"
            disabled={swatchesList.every((swatch) => swatch.locked === true)}
            onClick={() => randomiseUnlockedSwatches()}
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
            </TooltipBubble>
          }
        >
          <button
            className={styles.swatchActionButton}
            type="button"
            onClick={() => setPaletteFromImageModalOpen(true)}
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
            </TooltipBubble>
          }
        >
          <button
            className={styles.swatchActionButton}
            type="button"
            onClick={() => setExportModalOpen(true)}
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

      <PaletteFromImageModal
        modalOpen={paletteFromImageModalOpen}
        onClose={closePaletteFromImageModal}
        importAs={importAs}
        setImportAs={setImportAs}
      />
    </div>
  );
};
