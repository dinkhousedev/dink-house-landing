/**
 * Server-side URL for the Prisma Express backend.
 * Coolify compose: BACKEND_URL=http://backend:3001
 * Local: BACKEND_URL=http://localhost:3001
 */
export function getBackendUrl(): string {
  const url = process.env.BACKEND_URL || "http://localhost:3001";

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
