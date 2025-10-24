import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Progress } from "@heroui/react";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { generateClient } from "aws-amplify/api";

import DefaultLayout from "@/layouts/default";
import ContributionModal from "@/components/ContributionModal";
import { getCampaignImageUrl } from "@/config/media-urls";
import { logger } from "@/lib/logger";
import { formatBenefit } from "@/lib/format-benefits";
import "@/lib/graphql-client";
import { LIST_CAMPAIGNS, LIST_CONTRIBUTION_TIERS, LIST_FOUNDERS } from "@/lib/graphql-queries";

interface CampaignType {
  id: string;
  name: string;
  slug: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  backer_count: number;
  display_order: number;
}

interface ContributionTier {
  id: string;
  campaign_type_id: string;
  name: string;
  amount: number;
  description: string;
  benefits: Array<{ text: string }>;
  current_backers: number;
  max_backers: number | null;
  display_order: number;
}

interface FounderEntry {
  id: string;
  display_name: string;
  location: string | null;
  contribution_tier: string;
  total_contributed: number;
  is_featured: boolean;
}

// Campaign images mapping
const CAMPAIGN_IMAGES = {
  "ball-machines": getCampaignImageUrl("ball_machine.jpg"),
  "dink-boards": getCampaignImageUrl("dinkboard.webp"),
};

