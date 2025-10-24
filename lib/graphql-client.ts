/**
 * AWS AppSync GraphQL Client Configuration
 *
 * This module configures the Amplify API client to connect to AWS AppSync
 * using API key authentication for public queries.
 */

import { Amplify } from "aws-amplify";

// Configure Amplify with AppSync settings
Amplify.configure({
  API: {
    GraphQL: {
      endpoint: process.env.NEXT_PUBLIC_APPSYNC_API_URL!,
      region: process.env.NEXT_PUBLIC_APPSYNC_REGION || "us-east-1",
      defaultAuthMode: "apiKey",
      apiKey: process.env.NEXT_PUBLIC_APPSYNC_API_KEY!,
    },
  },
});

export default Amplify;
