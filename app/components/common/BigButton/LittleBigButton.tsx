import React from "react";
import styles from "./LittleBigButton.module.css";
import SvgIcon, {
  SvgImageList,
  type SvgImageListTypes,
} from "../SvgIcon/SvgIcon";

interface LittleBigButtonProps {
  size: "little" | "big";
  onClick: () => void;
  svgIconName: SvgImageListTypes;
  label: React.ReactNode;
  darkMode: boolean;
  disabled?: boolean;
}

const LittleBigButton: React.FC<LittleBigButtonProps> = ({
  size,
  onClick,
  svgIconName,
  label,
  darkMode,
  disabled,
}) => {
  return (
    <button
      type="button"
      className={`${styles.button} ${size === "big" ? styles.big : styles.little} ${darkMode ? styles.darkMode : styles.lightMode}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={styles.buttonIconContainer}>
        <SvgIcon name={svgIconName} fill={darkMode ? "white" : "black"} />
      </span>
      <span className={styles.buttonLabel}>{label}</span>
    </button>
  );
};

export default LittleBigButton;
