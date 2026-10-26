"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { trackEvent } from "@/app/lib/pendo";

// Module-level guard so each error instance is reported to Pendo only once,
// even if the effect re-runs (e.g. React Strict Mode or re-renders).
const trackedErrors = new WeakSet<Error>();

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const requiresLogin = error.message === "invalid auth param";

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);

    // Pendo: loading the user list or a user's details failed.
    if (!trackedErrors.has(error)) {
      trackedErrors.add(error);
      trackEvent("user_directory_load_failed", {
        error_type: requiresLogin ? "unauthenticated" : "unknown",
        error_message: error.message.substring(0, 100),
        error_digest: error.digest ?? null,
        requires_login: requiresLogin,
      });
    }
  }, [error, requiresLogin]);

  if (requiresLogin) {
    return <p>You need to login to view this data</p>;
  }

  return <p>Something went wrong!</p>;
}
