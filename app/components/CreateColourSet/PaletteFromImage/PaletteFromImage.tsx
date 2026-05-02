import React, { useState } from "react";
import {
  extractPalette,
  type ColorWithMetadata,
} from "@jimmyclchu/image-palette";
import styles from "./PaletteFromImage.module.css";
// import { convertImageElementToBase64 } from "~/utilities/utilities";

type PaletteFromImageProps = {};

const PaletteFromImage: React.FC<PaletteFromImageProps> = ({}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [extractedPalette, setExtractedPalette] = useState<
    (string | ColorWithMetadata<string>)[]
  >([]);

  const getPalette = async () => {
    // FROM URL (working - when file is not behind CORS)
    const colors = await extractPalette(imageUrl, {
      colorCount: 6,
      format: "hex",
    });

    // FROM URL-TO-BASE64 (Again, working - when file is not behind CORS)
    // const imageAsBase64 = await downloadImageAndConvertToBase64(imageUrl);
    // const colors = await extractPalette(imageAsBase64);

    // FROM IMAGE ELEMENT TO BASE64 (Not working - even when file is not behind CORS)
    // const imageAsBase64 = await convertImageElementToBase64(`imagePreview`);
    // const colors = await extractPalette(imageAsBase64);

    console.log(colors);
    setExtractedPalette(colors);
  };

  return (
    <div>
      <input
        type="url"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      {imageUrl && (
        <img id="imagePreview" src={imageUrl} className={styles.imagePreview} />
      )}
      <button onClick={() => getPalette()}>GENERATE PALETTE</button>
      {extractedPalette.map((colourHex) => (
        <div
          className={styles.tempPalette}
          style={{
            background:
              typeof colourHex === "string" ? colourHex : colourHex.color,
          }}
        ></div>
      ))}
    </div>
  );
};

export default PaletteFromImage;

// WHATEVER
// import React, { useState } from "react";

// type PaletteFromImageProps = {
//   imageUrl: string;
//   colorCount?: number;
//   onPaletteExtracted?: (palette: string[]) => void;
// };

// const PaletteFromImage: React.FC<PaletteFromImageProps> = (
//   {
//     imageUrl,
//     colorCount = 5,
//     onPaletteExtracted,
//   },
// ) => {
//   return (
//     <section className="palette-from-image">
//       <div className="palette-from-image__preview">
//         <img src={imageUrl} alt="Palette source" />
//       </div>
//       <div className="palette-from-image__meta">
//         <p>Extract up to {colorCount} colours from the image.</p>
//         {onPaletteExtracted && (
//           <button type="button" onClick={() => onPaletteExtracted([])}>
//             Extract palette
//           </button>
//         )}
//       </div>
//     </section>
//   );
// };

// export default PaletteFromImage;
