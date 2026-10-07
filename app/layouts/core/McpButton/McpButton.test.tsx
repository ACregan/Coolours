import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import McpButton from "./McpButton";
import { copyToClipboard } from "~/utilities/utilities";
import { trackClientAnalyticsEvent } from "~/hooks/analytics";

const mockAddToast = vi.fn();

vi.mock("~/components/common/SvgIcon/SvgIcon", () => ({
  default: ({ name }: { name: string }) => <svg data-testid={name} />,
  SvgImageList: { Mcp: "Mcp", Copy: "Copy", Close: "Close" },
}));

vi.mock("~/components/common/Toast/ToastProvider", () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

vi.mock("~/components/common/DarkMode/DarkModeContext", () => ({
  useTheme: () => ({ darkMode: false }),
}));

vi.mock("~/utilities/utilities", () => ({
  copyToClipboard: vi.fn(),
}));

vi.mock("~/hooks/analytics", () => ({
  trackClientAnalyticsEvent: vi.fn(),
}));

const MCP_URL = "https://coolours.perpetualsummer.ltd/mcp";

const openModal = () => {
  render(<McpButton />);
  fireEvent.click(
    screen.getByRole("button", { name: /use coolours from your ai agent/i }),
  );
};

describe("McpButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the MCP icon and label, with the modal closed", () => {
    render(<McpButton />);
    expect(screen.getByTestId("Mcp")).toBeInTheDocument();
    expect(screen.getByText("MCP")).toBeInTheDocument();
    expect(screen.queryByText(MCP_URL)).not.toBeInTheDocument();
  });

  it("opens the install modal and tracks the click", () => {
    openModal();
    expect(screen.getByText(MCP_URL)).toBeInTheDocument();
    expect(
      screen.getByText(`claude mcp add --transport http coolours ${MCP_URL}`),
    ).toBeInTheDocument();
    expect(trackClientAnalyticsEvent).toHaveBeenCalledWith(
      "header_click_mcp_button",
    );
  });

  it("copies the server URL", () => {
    openModal();
    fireEvent.click(screen.getAllByRole("button", { name: /copy/i })[0]);
    expect(copyToClipboard).toHaveBeenCalledWith(MCP_URL);
    expect(mockAddToast).toHaveBeenCalledWith("Server URL Copied To Clipboard");
    expect(trackClientAnalyticsEvent).toHaveBeenCalledWith(
      "mcp_copy_server_url",
    );
  });

  it("links to VS Code with the server's http config", () => {
    openModal();
    const href = screen
      .getByRole("link", { name: "Install in VS Code" })
      .getAttribute("href")!;
    expect(href.startsWith("vscode:mcp/install?")).toBe(true);
    expect(
      JSON.parse(decodeURIComponent(href.slice("vscode:mcp/install?".length))),
    ).toEqual({ name: "coolours", type: "http", url: MCP_URL });
  });

  it("links to Cursor with the server's base64 config", () => {
    openModal();
    const url = new URL(
      screen
        .getByRole("link", { name: "Install in Cursor" })
        .getAttribute("href")!,
    );
    expect(url.protocol).toBe("cursor:");
    expect(url.searchParams.get("name")).toBe("coolours");
    expect(JSON.parse(atob(url.searchParams.get("config")!))).toEqual({
      url: MCP_URL,
    });
  });
});
