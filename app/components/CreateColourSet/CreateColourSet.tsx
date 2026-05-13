import React, { useEffect, useRef, useState } from "react";
import {
  generateColorGradient,
  generateRandomColor,
  generateUrlPath,
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
import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";
import useLocalStorage from "~/hooks/useLocalStoragePalettes.client";
import { isbotMatches } from "isbot";
import useLocalStoragePalettes from "~/hooks/useLocalStoragePalettes.client";
import { useToast } from "../common/Toast/ToastProvider";
import Modal from "../common/Modal/Modal";
import OverwriteExistingPaletteModal from "./OverwriteExistingPaletteModal/OverwriteExistingPaletteModal";
import DeletePaletteConfirmationModal from "./DeletePaletteConfirmationModal/DeletePaletteConfirmationModal";

interface CreateColourSetProps {
  swatchesFromUrl?: swatchType[];
  swatchesNameFromUrl?: string;
}

interface savePaletteParams {
  newPalette: swatchType[];
}

export const CreateColourSet: React.FC<CreateColourSetProps> = ({
  swatchesFromUrl,
  swatchesNameFromUrl,
}) => {
  const [palettes, savePalettes, removePalette] = useLocalStoragePalettes();

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

  // Listen for 'space', 'i' or 'x' key press
  const handleKeyDown = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement;
    const isInput =
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable;
    // ignore if a key is pressed when an input is focused
    if (event.code === "Space" && !isInput) {
      event.preventDefault();
      randomiseUnlockedSwatches();
    }
    if (event.code === "KeyI" && !isInput) {
      event.preventDefault();
      setPaletteFromImageModalOpen(true);
    }
    if (event.code === "KeyX" && !isInput) {
      event.preventDefault();
      setExportModalOpen(true);
    }
    if (event.code === "KeyS" && !isInput) {
      event.preventDefault();
      savePaletteToLocalStorage();
    }
    if (event.code === "KeyD" && !isInput) {
      event.preventDefault();
      setDeleteModalOpen(true);
    }
  };
  useEffect(() => {
    // console.log(swatchesList);
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
    const generatedUrlString = generateUrlPath(swatchesList, swatchesName);
    // Call navigate with updated path & params, replace so
    // we dont end up with a huge navigation history tree
    navigate(generatedUrlString, { replace: true });
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
  const { addToast } = useToast();

  // SAVE PALETTE TO LOCAL STORAGE
  const swatchTitleInputRef = useRef<HTMLInputElement | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const savePaletteToLocalStorage = () => {
    if (swatchesName === "Untitled Swatch") {
      // CHECK if the user has failed to update the swatch name from the default "Untitled Swatch"
      addToast(
        "NOT SAVED: Provide A Unique Name For This Palette then try again.",
      );
      swatchTitleInputRef.current?.focus();
    } else if (palettes.some((palette) => palette.title === swatchesName)) {
      // CHECK if a palette with this name already exists in localStorage
      // and open a modal to confirm overwrite if it does.
      setSaveModalOpen(true);
    } else {
      // ALL CHECKS PASSED, Proceed to save
      savePalettes({
        title: swatchesName,
        colours: swatchesList,
        url: generateUrlPath(swatchesList, swatchesName),
      });
      addToast("Palette Saved. You can access and edit it from the Homepage");
    }
  };
  const overwritePaletteInLocalStorage = () => {
    removePalette(swatchesName);
    savePalettes({
      title: swatchesName,
      colours: swatchesList,
      url: generateUrlPath(swatchesList, swatchesName),
    });
    addToast("Palette Saved. You can access and edit it from the Homepage");
    setSaveModalOpen(false);
  };

  // DELETE PALETTE FROM LOCAL STORAGE
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const deletePaletteFromLocalStorage = () => {
    removePalette(swatchesName);
    addToast("Palette Sucessfully Deleted From Browser Storage");
    setDeleteModalOpen(false);
  };

  // Check if current palette exists in local storage
  const currentSwatchesAreInLocalStorage = palettes.some((palette) => {
    return (
      palette.title === swatchesName &&
      palette.url === generateUrlPath(swatchesList, swatchesName)
    );
  });

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

      <PaletteFromImageModal
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
