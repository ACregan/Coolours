import React from "react";
import styles from "./AddNewSwatchButton.module.css";
import SvgIcon, { SvgImageList } from "../../SvgIcon/SvgIcon";
import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";

interface AddSwatchButtonProps {
  index: number;
  addSwatch: Function;
}
const AddSwatchButton: React.FC<AddSwatchButtonProps> = ({
  index,
  addSwatch,
}) => {
  return (
    <div
      className={`${styles.hoverCaptureContainer} ${index === 0 ? styles.addBefore : styles.addAfter}`}
    >
      <button
        className={styles.addButton}
        onClick={() => {
          trackClientAnalyticsEvent("add_swatch_click");
          addSwatch(index);
        }}
      >
        <SvgIcon name={SvgImageList.Plus} fill="white" />
      </button>
    </div>
  );
};

export default AddSwatchButton;
