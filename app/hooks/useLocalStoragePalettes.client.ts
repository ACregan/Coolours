import { useState, useCallback } from "react";

import { type swatchItemType, type swatchType } from "~/types/commonTypes";

type UsePalettesReturn = [
  palettes: swatchItemType[],
  savePalette: (newPalette: swatchItemType) => void,
  removePalette: (id: string) => void,
];

const PALETTES_KEY = "palettes";

const isSwatchType = (value: unknown): value is swatchType => {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.hex === "string" &&
    typeof v.id === "string" &&
    (v.label === undefined || typeof v.label === "string") &&
    (v.locked === undefined || typeof v.locked === "boolean")
  );
};

const isSwatchItemType = (value: unknown): value is swatchItemType => {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.title === "string" &&
    Array.isArray(v.colours) &&
    v.colours.every(isSwatchType) &&
    (v.url === undefined || typeof v.url === "string")
  );
};

const isSwatchItemArray = (value: unknown): value is swatchItemType[] => {
  return Array.isArray(value) && value.every(isSwatchItemType);
};

const readFromStorage = (): swatchItemType[] => {
  try {
    const raw = window.localStorage.getItem(PALETTES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return isSwatchItemArray(parsed) ? parsed : [];
  } catch {
    console.warn("Failed to read palettes from localStorage");
    return [];
  }
};

const writeToStorage = (palettes: swatchItemType[]): void => {
  try {
    window.localStorage.setItem(PALETTES_KEY, JSON.stringify(palettes));
  } catch {
    console.warn("Failed to write palettes to localStorage");
  }
};

const useLocalStoragePalettes = (): UsePalettesReturn => {
  const [palettes, setPalettes] = useState<swatchItemType[]>(readFromStorage);

  const savePalette = useCallback((newPalette: swatchItemType): void => {
    setPalettes((current) => {
      const updated = [...current, newPalette];
      writeToStorage(updated);
      return updated;
    });
  }, []);

  const removePalette = useCallback((title: string): void => {
    setPalettes((current) => {
      const updated = current.filter((palette) => palette.title !== title);
      writeToStorage(updated);
      return updated;
    });
  }, []);

  return [palettes, savePalette, removePalette];
};

export default useLocalStoragePalettes;
