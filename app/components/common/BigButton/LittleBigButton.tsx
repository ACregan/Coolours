import React from "react";
import styles from "./LittleBigButton.module.css";
import SvgIcon, { type SvgImageListTypes } from "../SvgIcon/SvgIcon";
import classNames from "classnames/bind";

const cx = classNames.bind(styles);
interface LittleBigButtonProps {
  size: "little" | "big";
  onClick?: () => void;
  svgIconName?: SvgImageListTypes;
  label: React.ReactNode;
  darkMode: boolean;
  disabled?: boolean;
  status?: "success" | "warning" | "danger";
}

const LittleBigButton: React.FC<LittleBigButtonProps> = ({
  size,
  onClick,
  svgIconName,
  label,
  darkMode,
  disabled,
  status,
}) => {
  const buttonClasses = cx({
    button: true,
    big: size === "big",
    little: size === "little",
    darkMode: darkMode === true,
    lightMode: darkMode === false,
    success: status === "success",
    warning: status === "warning",
    danger: status === "danger",
  });
  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {svgIconName && (
        <span className={styles.buttonIconContainer}>
          <SvgIcon name={svgIconName} fill={darkMode ? "white" : "black"} />
        </span>
      )}
      <span className={styles.buttonLabel}>{label}</span>
    </button>
  );
};

export default LittleBigButton;
