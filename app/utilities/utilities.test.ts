import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isCloserToWhite,
  generateRandomColor,
  generateColorGradient,
  isValidHexColor,
  normalizeHex,
  debounce,
  copyToClipboard,
  generateExportCSS,
  generateExportJS,
  convertArrayOfHexesIntoUrlPath,
  generateUrlPath,
} from "./utilities";

vi.mock("hex-color-to-color-name", () => ({
  GetColorName: vi.fn((hex: string) => "Mock Color"),
}));

describe("isCloserToWhite", () => {
  it("returns true for white", () => {
    expect(isCloserToWhite("#ffffff")).toBe(true);
  });

  it("returns false for black", () => {
    expect(isCloserToWhite("#000000")).toBe(false);
  });

  it("returns true for a light color", () => {
    expect(isCloserToWhite("#eeeeee")).toBe(true);
  });

  it("returns false for a dark color", () => {
    expect(isCloserToWhite("#111111")).toBe(false);
  });

  it("handles hex without #", () => {
    expect(isCloserToWhite("ffffff")).toBe(true);
  });

  it("handles 3-digit shorthand hex", () => {
    expect(isCloserToWhite("#fff")).toBe(true);
    expect(isCloserToWhite("#000")).toBe(false);
  });
});

describe("generateRandomColor", () => {
  it("returns a 6-character hex string", () => {
    const color = generateRandomColor();
    expect(color).toMatch(/^[0-9a-f]{6}$/i);
  });

  it("returns different colors on subsequent calls", () => {
    const colors = new Set(Array.from({ length: 10 }, generateRandomColor));
    expect(colors.size).toBeGreaterThan(1);
  });
});

describe("generateColorGradient", () => {
  it("returns steps + 2 colors (including start and end)", () => {
    const result = generateColorGradient("#000000", "#ffffff", 3);
    expect(result).toHaveLength(5);
  });

  it("first color matches start color", () => {
    const result = generateColorGradient("#000000", "#ffffff", 1);
    expect(result[0].hex).toBe("000000");
  });

  it("last color matches end color", () => {
    const result = generateColorGradient("#000000", "#ffffff", 1);
    expect(result[result.length - 1].hex).toBe("ffffff");
  });

  it("each swatch has a hex and id", () => {
    const result = generateColorGradient("#000000", "#ffffff", 2);
    result.forEach((swatch) => {
      expect(swatch).toHaveProperty("hex");
      expect(swatch).toHaveProperty("id");
    });
  });

  it("handles 3-digit hex input", () => {
    const result = generateColorGradient("#000", "#fff", 1);
    expect(result).toHaveLength(3);
  });
});

describe("isValidHexColor", () => {
  it("returns true for valid 6-digit hex with #", () => {
    expect(isValidHexColor("#ff0000")).toBe(true);
  });

  it("returns true for valid 6-digit hex without #", () => {
    expect(isValidHexColor("ff0000")).toBe(true);
  });

  it("returns false for 3-digit hex", () => {
    expect(isValidHexColor("#fff")).toBe(false);
  });

  it("returns false for invalid characters", () => {
    expect(isValidHexColor("#gggggg")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidHexColor("")).toBe(false);
  });

  it("returns false for too long hex", () => {
    expect(isValidHexColor("#ff000000")).toBe(false);
  });
});

describe("normalizeHex", () => {
  it("expands 3-digit hex and uppercases", () => {
    expect(normalizeHex("#abc")).toBe("AABBCC");
  });

  it("uppercases 6-digit hex", () => {
    expect(normalizeHex("#ff00aa")).toBe("FF00AA");
  });

  it("handles input without #", () => {
    expect(normalizeHex("abc")).toBe("AABBCC");
    expect(normalizeHex("ff00aa")).toBe("FF00AA");
  });

  it("throws for invalid hex", () => {
    expect(() => normalizeHex("#12345")).toThrow('Invalid hex color: "#12345"');
    expect(() => normalizeHex("1234567")).toThrow();
  });
});

describe("debounce", () => {
  it("calls the function after the wait time", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("only calls once if invoked multiple times within wait period", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it("passes arguments to the debounced function", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("arg1", "arg2");
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith("arg1", "arg2");
    vi.useRealTimers();
  });
});

describe("copyToClipboard", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("calls successCB on success", async () => {
    const successCB = vi.fn();
    const failureCB = vi.fn();

    await copyToClipboard("test", successCB, failureCB);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("test");
    expect(successCB).toHaveBeenCalled();
    expect(failureCB).not.toHaveBeenCalled();
  });

  it("calls failureCB on failure", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(
      new Error("fail"),
    );

    const successCB = vi.fn();
    const failureCB = vi.fn();

    await copyToClipboard("test", successCB, failureCB);

    expect(failureCB).toHaveBeenCalled();
    expect(successCB).not.toHaveBeenCalled();
  });

  it("uses defaults when no arguments are passed", () => {
    expect(() => copyToClipboard()).not.toThrow();
  });

  it("uses default failureCB when none is provided", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(
      new Error("fail"),
    );

    expect(() => copyToClipboard("test", vi.fn())).not.toThrow();
  });
});

describe("generateExportCSS", () => {
  it("generates CSS custom properties for each colour", () => {
    const result = generateExportCSS([{ hex: "ff0000", id: "1" }]);
    expect(result).toContain("--mock-color: #FF0000;");
  });

  it("returns empty string for empty array", () => {
    expect(generateExportCSS([])).toBe("");
  });
});

describe("generateExportJS", () => {
  it("generates a JS object string for each colour", () => {
    const result = generateExportJS([{ hex: "ff0000", id: "1" }]);
    expect(result).toContain('"MockColor": "#FF0000"');
  });

  it("wraps output in curly braces", () => {
    const result = generateExportJS([{ hex: "ff0000", id: "1" }]);
    expect(result.startsWith("{")).toBe(true);
    expect(result.endsWith("}")).toBe(true);
  });

  it("returns empty object for empty array", () => {
    expect(generateExportJS([])).toBe("{\n}");
  });
});

describe("convertArrayOfHexesIntoUrlPath", () => {
  it("generates a url path from an array of hex values", () => {
    const result = convertArrayOfHexesIntoUrlPath(["#ff0000", "#00ff00"]);
    expect(result).toBe("/create/ff0000-00ff00?name=Colours%20From%20Image");
  });

  it("handles a single hex value", () => {
    const result = convertArrayOfHexesIntoUrlPath(["#ff0000"]);
    expect(result).toBe("/create/ff0000?name=Colours%20From%20Image");
  });
});

describe("generateUrlPath", () => {
  it("generates a correctly formatted url path", () => {
    const swatches = [
      { hex: "ff0000", id: "1" },
      { hex: "00ff00", id: "2" },
    ];
    const result = generateUrlPath(swatches, "My Palette");
    expect(result).toBe("/create/FF0000-00FF00?name=My%20Palette");
  });

  it("trims whitespace from the palette name", () => {
    const result = generateUrlPath(
      [{ hex: "ff0000", id: "1" }],
      "  My Palette  ",
    );
    expect(result).toContain("name=My%20Palette");
  });

  it("encodes special characters in the name", () => {
    const result = generateUrlPath([{ hex: "ff0000", id: "1" }], "A & B");
    expect(result).toContain("name=A%20%26%20B");
  });
});
