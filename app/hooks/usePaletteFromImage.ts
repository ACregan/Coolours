import {
  extractPalette,
  type ColorWithMetadata,
} from "@jimmyclchu/image-palette";
import React, { useEffect, useState } from "react";
import { useTheme } from "~/components/common/DarkMode/DarkModeContext";
import { useToast } from "~/components/common/Toast/ToastProvider";

type usePaletteFromImageModalProps = {
  onClose: Function;
};
const usePaletteFromimage = ({ onClose }: usePaletteFromImageModalProps) => {
  const { addToast } = useToast();
  const { darkMode } = useTheme();

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
      console.log("ERROR IN: getPaletteFromFile:", error);
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

  return {
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
  };
};

export default usePaletteFromimage;
