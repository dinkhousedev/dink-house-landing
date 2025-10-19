/**
 * AWS AppSync GraphQL Client Configuration
 */

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";

// Configure Amplify with AppSync
Amplify.configure({
  API: {
    GraphQL: {
      endpoint:
        process.env.NEXT_PUBLIC_APPSYNC_URL ||
        "https://qrscofg4tfevrhi7dfgjc5zqai.appsync-api.us-west-1.amazonaws.com/graphql",
      region: process.env.NEXT_PUBLIC_COGNITO_REGION || "us-west-1",
      defaultAuthMode: "apiKey",
      apiKey:
        process.env.NEXT_PUBLIC_APPSYNC_API_KEY || "da2-fakeApiKey123456",
    },
  },
});

// Create GraphQL client
export const graphqlClient = generateClient();
