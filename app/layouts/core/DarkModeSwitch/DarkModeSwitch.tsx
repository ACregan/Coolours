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
      className={styles.darkModeSwitchContainer}
      onClick={() => toggleDarkMode()}
    >
      <SvgIcon name={SvgImageList.DarkMode} />
      <div
        className={
          darkMode ? styles.darkModeSwitch_off : styles.darkModeSwitch_on
        }
      ></div>
      <SvgIcon name={SvgImageList.LightMode} />
    </div>
  );
};

export default DarkModeSwitch;
