import React, { useState, useRef, useMemo } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import {
  debounce,
  isCloserToWhite,
  copyToClipboard,
  normalizeHex,
} from "~/utilities/utilities";
import styles from "./ColourSwatch.module.css";
import { useClickOutside } from "~/hooks/useClickOutside";
import SvgIcon, {
  SvgImageList,
  type SvgImageListTypes,
} from "../SvgIcon/SvgIcon";
import { useToast } from "../Toast/ToastProvider";
import { useSortable } from "@dnd-kit/react/sortable";
import SwatchButton from "./SwatchButton/SwatchButton";
import AddSwatchButton from "./AddNewSwatchButton/AddNewSwatchButton";
import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";

interface ColourSwatchProps {
  id: string;
  hex: string;
  label?: string;
  index: number;
  addSwatch: Function;
  removeSwatch: Function;
  disableDelete: boolean;
  editSwatch: Function;
  moveSwatch: Function;
  isSwatchLocked: boolean;
  toggleLockSwatch: Function;
}

const ColourSwatch: React.FC<ColourSwatchProps> = ({
  id,
  hex,
  label,
  index,
  addSwatch,
  removeSwatch,
  disableDelete,
  editSwatch,
  moveSwatch,
  isSwatchLocked,
  toggleLockSwatch,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { ref, handleRef } = useSortable({ id, index, disabled: pickerOpen });

  function openColourPicker() {
    setPickerOpen(true);
  }

  const pickerContainerRef = useRef<HTMLDivElement | undefined>(undefined);

  useClickOutside(pickerContainerRef, () => setPickerOpen(false));

  const { addToast } = useToast();

  return (
    <div
      ref={ref}
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
            onChange={debounce((e) => {
              editSwatch(e, index);
            }, 10)}
          />
          <HexColorInput color={hex} onChange={(e) => editSwatch(e, index)} />
        </div>
      ) : null}

      <div ref={handleRef} className={styles.dragHandleContainer}>
        <SvgIcon name={SvgImageList.DragHandle} />
      </div>

      <div>
        <SwatchButton
          icon={SvgImageList.ArrowBack}
          label="LEFT"
          onClick={() => {
            trackClientAnalyticsEvent("move_swatch_left_click");
            moveSwatch(index, "left");
          }}
          labelAlignment="left"
          closerToWhite={isCloserToWhite(hex)}
        />

        <SwatchButton
          icon={SvgImageList.ArrowForward}
          label="RIGHT"
          onClick={() => {
            trackClientAnalyticsEvent("move_swatch_right_click");
            moveSwatch(index, "right");
          }}
          closerToWhite={isCloserToWhite(hex)}
        />
      </div>

      <SwatchButton
        icon={
          isSwatchLocked ? SvgImageList.LockLocked : SvgImageList.LockUnlocked
        }
        label={isSwatchLocked ? "LOCK: On" : "LOCK: Off"}
        onClick={() => {
          trackClientAnalyticsEvent(
            isSwatchLocked ? "unlock_swatch_click" : "lock_swatch_click",
          );
          toggleLockSwatch(index);
        }}
        closerToWhite={isCloserToWhite(hex)}
      />

      <SwatchButton
        icon={SvgImageList.Copy}
        label="COPY"
        onClick={() => {
          trackClientAnalyticsEvent("copy_colour_to_clipboard_click");
          copyToClipboard(
            `#${hex}`,
            () => addToast(`Copied to clipboard: "#${hex}"`),
            () => addToast("Copy to clipboard not supported."),
          );
        }}
        closerToWhite={isCloserToWhite(hex)}
      />

      <SwatchButton
        icon={SvgImageList.Palette}
        label="EDIT"
        onClick={() => {
          trackClientAnalyticsEvent("open_colour_picker_click");
          openColourPicker();
        }}
        closerToWhite={isCloserToWhite(hex)}
      />

      <SwatchButton
        icon={SvgImageList.Delete}
        label="DELETE"
        onClick={() => {
          trackClientAnalyticsEvent("delete_swatch_click");
          removeSwatch(index);
        }}
        closerToWhite={isCloserToWhite(hex)}
        disabled={disableDelete}
      />

      <span className={styles.colourHex}>#{normalizeHex(hex)}</span>
      {label ? <span className={styles.humanReadableName}>{label}</span> : null}
      <AddSwatchButton addSwatch={addSwatch} index={index + 1} />
    </div>
  );
};

export default ColourSwatch;
