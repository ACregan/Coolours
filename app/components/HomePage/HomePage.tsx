import React from "react";
import { getColorName, initColors, ORIGINAL_COLORS } from "ntc-ts";
import useLocalStorage from "~/hooks/useLocalStorage";
import styles from "./HomePage.module.css";
import { isCloserToWhite } from "~/utilities/utilities";
import type {
  swatchType,
  swatchItemType,
  swatchListTypes,
} from "~/types/commonTypes";
import SvgIcon, { SvgImageList } from "../common/SvgIcon/SvgIcon";

const initialData: swatchListTypes = {
  swatches: [
    {
      title: "Very Nice",
      colours: [
        {
          hex: "ffdb00",
        },
        {
          hex: "3dd12c",
        },
        {
          hex: "0096f3",
        },
        {
          hex: "e82a37",
        },
      ],
      url: "create/ffdb00-3dd12c-0096f3-e82a37?name=Very%20Nice",
    },
    {
      title: "Foggy Morning Forest",
      colours: [
        { hex: "CAD2C5" },
        { hex: "B9C2B7" },
        { hex: "A8B1A9" },
        { hex: "96A19B" },
        { hex: "85908D" },
        { hex: "74807E" },
        { hex: "636F70" },
        { hex: "515F62" },
        { hex: "404E54" },
        { hex: "2F3E46" },
      ],
      url: "create/CAD2C5-B9C2B7-A8B1A9-96A19B-85908D-74807E-636F70-515F62-404E54-2F3E46?name=Foggy%20Morning%20Forest",
    },
    {
      title: "UI Pacific Cyan Highlight",
      colours: [
        { hex: "DCDCDD" },
        { hex: "C5C3C6" },
        { hex: "46494C" },
        { hex: "4C5C68" },
        { hex: "1985A1" },
      ],
      url: "create/DCDCDD-C5C3C6-46494C-4C5C68-1985A1?name=UI%20Pacific%20Cyan%20Highlight",
    },
    {
      title: "UI Button Statuses",
      colours: [
        { hex: "01295F" },
        { hex: "437F97" },
        { hex: "849324" },
        { hex: "FFB30F" },
        { hex: "FD151B" },
      ],
      url: "create/01295F-437F97-849324-FFB30F-FD151B?name=UI%20Button%20Statuses",
    },
    {
      title: "Pastel Sauce",
      colours: [
        { hex: "4D9DE0" },
        { hex: "E15554" },
        { hex: "E1BC29" },
        { hex: "3BB273" },
        { hex: "7768AE" },
      ],
      url: "create/4D9DE0-E15554-E1BC29-3BB273-7768AE?name=Pastel%20Sauce",
    },
    {
      title: "Neonpoleon Dynamite",
      colours: [
        { hex: "9B5DE5" },
        { hex: "F15BB5" },
        { hex: "FEE440" },
        { hex: "00BBF9" },
        { hex: "00F5D4" },
      ],

      url: "create/9B5DE5-F15BB5-FEE440-00BBF9-00F5D4?name=Neonpoleon%20Dynamite",
    },
  ],
};

const HomePage = () => {
  // TODO: Consider Gettin rid of this, we dont use it
  // However, It could be useful to persist them in the users browser
  // so that we can reuse swatches that are saved in localstorage
  // on the homepage.
  const [swatches, setSwatches, clearSwatches] =
    useLocalStorage<swatchListTypes>("swatches", initialData);

  const colourSwatchData = swatches?.swatches || initialData.swatches;

  initColors(ORIGINAL_COLORS);

  return (
    <div className={styles.swatchListContainer}>
      {colourSwatchData.map((swatch) => {
        return (
          <div className={styles.swatchListItemContainer} key={swatch.title}>
            <div className={styles.swatchTitleContainer}>
              <h5 className={styles.swatchName}>{swatch.title}</h5>
              {swatch.url ? (
                <a href={swatch.url} className={styles.swatchLink}>
                  <SvgIcon name={SvgImageList.Link} />
                </a>
              ) : null}
            </div>
            <div className={styles.swatchesContainer}>
              {swatch.colours.map((colour) => {
                const colorNamerNames = getColorName(colour.hex);
                const humanReadableColourName = colorNamerNames.name;

                return (
                  <div
                    key={colour.hex}
                    style={{ backgroundColor: `#${colour.hex}` }}
                    className={`${styles.swatch} ${isCloserToWhite(colour.hex) ? styles.closerToWhite : styles.closerToBlack}`}
                  >
                    <span className={styles.colourHex}>#{colour.hex}</span>
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
    </div>
  );
};

export default HomePage;
