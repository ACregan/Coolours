import React, { useState, useRef } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import {
  debounce,
  isCloserToWhite,
  copyToClipboard,
} from "~/utilities/utilities";
import styles from "./ColourSwatch.module.css";
import { useClickOutside } from "~/hooks/useClickOutside";
import SvgIcon, {
  SvgImageList,
  type SvgImageListTypes,
} from "../SvgIcon/SvgIcon";
import { useToast } from "../Toast/ToastProvider";

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

  const { addToast } = useToast();

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
        <SwatchButton
          icon={SvgImageList.ArrowBack}
          label="LEFT"
          onClick={() => moveSwatch(index, "left")}
          labelAlignment="left"
        />

        <SwatchButton
          icon={SvgImageList.ArrowForward}
          label="RIGHT"
          onClick={() => moveSwatch(index, "right")}
        />
      </div>

      <SwatchButton
        icon={
          isSwatchLocked ? SvgImageList.LockLocked : SvgImageList.LockUnlocked
        }
        label={isSwatchLocked ? "LOCK: On" : "LOCK: Off"}
        onClick={() => toggleLockSwatch(index)}
      />

      <SwatchButton
        icon={SvgImageList.Copy}
        label="COPY"
        onClick={() =>
          copyToClipboard(
            `#${hex}`,
            () => addToast(`Copied to clipboard: "#${hex}"`),
            () => addToast("Copy to clipboard not supported."),
          )
        }
      />

      <SwatchButton
        icon={SvgImageList.Palette}
        label="EDIT"
        onClick={() => openColourPicker()}
      />

      <SwatchButton
        icon={SvgImageList.Delete}
        label="DELETE"
        onClick={() => removeSwatch(index)}
      />

      <span className={styles.colourHex}>#{hex}</span>
      {label ? <span className={styles.humanReadableName}>{label}</span> : null}
      <AddSwatchButton addSwatch={addSwatch} index={index + 1} />
    </div>
  );
};

type SwatchButtonsProps = {
  icon: SvgImageListTypes;
  label: string;
  onClick: () => void;
  labelAlignment?: "left" | "right";
};

const SwatchButton: React.FC<SwatchButtonsProps> = ({
  icon,
  label,
  onClick,
  labelAlignment = "right",
}) => {
  return (
    <button
      className={`${styles.swatchButton} ${labelAlignment === "left" && styles.leftAlignedLabel}`}
      onClick={onClick}
    >
      <SvgIcon name={icon} />
      <p className={styles.textLabel}>{label}</p>
    </button>
  );
};

export default ColourSwatch;
