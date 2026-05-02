import { type ReactNode, useRef } from "react";
import styles from "./Modal.module.css";
import SvgIcon, { SvgImageList } from "../SvgIcon/SvgIcon";
import { useClickOutside } from "~/hooks/useClickOutside";

type ModalProps = {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
};

const Modal = ({ open, title = "Modal", children, onClose }: ModalProps) => {
  if (!open) return null;

  // When open, Click Outside Modal should close it
  const modalRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(modalRef as React.RefObject<HTMLDivElement | HTMLElement | undefined>, () => onClose());

  return (
    <div className={styles.modalContainer}>
      <div className={styles.modalWindow} ref={modalRef}>
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
