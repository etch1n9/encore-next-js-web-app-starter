/**
 * Client-side Pendo Track Event helper. Safe to call when the Pendo agent has
 * not been loaded: the call becomes a no-op.
 */

type TrackPropertyValue = string | number | boolean | null;

declare global {
  interface Window {
    pendo?: {
      track: (
        trackType: string,
        metadata?: Record<string, TrackPropertyValue>,
      ) => void;
    };
  }
}

export function trackEvent(
  event: string,
  properties?: Record<string, TrackPropertyValue>,
): void {
  if (typeof window === "undefined") return;

  try {
    window.pendo?.track(event, properties);
  } catch (err) {
    console.error(`Pendo track event "${event}" failed`, err);
  }
}
