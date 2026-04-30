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

    default:
      return <p>To Err is Human</p>;
  }
};

export default SvgIcon;
