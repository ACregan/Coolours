import React from "react";
import { getColorName, initColors, ORIGINAL_COLORS } from "ntc-ts";
import { isCloserToWhite } from "~/utilities/utilities";
import styles from "./ColourSwatch.module.css";
interface ColourSwatchProps {
  hex: string;
  label?: string;
  index: number;
  addSwatch: Function;
  removeSwatch: Function;
}

interface AddSwatchButtonProps {
  index: number;
  addSwatch: Function;
}
const AddSwatchButton: React.FC<AddSwatchButtonProps> = ({
  index,
  addSwatch,
}) => {
  return (
    <div
      className={`${styles.hoverCaptureContainer} ${index === 0 ? styles.addBefore : styles.addAfter}`}
    >
      <button className={styles.addButton} onClick={() => addSwatch(index)}>
        +
      </button>
    </div>
  );
};

const ColourSwatch: React.FC<ColourSwatchProps> = ({
  hex,
  label,
  index,
  addSwatch,
  removeSwatch,
}) => {
  return (
    <div
      style={{ backgroundColor: `#${hex}` }}
      className={`${styles.swatch} ${isCloserToWhite(hex) ? styles.closerToWhite : styles.closerToBlack}`}
    >
      {index === 0 ? (
        <AddSwatchButton addSwatch={addSwatch} index={index} />
      ) : null}
      <button onClick={() => removeSwatch(index)}>DEL</button>
      <span className={styles.colourHex}>#{hex}</span>
      {label ? <span className={styles.humanReadableName}>{label}</span> : null}
      <AddSwatchButton addSwatch={addSwatch} index={index + 1} />
    </div>
  );
};

export default ColourSwatch;
