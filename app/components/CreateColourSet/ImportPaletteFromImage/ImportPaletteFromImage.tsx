import React from "react";

import styles from "./ImportPaletteFromImage.module.css";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";
import Modal from "~/components/common/Modal/Modal";
import { convertArrayOfHexesIntoUrlPath } from "~/utilities/utilities";
import { Link } from "react-router";
import useImportPaletteFromImage from "~/hooks/useImportPaletteFromImage";
import LittleBigButton from "~/components/common/BigButton/LittleBigButton";

type PaletteFromImageModalProps = {
  modalOpen: boolean;
  onClose: Function;
  importAs: "URL" | "FILE" | null;
  setImportAs: Function;
};

const ImportPaletteFromImageModal: React.FC<PaletteFromImageModalProps> = ({
  modalOpen,
  onClose,
  importAs,
  setImportAs,
}) => {
  const {
    addToast,
    darkMode,
    imageUrl,
    setImageUrl,
    numberOfSwatches,
    setNumberOfSwatches,
    isPending,
    setIsPending,
    errorMessage,
    setErrorMessage,
    getPaletteFromUrl,
    uploadedFile,
    setUploadedFile,
    uploadedFilePreview,
    setUploadedFilePreview,
    handleFileChange,
    getPaletteFromFile,
    extractedPalette,
    setExtractedPalette,
    closeModalAndReset,
  } = useImportPaletteFromImage({
    onClose,
  });

  return (
    <Modal
      title={`Import from Image${importAs === "URL" ? " URL" : importAs === "FILE" ? " File" : ""}`}
      open={modalOpen}
      onClose={() => {
        closeModalAndReset();
      }}
      darkMode={darkMode}
    >
      <div
        className={`${styles.importModalContentContainer}  ${darkMode ? styles.darkMode : styles.lightMode}`}
      >
        {importAs === null && (
          <div className={styles.importButtonsContainer}>
            <LittleBigButton
              size="big"
              onClick={() => setImportAs("FILE")}
              svgIconName={SvgImageList.ImageUp}
              label={"Upload Image File"}
              darkMode={darkMode}
            />

            <LittleBigButton
              size="big"
              onClick={() => setImportAs("URL")}
              svgIconName={SvgImageList.Image}
              label={"Image URL"}
              darkMode={darkMode}
            />
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
              {isPending ? (
                <div className={styles.loaderContainer}>
                  <span className={styles.loader}></span>
                  <h6>Generating Palette, Please Wait</h6>
                </div>
              ) : null}
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
            <LittleBigButton
              size="little"
              svgIconName={SvgImageList.Palette}
              label="Generate Colour Palette"
              onClick={() => getPaletteFromUrl()}
              darkMode={darkMode}
              disabled={
                !imageUrl || +numberOfSwatches === extractedPalette.length
              }
            />
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
                  <LittleBigButton
                    size="little"
                    svgIconName={SvgImageList.Link}
                    label="Open In New Tab"
                    darkMode={darkMode}
                  />
                </Link>
              </>
            ) : null}
          </div>
        )}
        {importAs === "FILE" && (
          <div className={styles.importFromURLContainer}>
            <div className={styles.importFormContainer}>
              <label>
                <span>Select Image File</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                placeholder="Paste Image URL"
              />
            </div>
            <div className={styles.importPreviewContainer}>
              {isPending ? (
                <div className={styles.loaderContainer}>
                  <span className={styles.loader}></span>
                  <h6>Generating Palette, Please Wait</h6>
                </div>
              ) : null}
              {uploadedFile ? (
                <img
                  id="imagePreview"
                  src={uploadedFilePreview || undefined}
                  className={styles.imagePreview}
                />
              ) : (
                <div>Upload Image File Using The Input Above</div>
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
            <LittleBigButton
              size="little"
              svgIconName={SvgImageList.Palette}
              label="Generate Colour Palette"
              onClick={() => getPaletteFromFile()}
              darkMode={darkMode}
              disabled={
                !uploadedFile || +numberOfSwatches === extractedPalette.length
              }
            />
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
                  <LittleBigButton
                    size="little"
                    svgIconName={SvgImageList.Link}
                    label="Open In New Tab"
                    darkMode={darkMode}
                  />
                </Link>
              </>
            ) : null}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImportPaletteFromImageModal;
