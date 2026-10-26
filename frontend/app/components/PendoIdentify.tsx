"use client";

import { useEffect } from "react";
import type { user } from "@/app/lib/client";

/**
 * Registers the signed-in user with Pendo. Render this once the signed-in
 * user's user.User record is available. pendo.initialize has already been
 * called in the root layout, so this only calls pendo.identify.
 */
export default function PendoIdentify({ user }: { user: user.User }) {
  useEffect(() => {
    pendo.identify({
      visitor: {
        id: user.id,
        full_name: user.name,
        name: user.name,
      },
    });
  }, [user.id, user.name]);

  return null;
}
