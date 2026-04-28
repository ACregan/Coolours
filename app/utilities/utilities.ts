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

export { isCloserToWhite };
