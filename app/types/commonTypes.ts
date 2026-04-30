type swatchType = {
  hex: string;
  label?: string;
};

type swatchItemType = {
  title: string;
  colours: swatchType[];
  url?: string;
};

type swatchListTypes = {
  swatches: swatchItemType[];
};

export type { swatchType, swatchItemType, swatchListTypes };
