import React from "react";
import styles from "./DeletePaletteConfirmationModal.module.css";
import Modal from "~/components/common/Modal/Modal";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";
import LittleBigButton from "~/components/common/BigButton/LittleBigButton";

interface DeletePaletteConfirmationModalProps {
  swatchesName: string;
  deleteModalOpen: boolean;
  setDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  darkMode: boolean;
  deletePaletteFromLocalStorage: () => void;
}

const DeletePaletteConfirmationModal: React.FC<
  DeletePaletteConfirmationModalProps
> = ({
  swatchesName,
  deleteModalOpen,
  setDeleteModalOpen,
  darkMode,
  deletePaletteFromLocalStorage,
}) => {
  return (
    <Modal
      title={`Delete Palette: ${swatchesName}`}
      open={deleteModalOpen}
      onClose={() => {
        setDeleteModalOpen(false);
      }}
      darkMode={darkMode}
    >
      <div className={styles.overwriteButtonContainer}>
        <LittleBigButton
          size="little"
          onClick={() => {
            deletePaletteFromLocalStorage();
          }}
          svgIconName={SvgImageList.CircleTick}
          label="YES"
          darkMode={darkMode}
        />
        <LittleBigButton
          size="little"
          onClick={() => {
            setDeleteModalOpen(false);
          }}
          svgIconName={SvgImageList.CircleCross}
          label="NO"
          darkMode={darkMode}
        />
      </div>
    </Modal>
  );
};

export default DeletePaletteConfirmationModal;
