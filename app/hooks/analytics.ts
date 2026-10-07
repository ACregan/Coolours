import type { SnakeCase } from "string-ts";

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, data?: Record<string, unknown>) => void;
    };
  }
}

/**
 * Records a custom event in Umami, our own analytics service at
 * analytics.perpetualsummer.ltd. Umami sets no cookies, so events need no
 * consent (see the privacy policy). The script loads with `defer` in
 * root.tsx; events fired before it has loaded are dropped.
 *
 * Event names are kept snake_case, enforced at type level, to match the
 * existing event history.
 */
const trackClientAnalyticsEvent = <T extends string>(
  eventName: T & SnakeCase<T>,
  properties?: Record<string, unknown>,
) => {
  window.umami?.track(eventName, properties);
};

export { trackClientAnalyticsEvent };
