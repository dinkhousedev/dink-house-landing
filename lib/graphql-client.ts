/**
 * AWS AppSync GraphQL Client Configuration
 *
 * This module configures the Amplify API client to connect to AWS AppSync
 * using API key authentication for public queries.
 */

import { Amplify } from "aws-amplify";

const endpoint = process.env.NEXT_PUBLIC_APPSYNC_API_URL;
const apiKey = process.env.NEXT_PUBLIC_APPSYNC_API_KEY;

/** AppSync URLs look like *.appsync-api.<region>.amazonaws.com — region must match for signing. */
function regionFromAppSyncEndpoint(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const m = url.match(/\.appsync-api\.([a-z0-9-]+)\.amazonaws\.com/i);
  return m?.[1];
}

const appsyncRegion =
  process.env.NEXT_PUBLIC_APPSYNC_REGION ||
  regionFromAppSyncEndpoint(endpoint) ||
  "us-east-1";

// Configure Amplify once - this works in both server and client environments
if (endpoint && apiKey) {
  Amplify.configure(
    {
      API: {
        GraphQL: {
          endpoint,
          region: appsyncRegion,
          defaultAuthMode: "apiKey",
          apiKey,
        },
      },
    },
    { ssr: true }, // Enable SSR support
  );
} else if (typeof window !== "undefined") {
  // Only warn in the browser to avoid server-side log spam
  console.warn("AppSync configuration missing: endpoint or API key not found");
}

export default Amplify;
