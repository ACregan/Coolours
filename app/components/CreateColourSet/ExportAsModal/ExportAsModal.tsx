import React from "react";
import styles from "./ExportAsModal.module.css";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";
import Modal from "~/components/common/Modal/Modal";
import {
  copyToClipboard,
  generateExportCSS,
  generateExportJS,
} from "~/utilities/utilities";
import { useToast } from "~/components/common/Toast/ToastProvider";
import type { swatchType } from "~/types/commonTypes";
import { useTheme } from "~/components/common/DarkMode/DarkModeContext";

type PaletteFromUrlModalProps = {
  modalOpen: boolean;
  onClose: Function;
  exportAs: "CSS" | "JS" | null;
  setExportAs: Function;
  swatchesList: swatchType[];
};

const PaletteFromUrlModal: React.FC<PaletteFromUrlModalProps> = ({
  modalOpen,
  onClose,
  exportAs,
  setExportAs,
  swatchesList,
}) => {
  const { addToast } = useToast();
  const { darkMode } = useTheme();
  return (
    <Modal
      title={`Export as${exportAs === null ? "..." : ` ${exportAs}`}`}
      open={modalOpen}
      onClose={() => onClose()}
      darkMode={darkMode}
    >
      <div className={styles.exportModalContentContainer}>
        {exportAs === null && (
          <div className={styles.exportButtonsContainer}>
            <button
              className={styles.exportButton}
              onClick={() => setExportAs("CSS")}
            >
              <span className={styles.exportButtonIcon}>
                <SvgIcon name={SvgImageList.Css} fill={"white"} />
              </span>
              <span className={styles.exportButtonLabel}>CSS Variables</span>
            </button>
            <button
              className={styles.exportButton}
              onClick={() => setExportAs("JS")}
            >
              <span className={styles.exportButtonIcon}>
                <SvgIcon name={SvgImageList.Js} fill={"white"} />
              </span>
              <span className={styles.exportButtonLabel}>
                JSON / Javascript
              </span>
            </button>
          </div>
        )}
        {exportAs === "JS" && (
          <div className={styles.codeForExport}>
            <pre>
              <code>{generateExportJS(swatchesList)}</code>
            </pre>
            <div className={styles.exportButtonContainer}>
              <button
                type="button"
                className={styles.exportBackButton}
                onClick={() => setExportAs(null)}
              >
                <SvgIcon
                  name={SvgImageList.ArrowBack}
                  fill={darkMode ? "black" : "white"}
                />
                Back
              </button>
              <button
                type="button"
                className={styles.exportCopyToClipboardButton}
                onClick={() => {
                  addToast("Colours Copied To Clipboard As JS Object");
                  copyToClipboard(generateExportJS(swatchesList));
                }}
              >
                <SvgIcon
                  name={SvgImageList.Copy}
                  fill={darkMode ? "black" : "white"}
                />
                Copy To Clipboard
              </button>
            </div>
          </div>
        )}
        {exportAs === "CSS" && (
          <div className={styles.codeForExport}>
            <pre>
              <code>{generateExportCSS(swatchesList)}</code>
            </pre>
            <div className={styles.exportButtonContainer}>
              <button
                type="button"
                className={styles.exportBackButton}
                onClick={() => setExportAs(null)}
              >
                <SvgIcon
                  name={SvgImageList.ArrowBack}
                  fill={darkMode ? "black" : "white"}
                />
                Back
              </button>
              <button
                type="button"
                className={styles.exportCopyToClipboardButton}
                onClick={() => {
                  addToast(
                    "Colours Copied To Clipboard As CSS Custom Properties",
                  );
                  copyToClipboard(generateExportCSS(swatchesList));
                }}
              >
                <SvgIcon
                  name={SvgImageList.Copy}
                  fill={darkMode ? "black" : "white"}
                />
                Copy To Clipboard
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PaletteFromUrlModal;
