import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import styles from "./core-layout.module.css";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";
import { useTheme } from "~/components/common/DarkMode/DarkModeContext";
import DarkModeSwitch from "./DarkModeSwitch/DarkModeSwitch";

export default function CoreLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const TopMenuButton = () => {
    if (location.pathname === "/") {
      return (
        <button
          className={styles.headerButton}
          onClick={() => navigate("/create")}
          type="button"
        >
          <div className={styles.buttonIconContainer}>
            <SvgIcon name={SvgImageList.Plus} />
          </div>
          <div className={styles.buttonTextContainer}>CREATE</div>
        </button>
      );
    }
    if (location.pathname.includes("/create")) {
      return (
        <button
          className={styles.headerButton}
          onClick={() => navigate("/")}
          type="button"
        >
          <div className={styles.buttonIconContainer}>
            <SvgIcon name={SvgImageList.Home} />
          </div>
          <div className={styles.buttonTextContainer}>HOME</div>
        </button>
      );
    }
  };

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
            toggleDarkMode={() => toggleDarkMode()}
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
