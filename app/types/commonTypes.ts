type swatchType = {
  hex: string;
  label?: string;
};

type swatchItemType = {
  title: string;
  colours: swatchType[];
};

type swatchListTypes = {
  swatches: swatchItemType[];
};

export type { swatchType, swatchItemType, swatchListTypes };
