import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SvgIcon, { SvgImageList } from "./SvgIcon";

describe("SvgIcon", () => {
  it("exports the SvgImageList constants", () => {
    expect(SvgImageList.Delete).toBe("Delete");
    expect(SvgImageList.Close).toBe("Close");
    expect(SvgImageList.Plus).toBe("Plus");
  });

  it("renders the Close icon as an SVG element with the requested fill", () => {
    const { container } = render(
      <SvgIcon name={SvgImageList.Close} fill="red" />,
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("fill", "red");
    expect(svg?.querySelector("path")).toBeInTheDocument();
  });

  it("renders the Plus icon and applies the fill color", () => {
    const { container } = render(
      <SvgIcon name={SvgImageList.Plus} fill="#00ff00" />,
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("fill", "#00ff00");
    expect(svg?.querySelector("path")).toBeInTheDocument();
  });

  it("renders the Js icon with fill applied to the inner path", () => {
    const { container } = render(
      <SvgIcon name={SvgImageList.Js} fill="blue" />,
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("fill", "none");
    const path = svg?.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute("fill", "blue");
  });

  it("renders a broad set of icons so switch cases are covered", () => {
    const iconNames = [
      SvgImageList.Delete,
      SvgImageList.Palette,
      SvgImageList.Copy,
      SvgImageList.ArrowBack,
      SvgImageList.ArrowForward,
      SvgImageList.Home,
      SvgImageList.Plus,
      SvgImageList.Link,
      SvgImageList.Css,
      SvgImageList.Image,
      SvgImageList.ImageUp,
      SvgImageList.Dropper,
      SvgImageList.Close,
      SvgImageList.Export,
      SvgImageList.DarkMode,
      SvgImageList.DragHandle,
      SvgImageList.Save,
      SvgImageList.CircleTick,
      SvgImageList.CircleCross,
    ];

    const { container } = render(
      <>
        {iconNames.map((iconName) => (
          <SvgIcon key={iconName} name={iconName} fill="purple" />
        ))}
      </>,
    );

    expect(container.querySelectorAll("svg").length).toBe(iconNames.length);
  });
});
