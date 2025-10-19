/**
 * TypeScript types for GraphQL responses
 */

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  description?: string;
  goal_amount: number;
  current_amount: number;
  backer_count: number;
  display_order: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ContributionTier {
  id: string;
  campaign_type_id: string;
  name: string;
  amount: number;
  description?: string;
  benefits: string[];
  stripe_price_id?: string;
  max_backers?: number;
  current_backers: number;
  display_order: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Founder {
  id: string;
  display_name: string;
  location?: string;
  contribution_tier: string;
  total_contributed: number;
  is_featured: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignData {
  campaigns: Campaign[];
  tiers: ContributionTier[];
  founders: Founder[];
}

export interface GetCampaignDataResponse {
  getCampaignData: CampaignData;
}
