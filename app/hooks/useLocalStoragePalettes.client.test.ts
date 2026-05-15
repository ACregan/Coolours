import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import useLocalStoragePalettes from "./useLocalStoragePalettes.client";

declare global {
  interface Window {
    localStorage: Storage;
  }
}

describe("useLocalStoragePalettes", () => {
  const samplePalette = {
    title: "My Palette",
    colours: [
      { hex: "#ff0000", id: "1", locked: false },
      { hex: "#00ff00", id: "2", locked: true },
    ],
    url: "/palette/My-Palette",
  };

  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("initializes with an empty array when localStorage is empty", () => {
    const { result } = renderHook(() => useLocalStoragePalettes());

    expect(result.current[0]).toEqual([]);
  });

  it("initializes from valid palettes stored in localStorage", () => {
    window.localStorage.setItem("palettes", JSON.stringify([samplePalette]));

    const { result } = renderHook(() => useLocalStoragePalettes());

    expect(result.current[0]).toEqual([samplePalette]);
  });

  it("returns an empty array when localStorage contains invalid JSON", () => {
    window.localStorage.setItem("palettes", "not-json");
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {
      /* noop */
    });

    const { result } = renderHook(() => useLocalStoragePalettes());

    expect(result.current[0]).toEqual([]);
    expect(consoleWarn).toHaveBeenCalledWith(
      "Failed to read palettes from localStorage",
    );
  });

  it("returns an empty array when localStorage contains invalid palette data", () => {
    window.localStorage.setItem("palettes", JSON.stringify([{ title: 123 }]));
    const { result } = renderHook(() => useLocalStoragePalettes());

    expect(result.current[0]).toEqual([]);
  });

  it("handles localStorage.setItem failures gracefully when saving a palette", () => {
    const { result } = renderHook(() => useLocalStoragePalettes());
    const spy = vi
      .spyOn(window.localStorage, "setItem")
      .mockImplementation(() => {
        throw new Error("quota exceeded");
      });

    act(() => {
      result.current[1](samplePalette);
    });

    expect(result.current[0]).toEqual([samplePalette]);
    spy.mockRestore();
  });

  it("saves a new palette and persists it to localStorage", () => {
    const { result } = renderHook(() => useLocalStoragePalettes());

    act(() => {
      result.current[1](samplePalette);
    });

    expect(result.current[0]).toEqual([samplePalette]);
    expect(
      JSON.parse(window.localStorage.getItem("palettes") ?? "null"),
    ).toEqual([samplePalette]);
  });

  it("removes a palette by title and persists the updated list", () => {
    window.localStorage.setItem("palettes", JSON.stringify([samplePalette]));
    const { result } = renderHook(() => useLocalStoragePalettes());

    act(() => {
      result.current[2](samplePalette.title);
    });

    expect(result.current[0]).toEqual([]);
    expect(
      JSON.parse(window.localStorage.getItem("palettes") ?? "null"),
    ).toEqual([]);
  });

  it("does not remove palettes when the title does not exist", () => {
    window.localStorage.setItem("palettes", JSON.stringify([samplePalette]));
    const { result } = renderHook(() => useLocalStoragePalettes());

    act(() => {
      result.current[2]("Unknown Title");
    });

    expect(result.current[0]).toEqual([samplePalette]);
    expect(
      JSON.parse(window.localStorage.getItem("palettes") ?? "null"),
    ).toEqual([samplePalette]);
  });
});
