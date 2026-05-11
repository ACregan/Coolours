import React, { useState } from "react";
import styles from "./HomePage.module.css";
import type { swatchItemType } from "~/types/commonTypes";
import SvgIcon, { SvgImageList } from "../common/SvgIcon/SvgIcon";
import { Link } from "react-router";
import { useTheme } from "../common/DarkMode/DarkModeContext";
import initialData from "./initialData";
import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";
import useLocalStoragePalettes from "~/hooks/useLocalStoragePalettes.client";
import HomePagePalette from "./HomepagePalette/HomepagePalette";

const HomePage = () => {
  const [palette] = useLocalStoragePalettes();

  const colourSwatchData = initialData.swatches;

  const { darkMode } = useTheme();

  return (
    <div
      className={`${styles.swatchListContainer} ${darkMode ? styles.darkMode : styles.lightMode}`}
    >
      {palette.length > 0 && (
        <>
          <h4>Saved Palettes</h4>
          {palette.map((swatch: swatchItemType) => {
            return <HomePagePalette {...swatch} darkMode={darkMode} />;
          })}
        </>
      )}

      {colourSwatchData && (
        <>
          <h4>Example Palettes</h4>
          {colourSwatchData.map((swatch: swatchItemType) => {
            return <HomePagePalette {...swatch} darkMode={darkMode} />;
          })}
        </>
      )}

      <footer>
        <div className={styles.leftCell}>
          <Link
            to="https://perpetualsummer.ltd/"
            target="_blank"
            onClick={() =>
              trackClientAnalyticsEvent("click_perpetual_summer_site_link")
            }
          >
            <SvgIcon name={SvgImageList.PerpetualSummer} fill="white" />
          </Link>
        </div>
        <div className={styles.centerCell}></div>
        <div className={styles.rightCell}>
          <p>A fun project by</p>
          <Link
            to="https://www.anthonycregan.co.uk/"
            target="_blank"
            onClick={() =>
              trackClientAnalyticsEvent("click_anthony_cregan_site_link")
            }
          >
            <div className={styles.acLogoContainer}>
              <div className={styles.acLogoWrapper}>
                <SvgIcon name={SvgImageList.AnthonyCregan} />
              </div>
              <p>
                Anthony
                <br />
                Cregan
              </p>
            </div>
          </Link>
          <div className={styles.socialLinks}>
            <Link
              to="https://github.com/acregan"
              target="_blank"
              onClick={() =>
                trackClientAnalyticsEvent("click_github_social_link")
              }
            >
              <SvgIcon name={SvgImageList.Github} fill="white" />
            </Link>
            <Link
              to="https://www.linkedin.com/in/anthony-cregan-64965267/"
              target="_blank"
              onClick={() =>
                trackClientAnalyticsEvent("click_linkedin_social_link")
              }
            >
              <SvgIcon name={SvgImageList.LinkedIn} fill="white" />
            </Link>
            <Link
              to="https://stackoverflow.com/users/3626334/anthony-cregan"
              target="_blank"
              onClick={() =>
                trackClientAnalyticsEvent("click_stackoverflow_social_link")
              }
            >
              <SvgIcon name={SvgImageList.StackOverflow} fill="white" />
            </Link>
            <Link
              to="https://bsky.app/profile/anthonycregan.dev"
              target="_blank"
              onClick={() =>
                trackClientAnalyticsEvent("click_bluesky_social_link")
              }
            >
              <SvgIcon name={SvgImageList.BlueSky} fill="white" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
