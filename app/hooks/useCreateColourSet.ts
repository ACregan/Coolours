import React, { useEffect, useRef, useState } from "react";
import useLocalStoragePalettes from "./useLocalStoragePalettes.client";
import type { swatchType } from "~/types/commonTypes";
import {
  generateColorGradient,
  generateRandomColor,
  generateUrlPath,
} from "~/utilities/utilities";
import { useNavigate } from "react-router";
import { useTheme } from "~/components/common/DarkMode/DarkModeContext";
import { useToast } from "~/components/common/Toast/ToastProvider";

interface useCreateColourSetProps {
  swatchesFromUrl?: swatchType[];
  swatchesNameFromUrl?: string;
}

const useCreateColourSet = ({
  swatchesFromUrl,
  swatchesNameFromUrl,
}: useCreateColourSetProps) => {
  const navigate = useNavigate();

  const [palettes, savePalettes, removePalette] = useLocalStoragePalettes();

  const [isClient, setIsClient] = useState<boolean>(false);

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

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handler for key press
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
  // Add listener for keypresses and pass to handler (above)
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

  return {
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
  };
};

export default useCreateColourSet;
