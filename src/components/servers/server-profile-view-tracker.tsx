"use client";

import { useEffect, useRef } from "react";

export function ServerProfileViewTracker({ serverId }: { serverId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    fetch("/api/servers/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serverId, clickType: "profile" }),
    }).catch(() => {});
  }, [serverId]);

  return null;
}
