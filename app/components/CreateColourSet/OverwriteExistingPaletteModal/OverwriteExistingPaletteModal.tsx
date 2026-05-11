import React from "react";
import styles from "./OverwriteExistingPaletteModal.module.css";
import Modal from "~/components/common/Modal/Modal";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";

interface OverwriteExistingPaletteModalProps {
  swatchesName: string;
  saveModalOpen: boolean;
  setSaveModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  darkMode: boolean;
  overwritePaletteInLocalStorage: () => void;
}

const OverwriteExistingPaletteModal: React.FC<
  OverwriteExistingPaletteModalProps
> = ({
  swatchesName,
  saveModalOpen,
  setSaveModalOpen,
  darkMode,
  overwritePaletteInLocalStorage,
}) => {
  return (
    <Modal
      title={`Overwrite Existing Palette: ${swatchesName}`}
      open={saveModalOpen}
      onClose={() => {
        setSaveModalOpen(false);
      }}
      darkMode={darkMode}
    >
      <div className={styles.overwriteButtonContainer}>
        <button
          className={styles.overwriteButton}
          type="button"
          onClick={() => {
            overwritePaletteInLocalStorage();
          }}
        >
          <SvgIcon name={SvgImageList.CircleTick} />
          <span>YES</span>
        </button>
        <button
          className={styles.overwriteButton}
          type="button"
          onClick={() => setSaveModalOpen(false)}
        >
          <SvgIcon name={SvgImageList.CircleCross} />
          <span>NO</span>
        </button>
      </div>
    </Modal>
  );
};

export default OverwriteExistingPaletteModal;
