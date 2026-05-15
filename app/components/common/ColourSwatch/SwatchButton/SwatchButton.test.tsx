import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SwatchButton from "./SwatchButton";
import { SvgImageList } from "../../SvgIcon/SvgIcon";

vi.mock("../../SvgIcon/SvgIcon", () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => (
    <span data-testid={`svg-${name}`}>{name}</span>
  ),
  SvgImageList: {
    Plus: "Plus",
    Delete: "Delete",
  },
}));

vi.mock("./SwatchButton.module.css", () => ({
  default: {
    swatchButton: "swatchButton",
    closerToWhite: "closerToWhite",
    closerToBlack: "closerToBlack",
    leftAlignedLabel: "leftAlignedLabel",
    textLabel: "textLabel",
  },
}));

describe("SwatchButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the icon and label", () => {
    render(
      <SwatchButton
        icon={SvgImageList.Plus}
        label="Add"
        onClick={vi.fn()}
        closerToWhite={true}
      />,
    );

    expect(screen.getByTestId("svg-Plus")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(
      <SwatchButton
        icon={SvgImageList.Delete}
        label="Remove"
        onClick={onClick}
        closerToWhite={false}
      />,
    );

    fireEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies closerToWhite class when closerToWhite is true", () => {
    const { container } = render(
      <SwatchButton
        icon={SvgImageList.Plus}
        label="Test"
        onClick={vi.fn()}
        closerToWhite={true}
      />,
    );

    expect(container.firstChild).toHaveClass("swatchButton", "closerToWhite");
  });

  it("applies closerToBlack class when closerToWhite is false", () => {
    const { container } = render(
      <SwatchButton
        icon={SvgImageList.Plus}
        label="Test"
        onClick={vi.fn()}
        closerToWhite={false}
      />,
    );

    expect(container.firstChild).toHaveClass("swatchButton", "closerToBlack");
  });

  it("applies leftAlignedLabel class when labelAlignment is left", () => {
    const { container } = render(
      <SwatchButton
        icon={SvgImageList.Plus}
        label="Test"
        onClick={vi.fn()}
        labelAlignment="left"
        closerToWhite={true}
      />,
    );

    expect(container.firstChild).toHaveClass(
      "swatchButton",
      "leftAlignedLabel",
    );
  });

  it("does not apply leftAlignedLabel class when labelAlignment is right (default)", () => {
    const { container } = render(
      <SwatchButton
        icon={SvgImageList.Plus}
        label="Test"
        onClick={vi.fn()}
        closerToWhite={true}
      />,
    );

    expect(container.firstChild).toHaveClass("swatchButton");
    expect(container.firstChild).not.toHaveClass("leftAlignedLabel");
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <SwatchButton
        icon={SvgImageList.Plus}
        label="Test"
        onClick={vi.fn()}
        closerToWhite={true}
        disabled={true}
      />,
    );

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is not disabled when disabled prop is false or undefined", () => {
    render(
      <SwatchButton
        icon={SvgImageList.Plus}
        label="Test"
        onClick={vi.fn()}
        closerToWhite={true}
        disabled={false}
      />,
    );

    expect(screen.getByRole("button")).not.toBeDisabled();
  });
});
