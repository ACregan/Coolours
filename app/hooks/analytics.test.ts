import { afterEach, describe, expect, it, vi } from "vitest";
import { trackClientAnalyticsEvent } from "./analytics";

describe("trackClientAnalyticsEvent", () => {
  afterEach(() => {
    delete window.umami;
  });

  it("sends the event to Umami", () => {
    const track = vi.fn();
    window.umami = { track };
    trackClientAnalyticsEvent("header_click_mcp_button", { from: "test" });
    expect(track).toHaveBeenCalledWith("header_click_mcp_button", {
      from: "test",
    });
  });

  it("does nothing before the Umami script has loaded", () => {
    expect(() =>
      trackClientAnalyticsEvent("header_click_mcp_button"),
    ).not.toThrow();
  });
});
