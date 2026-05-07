import React, { useEffect, useState } from "react";
import {
  extractPalette,
  type ColorWithMetadata,
} from "@jimmyclchu/image-palette";
import styles from "./PaletteFromImage.module.css";
import SvgIcon, { SvgImageList } from "~/components/common/SvgIcon/SvgIcon";
import Modal from "~/components/common/Modal/Modal";
import { convertArrayOfHexesIntoUrlPath } from "~/utilities/utilities";
import { Link } from "react-router";
import { useToast } from "~/components/common/Toast/ToastProvider";

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
  const { addToast } = useToast();
  // URL IMPORT
  const [imageUrl, setImageUrl] = useState("");
  const defaultNumberOfSwatches = "6";
  const [numberOfSwatches, setNumberOfSwatches] = useState<string>(
    defaultNumberOfSwatches,
  );

  // ASYNC STATE
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);

  const getPaletteFromUrl = async () => {
    try {
      setIsPending(true);
      const colors = await extractPalette(imageUrl, {
        colorCount: +numberOfSwatches,
        format: "hex",
      });
      setExtractedPalette(colors);
      setIsPending(false);
      addToast("Palette Generated Successfully");
    } catch (error: any) {
      // console.error(error);
      addToast(
        "ERROR DOWNLOADING IMAGE. Try downloading the image and upload the file manually.",
      );
      setIsPending(false);
      setErrorMessage(error);
    }
  };

  // FILE IMPORT
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(
    null,
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // e.target.files is an array-like object
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    } else {
      setUploadedFile(null);
    }
  };

  useEffect(() => {
    if (!uploadedFile) {
      setUploadedFilePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(uploadedFile);
    setUploadedFilePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [uploadedFile]);

  const getPaletteFromFile = async () => {
    // FROM URL (working - when file is not behind CORS)
    if (!uploadedFile) return;
    try {
      setIsPending(true);
      const colors = await extractPalette(uploadedFile, {
        colorCount: +numberOfSwatches,
        format: "hex",
      });
      setExtractedPalette(colors);
      setIsPending(false);
      addToast("Palette Generated Successfully");
    } catch (error: any) {
      console.log("ERROR IN: getPaletteFromFile");
      setIsPending(false);
      setErrorMessage(error);
    }
  };

  // EXTRACTED PALETTE
  const [extractedPalette, setExtractedPalette] = useState<
    (string | ColorWithMetadata<string>)[]
  >([]);

  const closeModalAndReset = () => {
    setImageUrl("");
    setNumberOfSwatches(defaultNumberOfSwatches);
    setExtractedPalette([]);
    setUploadedFile(null);
    setUploadedFilePreview(null);
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
        {importAs === "FILE" && (
          <div className={styles.importFromURLContainer}>
            <div className={styles.importFormContainer}>
              <label>Image URL</label>
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
            <button
              className={styles.generateButton}
              onClick={() => getPaletteFromFile()}
              disabled={!uploadedFile}
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
