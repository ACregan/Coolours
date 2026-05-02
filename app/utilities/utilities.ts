import type { swatchType } from "~/types/commonTypes";
import { getColorName, initColors, ORIGINAL_COLORS } from "ntc-ts";

/* -= COLOUR UTILITIES =- */

/**
 * Determines if a given hex color is closer to white than to
 * black in RGB color space.
 *
 * This function calculates the Euclidean distance from the color
 * to pure white (255, 255, 255) and to pure black (0, 0, 0), and
 * returns true if the distance to white is smaller.
 *
 * @param hex - The hex color string, which can include or exclude
 * the '#' prefix and be in 3-digit or 6-digit format.
 *
 * @returns True if the color is closer to white, false if closer
 * to black.
 */
function isCloserToWhite(hex: string): boolean {
  // Remove # if present
  hex = hex.replace("#", "");

  // Handle 3-digit hex shorthand by expanding to 6-digit
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Parse to RGB
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Calculate distances
  const distToWhite = Math.sqrt(
    (r - 255) ** 2 + (g - 255) ** 2 + (b - 255) ** 2,
  );
  const distToBlack = Math.sqrt(r ** 2 + g ** 2 + b ** 2);

  // Return true if closer to white
  return distToWhite < distToBlack;
}

/**
 * Generates a random color hex code.
 *
 * @returns A random hex color string in the format '#RRGGBB'.
 */
function generateRandomColor(): string {
  const randomValue = Math.floor(Math.random() * 16777215);
  return `${randomValue.toString(16).padStart(6, "0")}`;
}

/**
 * Generates a gradient of colors between two hex colors, including the start and end colors.
 *
 * @param hex1 - The starting hex color string.
 * @param hex2 - The ending hex color string.
 * @param steps - The number of intermediate colors to generate.
 * @returns An array of objects with hex color strings representing the gradient.
 */
function generateColorGradient(
  hex1: string,
  hex2: string,
  steps: number,
): swatchType[] {
  // Helper to parse hex to RGB
  const parseHex = (hex: string): { r: number; g: number; b: number } => {
    hex = hex.replace("#", "");
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  };

  // Helper to convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
    return `${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const start = parseHex(hex1);
  const end = parseHex(hex2);
  const colors: swatchType[] = [];

  for (let i = 0; i <= steps + 1; i++) {
    const t = i / (steps + 1);
    const r = start.r + (end.r - start.r) * t;
    const g = start.g + (end.g - start.g) * t;
    const b = start.b + (end.b - start.b) * t;
    colors.push({ hex: rgbToHex(r, g, b) });
  }

  return colors;
}

/* -= GENERAL UTILITIES =- */

/**
 * Creates a debounced version of a function that delays execution
 * until after the specified wait time has elapsed since the last call.
 *
 * @param func - The function to debounce.
 * @param wait - The number of milliseconds to wait before executing.
 * @returns A debounced function.
 */
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Writes a given string of text to the users clipboard
 * @param newClip (string) - To be copied to the users clipboard
 * @param successCB (function) - To be called on successful update of clipboard
 * @param failureCB (function) - To be called on failure to update clipboard
 */
function copyToClipboard(
  newClip: string = "",
  successCB: Function = () => {},
  failureCB: Function = () => {},
) {
  navigator.clipboard.writeText(newClip).then(
    () => {
      successCB();
    },
    () => {
      failureCB();
    },
  );
}

/**
 * Validates that a string is a valid 6-character hex color code.
 *
 * @param hex - The string to validate.
 * @returns True if the string is a valid 6-character hex color, false otherwise.
 */
function isValidHexColor(hex: string): boolean {
  return /^#?[0-9A-Fa-f]{6}$/.test(hex);
}

/**
 * Generates a CSS string with custom properties for each color in the list,
 * where each color is defined as a CSS variable with its name and hex value.
 *
 * @param colourList - An array of color swatches to export.
 * @returns A string containing CSS custom properties in the format '--colour-name: #hex;'.
 */
function generateExportCSS(colourList: swatchType[]) {
  initColors(ORIGINAL_COLORS);
  let cssContent = "";
  colourList.map((colour) => {
    const colourName = getColorName(colour.hex)
      .name.replace(" ", "-")
      .toLowerCase();
    cssContent = `${cssContent}--${colourName}: #${colour.hex};\n`;
  });
  return cssContent;
}

/**
 * Generates a JavaScript object string representation of the color list,
 * where each color is keyed by its name and valued by its hex code.
 *
 * @param colourList - An array of color swatches to export.
 * @returns A string containing a JavaScript object literal with color names as keys and hex values as values.
 */
function generateExportJS(colourList: swatchType[]) {
  initColors(ORIGINAL_COLORS);
  let jsContent = "{\n";
  colourList.map((colour) => {
    const colourName = getColorName(colour.hex).name.replace(" ", "");
    jsContent = `${jsContent}    "${colourName}": "#${colour.hex}",\n`;
  });
  jsContent = `${jsContent}}`;
  return jsContent;
}

function convertArrayOfHexesIntoArrayOfObjects(arrayOfHexes: string[]) {
  arrayOfHexes.map((hex: string) => {
    return { hex: hex };
  });
}

function convertArrayOfHexesIntoUrlPath(arrayOfHexes: string[]) {
  let urlString = `/create/`;
  arrayOfHexes.map((hex: string) => {
    urlString = `${urlString}${hex.substring(1)}-`;
  });
  const urlStringWithoutTrailingDash = urlString.slice(0, -1);
  const urlStringWithDefaultLabel = `${urlStringWithoutTrailingDash}?name=Colours%20From%20Image`;
  return urlStringWithDefaultLabel;
}

// async function downloadImageAndConvertToBase64(
//   imageurl: string,
// ): Promise<string> {
//   const response = await fetch(imageurl);
//   const blob = await response.blob();
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//       const result = reader.result as string;
//       const base64 = result.split(",")[1];
//       resolve(base64);
//     };
//     reader.onerror = reject;
//     reader.readAsDataURL(blob);
//   });
// }

// async function convertImageElementToBase64(
//   imageId: string,
// ): Promise<string> {
//   const imageElement = document.getElementById(imageId);
//   if (!imageElement) {
//     throw new Error(`Image element with id "${imageId}" not found.`);
//   }

//   if (!(imageElement instanceof HTMLImageElement)) {
//     throw new Error(`Element with id "${imageId}" is not an HTMLImageElement.`);
//   }

//   const canvas = document.createElement("canvas");
//   canvas.width = imageElement.naturalWidth;
//   canvas.height = imageElement.naturalHeight;

//   const context = canvas.getContext("2d");
//   if (!context) {
//     throw new Error("Unable to get canvas rendering context.");
//   }

//   context.drawImage(imageElement, 0, 0);
//   const dataUrl = canvas.toDataURL("image/png");
//   return dataUrl.split(",")[1];
// }

export {
  isCloserToWhite,
  generateRandomColor,
  generateColorGradient,
  isValidHexColor,
  debounce,
  copyToClipboard,
  generateExportCSS,
  generateExportJS,
  // downloadImageAndConvertToBase64,
  // convertImageElementToBase64,
  convertArrayOfHexesIntoArrayOfObjects,
  convertArrayOfHexesIntoUrlPath,
};
