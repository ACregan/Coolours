import React from "react";

export const SvgImageList = {
  Delete: "Delete",
  Palette: "Palette",
  Copy: "Copy",
  ArrowBack: "ArrowBack",
  ArrowForward: "ArrowForward",
  Home: "Home",
  Plus: "Plus",
  Link: "Link",
  Css: "Css",
  Js: "Js",
  Close: "Close",
  Export: "Export",
  Dropper: "Dropper",
  Image: "Image",
  ImageUp: "ImageUp",
} as const;

export type SvgImageListTypes = keyof typeof SvgImageList;

type SVGiconProp = {
  name: SvgImageListTypes;
  className?: string;
  stroke?: string;
  strokeWidth?: string;
  text?: string;
  fill?: string;
  background?: string;
};

const SvgIcon: React.FC<SVGiconProp> = ({
  name,
  className,
  stroke = "black",
  strokeWidth = "1",
  text,
  fill = "black",
  background = "white",
}) => {
  switch (name) {
    case SvgImageList.Delete:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={fill}
          viewBox="0 -960 960 960"
        >
          <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120zm80-160h80v-360h-80zm160 0h80v-360h-80z"></path>
        </svg>
      );
    case SvgImageList.Palette:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={fill}
          viewBox="0 -960 960 960"
        >
          <path d="M480-80q-82 0-155-31.5t-127.5-86-86-127.5T80-480q0-83 32.5-156t88-127T330-848.5 488-880q80 0 151 27.5t124.5 76 85 115T880-518q0 115-70 176.5T640-280h-74q-9 0-12.5 5t-3.5 11q0 12 15 34.5t15 51.5q0 50-27.5 74T480-80M303-457q17-17 17-43t-17-43-43-17-43 17-17 43 17 43 43 17 43-17m120-160q17-17 17-43t-17-43-43-17-43 17-17 43 17 43 43 17 43-17m200 0q17-17 17-43t-17-43-43-17-43 17-17 43 17 43 43 17 43-17m120 160q17-17 17-43t-17-43-43-17-43 17-17 43 17 43 43 17 43-17"></path>
        </svg>
      );
    case SvgImageList.Copy:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={fill}
          viewBox="0 -960 960 960"
        >
          <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240zm0-80h360v-480H360zM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80zm160-240v-480z"></path>
        </svg>
      );
    case SvgImageList.ArrowBack:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill={fill}
        >
          <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
        </svg>
      );
    case SvgImageList.ArrowForward:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill={fill}
        >
          <path d="M647-440H160v-80h487L423-744l57-56 320 320-320 320-57-56 224-224Z" />
        </svg>
      );
    case SvgImageList.Home:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill={fill}
        >
          <path d="M160-120v-480l320-240 320 240v480H560v-280H400v280H160Z" />
        </svg>
      );
    case SvgImageList.Plus:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill={fill}
        >
          <path d="M427-100.78V-427H100.78v-106H427v-326.22h106V-533h326.22v106H533v326.22H427Z" />
        </svg>
      );
    case SvgImageList.Link:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill={fill}
        >
          <path d="M206.78-100.78q-44.3 0-75.15-30.85-30.85-30.85-30.85-75.15v-546.44q0-44.3 30.85-75.15 30.85-30.85 75.15-30.85H480v106H206.78v546.44h546.44V-480h106v273.22q0 44.3-30.85 75.15-30.85 30.85-75.15 30.85H206.78ZM405.52-332 332-405.52l347.69-347.7H560v-106h299.22V-560h-106v-119.69L405.52-332Z" />
        </svg>
      );
    case SvgImageList.Js:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path
            fill={fill}
            fillRule="evenodd"
            d="M0 0h24v24H0zm18.347 20.12c-1.113 0-1.742-.58-2.225-1.37l-1.833 1.065c.662 1.308 2.015 2.306 4.11 2.306 2.142 0 3.737-1.112 3.737-3.143 0-1.883-1.082-2.72-2.998-3.543l-.564-.241c-.968-.42-1.387-.693-1.387-1.37 0-.547.42-.966 1.08-.966.647 0 1.064.273 1.451.966l1.756-1.127c-.743-1.307-1.773-1.806-3.207-1.806-2.014 0-3.303 1.288-3.303 2.98 0 1.835 1.08 2.704 2.708 3.397l.564.242c1.029.45 1.642.724 1.642 1.497 0 .646-.597 1.113-1.531 1.113m-8.74-.015c-.775 0-1.098-.53-1.452-1.16l-1.836 1.112c.532 1.126 1.578 2.06 3.383 2.06 1.999 0 3.368-1.063 3.368-3.398v-7.7h-2.255v7.67c0 1.127-.468 1.416-1.209 1.416"
            clipRule="evenodd"
          ></path>
        </svg>
      );
    case SvgImageList.Css:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlSpace="preserve"
          viewBox="0 0 512 512"
        >
          <path
            fill={fill}
            id="c133de6af664cd4f011a55de6b001b19"
            d="m483.111.501-42.59 461.314-184.524 49.684L71.47 461.815 28.889.501zM397.29 94.302H111.866l6.885 55.708h144.78l-7.7 3.205-132.07 55.006 4.38 54.453 127.69.414 68.438.217-4.381 72.606-64.058 18.035v-.057l-.525.146-61.864-15.617-3.754-45.07h-57.789l7.511 87.007 116.423 34.429v-.062l.21.062 115.799-33.802 15.021-172.761H255.509l.323-.14 135.83-58.071z"
          ></path>
        </svg>
      );
    case SvgImageList.Close:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill={fill}
        >
          <path d="M256-181.91 181.91-256l224-224-224-224L256-778.09l224 224 224-224L778.09-704l-224 224 224 224L704-181.91l-224-224-224 224Z" />
        </svg>
      );
    case SvgImageList.Export:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={fill}
          viewBox="0 -960 960 960"
        >
          <path d="M571.3-140.78v-105.44h95.13q19.83 0 33.59-13.76t13.76-34.15v-63.04q0-39.13 22.28-70.7 22.29-31.56 59.42-45.13v-14q-37.13-13.57-59.42-45.13-22.28-31.57-22.28-70.7v-63.6q0-19.83-13.76-33.59t-33.59-13.76H571.3v-105.44h113.79q55.65 0 94.89 39.24t39.24 95.46v63.04q0 19.83 13.76 33.87t34.15 14.04h32.09v187.14h-32.09q-20.39 0-34.15 13.76t-13.76 33.58v63.61q0 56.22-39.24 95.46t-94.89 39.24zm-296.39 0q-55.65 0-94.89-39.24t-39.24-95.46v-63.61q0-19.82-13.76-33.58t-33.59-13.76H60.78v-187.14h32.65q19.83 0 33.59-14.04t13.76-33.87v-63.04q0-56.22 39.24-95.46t94.89-39.24H388.7v105.44h-94.57q-19.83 0-33.87 13.76t-14.04 33.59v63.6q0 39.13-22.28 70.7-22.29 31.56-58.85 45.13v14q36.56 13.57 58.85 45.13 22.28 31.57 22.28 70.7v63.04q0 20.39 14.04 34.15t33.87 13.76h94.57v105.44z"></path>
        </svg>
      );
    case SvgImageList.Dropper:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={fill}
          viewBox="0 -960 960 960"
        >
          <path d="M120-120v-190l358-358-58-56 58-56 76 76 124-124q5-5 12.5-8t15.5-3 15 3 13 8l94 94q5 6 8 13t3 15-3 15.5-8 12.5L705-555l76 78-57 57-56-58-358 358zm80-80h78l332-334-76-76-334 332zm447-410 96-96-37-37-96 96zm0 0-37-37z"></path>
        </svg>
      );
    case SvgImageList.ImageUp:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={fill}
          viewBox="0 -960 960 960"
        >
          <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h320v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120zm40-160h480L570-480 450-320l-90-120zm480-280v-167l-64 63-56-56 160-160 160 160-56 56-64-63v167z"></path>
        </svg>
      );
    case SvgImageList.Image:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={fill}
          viewBox="0 -960 960 960"
        >
          <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120zm0-80h560v-560H200zm40-80h480L570-480 450-320l-90-120zm-40 80v-560z"></path>
        </svg>
      );

    default:
      return <p>To Err is Human</p>;
  }
};

export default SvgIcon;
