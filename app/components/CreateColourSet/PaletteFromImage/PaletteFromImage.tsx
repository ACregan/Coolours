import React, { useState } from "react";
import {
  extractPalette,
  type ColorWithMetadata,
} from "@jimmyclchu/image-palette";
import styles from "./PaletteFromImage.module.css";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";
import Modal from "~/components/common/Modal/Modal";
import { convertArrayOfHexesIntoUrlPath } from "~/utilities/utilities";
import { Link, useNavigate } from "react-router";
// import { convertImageElementToBase64 } from "~/utilities/utilities";

type PaletteFromImageModalProps = {
  modalOpen: boolean;
  onClose: Function;
  importAs: "URL" | "FILE" | null;
  setImportAs: Function;
};

const PaletteFromImageModal: React.FC<PaletteFromImageModalProps> = ({
  modalOpen,
  onClose,
  importAs,
  setImportAs,
}) => {
  const navigate = useNavigate();
  // URL IMPORT
  const [imageUrl, setImageUrl] = useState("");
  const defaultNumberOfSwatches = "6";
  const [numberOfSwatches, setNumberOfSwatches] = useState<string>(
    defaultNumberOfSwatches,
  );
  const getPaletteFromUrl = async () => {
    // FROM URL (working - when file is not behind CORS)
    const colors = await extractPalette(imageUrl, {
      colorCount: +numberOfSwatches,
      format: "hex",
    });

    // FROM URL-TO-BASE64 (Again, working - when file is not behind CORS)
    // const imageAsBase64 = await downloadImageAndConvertToBase64(imageUrl);
    // const colors = await extractPalette(imageAsBase64);

    // FROM IMAGE ELEMENT TO BASE64 (Not working - even when file is not behind CORS)
    // const imageAsBase64 = await convertImageElementToBase64(`imagePreview`);
    // const colors = await extractPalette(imageAsBase64);

    setExtractedPalette(colors);
  };

  // FILE IMPORT

  // EXTRACTED PALETTE
  const [extractedPalette, setExtractedPalette] = useState<
    (string | ColorWithMetadata<string>)[]
  >([]);

  const closeModalAndReset = () => {
    setImageUrl("");
    setNumberOfSwatches(defaultNumberOfSwatches);
    setExtractedPalette([]);
    onClose();
  };

  return (
    <Modal
      title={`Import from Image${importAs === "URL" ? " URL" : importAs === "FILE" ? " File" : ""}`}
      open={modalOpen}
      onClose={() => {
        closeModalAndReset();
      }}
    >
      <div className={styles.importModalContentContainer}>
        {importAs === null && (
          <div className={styles.importButtonsContainer}>
            <button
              className={styles.importButton}
              onClick={() => setImportAs("FILE")}
            >
              <span className={styles.importButtonIcon}>
                <SvgIcon name={SvgImageList.ImageUp} />
              </span>
              <span className={styles.importButtonLabel}>
                Upload Image File
              </span>
            </button>
            <button
              className={styles.importButton}
              onClick={() => setImportAs("URL")}
            >
              <span className={styles.importButtonIcon}>
                <SvgIcon name={SvgImageList.Image} />
              </span>
              <span className={styles.importButtonLabel}>Image URL</span>
            </button>
          </div>
        )}
        {importAs === "URL" && (
          <div className={styles.importFromURLContainer}>
            <div className={styles.importFormContainer}>
              <label>Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste Image URL"
              />
            </div>
            <div className={styles.importPreviewContainer}>
              {imageUrl ? (
                <img
                  id="imagePreview"
                  src={imageUrl}
                  className={styles.imagePreview}
                />
              ) : (
                <div>Paste Image URL Into The Input Above</div>
              )}
            </div>
            <div className={styles.numberOfSwatchesContainer}>
              <label htmlFor="numberOfSwatchesRange">Number Of Swatches</label>
              <div className={styles.numberOfSwatchesInputWrapper}>
                <input
                  id="numberOfSwatchesRange"
                  type="range"
                  min={2}
                  max={12}
                  value={numberOfSwatches}
                  onChange={(e) => setNumberOfSwatches(e.target.value)}
                />
                <span>{numberOfSwatches}</span>
              </div>
            </div>
            <button
              className={styles.generateButton}
              onClick={() => getPaletteFromUrl()}
              disabled={!imageUrl}
            >
              <span className={styles.generateButtonIcon}>
                <SvgIcon name={SvgImageList.Palette} />
              </span>
              Generate Colour Palette
            </button>
            {extractedPalette.length > 0 ? (
              <>
                <div className={styles.extractedPaletteContainer}>
                  {extractedPalette.map((colourHex, i) => (
                    <div
                      key={`colourHex_${i}`}
                      className={styles.extractedPaletteSwatch}
                      style={{
                        background:
                          typeof colourHex === "string"
                            ? colourHex
                            : colourHex.color,
                      }}
                    ></div>
                  ))}
                </div>
                <Link
                  className={styles.openInNewTabLink}
                  to={convertArrayOfHexesIntoUrlPath(
                    extractedPalette.map((colourHex) =>
                      typeof colourHex === "string"
                        ? colourHex
                        : colourHex.color,
                    ),
                  )}
                  target="_blank"
                >
                  <button type="button" className={styles.openInNewTabButton}>
                    Open In New Tab
                  </button>
                </Link>
              </>
            ) : null}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PaletteFromImageModal;
