import React, { useState } from "react";
import { GetColorName } from "hex-color-to-color-name";
import styles from "./HomePage.module.css";
import { isCloserToWhite, normalizeHex } from "~/utilities/utilities";
import type {
  swatchType,
  swatchItemType,
  swatchListTypes,
} from "~/types/commonTypes";
import SvgIcon, { SvgImageList } from "../common/SvgIcon/SvgIcon";
import { Link } from "react-router";
import { useTheme } from "../common/DarkMode/DarkModeContext";
import initialData from "./initialData";
import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";

const HomePage = () => {
  const [swatches, setSwatches] = useState<swatchListTypes>(initialData);

  const colourSwatchData = swatches?.swatches || initialData.swatches;

  const { darkMode } = useTheme();

  return (
    <div className={styles.swatchListContainer}>
      {colourSwatchData.map((swatch) => {
        return (
          <div className={styles.swatchListItemContainer} key={swatch.title}>
            <div className={styles.swatchTitleContainer}>
              <h5 className={styles.swatchName}>{swatch.title}</h5>
              {swatch.url ? (
                <Link
                  onClick={() => {
                    trackClientAnalyticsEvent("homepage_click_edit_colours");
                  }}
                  to={swatch.url}
                  className={`${styles.swatchLink} ${darkMode ? styles.darkMode : styles.lightMode}`}
                >
                  <span>EDIT COLOURS</span>
                  <SvgIcon
                    name={SvgImageList.Link}
                    fill={darkMode ? "white" : "black"}
                  />
                </Link>
              ) : null}
            </div>
            <div className={styles.swatchesContainer}>
              {swatch.colours.map((colour) => {
                const colorNamerNames = GetColorName(colour.hex);
                const humanReadableColourName = colorNamerNames;

                return (
                  <div
                    key={colour.hex}
                    style={{ backgroundColor: `#${colour.hex}` }}
                    className={`${styles.swatch} ${isCloserToWhite(colour.hex) ? styles.closerToWhite : styles.closerToBlack}`}
                  >
                    <span className={styles.colourHex}>
                      #{normalizeHex(colour.hex)}
                    </span>
                    <span className={styles.humanReadableName}>
                      {humanReadableColourName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
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
