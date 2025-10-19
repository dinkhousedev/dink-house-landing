import React, { useId, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/react";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";

import { logger } from "@/lib/logger";

interface ContributionTier {
  id: string;
  campaign_type_id: string;
  name: string;
  amount: number;
  description: string;
  benefits: Array<{ text: string }>;
  metadata?: {
    allows_custom_amount?: boolean;
    min_amount?: number;
  };
}

interface ContributionModalProps {
  isOpen: boolean;
  tier: ContributionTier;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ContributionModal({
  isOpen,
  tier,
  onClose,
  onSuccess,
}: ContributionModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastInitial: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    isPublic: true,
    showAmount: true,
  });
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const amountInputId = useId();

  const allowsCustomAmount = tier.metadata?.allows_custom_amount === true;
  const minAmount = tier.metadata?.min_amount || 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    logger.info("=== CONTRIBUTION SUBMIT ===");
    logger.debug("Tier being submitted:", {
      id: tier.id,
      name: tier.name,
      campaign_type_id: tier.campaign_type_id,
    });

    try {
      // Validate form
      if (!formData.firstName.trim()) {
        throw new Error("First name is required");
      }
      if (!formData.lastInitial.trim() || formData.lastInitial.length !== 1) {
        throw new Error("Last initial must be a single letter");
      }
      if (!formData.email.trim()) {
        throw new Error("Email is required");
      }

      // Validate custom amount if applicable
      let amountValue: number | undefined;

      if (allowsCustomAmount && customAmount) {
        amountValue = parseFloat(customAmount);
        if (isNaN(amountValue) || amountValue < minAmount) {
          throw new Error(
            `Please enter a valid amount (minimum $${minAmount})`,
          );
        }
      }

      // Create checkout session - use AWS API
      const awsApiUrl = process.env.NEXT_PUBLIC_AWS_API_URL || "";

      // Get base URL for redirects
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

      // AWS Lambda expects flat structure
      const requestBody = {
        email: formData.email.trim().toLowerCase(),
        firstName: formData.firstName.trim(),
        lastInitial: formData.lastInitial.trim().toUpperCase(),
        campaignTypeId: tier.campaign_type_id,
        tierId: tier.id,
        amount: amountValue || tier.amount,
        phone: formData.phone.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim().toUpperCase() || undefined,
        isPublic: formData.isPublic,
        showAmount: formData.showAmount,
        successUrl: `${baseUrl}/campaign?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/campaign?canceled=true`,
      };

      const endpoint = awsApiUrl
        ? `${awsApiUrl}/campaigns/checkout`
        : "/api/stripe/create-checkout";

      logger.debug("Calling API endpoint:", endpoint);
      logger.debug("Request body:", requestBody);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      logger.debug("API response:", { status: response.status, data });

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to create checkout session",
        );
      }

      // Redirect to Stripe Checkout
      // AWS Lambda returns { sessionUrl, sessionId, contributionId, backerId }
      const checkoutUrl = data.sessionUrl || data.url;

      if (checkoutUrl) {
        onSuccess?.();
        window.location.href = checkoutUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      logger.error("Error creating checkout:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: "bg-gray-900 border-2 border-gray-800",
        header: "border-b border-gray-800",
        body: "py-6",
        footer: "border-t border-gray-800",
      }}
      isOpen={isOpen}
      scrollBehavior="inside"
      size="2xl"
      onClose={onClose}
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{tier.name}</h2>
              <Chip
                className="bg-dink-lime/20 text-dink-lime font-bold"
                size="lg"
                variant="flat"
              >
                {allowsCustomAmount && customAmount
                  ? formatCurrency(parseFloat(customAmount))
                  : allowsCustomAmount
                    ? "Custom"
                    : formatCurrency(tier.amount)}
              </Chip>
            </div>
            <p className="text-sm text-gray-400 font-normal">
              {tier.description}
            </p>
          </ModalHeader>

          <ModalBody>
            {/* Benefits */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                Your Benefits Include:
              </h3>
              <div className="space-y-2">
                {tier.benefits?.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Icon
                      className="text-dink-lime flex-shrink-0 mt-0.5"
                      icon="solar:check-circle-bold"
                      width={20}
                    />
                    <span className="text-sm text-gray-400">
                      {benefit.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            {allowsCustomAmount && (
              <div className="mb-6 p-4 bg-dink-lime/5 border-2 border-dink-lime/30 rounded-lg">
                <label
                  className="block text-sm font-semibold text-gray-300 mb-3"
                  htmlFor={amountInputId}
                >
                  Choose Your Contribution Amount
                </label>
                <Input
                  classNames={{
                    input: "bg-gray-800 text-white text-lg",
                    inputWrapper: "bg-gray-800 border-gray-700",
                  }}
                  min={minAmount}
                  placeholder={`Minimum $${minAmount}`}
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-gray-400 text-sm">$</span>
                    </div>
                  }
                  step="0.01"
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter any amount ${minAmount} or more. Every dollar helps
                  equip our community.
                </p>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  isRequired
                  classNames={{
                    input: "bg-gray-800 text-white",
                    inputWrapper: "bg-gray-800 border-gray-700",
                  }}
                  label="First Name"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
                <Input
                  isRequired
                  classNames={{
                    input: "bg-gray-800 text-white",
                    inputWrapper: "bg-gray-800 border-gray-700",
                  }}
                  label="Last Initial"
                  maxLength={1}
                  placeholder="S"
                  value={formData.lastInitial}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lastInitial: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <Input
                isRequired
                classNames={{
                  input: "bg-gray-800 text-white",
                  inputWrapper: "bg-gray-800 border-gray-700",
                }}
                label="Email"
                placeholder="john@example.com"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <Input
                classNames={{
                  input: "bg-gray-800 text-white",
                  inputWrapper: "bg-gray-800 border-gray-700",
                }}
                label="Phone (Optional)"
                placeholder="(555) 123-4567"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />

              <div className="grid grid-cols-3 gap-4">
                <Input
                  className="col-span-2"
                  classNames={{
                    input: "bg-gray-800 text-white",
                    inputWrapper: "bg-gray-800 border-gray-700",
                  }}
                  label="City (Optional)"
                  placeholder="Belton"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
                <Input
                  classNames={{
                    input: "bg-gray-800 text-white",
                    inputWrapper: "bg-gray-800 border-gray-700",
                  }}
                  label="State"
                  maxLength={2}
                  placeholder="TX"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      state: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              {/* Privacy Options */}
              <div className="space-y-3 pt-4 border-t border-gray-800">
                <Checkbox
                  classNames={{
                    wrapper: "after:bg-dink-lime after:text-black",
                  }}
                  isSelected={formData.isPublic}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isPublic: value })
                  }
                >
                  <span className="text-sm text-gray-300">
                    Show my name on the Founders Wall
                  </span>
                </Checkbox>
                <Checkbox
                  classNames={{
                    wrapper: "after:bg-dink-lime after:text-black",
                  }}
                  isSelected={formData.showAmount}
                  onValueChange={(value) =>
                    setFormData({ ...formData, showAmount: value })
                  }
                >
                  <span className="text-sm text-gray-300">
                    Display my contribution amount publicly
                  </span>
                </Checkbox>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <Icon
                    className="text-red-500"
                    icon="solar:danger-circle-bold"
                    width={20}
                  />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              {/* Security Notice */}
              <div className="flex items-start gap-2 p-3 bg-gray-800 rounded-lg">
                <Icon
                  className="text-dink-lime flex-shrink-0 mt-0.5"
                  icon="solar:shield-check-bold"
                  width={20}
                />
                <p className="text-xs text-gray-400">
                  Your payment information is securely processed by Stripe. We
                  never see or store your payment details.
                </p>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              color="default"
              disabled={loading}
              variant="flat"
              onPress={onClose}
            >
              Cancel
            </Button>
            <Button
              className="bg-dink-lime text-black font-bold"
              isLoading={loading}
              startContent={
                !loading && <Icon icon="solar:card-bold" width={20} />
              }
              type="submit"
            >
              {loading ? "Processing..." : `Continue to Payment`}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
