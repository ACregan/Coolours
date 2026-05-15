import { render, renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import useGoogleAnalytics, {
  GoogleAnalyticsHead,
  trackClientAnalyticsEvent,
} from "./useGoogleAnalytics";
import { GA_TAG } from "~/constants";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => unknown;
    dataLayer?: unknown[];
  }
}

vi.mock("react-router", () => ({
  useLocation: vi.fn(() => ({ pathname: "/test-path" })),
}));

describe("useGoogleAnalytics", () => {
  const gaMeasurementId = "G-TEST-ID";

  beforeEach(() => {
    delete window.gtag;
    delete window.dataLayer;
    document.head.querySelectorAll("script[src*='googletagmanager.com/gtag/js']").forEach((script) => {
      script.remove();
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.head.querySelectorAll("script[src*='googletagmanager.com/gtag/js']").forEach((script) => {
      script.remove();
    });
  });

  it("returns true when gtag is already present", async () => {
    window.gtag = vi.fn();

    const { result } = renderHook(() => useGoogleAnalytics(gaMeasurementId));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("returns true when no gaMeasurementId is provided", async () => {
    const { result } = renderHook(() => useGoogleAnalytics(undefined));

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("appends the gtag script when no gtag exists and a measurement ID is provided", () => {
    renderHook(() => useGoogleAnalytics(gaMeasurementId));

    const script = document.head.querySelector(
      `script[src='https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}']`,
    );

    expect(script).toBeInstanceOf(HTMLScriptElement);
    expect(script).toHaveProperty("async", true);
  });

  it("initializes window.gtag and sets isInitialized true after the script loads", async () => {
    const { result } = renderHook(() => useGoogleAnalytics(gaMeasurementId));

    const script = document.head.querySelector(
      `script[src='https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}']`,
    ) as HTMLScriptElement | null;

    expect(script).not.toBeNull();
    expect(window.gtag).toBeUndefined();

    await act(async () => {
      script?.onload?.(new Event("load"));
    });

    await waitFor(() => {
      expect(window.gtag).toBeDefined();
      expect(window.dataLayer).toEqual(expect.any(Array));
      expect(result.current).toBe(true);
    });
  });

  it("does not append a second script when gtag already exists", async () => {
    window.gtag = vi.fn();

    renderHook(() => useGoogleAnalytics(gaMeasurementId));

    const scripts = document.head.querySelectorAll(
      `script[src='https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}']`,
    );

    expect(scripts).toHaveLength(0);
  });
});

describe("trackClientAnalyticsEvent", () => {
  beforeEach(() => {
    delete window.gtag;
  });

  it("returns undefined when window.gtag is not available", () => {
    const result = trackClientAnalyticsEvent("test_event", { foo: "bar" });

    expect(result).toBeUndefined();
  });

  it("forwards event name and properties to window.gtag", () => {
    const mockGtag = vi.fn(() => "tracked");
    window.gtag = mockGtag;

    const result = trackClientAnalyticsEvent("test_event", { foo: "bar" });

    expect(mockGtag).toHaveBeenCalledWith("event", "test_event", { foo: "bar" });
    expect(result).toBe("tracked");
  });
});

describe("GoogleAnalyticsHead", () => {
  beforeEach(() => {
    delete window.gtag;
    window.gtag = vi.fn();
  });

  it("calls gtag config with the current page path when initialized", async () => {
    const mockGtag = vi.mocked(window.gtag!);

    render(<GoogleAnalyticsHead />);

    await waitFor(() => {
      expect(mockGtag).toHaveBeenCalledWith("config", GA_TAG, {
        page_path: "/test-path",
      });
    });
  });
});
