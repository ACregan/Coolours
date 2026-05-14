import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TopMenuButton from "./TopMenuButton";

vi.mock("~/components/common/SvgIcon/SvgIcon", () => ({
  default: ({ name }: { name: string }) => <svg data-testid={name} />,
  SvgImageList: { Plus: "Plus", Home: "Home" },
}));

vi.mock("./TopMenuButton.module.css", () => ({
  default: {
    headerButton: "headerButton",
    buttonIconContainer: "buttonIconContainer",
    buttonTextContainer: "buttonTextContainer",
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
  useLocation: vi.fn(),
}));

vi.mock("~/hooks/useGoogleAnalytics", () => ({
  trackClientAnalyticsEvent: vi.fn(),
}));

import { useLocation } from "react-router";
import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";

describe("TopMenuButton", () => {
  it("renders CREATE button on '/' and navigates to /create on click", () => {
    vi.mocked(useLocation).mockReturnValue({ pathname: "/" } as any);

    render(<TopMenuButton />);

    expect(screen.getByText("CREATE")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(mockNavigate).toHaveBeenCalledWith("/create");
    expect(trackClientAnalyticsEvent).toHaveBeenCalledWith(
      "header_click_create_button",
    );
  });

  it("renders HOME button on '/create' and navigates to / on click", () => {
    vi.mocked(useLocation).mockReturnValue({ pathname: "/create" } as any);

    render(<TopMenuButton />);

    expect(screen.getByText("HOME")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(trackClientAnalyticsEvent).toHaveBeenCalledWith(
      "header_click_home_button",
    );
  });

  it("renders nothing on an unmatched route", () => {
    vi.mocked(useLocation).mockReturnValue({ pathname: "/other" } as any);

    const { container } = render(<TopMenuButton />);
    expect(container.firstChild).toBeNull();
  });
});
