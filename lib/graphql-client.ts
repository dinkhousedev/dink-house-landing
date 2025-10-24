/**
 * AWS AppSync GraphQL Client Configuration
 *
 * This module configures the Amplify API client to connect to AWS AppSync
 * using API key authentication for public queries.
 */

import { Amplify } from "aws-amplify";

const endpoint = process.env.NEXT_PUBLIC_APPSYNC_API_URL;
const apiKey = process.env.NEXT_PUBLIC_APPSYNC_API_KEY;

// Configure Amplify once - this works in both server and client environments
if (endpoint && apiKey) {
  Amplify.configure(
    {
      API: {
        GraphQL: {
          endpoint,
          region: process.env.NEXT_PUBLIC_APPSYNC_REGION || "us-east-1",
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
