import colorNames from "color-name";
import {
  generateExportCSS,
  generateExportJS,
  generateUrlPath,
  isValidHexColor,
} from "../../app/utilities/utilities";

export const COOLOURS_ORIGIN = "https://coolours.perpetualsummer.ltd";

/* -= PARSING =- */

/**
 * Converts any colour an agent is likely to produce into the 6-digit,
 * uppercase, '#'-less hex the Coolours URL expects.
 *
 * Accepts: "#abc", "abc", "#aabbcc", "aabbcc", "rgb(1, 2, 3)", "rgb(1 2 3)",
 * and CSS named colours ("rebeccapurple").
 *
 * Throws on anything else, including colours with transparency. Coolours has
 * no alpha channel, and the site silently drops invalid swatches, so failing
 * loudly here is the only way the agent finds out.
 */
export function parseColour(input: string): string {
  const value = input.trim().toLowerCase();

  const hex = value.match(/^#?([0-9a-f]{3,8})$/)?.[1];
  if (hex) {
    if (hex.length === 3) return expandShortHex(hex);
    if (hex.length === 6) return hex.toUpperCase();
    if (hex.length === 4 || hex.length === 8) {
      throw new Error(
        `"${input}" has an alpha channel; Coolours only supports opaque colours`,
      );
    }
  }

  const rgb = value.match(
    /^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/,
  );
  if (rgb) {
    const [, r, g, b, alpha] = rgb;
    if (alpha !== undefined && parseFloat(alpha) !== (alpha.endsWith("%") ? 100 : 1)) {
      throw new Error(
        `"${input}" has an alpha channel; Coolours only supports opaque colours`,
      );
    }
    const channels = [r, g, b].map(Number);
    if (channels.some((c) => c > 255)) {
      throw new Error(`"${input}" has an RGB channel above 255`);
    }
    return rgbToHex(channels as [number, number, number]);
  }

  // hasOwn, not `in`: `in` also matches inherited keys like "constructor"
  if (Object.hasOwn(colorNames, value)) {
    return rgbToHex(colorNames[value as keyof typeof colorNames]);
  }

  throw new Error(
    `Could not parse colour "${input}". Use hex (#RRGGBB or #RGB), rgb(r, g, b), or a CSS colour name`,
  );
}

function expandShortHex(hex: string) {
  return hex
    .split("")
    .map((c) => c + c)
    .join("")
    .toUpperCase();
}

function rgbToHex([r, g, b]: readonly [number, number, number]) {
  return [r, g, b]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/* -= URLS =- */

/** The site's own URL builder, so the links can't drift from what the site reads. */
export function buildPaletteUrl(hexes: string[], name?: string) {
  return `${COOLOURS_ORIGIN}${generateUrlPath(toSwatches(hexes), name ?? "")}`;
}

/**
 * Reads a Coolours palette URL back into hexes, so a palette the user edited
 * on the site can return to the agent. Swatches the site itself would
 * ignore are reported in `ignored` rather than dropped silently.
 */
export function parsePaletteUrl(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`"${url}" is not a valid URL`);
  }

  const match = parsed.pathname.match(/^\/create\/([^/]+)\/?$/);
  if (!match) {
    throw new Error(
      `"${url}" is not a Coolours palette link (expected ${COOLOURS_ORIGIN}/create/RRGGBB-RRGGBB...)`,
    );
  }

  const hexes: string[] = [];
  const ignored: string[] = [];
  for (const segment of match[1].split("-")) {
    if (isValidHexColor(segment)) {
      hexes.push(segment.replace("#", "").toUpperCase());
    } else if (segment) {
      ignored.push(segment);
    }
  }

  return { hexes, name: parsed.searchParams.get("name") || undefined, ignored };
}

/* -= CONTRAST (WCAG 2.x) =- */

function relativeLuminance(hex: string) {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hexA: string, hexB: string) {
  const [light, dark] = [relativeLuminance(hexA), relativeLuminance(hexB)].sort(
    (a, b) => b - a,
  );
  return (light + 0.05) / (dark + 0.05);
}

export type ContrastPair = {
  foreground: string;
  background: string;
  ratio: number;
  /** Highest WCAG level met: AAA ≥ 7, AA ≥ 4.5, "AA large" ≥ 3 (large text / UI components) */
  wcag: "AAA" | "AA" | "AA large" | "fail";
};

/** Every pair of swatches, best contrast first. */
export function contrastPairs(hexes: string[]): ContrastPair[] {
  const pairs: ContrastPair[] = [];
  for (let i = 0; i < hexes.length; i++) {
    for (let j = i + 1; j < hexes.length; j++) {
      const ratio = Math.round(contrastRatio(hexes[i], hexes[j]) * 100) / 100;
      pairs.push({
        foreground: `#${hexes[i]}`,
        background: `#${hexes[j]}`,
        ratio,
        wcag:
          ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA large" : "fail",
      });
    }
  }
  return pairs.sort((a, b) => b.ratio - a.ratio);
}

/* -= EXPORTS =- */

/** CSS custom properties, exactly as the site's Export modal produces them. */
export function exportCss(hexes: string[]) {
  return generateExportCSS(toSwatches(hexes));
}

/** The site's "JSON / Javascript" export: a JS object literal with a trailing comma, not strict JSON. */
export function exportJs(hexes: string[]) {
  return generateExportJS(toSwatches(hexes));
}

/** The site's functions take swatch objects; only `hex` is read. */
function toSwatches(hexes: string[]) {
  return hexes.map((hex, i) => ({ hex, id: String(i) }));
}
