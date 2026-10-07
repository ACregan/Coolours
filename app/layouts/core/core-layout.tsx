import React, { useLayoutEffect, useRef } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router";
import styles from "./core-layout.module.css";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";
import { useTheme } from "~/components/common/DarkMode/DarkModeContext";
import DarkModeSwitch from "./DarkModeSwitch/DarkModeSwitch";
import TopMenuButton from "./TopMenuButton/TopMenuButton";
import McpButton from "./McpButton/McpButton";
import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";

export default function CoreLayout() {
  const { darkMode, toggleDarkMode } = useTheme();

  // <main> is the scrolling element, not the window, so React Router's
  // ScrollRestoration doesn't manage it. Do the same job here: new
  // navigations start at the top (otherwise a link at the bottom of one page
  // opens the next page scrolled down), and back/forward returns to where
  // you were on that history entry. A layout effect swaps the scroll
  // listener before the browser can fire a scroll event for the new page's
  // height, which would otherwise be saved against the old entry.
  const mainRef = useRef<HTMLElement>(null);
  const scrollPositions = useRef(new Map<string, number>());
  const { key } = useLocation();
  const navigationType = useNavigationType();
  useLayoutEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    main.scrollTop =
      navigationType === "POP" ? (scrollPositions.current.get(key) ?? 0) : 0;
    const save = () => scrollPositions.current.set(key, main.scrollTop);
    main.addEventListener("scroll", save, { passive: true });
    return () => main.removeEventListener("scroll", save);
  }, [key, navigationType]);

  return (
    <div
      className={`${styles.coreLayout_container} ${darkMode ? styles.darkMode : styles.lightMode}`}
    >
      <header>
        <div className={styles.darkModeBackgroundContainer}></div>
        <SvgIcon name={SvgImageList.CooloursLogo_v2} />
        <div className={styles.headerButtonContainer}>
          <TopMenuButton />
          <McpButton />
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
      <main ref={mainRef}>
        <Outlet />
      </main>
    </div>
  );
}
