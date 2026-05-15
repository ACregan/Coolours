import React from "react";
import styles from "./OverwriteExistingPaletteModal.module.css";
import Modal from "~/components/common/Modal/Modal";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";
import LittleBigButton from "~/components/common/BigButton/LittleBigButton";

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
        <LittleBigButton
          size="little"
          onClick={() => {
            overwritePaletteInLocalStorage();
          }}
          svgIconName={SvgImageList.CircleTick}
          label="YES"
          darkMode={darkMode}
          status="danger"
        />
        <LittleBigButton
          size="little"
          onClick={() => setSaveModalOpen(false)}
          svgIconName={SvgImageList.CircleCross}
          label="NO"
          darkMode={darkMode}
          status="success"
        />
      </div>
    </Modal>
  );
};

export default OverwriteExistingPaletteModal;
