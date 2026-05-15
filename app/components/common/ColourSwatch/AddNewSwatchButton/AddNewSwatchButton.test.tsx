import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AddNewSwatchButton from "./AddNewSwatchButton";
import { trackClientAnalyticsEvent } from "~/hooks/useGoogleAnalytics";

vi.mock("../../SvgIcon/SvgIcon", () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => (
    <span data-testid={`svg-${name}`}>{name}</span>
  ),
  SvgImageList: {
    Plus: "Plus",
  },
}));

vi.mock("~/hooks/useGoogleAnalytics", () => ({
  trackClientAnalyticsEvent: vi.fn(),
}));

vi.mock("./AddNewSwatchButton.module.css", () => ({
  default: {
    hoverCaptureContainer: "hoverCaptureContainer",
    addBefore: "addBefore",
    addAfter: "addAfter",
    addButton: "addButton",
  },
}));

describe("AddNewSwatchButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the plus icon", () => {
    render(<AddNewSwatchButton index={0} addSwatch={vi.fn()} />);

    expect(screen.getByTestId("svg-Plus")).toBeInTheDocument();
  });

  it("calls addSwatch with the passed index when clicked", () => {
    const addSwatch = vi.fn();
    render(<AddNewSwatchButton index={3} addSwatch={addSwatch} />);

    fireEvent.click(screen.getByRole("button"));

    expect(addSwatch).toHaveBeenCalledWith(3);
  });

  it("tracks an analytics event when clicked", () => {
    render(<AddNewSwatchButton index={1} addSwatch={vi.fn()} />);

    fireEvent.click(screen.getByRole("button"));

    expect(trackClientAnalyticsEvent).toHaveBeenCalledWith("add_swatch_click");
  });

  it("renders with addBefore class when index is zero", () => {
    const { container } = render(
      <AddNewSwatchButton index={0} addSwatch={vi.fn()} />,
    );

    expect(container.firstChild).toHaveClass(
      "hoverCaptureContainer",
      "addBefore",
    );
  });

  it("renders with addAfter class when index is greater than zero", () => {
    const { container } = render(
      <AddNewSwatchButton index={2} addSwatch={vi.fn()} />,
    );

    expect(container.firstChild).toHaveClass(
      "hoverCaptureContainer",
      "addAfter",
    );
  });
});
