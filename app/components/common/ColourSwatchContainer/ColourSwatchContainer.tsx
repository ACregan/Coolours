import React from "react";
import styles from "./ColourSwatchContainer.module.css";

interface ColourSwatchContainerProps {
  // Add your props here
  children: React.ReactNode;
}

const ColourSwatchContainer: React.FC<ColourSwatchContainerProps> = ({
  children,
}) => {
  return <div className={styles.swatchesContainer}>{children}</div>;
};

export default ColourSwatchContainer;
