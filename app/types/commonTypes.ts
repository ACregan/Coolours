type swatchType = {
  hex: string;
  label?: string;
  locked?: boolean;
  id: string;
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
