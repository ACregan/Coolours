import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePagePalette from "./HomepagePalette";

vi.mock("~/components/common/SvgIcon/SvgIcon", () => ({
  default: ({ name }: { name: string }) => <svg data-testid={name} />,
  SvgImageList: { Link: "Link" },
}));

vi.mock("./HomepagePalette.module.css", () => ({
  default: {
    swatchListItemContainer: "swatchListItemContainer",
    swatchTitleContainer: "swatchTitleContainer",
    swatchName: "swatchName",
    swatchLink: "swatchLink",
    darkMode: "darkMode",
    lightMode: "lightMode",
    swatchesContainer: "swatchesContainer",
    swatch: "swatch",
    closerToWhite: "closerToWhite",
    closerToBlack: "closerToBlack",
    colourHex: "colourHex",
    humanReadableName: "humanReadableName",
  },
}));

vi.mock("react-router", () => ({
  Link: ({
    to,
    children,
    onClick,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <a href={to} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("~/hooks/useGoogleAnalytics", () => ({
  trackClientAnalyticsEvent: vi.fn(),
}));

vi.mock("hex-color-to-color-name", () => ({
  GetColorName: vi.fn(() => "Mock Color Name"),
}));

vi.mock("~/utilities/utilities", () => ({
  isCloserToWhite: vi.fn(),
  normalizeHex: vi.fn((hex: string) => hex.toUpperCase()),
}));

import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";
import { isCloserToWhite } from "~/utilities/utilities";

const mockColours = [
  { hex: "ff0000", id: "1" },
  { hex: "000000", id: "2" },
];

const defaultProps = {
  title: "Test Palette",
  url: "create/ff0000-000000",
  colours: mockColours,
  darkMode: false,
};

describe("HomePagePalette", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isCloserToWhite).mockReturnValue(false);
  });

  describe("title", () => {
    it("renders the palette title", () => {
      render(<HomePagePalette {...defaultProps} />);
      expect(screen.getByText("Test Palette")).toBeInTheDocument();
    });
  });

  describe("edit colours link", () => {
    it("renders the edit colours link when url is provided", () => {
      render(<HomePagePalette {...defaultProps} />);
      expect(screen.getByText("EDIT COLOURS")).toBeInTheDocument();
    });

    it("does not render the edit colours link when url is empty", () => {
      render(<HomePagePalette {...defaultProps} url="" />);
      expect(screen.queryByText("EDIT COLOURS")).not.toBeInTheDocument();
    });

    it("link points to the correct url", () => {
      render(<HomePagePalette {...defaultProps} />);
      expect(document.querySelector("a")).toHaveAttribute(
        "href",
        "create/ff0000-000000",
      );
    });

    it("applies lightMode class when darkMode is false", () => {
      render(<HomePagePalette {...defaultProps} darkMode={false} />);
      expect(document.querySelector("a")).toHaveClass("lightMode");
    });

    it("applies darkMode class when darkMode is true", () => {
      render(<HomePagePalette {...defaultProps} darkMode={true} />);
      expect(document.querySelector("a")).toHaveClass("darkMode");
    });

    it("tracks analytics event when edit colours link is clicked", () => {
      render(<HomePagePalette {...defaultProps} />);
      fireEvent.click(document.querySelector("a")!);
      expect(trackClientAnalyticsEvent).toHaveBeenCalledWith(
        "homepage_click_edit_colours",
      );
    });
  });

  describe("colour swatches", () => {
    it("renders a swatch for each colour", () => {
      render(<HomePagePalette {...defaultProps} />);
      const swatches = document.querySelectorAll(".swatch");
      expect(swatches).toHaveLength(mockColours.length);
    });

    it("renders the normalised hex value for each colour", () => {
      render(<HomePagePalette {...defaultProps} />);
      expect(screen.getByText("#FF0000")).toBeInTheDocument();
      expect(screen.getByText("#000000")).toBeInTheDocument();
    });

    it("renders the human readable colour name for each colour", () => {
      render(<HomePagePalette {...defaultProps} />);
      const colorNames = screen.getAllByText("Mock Color Name");
      expect(colorNames).toHaveLength(mockColours.length);
    });

    it("sets the background color style for each swatch", () => {
      render(<HomePagePalette {...defaultProps} />);
      const swatches = document.querySelectorAll(".swatch");
      expect(swatches[0]).toHaveStyle({ backgroundColor: "#ff0000" });
      expect(swatches[1]).toHaveStyle({ backgroundColor: "#000000" });
    });

    it("applies closerToWhite class when isCloserToWhite returns true", () => {
      vi.mocked(isCloserToWhite).mockReturnValue(true);
      render(
        <HomePagePalette
          {...defaultProps}
          colours={[{ hex: "ffffff", id: "1" }]}
        />,
      );
      expect(document.querySelector(".swatch")).toHaveClass("closerToWhite");
    });

    it("applies closerToBlack class when isCloserToWhite returns false", () => {
      vi.mocked(isCloserToWhite).mockReturnValue(false);
      render(
        <HomePagePalette
          {...defaultProps}
          colours={[{ hex: "000000", id: "1" }]}
        />,
      );
      expect(document.querySelector(".swatch")).toHaveClass("closerToBlack");
    });

    it("renders no swatches when colours array is empty", () => {
      render(<HomePagePalette {...defaultProps} colours={[]} />);
      expect(document.querySelectorAll(".swatch")).toHaveLength(0);
    });
  });
});
