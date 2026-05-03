import React, { useState, useRef } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import {
  debounce,
  isCloserToWhite,
  copyToClipboard,
} from "~/utilities/utilities";
import styles from "./ColourSwatch.module.css";
import { useClickOutside } from "~/hooks/useClickOutside";
import SvgIcon, { SvgImageList } from "../SvgIcon/SvgIcon";

interface ColourSwatchProps {
  hex: string;
  label?: string;
  index: number;
  addSwatch: Function;
  removeSwatch: Function;
  editSwatch: Function;
  moveSwatch: Function;
  isSwatchLocked: boolean;
  toggleLockSwatch: Function;
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
  moveSwatch,
  isSwatchLocked,
  toggleLockSwatch,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  function openColourPicker() {
    setPickerOpen(!pickerOpen);
  }

  const pickerContainerRef = useRef<HTMLDivElement | undefined>(undefined);

  useClickOutside(pickerContainerRef, () => setPickerOpen(false));

  return (
    <div
      style={{ backgroundColor: `#${hex}` }}
      className={`${styles.swatch} ${isCloserToWhite(hex) ? styles.closerToWhite : styles.closerToBlack}`}
    >
      {index === 0 ? (
        <AddSwatchButton addSwatch={addSwatch} index={index} />
      ) : null}
      {pickerOpen ? (
        <div
          className={styles.colourPickerContainer}
          ref={pickerContainerRef as React.RefObject<HTMLDivElement>}
        >
          <HexColorPicker
            color={hex}
            onChange={debounce((e) => editSwatch(e, index), 10)}
          />
          <HexColorInput color={hex} onChange={(e) => editSwatch(e, index)} />
        </div>
      ) : null}
      <div>
        <button
          className={styles.swatchButton}
          onClick={() => moveSwatch(index, "left")}
        >
          <SvgIcon name={SvgImageList.ArrowBack} />
        </button>
        <button
          className={styles.swatchButton}
          onClick={() => moveSwatch(index, "right")}
        >
          <SvgIcon name={SvgImageList.ArrowForward} />
        </button>
      </div>
      <button
        className={styles.swatchButton}
        onClick={() => toggleLockSwatch(index)}
      >
        <SvgIcon
          name={
            isSwatchLocked ? SvgImageList.LockLocked : SvgImageList.LockUnlocked
          }
        />
      </button>
      <button
        className={styles.swatchButton}
        onClick={() =>
          copyToClipboard(
            `#${hex}`,
            () => console.log("Copy to clipboard: SUCCESS"),
            () => console.log("Copy to clipboard: FAILURE"),
          )
        }
      >
        <SvgIcon name={SvgImageList.Copy} />
      </button>
      <button
        className={styles.swatchButton}
        onClick={() => openColourPicker()}
      >
        <SvgIcon name={SvgImageList.Palette} />
      </button>
      <button
        className={styles.swatchButton}
        onClick={() => removeSwatch(index)}
      >
        <SvgIcon name={SvgImageList.Delete} />
      </button>
      <span className={styles.colourHex}>#{hex}</span>
      {label ? <span className={styles.humanReadableName}>{label}</span> : null}
      <AddSwatchButton addSwatch={addSwatch} index={index + 1} />
    </div>
  );
};

export default ColourSwatch;
