import type { swatchType } from "~/types/commonTypes";

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

export { isCloserToWhite, generateRandomColor, generateColorGradient };
