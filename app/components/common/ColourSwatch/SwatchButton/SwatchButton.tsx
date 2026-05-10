import React from "react";
import SvgIcon, { type SvgImageListTypes } from "../../SvgIcon/SvgIcon";
import styles from "./SwatchButton.module.css";

type SwatchButtonsProps = {
  icon: SvgImageListTypes;
  label: string;
  onClick: () => void;
  labelAlignment?: "left" | "right";
  closerToWhite: boolean;
  disabled?: boolean;
};

const SwatchButton: React.FC<SwatchButtonsProps> = ({
  icon,
  label,
  onClick,
  labelAlignment = "right",
  closerToWhite,
  disabled,
}) => {
  return (
    <button
      className={`${styles.swatchButton} ${labelAlignment === "left" && styles.leftAlignedLabel} ${closerToWhite ? styles.closerToWhite : styles.closerToBlack}`}
      onClick={onClick}
      disabled={disabled}
    >
      <SvgIcon name={icon} />
      <p className={styles.textLabel}>{label}</p>
    </button>
  );
};

export default SwatchButton;
