/**
 * GraphQL Queries for Campaign Data
 *
 * This module contains all GraphQL queries used by the landing page
 * to fetch campaign, tier, and founder data from AWS AppSync.
 */

export const LIST_CAMPAIGNS = /* GraphQL */ `
  query ListCampaigns {
    listCampaigns {
      id
      name
      slug
      description
      goal_amount
      current_amount
      backer_count
      display_order
      metadata
      createdAt
      updatedAt
    }
  }
`;

export const GET_CAMPAIGN = /* GraphQL */ `
  query GetCampaign($id: ID!) {
    getCampaign(id: $id) {
      id
      name
      slug
      description
      goal_amount
      current_amount
      backer_count
      display_order
      metadata
      createdAt
      updatedAt
    }
  }
`;

export const LIST_CONTRIBUTION_TIERS = /* GraphQL */ `
  query ListContributionTiers($campaignId: ID) {
    listContributionTiers(campaignId: $campaignId) {
      id
      campaign_type_id
      name
      amount
      description
      benefits
      stripe_price_id
      max_backers
      current_backers
      display_order
      metadata
      createdAt
      updatedAt
    }
  }
`;

export const LIST_FOUNDERS = /* GraphQL */ `
  query ListFounders {
    listFounders {
      id
      display_name
      location
      contribution_tier
      total_contributed
      is_featured
      metadata
      createdAt
      updatedAt
    }
  }
`;

export const GET_CAMPAIGN_DATA = /* GraphQL */ `
  query GetCampaignData {
    getCampaignData {
      campaigns {
        id
        name
        slug
        description
        goal_amount
        current_amount
        backer_count
        display_order
        metadata
        createdAt
        updatedAt
      }
      tiers {
        id
        campaign_type_id
        name
        amount
        description
        benefits
        stripe_price_id
        max_backers
        current_backers
        display_order
        metadata
        createdAt
        updatedAt
      }
      founders {
        id
        display_name
        location
        contribution_tier
        total_contributed
        is_featured
        metadata
        createdAt
        updatedAt
      }
    }
  }
`;
