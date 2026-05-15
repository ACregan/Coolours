import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "./HomePage";

vi.mock("~/components/common/SvgIcon/SvgIcon", () => ({
  default: ({ name }: { name: string }) => <svg data-testid={name} />,
  SvgImageList: {
    PerpetualSummer: "PerpetualSummer",
    AnthonyCregan: "AnthonyCregan",
    Github: "Github",
    LinkedIn: "LinkedIn",
    StackOverflow: "StackOverflow",
    BlueSky: "BlueSky",
  },
}));

vi.mock("./HomepagePalette/HomepagePalette", () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="homepage-palette">{title}</div>
  ),
}));

vi.mock("react-router", () => ({
  Link: ({
    to,
    children,
    onClick,
  }: {
    to: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <a href={to} onClick={onClick}>
      {children}
    </a>
  ),
}));

vi.mock("~/hooks/useGoogleAnalytics", () => ({
  trackClientAnalyticsEvent: vi.fn(),
}));

vi.mock("~/hooks/useLocalStoragePalettes.client", () => ({
  default: vi.fn(),
}));

vi.mock("../common/DarkMode/DarkModeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("./initialData", () => ({
  default: {
    swatches: [
      { title: "Example Palette 1", colours: [], url: "create/example-1" },
      { title: "Example Palette 2", colours: [], url: "create/example-2" },
    ],
  },
}));

vi.mock("./HomePage.module.css", () => ({
  default: {
    swatchListContainer: "swatchListContainer",
    darkMode: "darkMode",
    lightMode: "lightMode",
  },
}));

import { useTheme } from "../common/DarkMode/DarkModeContext";
import useLocalStoragePalettes from "~/hooks/useLocalStoragePalettes.client";
import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTheme).mockReturnValue({
      darkMode: false,
      toggleDarkMode: vi.fn(),
    });
    vi.mocked(useLocalStoragePalettes).mockReturnValue([[], vi.fn(), vi.fn()]);
  });

  describe("theme", () => {
    it("applies lightMode class when darkMode is false", () => {
      const { container } = render(<HomePage />);
      expect(container.firstChild).toHaveClass("lightMode");
    });

    it("applies darkMode class when darkMode is true", () => {
      vi.mocked(useTheme).mockReturnValue({
        darkMode: true,
        toggleDarkMode: vi.fn(),
      });
      const { container } = render(<HomePage />);
      expect(container.firstChild).toHaveClass("darkMode");
    });
  });

  describe("example palettes", () => {
    it("renders the Example Palettes heading", () => {
      render(<HomePage />);
      expect(screen.getByText("Example Palettes")).toBeInTheDocument();
    });

    it("renders a HomePagePalette for each item in initialData", () => {
      render(<HomePage />);
      expect(screen.getByText("Example Palette 1")).toBeInTheDocument();
      expect(screen.getByText("Example Palette 2")).toBeInTheDocument();
    });
  });

  describe("saved palettes", () => {
    it("does not render Saved Palettes section when palette is empty", () => {
      render(<HomePage />);
      expect(screen.queryByText("Saved Palettes")).not.toBeInTheDocument();
    });

    it("renders Saved Palettes heading when palettes exist", () => {
      vi.mocked(useLocalStoragePalettes).mockReturnValue([
        [{ title: "My Palette", colours: [], url: "create/my-palette" }],
        vi.fn(),
        vi.fn(),
      ]);
      render(<HomePage />);
      expect(screen.getByText("Saved Palettes")).toBeInTheDocument();
    });

    it("renders a HomePagePalette for each saved palette", () => {
      vi.mocked(useLocalStoragePalettes).mockReturnValue([
        [
          { title: "My Palette 1", colours: [], url: "create/my-palette-1" },
          { title: "My Palette 2", colours: [], url: "create/my-palette-2" },
        ],
        vi.fn(),
        vi.fn(),
      ]);
      render(<HomePage />);
      expect(screen.getByText("My Palette 1")).toBeInTheDocument();
      expect(screen.getByText("My Palette 2")).toBeInTheDocument();
    });
  });

  describe("footer links", () => {
    it("renders the Perpetual Summer link", () => {
      render(<HomePage />);
      expect(
        document.querySelector('a[href="https://perpetualsummer.ltd/"]'),
      ).toBeInTheDocument();
    });

    it("renders the Anthony Cregan link", () => {
      render(<HomePage />);
      expect(
        document.querySelector('a[href="https://www.anthonycregan.co.uk/"]'),
      ).toBeInTheDocument();
    });

    it("renders the GitHub link", () => {
      render(<HomePage />);
      expect(
        document.querySelector('a[href="https://github.com/acregan"]'),
      ).toBeInTheDocument();
    });

    it("renders the LinkedIn link", () => {
      render(<HomePage />);
      expect(
        document.querySelector(
          'a[href="https://www.linkedin.com/in/anthony-cregan-64965267/"]',
        ),
      ).toBeInTheDocument();
    });

    it("renders the StackOverflow link", () => {
      render(<HomePage />);
      expect(
        document.querySelector(
          'a[href="https://stackoverflow.com/users/3626334/anthony-cregan"]',
        ),
      ).toBeInTheDocument();
    });

    it("renders the BlueSky link", () => {
      render(<HomePage />);
      expect(
        document.querySelector(
          'a[href="https://bsky.app/profile/anthonycregan.dev"]',
        ),
      ).toBeInTheDocument();
    });
  });

  describe("footer analytics", () => {
    it("tracks Perpetual Summer link click", () => {
      render(<HomePage />);
      fireEvent.click(
        document.querySelector('a[href="https://perpetualsummer.ltd/"]')!,
      );
      expect(trackClientAnalyticsEvent).toHaveBeenCalledWith(
        "click_perpetual_summer_site_link",
      );
    });

    it("tracks Anthony Cregan link click", () => {
      render(<HomePage />);
      fireEvent.click(
        document.querySelector('a[href="https://www.anthonycregan.co.uk/"]')!,
      );
      expect(trackClientAnalyticsEvent).toHaveBeenCalledWith(
        "click_anthony_cregan_site_link",
      );
    });

    it("tracks GitHub link click", () => {
      render(<HomePage />);
      fireEvent.click(
        document.querySelector('a[href="https://github.com/acregan"]')!,
      );
      expect(trackClientAnalyticsEvent).toHaveBeenCalledWith(
        "click_github_social_link",
      );
    });

    it("tracks LinkedIn link click", () => {
      render(<HomePage />);
      fireEvent.click(
        document.querySelector(
          'a[href="https://www.linkedin.com/in/anthony-cregan-64965267/"]',
        )!,
      );
      expect(trackClientAnalyticsEvent).toHaveBeenCalledWith(
        "click_linkedin_social_link",
      );
    });

    it("tracks StackOverflow link click", () => {
      render(<HomePage />);
      fireEvent.click(
        document.querySelector(
          'a[href="https://stackoverflow.com/users/3626334/anthony-cregan"]',
        )!,
      );
      expect(trackClientAnalyticsEvent).toHaveBeenCalledWith(
        "click_stackoverflow_social_link",
      );
    });

    it("tracks BlueSky link click", () => {
      render(<HomePage />);
      fireEvent.click(
        document.querySelector(
          'a[href="https://bsky.app/profile/anthonycregan.dev"]',
        )!,
      );
      expect(trackClientAnalyticsEvent).toHaveBeenCalledWith(
        "click_bluesky_social_link",
      );
    });
  });
});
