/**
 * Server-side Pendo Track Event helper.
 *
 * Sends events to Pendo's Track API (POST https://<data host>/data/track) from
 * Next.js route handlers, where the browser-side `pendo.track()` agent is not
 * available.
 *
 * Configuration (environment variables, never commit the key):
 * - PENDO_TRACK_EVENT_SECRET: Pendo Track Event integration key (required).
 * - PENDO_DATA_HOST: Pendo data host (optional, defaults to "data.pendo.io").
 */

type TrackPropertyValue = string | number | boolean | null;

export interface ServerTrackEvent {
  event: string;
  visitorId?: string;
  accountId?: string;
  properties?: Record<string, TrackPropertyValue>;
  context?: {
    ip?: string;
    userAgent?: string;
    url?: string;
    title?: string;
  };
}

const TRACK_TIMEOUT_MS = 2000;

/**
 * Sends a Track Event to Pendo. Never throws: tracking failures are logged and
 * must not affect the application flow.
 */
export async function trackServerEvent({
  event,
  visitorId = "system",
  accountId = "system",
  properties = {},
  context,
}: ServerTrackEvent): Promise<void> {
  const integrationKey = process.env.PENDO_TRACK_EVENT_SECRET;
  if (!integrationKey) {
    console.warn(
      `Pendo track event "${event}" skipped: PENDO_TRACK_EVENT_SECRET is not set`,
    );
    return;
  }
  const dataHost = process.env.PENDO_DATA_HOST || "data.pendo.io";

  try {
    const res = await fetch(`https://${dataHost}/data/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pendo-integration-key": integrationKey,
      },
      body: JSON.stringify({
        type: "track",
        event,
        visitorId,
        accountId,
        timestamp: Date.now(),
        properties,
        context,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(TRACK_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error(
        `Pendo track event "${event}" failed with status ${res.status}`,
      );
    }
  } catch (err) {
    console.error(`Pendo track event "${event}" failed`, err);
  }
}

/**
 * Builds the optional Track API context from an incoming request.
 */
export function getTrackContext(req: Request): ServerTrackEvent["context"] {
  return {
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
    url: req.url,
  };
}
