import { useCallback, useEffect, useRef, useState } from "react";

import { ApiFailure, readApi, type PublicMoneyball } from "./shared";

const REFRESH_MS = 20_000;

export type LiveStatus = "loading" | "ready" | "missing" | "error";

/**
 * Keeps one Moneyball event fresh so the purse grows on screen as teams pay.
 * Re-fetches every 20 seconds, and stops while the tab is in the background.
 */
export function useLivePurse(
  id: string | undefined,
  initial: PublicMoneyball | null = null,
  initiallyMissing = false,
) {
  const [event, setEvent] = useState<PublicMoneyball | null>(initial);
  const [status, setStatus] = useState<LiveStatus>(
    initial ? "ready" : initiallyMissing ? "missing" : "loading",
  );
  const latest = useRef(0);

  const refresh = useCallback(async () => {
    if (!id) return;

    const request = ++latest.current;

    try {
      const response = await fetch(`/api/moneyball/${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      const data = await readApi<{ event: PublicMoneyball }>(response);

      if (request !== latest.current) return;
      setEvent(data.event);
      setStatus("ready");
    } catch (error) {
      if (request !== latest.current) return;

      if (error instanceof ApiFailure && error.status === 404) {
        setEvent(null);
        setStatus("missing");
      } else {
        // A dropped request keeps the last good numbers on screen.
        setStatus((current) => (current === "ready" ? "ready" : "error"));
      }
    }
  }, [id]);

  useEffect(() => {
    if (!id || initiallyMissing) return;
    if (!initial) refresh();

    const timer = window.setInterval(() => {
      if (!document.hidden) refresh();
    }, REFRESH_MS);
    const onVisible = () => {
      if (!document.hidden) refresh();
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [id, refresh]);

  return { event, status, refresh };
}
