import React, { useEffect, useState, useContext } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import styles from "./core-layout.module.css";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";
import { ToastProvider } from "~/components/common/Toast/ToastProvider";
import {
  ThemeProvider,
  useTheme,
} from "~/components/common/DarkMode/DarkModeContext";

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

  // const [darkMode, setDarkMode] = useState<boolean>(false);

  // useEffect(() => {
  //   console.log("CALLED");
  //   const browserPrefersDarkMode =
  //     window &&
  //     window.matchMedia &&
  //     window.matchMedia("(prefers-color-scheme: dark)").matches;

  //   console.log("Dark Mode? What say your browser?", browserPrefersDarkMode);

  //   if (browserPrefersDarkMode) {
  //     setDarkMode(true);
  //   }
  // }, []);

  const { darkMode, toggleDarkMode } = useTheme();

  return (
    // <ToastProvider>
    //   <ThemeProvider>
    <div
      className={`${styles.coreLayout_container} ${darkMode ? styles.darkMode : styles.lightMode}`}
    >
      <header>
        <SvgIcon name={SvgImageList.CooloursLogo_v2} />
        <div className={styles.headerButtonContainer}>
          <DarkModeSwitch
            toggleDarkMode={() => toggleDarkMode()}
            darkMode={darkMode}
          />
          <TopMenuButton />
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
    //   </ThemeProvider>
    // </ToastProvider>
  );
}
