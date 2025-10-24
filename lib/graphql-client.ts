/**
 * AWS AppSync GraphQL Client Configuration
 *
 * This module configures the Amplify API client to connect to AWS AppSync
 * using API key authentication for public queries.
 */

import { Amplify } from "aws-amplify";

// Only configure if we're in a browser environment and have the required env vars
if (typeof window !== "undefined") {
  const endpoint = process.env.NEXT_PUBLIC_APPSYNC_API_URL;
  const apiKey = process.env.NEXT_PUBLIC_APPSYNC_API_KEY;

  if (endpoint && apiKey) {
    Amplify.configure({
      API: {
        GraphQL: {
          endpoint,
          region: process.env.NEXT_PUBLIC_APPSYNC_REGION || "us-east-1",
          defaultAuthMode: "apiKey",
          apiKey,
        },
      },
    });
  } else {
    console.warn("AppSync configuration missing: endpoint or API key not found");
  }
}

export default Amplify;
