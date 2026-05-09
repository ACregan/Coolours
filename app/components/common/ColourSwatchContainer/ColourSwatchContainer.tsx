import React from "react";
import styles from "./ColourSwatchContainer.module.css";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import type { swatchType } from "~/types/commonTypes";

interface ColourSwatchContainerProps {
  children: React.ReactNode;
  swatchesList: swatchType[];
  setSwatchesList: (swatches: swatchType[]) => void;
}

const ColourSwatchContainer: React.FC<ColourSwatchContainerProps> = ({
  children,
  swatchesList,
  setSwatchesList,
}) => {
  return (
    <DragDropProvider
      onDragEnd={(event: DragEndEvent) => {
        if (event.canceled) return;

        const { source, target } = event.operation;

        if (isSortable(source) && isSortable(target)) {
          setSwatchesList(move(swatchesList, event));
        }
      }}
    >
      <div className={styles.swatchesContainer}>{children}</div>
    </DragDropProvider>
  );
};

export default ColourSwatchContainer;
