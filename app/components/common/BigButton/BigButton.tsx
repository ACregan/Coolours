import React from "react";
import styles from "./BigButton.module.css";
import SvgIcon, {
  SvgImageList,
  type SvgImageListTypes,
} from "../SvgIcon/SvgIcon";

interface BigButtonProps {
  onClick: () => void;
  svgIconName: SvgImageListTypes;
  label: React.ReactNode;
  darkMode: boolean;
}

const BigButton: React.FC<BigButtonProps> = ({
  onClick,
  svgIconName,
  label,
  darkMode,
}) => {
  return (
    <button className={styles.bigButton} onClick={onClick}>
      <span className={styles.bigButtonIcon}>
        <SvgIcon name={svgIconName} fill={darkMode ? "white" : "black"} />
      </span>
      <span className={styles.bigButtonLabel}>{label}</span>
    </button>
  );
};

export default BigButton;
