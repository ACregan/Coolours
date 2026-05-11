import React from "react";
import styles from "./DeletePaletteConfirmationModal.module.css";
import Modal from "~/components/common/Modal/Modal";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";

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
        <button
          className={styles.overwriteButton}
          type="button"
          onClick={() => {
            deletePaletteFromLocalStorage();
          }}
        >
          <SvgIcon name={SvgImageList.CircleTick} />
          <span>YES</span>
        </button>
        <button
          className={styles.overwriteButton}
          type="button"
          onClick={() => setDeleteModalOpen(false)}
        >
          <SvgIcon name={SvgImageList.CircleCross} />
          <span>NO</span>
        </button>
      </div>
    </Modal>
  );
};

export default DeletePaletteConfirmationModal;
