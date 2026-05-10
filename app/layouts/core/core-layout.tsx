import React from "react";
import { Outlet } from "react-router";
import styles from "./core-layout.module.css";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";
import { useTheme } from "~/components/common/DarkMode/DarkModeContext";
import DarkModeSwitch from "./DarkModeSwitch/DarkModeSwitch";
import TopMenuButton from "./TopMenuButton/TopMenuButton";
import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";

export default function CoreLayout() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div
      className={`${styles.coreLayout_container} ${darkMode ? styles.darkMode : styles.lightMode}`}
    >
      <header>
        <div className={styles.darkModeBackgroundContainer}></div>
        <SvgIcon name={SvgImageList.CooloursLogo_v2} />
        <div className={styles.headerButtonContainer}>
          <TopMenuButton />
          <DarkModeSwitch
            toggleDarkMode={() => {
              toggleDarkMode();
              trackClientAnalyticsEvent(
                darkMode
                  ? "header_toggle_dark_mode_off"
                  : "header_toggle_dark_mode_on",
              );
            }}
            darkMode={darkMode}
          />
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
