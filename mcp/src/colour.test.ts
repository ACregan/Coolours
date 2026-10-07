import { describe, expect, it } from "vitest";
import {
  buildPaletteUrl,
  contrastPairs,
  contrastRatio,
  exportCss,
  exportJs,
  namedColours,
  parseColour,
  parsePaletteUrl,
} from "./colour.js";

describe("parseColour", () => {
  it.each([
    ["#1e293b", "1E293B"],
    ["1E293B", "1E293B"],
    ["#abc", "AABBCC"],
    ["  #ABC  ", "AABBCC"],
    ["rgb(255, 0, 128)", "FF0080"],
    ["rgb(255 0 128)", "FF0080"],
    ["rgba(255, 0, 128, 1)", "FF0080"],
    ["rgb(255 0 128 / 100%)", "FF0080"],
    ["rebeccapurple", "663399"],
    ["White", "FFFFFF"],
  ])("%s → %s", (input, expected) => {
    expect(parseColour(input)).toBe(expected);
  });

  it.each(["#aabbcc80", "#abcd", "rgba(0, 0, 0, 0.5)", "rgb(0 0 0 / 50%)"])(
    "rejects alpha in %s",
    (input) => {
      expect(() => parseColour(input)).toThrow(/alpha/);
    },
  );

  it.each(["", "#ggg", "notacolour", "hsl(0 0% 0%)", "#12345", "constructor", "__proto__"])(
    "rejects %j",
    (input) => {
      expect(() => parseColour(input)).toThrow(/Could not parse/);
    },
  );

  it("rejects out-of-range rgb", () => {
    expect(() => parseColour("rgb(256, 0, 0)")).toThrow(/above 255/);
  });
});

describe("palette URLs", () => {
  it("builds the same shape as the site's generateUrlPath", () => {
    expect(buildPaletteUrl(["0F172A", "38BDF8"], " Fintech & Co ")).toBe(
      "https://coolours.perpetualsummer.ltd/create/0F172A-38BDF8?name=Fintech%20%26%20Co",
    );
  });

  it("leaves the name empty when none is given, as the site does", () => {
    expect(buildPaletteUrl(["0F172A"])).toBe(
      "https://coolours.perpetualsummer.ltd/create/0F172A?name=",
    );
  });

  it("round-trips", () => {
    const url = buildPaletteUrl(["0F172A", "38BDF8", "F97316"], "Ocean Sunset");
    expect(parsePaletteUrl(url)).toEqual({
      hexes: ["0F172A", "38BDF8", "F97316"],
      name: "Ocean Sunset",
      ignored: [],
    });
  });

  it("reports segments the site would ignore", () => {
    expect(
      parsePaletteUrl("https://coolours.perpetualsummer.ltd/create/0f172a-xyz-abc"),
    ).toEqual({ hexes: ["0F172A"], name: undefined, ignored: ["xyz", "abc"] });
  });

  it("rejects non-palette URLs", () => {
    expect(() => parsePaletteUrl("https://coolours.perpetualsummer.ltd/")).toThrow(
      /not a Coolours palette link/,
    );
    expect(() => parsePaletteUrl("not a url")).toThrow(/not a valid URL/);
  });
});

describe("contrast", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio("000000", "FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("FFFFFF", "FFFFFF")).toBeCloseTo(1, 5);
    // Commonly cited: #767676 on white is the lightest grey that passes AA
    expect(contrastRatio("767676", "FFFFFF")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("777777", "FFFFFF")).toBeLessThan(4.5);
  });

  it("lists every pair, best first, with WCAG levels", () => {
    const pairs = contrastPairs(["000000", "FFFFFF", "777777"]);
    expect(pairs).toHaveLength(3);
    expect(pairs[0]).toMatchObject({ ratio: 21, wcag: "AAA" });
    expect(pairs.map((p) => p.ratio)).toEqual([...pairs.map((p) => p.ratio)].sort((a, b) => b - a));
    expect(pairs.at(-1)?.wcag).toBe("AA large");
  });
});

describe("namedColours", () => {
  it("uses the site's names, suffixing similar colours by lightness", () => {
    expect(namedColours(["252F34", "FF6347", "2F3A40"])).toEqual([
      { hex: "#252F34", name: "Outer Space Dark" },
      { hex: "#FF6347", name: "Persimmon" },
      { hex: "#2F3A40", name: "Outer Space Light" },
    ]);
  });
});

describe("exports", () => {
  it("produces CSS custom properties named after the nearest colour", () => {
    expect(exportCss(["000000", "FFFFFF"])).toBe("--black: #000000;\n--white: #FFFFFF;\n");
  });

  it("never repeats a variable name for similar colours", () => {
    expect(exportCss(["2F3A40", "252F34"])).toBe(
      "--outer-space-light: #2F3A40;\n--outer-space-dark: #252F34;\n",
    );
  });

  it("produces the site's JS object format", () => {
    expect(exportJs(["000000"])).toBe('{\n    "Black": "#000000",\n}');
  });
});
