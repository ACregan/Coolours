import React from "react";
import { HexColorPicker } from "react-colorful";
import { debounce, isCloserToWhite } from "~/utilities/utilities";
import styles from "./ColourSwatch.module.css";

interface ColourSwatchProps {
  hex: string;
  label?: string;
  index: number;
  addSwatch: Function;
  removeSwatch: Function;
  editSwatch: Function;
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
  editSwatch,
}) => {
  function openColourPicker() {}

  return (
    <div
      style={{ backgroundColor: `#${hex}` }}
      className={`${styles.swatch} ${isCloserToWhite(hex) ? styles.closerToWhite : styles.closerToBlack}`}
    >
      {index === 0 ? (
        <AddSwatchButton addSwatch={addSwatch} index={index} />
      ) : null}
      <HexColorPicker
        color={hex}
        onChange={debounce((e) => editSwatch(e, index), 200)}
      />
      <button onClick={() => openColourPicker()}>EDIT</button>
      <button onClick={() => removeSwatch(index)}>DEL</button>
      <span className={styles.colourHex}>#{hex}</span>
      {label ? <span className={styles.humanReadableName}>{label}</span> : null}
      <AddSwatchButton addSwatch={addSwatch} index={index + 1} />
    </div>
  );
};

export default ColourSwatch;
