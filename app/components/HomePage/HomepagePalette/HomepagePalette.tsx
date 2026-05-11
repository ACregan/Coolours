import React from "react";
import type { swatchType } from "~/types/commonTypes";
import styles from "./HomepagePalette.module.css";
import { Link } from "react-router";
import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";
import { GetColorName } from "hex-color-to-color-name";
import { isCloserToWhite, normalizeHex } from "~/utilities/utilities";

interface HomePagePalleteProps {
  title: string;
  url: string;
  colours: swatchType[];
  darkMode: boolean;
}

const HomePagePalette: React.FC<HomePagePalleteProps> = ({
  title,
  url,
  colours,
  darkMode,
}) => {
  return (
    <div className={styles.swatchListItemContainer} key={title}>
      <div className={styles.swatchTitleContainer}>
        <h5 className={styles.swatchName}>{title}</h5>
        {url ? (
          <Link
            onClick={() => {
              trackClientAnalyticsEvent("homepage_click_edit_colours");
            }}
            to={url}
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
        {colours.map((colour) => {
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
};

export default HomePagePalette;
