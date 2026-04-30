import React, { useEffect, useState } from "react";
import {
  generateColorGradient,
  generateRandomColor,
  isCloserToWhite,
} from "~/utilities/utilities";
import { getColorName, initColors, ORIGINAL_COLORS } from "ntc-ts";
import styles from "./CreateColourSet.module.css";
import ColourSwatch from "../common/ColourSwatch/ColourSwatch";
import ColourSwatchContainer from "../common/ColourSwatchContainer/ColourSwatchContainer";

interface CreateColourSetProps {}

export const CreateColourSet: React.FC<CreateColourSetProps> = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  initColors(ORIGINAL_COLORS);

  const randomlyGeneratedSixColourSet = generateColorGradient(
    generateRandomColor(),
    generateRandomColor(),
    4,
  );

  const [swatchesName, setSwatchesName] = useState("Untitled Swatch");
  const [swatchesList, setSwatchesList] = useState(
    randomlyGeneratedSixColourSet,
  );

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
    console.log(
      "array without selected",
      clonedSwatchesList.filter((_, index) => index !== indexToRemove),
    );
    const newSwatchesList = clonedSwatchesList.filter(
      (_, index) => index !== indexToRemove,
    );

    setSwatchesList(newSwatchesList);
  }

  function editSwatch(hex: string, indexToEdit: number) {
    const clonedSwatchesList = swatchesList;
    console.log("edit", indexToEdit);
    console.log("hex", hex);
    const hexWithoutHash = hex.replace("#", "");
    const updatedSwatchesList = [
      ...clonedSwatchesList.slice(0, indexToEdit),
      { hex: hexWithoutHash },
      ...clonedSwatchesList.slice(indexToEdit + 1),
    ];
    console.log(updatedSwatchesList);
    setSwatchesList(updatedSwatchesList);
  }

  return (
    <div className={styles.createContainer}>
      <input
        className={styles.editableSwatchSetLabelInput}
        type="text"
        value={swatchesName}
        onChange={(e) => setSwatchesName(e.target.value)}
      ></input>
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
    </div>
  );
};
