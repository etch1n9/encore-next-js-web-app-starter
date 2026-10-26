import { cookies } from "next/headers";
import getRequestClient from "@/app/lib/getRequestClient";
import { isAPIError } from "@/app/lib/client";
import { getTrackContext, trackServerEvent } from "@/app/lib/pendoServer";

export async function POST(req: Request) {
  const data = await req.formData();
  const email = (data.get("email") as string) || "incognito";
  const password = (data.get("password") as string) || "password";
  // True when the form was submitted without an email or password and the
  // "incognito" / "password" fallbacks were used. Never send the values.
  const usedDefaultCredentials = !data.get("email") || !data.get("password");
  const origin = new URL(req.url).origin;

  try {
    const client = getRequestClient();
    const response = await client.auth.Login({ email, password });
    cookies().set("auth-token", response.token);

    // Pendo: the user is authenticated (backend accepted the login and the
    // auth-token cookie is set). No user ID is available here, so the event is
    // attributed to the "system" visitor.
    await trackServerEvent({
      event: "login_succeeded",
      properties: {
        used_default_credentials: usedDefaultCredentials,
        redirect_origin: origin,
      },
      context: getTrackContext(req),
    });
  } catch (error) {
    console.error(error);

    // Pendo: sign-in attempt failed. Error code / HTTP status distinguish bad
    // credentials (e.g. "unauthenticated", 401) from backend errors.
    await trackServerEvent({
      event: "login_failed",
      properties: {
        error_code: isAPIError(error) ? error.code : "unknown",
        error_status: isAPIError(error) ? error.status : null,
        error_message:
          error instanceof Error ? error.message.substring(0, 100) : "unknown",
        used_default_credentials: usedDefaultCredentials,
      },
      context: getTrackContext(req),
    });
  }

  return Response.redirect(origin);
}
