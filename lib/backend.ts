/**
 * Server-side URL for dink-house-backend.
 * Production: BACKEND_URL=https://api.thedinkhousepb.com
 * Local: BACKEND_URL=http://localhost:3001
 */
export function getBackendUrl(): string {
  const url = process.env.BACKEND_URL || "https://api.thedinkhousepb.com";

  return url.replace(/\/$/, "");
}

export async function backendFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = `${getBackendUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
}
