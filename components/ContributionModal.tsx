import React, { useState } from "react";
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

  const allowsCustomAmount = tier.metadata?.allows_custom_amount === true;
  const minAmount = tier.metadata?.min_amount || 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
          throw new Error(`Please enter a valid amount (minimum $${minAmount})`);
        }
      }

      // Create checkout session
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tierId: tier.id,
          firstName: formData.firstName.trim(),
          lastInitial: formData.lastInitial.trim().toUpperCase(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          city: formData.city.trim(),
          state: formData.state.trim().toUpperCase(),
          isPublic: formData.isPublic,
          showAmount: formData.showAmount,
          customAmount: amountValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error("Error creating checkout:", err);
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
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: "bg-gray-900 border-2 border-gray-800",
        header: "border-b border-gray-800",
        body: "py-6",
        footer: "border-t border-gray-800",
      }}
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{tier.name}</h2>
              <Chip size="lg" variant="flat" className="bg-dink-lime/20 text-dink-lime font-bold">
                {allowsCustomAmount && customAmount
                  ? formatCurrency(parseFloat(customAmount))
                  : allowsCustomAmount
                  ? "Custom"
                  : formatCurrency(tier.amount)}
              </Chip>
            </div>
            <p className="text-sm text-gray-400 font-normal">{tier.description}</p>
          </ModalHeader>

          <ModalBody>
            {/* Benefits */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Your Benefits Include:</h3>
              <div className="space-y-2">
                {tier.benefits?.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Icon
                      icon="solar:check-circle-bold"
                      className="text-dink-lime flex-shrink-0 mt-0.5"
                      width={20}
                    />
                    <span className="text-sm text-gray-400">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            {allowsCustomAmount && (
              <div className="mb-6 p-4 bg-dink-lime/5 border-2 border-dink-lime/30 rounded-lg">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Choose Your Contribution Amount
                </label>
                <Input
                  type="number"
                  placeholder={`Minimum $${minAmount}`}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  min={minAmount}
                  step="0.01"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-gray-400 text-sm">$</span>
                    </div>
                  }
                  classNames={{
                    input: "bg-gray-800 text-white text-lg",
                    inputWrapper: "bg-gray-800 border-gray-700",
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter any amount ${minAmount} or more. Every dollar helps equip our community.
                </p>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  isRequired
                  classNames={{
                    input: "bg-gray-800 text-white",
                    inputWrapper: "bg-gray-800 border-gray-700",
                  }}
                />
                <Input
                  label="Last Initial"
                  placeholder="S"
                  maxLength={1}
                  value={formData.lastInitial}
                  onChange={(e) =>
                    setFormData({ ...formData, lastInitial: e.target.value.toUpperCase() })
                  }
                  isRequired
                  classNames={{
                    input: "bg-gray-800 text-white",
                    inputWrapper: "bg-gray-800 border-gray-700",
                  }}
                />
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                isRequired
                classNames={{
                  input: "bg-gray-800 text-white",
                  inputWrapper: "bg-gray-800 border-gray-700",
                }}
              />

              <Input
                label="Phone (Optional)"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                classNames={{
                  input: "bg-gray-800 text-white",
                  inputWrapper: "bg-gray-800 border-gray-700",
                }}
              />

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="City (Optional)"
                  placeholder="Belton"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="col-span-2"
                  classNames={{
                    input: "bg-gray-800 text-white",
                    inputWrapper: "bg-gray-800 border-gray-700",
                  }}
                />
                <Input
                  label="State"
                  placeholder="TX"
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  classNames={{
                    input: "bg-gray-800 text-white",
                    inputWrapper: "bg-gray-800 border-gray-700",
                  }}
                />
              </div>

              {/* Privacy Options */}
              <div className="space-y-3 pt-4 border-t border-gray-800">
                <Checkbox
                  isSelected={formData.isPublic}
                  onValueChange={(value) => setFormData({ ...formData, isPublic: value })}
                  classNames={{
                    wrapper: "after:bg-dink-lime after:text-black",
                  }}
                >
                  <span className="text-sm text-gray-300">
                    Show my name on the Founders Wall
                  </span>
                </Checkbox>
                <Checkbox
                  isSelected={formData.showAmount}
                  onValueChange={(value) => setFormData({ ...formData, showAmount: value })}
                  classNames={{
                    wrapper: "after:bg-dink-lime after:text-black",
                  }}
                >
                  <span className="text-sm text-gray-300">
                    Display my contribution amount publicly
                  </span>
                </Checkbox>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <Icon icon="solar:danger-circle-bold" className="text-red-500" width={20} />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              {/* Security Notice */}
              <div className="flex items-start gap-2 p-3 bg-gray-800 rounded-lg">
                <Icon icon="solar:shield-check-bold" className="text-dink-lime flex-shrink-0 mt-0.5" width={20} />
                <p className="text-xs text-gray-400">
                  Your payment information is securely processed by Stripe. We never see or store
                  your payment details.
                </p>
              </div>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              color="default"
              variant="flat"
              onPress={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-dink-lime text-black font-bold"
              isLoading={loading}
              startContent={
                !loading && <Icon icon="solar:card-bold" width={20} />
              }
            >
              {loading ? "Processing..." : `Continue to Payment`}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
