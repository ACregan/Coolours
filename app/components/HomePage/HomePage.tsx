import React, { useState } from "react";
import { GetColorName } from "hex-color-to-color-name";
import styles from "./HomePage.module.css";
import { isCloserToWhite } from "~/utilities/utilities";
import type {
  swatchType,
  swatchItemType,
  swatchListTypes,
} from "~/types/commonTypes";
import SvgIcon, { SvgImageList } from "../common/SvgIcon/SvgIcon";
import { Link } from "react-router";
import { useTheme } from "../common/DarkMode/DarkModeContext";

const initialData: swatchListTypes = {
  swatches: [
    {
      title: "Coolourful",
      colours: [
        {
          hex: "e6f456",
        },
        {
          hex: "ffbf10",
        },
        {
          hex: "e40e52",
        },
        {
          hex: "008ae6",
        },
        {
          hex: "0056e3",
        },
        {
          hex: "005481",
        },
      ],
      url: "create/e6f456-ffbf10-e40e52-008ae6-0056e3-005481?name=Coolourful",
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
      title: "Cyberpunk Clouds",
      colours: [
        { hex: "f5e511" },
        { hex: "1f1220" },
        { hex: "323161" },
        { hex: "773070" },
        { hex: "bc84a2" },
        { hex: "6b2e35" },
      ],
      url: "create/f5e511-1f1220-323161-773070-bc84a2-6b2e35?name=Cyberpunk%20Clouds",
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
      title: "Retro Cushion",
      colours: [
        { hex: "380606" },
        { hex: "511a15" },
        { hex: "7a311d" },
        { hex: "814133" },
        { hex: "9b4528" },
        { hex: "9f4f35" },
        { hex: "c06f32" },
        { hex: "c98647" },
        { hex: "f1eeeb" },
        { hex: "cebba6" },
        { hex: "a49487" },
      ],

      url: "create/380606-511a15-7a311d-814133-9b4528-9f4f35-c06f32-c98647-f1eeeb-cebba6-a49487?name=Retro%20Cushion",
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
    {
      title: "Spectral ZX",
      colours: [
        { hex: "37b49a" },
        { hex: "3dbdd9" },
        { hex: "2893c8" },
        { hex: "1369b6" },
        { hex: "72457c" },
        { hex: "d12141" },
        { hex: "e85521" },
        { hex: "ff8800" },
        { hex: "f1b82c" },
        { hex: "e3e758" },
        { hex: "8ac959" },
        { hex: "30aa5a" },
      ],

      url: "create/37b49a-3dbdd9-2893c8-1369b6-72457c-d12141-e85521-ff8800-f1b82c-e3e758-8ac959-30aa5a?name=Spectral%20ZX",
    },
  ],
};

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
                <a href={swatch.url} className={styles.swatchLink}>
                  <SvgIcon
                    name={SvgImageList.Link}
                    fill={darkMode ? "white" : "black"}
                  />
                </a>
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
      <footer>
        <div className={styles.leftCell}>
          <Link to="https://perpetualsummer.ltd/" target="_blank">
            <SvgIcon name={SvgImageList.PerpetualSummer} fill="white" />
          </Link>
        </div>
        <div className={styles.centerCell}></div>
        <div className={styles.rightCell}>
          <p>A fun project by</p>
          <Link to="https://www.anthonycregan.co.uk/" target="_blank">
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
            <Link to="https://github.com/acregan" target="_blank">
              <SvgIcon name={SvgImageList.Github} fill="white" />
            </Link>
            <Link
              to="https://www.linkedin.com/in/anthony-cregan-64965267/"
              target="_blank"
            >
              <SvgIcon name={SvgImageList.LinkedIn} fill="white" />
            </Link>
            <Link
              to="https://stackoverflow.com/users/3626334/anthony-cregan"
              target="_blank"
            >
              <SvgIcon name={SvgImageList.StackOverflow} fill="white" />
            </Link>
            <Link
              to="https://bsky.app/profile/anthonycregan.dev"
              target="_blank"
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
