import React from "react";
import styles from "./DeletePaletteConfirmationModal.module.css";
import Modal from "~/components/common/Modal/Modal";
import { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";
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
      title={`Delete Palette?`}
      open={deleteModalOpen}
      onClose={() => {
        setDeleteModalOpen(false);
      }}
      darkMode={darkMode}
    >
      <div className={styles.contentContainer}>
        <p>
          Are you sure you want to delete the palette{" "}
          <span>"{swatchesName}"</span>?
        </p>
      </div>
      <div className={styles.overwriteButtonContainer}>
        <LittleBigButton
          size="little"
          onClick={() => {
            deletePaletteFromLocalStorage();
          }}
          svgIconName={SvgImageList.CircleTick}
          label="YES"
          darkMode={darkMode}
          status="danger"
        />
        <LittleBigButton
          size="little"
          onClick={() => {
            setDeleteModalOpen(false);
          }}
          svgIconName={SvgImageList.CircleCross}
          label="NO"
          darkMode={darkMode}
          status="success"
        />
      </div>
    </Modal>
  );
};

export default DeletePaletteConfirmationModal;
