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
import LittleBigButton from "~/components/common/BigButton/LittleBigButton";

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
            <LittleBigButton
              size="big"
              onClick={() => setExportAs("CSS")}
              svgIconName={SvgImageList.Css}
              label={"CSS Variables"}
              darkMode={darkMode}
            />
            <LittleBigButton
              size="big"
              onClick={() => setExportAs("JS")}
              svgIconName={SvgImageList.Js}
              label={"JSON / Javascript"}
              darkMode={darkMode}
            />
          </div>
        )}
        {exportAs === "JS" && (
          <div className={styles.codeForExport}>
            <pre>
              <code>{generateExportJS(swatchesList)}</code>
            </pre>
            <div className={styles.exportButtonContainer}>
              <LittleBigButton
                size="little"
                onClick={() => setExportAs(null)}
                svgIconName={SvgImageList.ArrowBack}
                label="Back"
                darkMode={darkMode}
              />
              <LittleBigButton
                size="little"
                onClick={() => {
                  addToast("Colours Copied To Clipboard As JS Object");
                  copyToClipboard(generateExportJS(swatchesList));
                }}
                svgIconName={SvgImageList.Copy}
                label="Copy To Clipboard"
                darkMode={darkMode}
              />
            </div>
          </div>
        )}
        {exportAs === "CSS" && (
          <div className={styles.codeForExport}>
            <pre>
              <code>{generateExportCSS(swatchesList)}</code>
            </pre>
            <div className={styles.exportButtonContainer}>
              <LittleBigButton
                size="little"
                onClick={() => setExportAs(null)}
                svgIconName={SvgImageList.ArrowBack}
                label="Back"
                darkMode={darkMode}
              />
              <LittleBigButton
                size="little"
                onClick={() => {
                  addToast(
                    "Colours Copied To Clipboard As CSS Custom Properties",
                  );
                  copyToClipboard(generateExportCSS(swatchesList));
                }}
                svgIconName={SvgImageList.Copy}
                label="Copy To Clipboard"
                darkMode={darkMode}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PaletteFromUrlModal;