export default function CampaignPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignType[]>([]);
  const [tiers, setTiers] = useState<Record<string, ContributionTier[]>>({});
  const [founders, setFounders] = useState<FounderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<ContributionTier | null>(
    null,
  );
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignType | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    fetchAllCampaignData();
  }, []);

  // Check for successful payment redirect
  useEffect(() => {
    if (router.query.success === "true") {
      setShowSuccessMessage(true);
      // Refresh data to show updated amounts
      fetchAllCampaignData();
      // Clean up URL after 500ms
      setTimeout(() => {
        router.replace("/campaign", undefined, { shallow: true });
      }, 500);
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.success]);

  // Fetch all campaign data using GraphQL (single query!)
  const fetchAllCampaignData = async () => {
    try {
      logger.info("Fetching campaigns from AWS AppSync GraphQL...");

      const client = generateClient();

      // Fetch campaigns using GraphQL
      const campaignsResponse = await client.graphql({
        query: LIST_CAMPAIGNS,
      });

      const campaignsData =
        "data" in campaignsResponse
          ? campaignsResponse.data.listCampaigns
          : null;

      logger.debug("Campaigns response:", campaignsData);

      setCampaigns(campaignsData || []);

      // Fetch contribution tiers using GraphQL
      const tiersResponse = await client.graphql({
        query: LIST_CONTRIBUTION_TIERS,
      });

      const tiersData =
        "data" in tiersResponse
          ? tiersResponse.data.listContributionTiers
          : null;

      // Group tiers by campaign
      const tiersByCampaign: Record<string, ContributionTier[]> = {};

      (tiersData || []).forEach((tier: any) => {
        if (!tiersByCampaign[tier.campaign_type_id]) {
          tiersByCampaign[tier.campaign_type_id] = [];
        }

        // Parse benefits if it's a JSON string
        let parsedBenefits = tier.benefits;

        if (typeof tier.benefits === "string") {
          try {
            parsedBenefits = JSON.parse(tier.benefits);
          } catch (e) {
            logger.warn("Failed to parse benefits:", e);
            parsedBenefits = [];
          }
        }

        // Convert benefits array to expected format
        const benefits = Array.isArray(parsedBenefits)
          ? parsedBenefits.map((b: any) =>
              typeof b === "string" ? { text: b } : b,
            )
          : [];

        // Debug: Log first tier's benefits
        if (Object.keys(tiersByCampaign).length === 0) {
          logger.debug("First tier benefits:", benefits);
        }

        tiersByCampaign[tier.campaign_type_id].push({
          ...tier,
          benefits,
        });
      });

      setTiers(tiersByCampaign);

      // Fetch founders using GraphQL
      const foundersResponse = await client.graphql({
        query: LIST_FOUNDERS,
      });

      const foundersData =
        "data" in foundersResponse
          ? foundersResponse.data.listFounders
          : null;

      setFounders(foundersData || []);

      logger.debug("Campaigns loaded:", campaignsData?.length);
      logger.debug("Tiers loaded:", tiersData?.length);
      logger.debug("Founders loaded:", foundersData?.length);
      logger.debug(
        "First 3 tier IDs:",
        tiersData?.slice(0, 3).map((t: any) => ({ id: t.id, name: t.name })),
      );
    } catch (error) {
      logger.error("Error fetching campaign data from GraphQL:", error);
      // Fallback to REST API if GraphQL fails
      logger.warn("Falling back to REST API...");
      await fetchCampaignDataREST();
    } finally {
      setLoading(false);
    }
  };

  // Fallback: REST API version (kept for compatibility)
  const fetchCampaignDataREST = async () => {
    try {
      logger.info("Fetching data from REST API...");

      const [campaignsResponse, tiersResponse, foundersResponse] =
        await Promise.all([
          fetch("/api/campaigns"),
          fetch("/api/contribution-tiers"),
          fetch("/api/founders"),
        ]);

      const [campaignsData, tiersData, foundersData] = await Promise.all([
        campaignsResponse.json(),
        tiersResponse.json(),
        foundersResponse.json(),
      ]);

      setCampaigns(campaignsData || []);

      const tiersByCampaign: Record<string, ContributionTier[]> = {};

      (tiersData || []).forEach((tier: ContributionTier) => {
        if (!tiersByCampaign[tier.campaign_type_id]) {
          tiersByCampaign[tier.campaign_type_id] = [];
        }
        tiersByCampaign[tier.campaign_type_id].push(tier);
      });

      setTiers(tiersByCampaign);
      setFounders(foundersData || []);
    } catch (error) {
      logger.error("Error fetching campaign data from REST:", error);
    }
  };

  const handleSelectTier = (tier: ContributionTier, campaign: CampaignType) => {
    if (tier.max_backers && tier.current_backers >= tier.max_backers) {
      return;
    }
    setSelectedTier(tier);
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTier(null);
    setSelectedCampaign(null);
  };

  const handleContributionSuccess = () => {
    fetchAllCampaignData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePercentage = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Icon
            className="text-dink-lime text-6xl animate-spin"
            icon="solar:loading-linear"
            width={64}
          />
        </div>
      </DefaultLayout>
    );
  }

  const mainCampaign = campaigns.find((c) => c.slug === "main-membership");
  const communityCampaign = campaigns.find(
    (c) => c.slug === "community-support",
  );
  const equipmentCampaigns = campaigns.filter(
    (c) => c.slug !== "main-membership" && c.slug !== "community-support",
  );

  return (
    <DefaultLayout>
      <div className="w-full">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-500">
            <div className="bg-dink-lime text-black px-6 py-4 rounded-lg shadow-2xl shadow-dink-lime/50 flex items-center gap-3 max-w-md">
              <Icon
                className="flex-shrink-0"
                icon="solar:check-circle-bold"
                width={28}
              />
              <div>
                <p className="font-bold text-lg">Contribution Successful! 🎉</p>
                <p className="text-sm opacity-90">
                  Thank you for supporting The Dink House
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Banner - Community Driven */}
        <section className="relative bg-gradient-to-b from-black via-gray-900 to-black py-20 sm:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="court-pattern" />
          </div>

          <LazyMotion features={domAnimation}>
            <m.div
              animate={{ opacity: 1, y: 0 }}
              className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center">
                {/* Community Badge */}
                <m.div
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-dink-lime/10 border border-dink-lime/30 rounded-full mb-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.2 }}
                >
                  <Icon
                    className="text-dink-lime"
                    icon="solar:users-group-rounded-bold"
                    width={20}
                  />
                  <span className="text-sm font-semibold text-dink-lime uppercase tracking-wide">
                    Community Powered
                  </span>
                </m.div>

                {/* Main Title */}
                <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold uppercase tracking-tight mb-6">
                  <span className="block text-white">Built By The</span>
                  <span className="block text-dink-lime mt-2">Community</span>
                  <span className="block text-white/80 text-2xl sm:text-3xl lg:text-4xl mt-4">
                    For The Community
                  </span>
                </h1>

                {/* Description */}
                <p className="mt-6 text-base sm:text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  Join Bell County residents in building our first premier
                  pickleball facility. Every contribution brings us closer to 10
                  championship courts, professional equipment, and a thriving
                  community hub.{" "}
                  <span className="text-dink-lime font-semibold">
                    This is our house
                  </span>{" "}
                  — built together, owned by the community, and designed for
                  generations of play.
                </p>

                {/* Stats Bar */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="bg-gray-900/50 border border-gray-800 rounded-xl p-4"
                    >
                      <div className="text-3xl font-bold text-dink-lime">
                        {calculatePercentage(
                          campaign.current_amount,
                          campaign.goal_amount,
                        )}
                        %
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {campaign.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {campaign.backer_count} supporters
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </m.div>
          </LazyMotion>
        </section>

        {/* Product Showcase - Equipment Campaigns */}
        {equipmentCampaigns.length > 0 && (
          <section className="bg-gray-950 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white mb-4">
                  <span className="text-dink-lime">Essential</span> Equipment
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Help us bring professional-grade training equipment to The
                  Dink House
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {equipmentCampaigns.map((campaign) => {
                  const imageUrl =
                    CAMPAIGN_IMAGES[
                      campaign.slug as keyof typeof CAMPAIGN_IMAGES
                    ];
                  const percentage = calculatePercentage(
                    campaign.current_amount,
                    campaign.goal_amount,
                  );

                  return (
                    <Card
                      key={campaign.id}
                      className="group bg-gray-900 border-2 border-gray-800 hover:border-dink-lime/50 transition-all duration-300 overflow-hidden"
                    >
                      {/* Product Image */}
                      {imageUrl && (
                        <div className="relative h-64 sm:h-80 overflow-hidden">
                          <Image
                            fill
                            alt={campaign.name}
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            src={imageUrl}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

                          {/* Progress Badge */}
                          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-full border border-dink-lime/30">
                            <span className="text-dink-lime font-bold text-lg">
                              {percentage}%
                            </span>
                            <span className="text-gray-400 text-sm ml-2">
                              Funded
                            </span>
                          </div>
                        </div>
                      )}

                      <CardBody className="p-6">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {campaign.name}
                        </h3>
                        <p className="text-gray-400 mb-4">
                          {campaign.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-6">
                          <div className="flex justify-between items-baseline mb-2">
                            <span className="text-2xl font-bold text-dink-lime">
                              {formatCurrency(campaign.current_amount)}
                            </span>
                            <span className="text-sm text-gray-500">
                              of {formatCurrency(campaign.goal_amount)}
                            </span>
                          </div>
                          <Progress
                            className="max-w-full"
                            classNames={{
                              indicator: "bg-dink-lime",
                              track: "bg-gray-800",
                            }}
                            value={percentage}
                          />
                          <div className="flex justify-between mt-2 text-sm text-gray-400">
                            <span>{campaign.backer_count} backers</span>
                            <span>{100 - percentage}% to go</span>
                          </div>
                        </div>

                        {/* Quick Tiers */}
                        <div className="space-y-2">
                          {(tiers[campaign.id] || [])
                            .slice(0, 2)
                            .map((tier) => {
                              const isFull =
                                tier.max_backers &&
                                tier.current_backers >= tier.max_backers;

                              return (
                                <button
                                  key={tier.id}
                                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                    isFull
                                      ? "border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed"
                                      : "border-dink-lime/20 bg-gray-800/50 hover:border-dink-lime hover:bg-gray-800 cursor-pointer"
                                  }`}
                                  disabled={!!isFull}
                                  onClick={() =>
                                    !isFull && handleSelectTier(tier, campaign)
                                  }
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <div className="font-semibold text-white">
                                        {tier.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {tier.description}
                                      </div>
                                    </div>
                                    <div className="text-dink-lime font-bold">
                                      {formatCurrency(tier.amount)}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                        </div>

                        <Button
                          className="w-full mt-4 bg-dink-lime text-black font-bold hover:bg-dink-lime/90"
                          onPress={() => {
                            const firstTier = tiers[campaign.id]?.[0];

                            if (firstTier)
                              handleSelectTier(firstTier, campaign);
                          }}
                        >
                          View All Tiers
                        </Button>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Community Support Banner */}
        {communityCampaign && (
          <section className="bg-gradient-to-b from-gray-950 to-black py-16 sm:py-20 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="court-pattern" />
            </div>

            <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-r from-dink-lime/10 via-dink-lime/5 to-dink-lime/10 border-4 border-dink-lime/30 rounded-3xl p-8 sm:p-12 overflow-hidden">
                <div className="text-center mb-8">
                  <Icon
                    className="text-dink-lime mx-auto mb-6"
                    icon="solar:hand-heart-bold"
                    width={56}
                  />
                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white mb-4">
                    <span className="text-dink-lime">Support</span> The
                    Community
                  </h2>
                  <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
                    Not a pickleball player? You can still make a difference!
                    Your contribution helps us provide{" "}
                    <span className="text-dink-lime font-semibold">
                      rental paddles, equipment storage, nets, and operational
                      essentials
                    </span>{" "}
                    that make pickleball accessible to everyone in Bell County.
                  </p>
                </div>

                {/* Progress */}
                <div className="mb-8 max-w-2xl mx-auto">
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="text-3xl font-bold text-dink-lime">
                      {formatCurrency(communityCampaign.current_amount)}
                    </span>
                    <span className="text-sm text-gray-400">
                      of {formatCurrency(communityCampaign.goal_amount)}
                    </span>
                  </div>
                  <Progress
                    className="max-w-full"
                    classNames={{
                      indicator: "bg-dink-lime",
                      track: "bg-gray-800",
                    }}
                    value={calculatePercentage(
                      communityCampaign.current_amount,
                      communityCampaign.goal_amount,
                    )}
                  />
                  <div className="flex justify-between mt-2 text-sm text-gray-400">
                    <span>
                      {communityCampaign.backer_count} community supporters
                    </span>
                    <span>
                      {calculatePercentage(
                        communityCampaign.current_amount,
                        communityCampaign.goal_amount,
                      )}
                      % funded
                    </span>
                  </div>
                </div>

                {/* Contribution Tiers */}
                <div className="grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
                  {(tiers[communityCampaign.id] || []).map((tier) => (
                    <button
                      key={tier.id}
                      className="text-left p-4 rounded-xl border-2 border-dink-lime/30 bg-gray-900/50 hover:border-dink-lime hover:bg-gray-900 transition-all cursor-pointer group"
                      onClick={() => handleSelectTier(tier, communityCampaign)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-white text-base group-hover:text-dink-lime transition-colors">
                          {tier.name}
                        </div>
                        <div className="text-dink-lime font-bold text-lg">
                          {formatCurrency(tier.amount)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {tier.description}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <div className="text-sm text-gray-400 flex items-center justify-center gap-2">
                    <Icon
                      className="text-dink-lime"
                      icon="solar:shield-check-bold"
                      width={16}
                    />
                    Secure donation via Stripe • 100% goes to community
                    equipment
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main Campaign - Build the Courts */}
        {mainCampaign && (
          <section className="bg-black py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white mb-4">
                  <span className="text-dink-lime">Main</span> Campaign
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  The foundation of our community — 10 championship courts in
                  Bell County
                </p>
              </div>

              <Card className="bg-gradient-to-br from-gray-900 via-gray-900 to-black border-4 border-dink-lime/30">
                <CardHeader className="p-8 border-b border-gray-800">
                  <div className="w-full">
                    <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                      {mainCampaign.name}
                    </h3>
                    <p className="text-gray-300 text-lg">
                      {mainCampaign.description}
                    </p>
                  </div>
                </CardHeader>

                <CardBody className="p-8">
                  {/* Progress */}
                  <div className="mb-8">
                    <div className="flex justify-between items-baseline mb-3">
                      <span className="text-4xl sm:text-5xl font-bold text-dink-lime">
                        {formatCurrency(mainCampaign.current_amount)}
                      </span>
                      <span className="text-xl text-gray-400">
                        of {formatCurrency(mainCampaign.goal_amount)}
                      </span>
                    </div>
                    <Progress
                      className="max-w-full h-4"
                      classNames={{
                        indicator:
                          "bg-gradient-to-r from-dink-lime to-green-400",
                        track: "bg-gray-800",
                      }}
                      size="lg"
                      value={calculatePercentage(
                        mainCampaign.current_amount,
                        mainCampaign.goal_amount,
                      )}
                    />
                    <div className="flex justify-between mt-3 text-gray-400">
                      <span className="flex items-center gap-2">
                        <Icon
                          icon="solar:users-group-rounded-bold"
                          width={20}
                        />
                        {mainCampaign.backer_count} community members
                      </span>
                      <span className="text-dink-lime font-semibold">
                        {calculatePercentage(
                          mainCampaign.current_amount,
                          mainCampaign.goal_amount,
                        )}
                        % Complete
                      </span>
                    </div>
                  </div>

                  {/* Contribution Tiers */}
                  <div>
                    <h4 className="text-xl font-bold text-white mb-6">
                      Choose Your Impact Level
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {(tiers[mainCampaign.id] || []).map((tier) => {
                        const isFull =
                          tier.max_backers &&
                          tier.current_backers >= tier.max_backers;

                        return (
                          <Card
                            key={tier.id}
                            className={`${
                              isFull
                                ? "bg-gray-800/30 border-2 border-gray-700 opacity-60"
                                : "bg-gray-800/50 border-2 border-dink-lime/30 hover:border-dink-lime hover:bg-gray-800 cursor-pointer"
                            } transition-all duration-200`}
                            isPressable={!isFull}
                            onPress={() =>
                              !isFull && handleSelectTier(tier, mainCampaign)
                            }
                          >
                            <CardBody className="p-5">
                              <div className="flex justify-between items-start mb-3">
                                <h5 className="font-bold text-white text-lg">
                                  {tier.name}
                                </h5>
                                <Chip
                                  className={
                                    isFull
                                      ? "bg-gray-700 text-gray-400"
                                      : "bg-dink-lime/20 text-dink-lime font-bold"
                                  }
                                  size="lg"
                                  variant="flat"
                                >
                                  {formatCurrency(tier.amount)}
                                </Chip>
                              </div>

                              <p className="text-sm text-gray-400 mb-4 min-h-[40px]">
                                {tier.description}
                              </p>

                              <div className="space-y-2">
                                {tier.benefits
                                  ?.slice(0, 3)
                                  .map((benefit, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-2 text-sm"
                                    >
                                      <Icon
                                        className="text-dink-lime flex-shrink-0 mt-0.5"
                                        icon="solar:check-circle-bold"
                                        width={18}
                                      />
                                      <span className="text-gray-300">
                                        {formatBenefit(benefit)}
                                      </span>
                                    </div>
                                  ))}
                                {tier.benefits && tier.benefits.length > 3 && (
                                  <div className="text-xs text-gray-500 pl-6">
                                    +{tier.benefits.length - 3} more benefits
                                  </div>
                                )}
                              </div>

                              {tier.max_backers && (
                                <div className="mt-4 pt-3 border-t border-gray-700">
                                  <div className="text-xs text-gray-500">
                                    {isFull ? (
                                      <span className="text-red-400 font-semibold">
                                        ✕ Fully Backed
                                      </span>
                                    ) : (
                                      <span>
                                        <span className="text-dink-lime font-semibold">
                                          {tier.max_backers -
                                            tier.current_backers}
                                        </span>{" "}
                                        of {tier.max_backers} remaining
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardBody>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </section>
        )}

        {/* Founders Wall Section */}
        <section className="bg-gray-900 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white mb-4">
                <span className="text-dink-lime">Founding</span> Members
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                These community champions are building the future of pickleball
                in Bell County
              </p>
            </div>

            {founders.length === 0 ? (
              <div className="text-center py-16 bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-700">
                <Icon
                  className="text-gray-700 mx-auto mb-4"
                  icon="solar:users-group-rounded-bold"
                  width={80}
                />
                <p className="text-xl text-gray-400 mb-2">
                  Be The First Founding Member!
                </p>
                <p className="text-gray-500">
                  Your name could be the first on our wall
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {founders.map((founder) => (
                  <Card
                    key={founder.id}
                    className={`${
                      founder.is_featured
                        ? "bg-gradient-to-br from-dink-lime/20 to-gray-900 border-2 border-dink-lime shadow-lg shadow-dink-lime/20"
                        : "bg-gray-800 border-2 border-gray-700"
                    } transition-all hover:scale-105`}
                  >
                    <CardBody className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg leading-tight">
                            {founder.display_name}
                          </h3>
                          {founder.location && (
                            <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                              <Icon icon="solar:map-point-bold" width={14} />
                              {founder.location}
                            </p>
                          )}
                        </div>
                        {founder.is_featured && (
                          <Icon
                            className="text-dink-lime flex-shrink-0"
                            icon="solar:medal-star-bold"
                            width={28}
                          />
                        )}
                      </div>
                      <Chip
                        className="bg-dink-lime/20 text-dink-lime font-semibold"
                        size="sm"
                        variant="flat"
                      >
                        {founder.contribution_tier}
                      </Chip>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-gradient-to-b from-black to-gray-900 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative bg-gradient-to-r from-dink-lime/10 via-dink-lime/5 to-dink-lime/10 border-4 border-dink-lime rounded-3xl p-8 sm:p-12 text-center overflow-hidden">
              <div className="absolute inset-0 opacity-5">
                <div className="court-pattern" />
              </div>

              <div className="relative">
                <Icon
                  className="text-dink-lime mx-auto mb-6"
                  icon="solar:hand-heart-bold"
                  width={64}
                />
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  <span className="text-white">Join The </span>
                  <span className="text-dink-lime">Movement</span>
                </h2>
                <p className="text-gray-300 text-lg sm:text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
                  Every contribution, no matter the size, brings us one step
                  closer to opening day. Your support today creates a lasting
                  legacy for pickleball in Bell County.{" "}
                  <span className="text-dink-lime font-bold">
                    Together, we build The Dink House.
                  </span>
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    className="bg-dink-lime text-black font-bold text-lg px-8 py-6 hover:bg-dink-lime/90 shadow-lg shadow-dink-lime/20"
                    endContent={
                      <Icon icon="solar:arrow-right-bold" width={24} />
                    }
                    size="lg"
                    onPress={() => {
                      const campaign = mainCampaign || campaigns[0];
                      const tier = campaign && tiers[campaign.id]?.[0];

                      if (tier && campaign) handleSelectTier(tier, campaign);
                    }}
                  >
                    Become a Founder
                  </Button>

                  <div className="text-sm text-gray-400">
                    <Icon
                      className="inline mr-1 text-dink-lime"
                      icon="solar:shield-check-bold"
                      width={16}
                    />
                    Secure payment via Stripe
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contribution Modal */}
        {selectedTier && selectedCampaign && (
          <ContributionModal
            isOpen={isModalOpen}
            tier={selectedTier}
            onClose={handleCloseModal}
            onSuccess={handleContributionSuccess}
          />
        )}
      </div>
    </DefaultLayout>
  );
}
