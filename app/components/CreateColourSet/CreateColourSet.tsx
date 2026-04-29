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

  const [swatchesList, setSwatchesList] = useState(
    randomlyGeneratedSixColourSet,
  );

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
      const newColour = generateColorGradient(
        selectedColour.hex,
        nextColour.hex,
        1,
      );
      // NOTE: The above returns an array with the 'before', (new) midpoint and 'after' colours...

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

  // TODO: Content Editable H1
  return (
    <div className={styles.createContainer}>
      <h5>Create Colour Set</h5>
      {isClient ? (
        <ColourSwatchContainer>
          {swatchesList.map((colour, i) => {
            const colorNamerNames = getColorName(colour.hex);
            const humanReadableColourName = colorNamerNames.name;
            return (
              <ColourSwatch
                key={colour.hex}
                hex={colour.hex}
                label={humanReadableColourName}
                index={i}
                addSwatch={addSwatch}
                removeSwatch={removeSwatch}
              />
            );
          })}
        </ColourSwatchContainer>
      ) : null}
    </div>
  );
};
