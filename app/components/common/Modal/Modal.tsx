import { type ReactNode } from "react";
import styles from "./Modal.module.css";
import SvgIcon, { SvgImageList } from "../SvgIcon/SvgIcon";

type ModalProps = {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
};

const Modal = ({ open, title = "Modal", children, onClose }: ModalProps) => {
  if (!open) return null;

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalWindow}>
        <header className={styles.modalHeader}>
          <h6>{title}</h6>
          <button type="button" onClick={onClose}>
            <SvgIcon name={SvgImageList.Close} fill="#ffffff" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
};

export default Modal;
