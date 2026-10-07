import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PrivacyPolicy from "./PrivacyPolicy";

vi.mock("react-router", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

describe("PrivacyPolicy", () => {
  it("names the contact address and the services that receive data", () => {
    render(<PrivacyPolicy />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Privacy Policy" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "hello@perpetualsummer.ltd" })[0],
    ).toHaveAttribute("href", "mailto:hello@perpetualsummer.ltd");
    for (const heading of [
      "What stays on your device",
      "What we collect",
      "AI agents (MCP)",
      "Your rights",
    ]) {
      expect(
        screen.getByRole("heading", { name: heading }),
      ).toBeInTheDocument();
    }
  });
});
