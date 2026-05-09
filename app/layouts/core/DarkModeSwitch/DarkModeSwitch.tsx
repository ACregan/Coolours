import React from "react";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";
import styles from "./DarkModeSwitch.module.css";

interface DarkModeSwitch {
  toggleDarkMode: () => void;
  darkMode: boolean;
}

const DarkModeSwitch: React.FC<DarkModeSwitch> = ({
  toggleDarkMode,
  darkMode,
}) => {
  return (
    <div
      className={`${styles.darkModeSwitchContainer} ${
        darkMode ? styles.darkMode_on : styles.darkMode_off
      }`}
      onClick={() => toggleDarkMode()}
    >
      <SvgIcon name={SvgImageList.DarkMode} fill="#d8d8d8" />
      <div className={styles.darkModeSwitch}></div>
      <SvgIcon name={SvgImageList.LightMode} fill="#ffdb00" />
    </div>
  );
};

export default DarkModeSwitch;
