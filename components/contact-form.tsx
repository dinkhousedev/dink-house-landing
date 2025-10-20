import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Skeleton } from "@heroui/skeleton";
import { Chip } from "@heroui/chip";
import { motion, AnimatePresence } from "framer-motion";

import { logger } from "@/lib/logger";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
  subject?: string;
  _honeypot?: string; // Honeypot field for bot protection
}

const STORAGE_KEY = "dinkhouse_contact_form";
const MESSAGE_MAX_LENGTH = 1000;
const AUTOSAVE_DELAY = 1000; // 1 second debounce

const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    phone: "",
    company: "",
    subject: "",
    _honeypot: "", // Hidden field
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isLoading, setIsLoading] = useState(true);
  const [hasRestoredData, setHasRestoredData] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Format phone number as user types
  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");

    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6)
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;

    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  // Load saved form data from localStorage
  useEffect(() => {
    if (isOpen && !hasRestoredData) {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);

        if (savedData) {
          const parsed = JSON.parse(savedData);

          // Don't restore honeypot or recaptcha
          delete parsed._honeypot;
          setFormData((prev) => ({ ...prev, ...parsed }));
          setHasRestoredData(true);
        }
      } catch (error) {
        logger.error("Error loading saved form data:", error);
      } finally {
        setIsLoading(false);
      }
    } else if (!isOpen) {
      setIsLoading(true);
    }
  }, [isOpen, hasRestoredData]);

  // Auto-save form data to localStorage
  const saveToLocalStorage = useCallback(() => {
    try {
      const dataToSave = { ...formData };

      delete dataToSave._honeypot; // Don't save honeypot
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      logger.error("Error saving form data:", error);
    }
  }, [formData]);

  // Debounced auto-save
  useEffect(() => {
    if (!isOpen || submitStatus === "success") return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      if (
        formData.firstName ||
        formData.lastName ||
        formData.email ||
        formData.message
      ) {
        saveToLocalStorage();
      }
    }, AUTOSAVE_DELAY);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, isOpen, submitStatus, saveToLocalStorage]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Check honeypot (should be empty)
    if (formData._honeypot) {
      // Bot detected, fail silently
      return false;
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    } else if (formData.message.length > MESSAGE_MAX_LENGTH) {
      newErrors.message = `Message must be ${MESSAGE_MAX_LENGTH} characters or less`;
    }

    // Optional phone validation if provided
    if (formData.phone && formData.phone.trim()) {
      const cleaned = formData.phone.replace(/\D/g, "");

      if (cleaned.length > 0 && (cleaned.length < 10 || cleaned.length > 11)) {
        newErrors.phone = "Please enter a valid 10-digit phone number";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Use GraphQL API instead of REST API
      const APPSYNC_API_URL = process.env.NEXT_PUBLIC_APPSYNC_API_URL;
      const APPSYNC_API_KEY = process.env.NEXT_PUBLIC_APPSYNC_API_KEY;

      if (!APPSYNC_API_URL || !APPSYNC_API_KEY) {
        throw new Error("API configuration is missing");
      }

      const mutation = `
        mutation SubmitContact($input: SubmitContactInput!) {
          submitContact(input: $input) {
            id
            inquiry_id
            firstName
            lastName
            email
            phone
            company
            jobTitle
            subject
            message
            status
            createdAt
          }
        }
      `;

      const response = await fetch(APPSYNC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": APPSYNC_API_KEY,
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            input: {
              firstName: formData.firstName.trim(),
              lastName: formData.lastName.trim(),
              email: formData.email.trim().toLowerCase(),
              phone: formData.phone?.trim() || undefined,
              company: formData.company?.trim() || undefined,
              jobTitle: undefined, // Not collected in this form, but available in schema
              subject: formData.subject?.trim() || "General Inquiry",
              message: formData.message.trim(),
            },
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        setSubmitStatus("error");
        setErrors({ submit: result.errors[0]?.message || "Failed to send message" });
      } else if (result.data?.submitContact) {
        setSubmitStatus("success");
        // Clear localStorage on successful submission
        localStorage.removeItem(STORAGE_KEY);
        // Clear form after successful submission
        setTimeout(() => {
          onClose();
          setSubmitStatus("idle");
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            message: "",
            phone: "",
            company: "",
            subject: "",
            _honeypot: "",
          });
        }, 3000);
      } else {
        setSubmitStatus("error");
        setErrors({ submit: "Failed to send message" });
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Network error. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // Format phone number if it's the phone field
    const formattedValue = name === "phone" ? formatPhoneNumber(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };

        delete newErrors[name];

        return newErrors;
      });
    }
  };

  const handleModalClose = () => {
    // Don't reset form state when modal closes (preserve for auto-save)
    // Only reset on successful submission
    if (submitStatus === "success") {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
        phone: "",
        company: "",
        subject: "",
        _honeypot: "",
      });
    }
    setErrors({});
    setSubmitStatus("idle");
    setHasRestoredData(false);
    onClose();
  };

  return (
    <Modal
      backdrop="blur"
      className="max-h-[90vh] overflow-y-auto"
      isOpen={isOpen}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
      placement="center"
      size="2xl"
      onClose={handleModalClose}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col items-center gap-3 pb-2">
              <div className="w-32 h-32 relative">
                {isLoading ? (
                  <Skeleton className="w-32 h-32 rounded-lg" />
                ) : (
                  <Image
                    fill
                    priority
                    alt="The Dink House Logo"
                    className="object-contain"
                    src="/dinklogo.jpg"
                  />
                )}
              </div>
              <h2 className="text-2xl font-bold">Contact Us</h2>
              <AnimatePresence>
                {hasRestoredData && (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    initial={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Chip
                      className="animate-pulse"
                      color="primary"
                      size="sm"
                      variant="flat"
                    >
                      Form data restored
                    </Chip>
                  </motion.div>
                )}
              </AnimatePresence>
            </ModalHeader>
            <form onSubmit={handleSubmit}>
              <ModalBody className="gap-4 pb-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 text-center">
                    We&apos;d love to hear from you! Send us a message and
                    we&apos;ll get back to you as soon as possible.
                  </p>
                  <p className="text-xs text-gray-500 text-center">
                    <span className="inline-flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                      We typically respond within 24 hours
                    </span>
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {submitStatus === "success" && (
                    <motion.div
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="p-3 bg-green-100 text-green-700 rounded-lg relative overflow-hidden"
                      exit={{ opacity: 0, scale: 0.9 }}
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <motion.div
                        animate={{ x: "100%" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200 to-transparent opacity-30"
                        initial={{ x: "-100%" }}
                        transition={{ duration: 1, delay: 0.5, ease: "linear" }}
                      />
                      <div className="flex items-start gap-3">
                        <motion.svg
                          animate={{ scale: 1 }}
                          className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          initial={{ scale: 0 }}
                          transition={{
                            delay: 0.2,
                            type: "spring",
                            stiffness: 200,
                          }}
                          viewBox="0 0 20 20"
                        >
                          <path
                            clipRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            fillRule="evenodd"
                          />
                        </motion.svg>
                        <div>
                          <div className="font-semibold mb-1">
                            Message sent successfully!
                          </div>
                          <div className="text-sm">
                            Thank you for contacting us. You will receive an
                            automatic confirmation email shortly, and we will
                            reply to your inquiry within 24 hours.
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {errors.submit && (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-100 text-red-700 rounded-lg flex items-start gap-3"
                      exit={{ opacity: 0, y: -10 }}
                      initial={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <svg
                        className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          clipRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          fillRule="evenodd"
                        />
                      </svg>
                      <span>{errors.submit}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Honeypot field - hidden from users */}
                <input
                  aria-hidden="true"
                  autoComplete="off"
                  name="_honeypot"
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    top: "-9999px",
                    height: 0,
                    width: 0,
                    opacity: 0,
                  }}
                  tabIndex={-1}
                  type="text"
                  value={formData._honeypot}
                  onChange={handleInputChange}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    isRequired
                    aria-describedby={
                      errors.firstName ? "firstName-error" : undefined
                    }
                    aria-invalid={!!errors.firstName}
                    aria-label="First Name"
                    aria-required="true"
                    autoComplete="given-name"
                    errorMessage={errors.firstName}
                    isInvalid={!!errors.firstName}
                    label="First Name"
                    name="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />

                  <Input
                    isRequired
                    aria-describedby={
                      errors.lastName ? "lastName-error" : undefined
                    }
                    aria-invalid={!!errors.lastName}
                    aria-label="Last Name"
                    aria-required="true"
                    autoComplete="family-name"
                    errorMessage={errors.lastName}
                    isInvalid={!!errors.lastName}
                    label="Last Name"
                    name="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>

                <Input
                  isRequired
                  aria-describedby={errors.email ? "email-error" : undefined}
                  aria-invalid={!!errors.email}
                  aria-label="Email Address"
                  aria-required="true"
                  autoComplete="email"
                  errorMessage={errors.email}
                  isInvalid={!!errors.email}
                  label="Email"
                  name="email"
                  placeholder="your@email.com"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    aria-invalid={!!errors.phone}
                    aria-label="Phone Number"
                    autoComplete="tel"
                    description="10-digit US phone number"
                    errorMessage={errors.phone}
                    isInvalid={!!errors.phone}
                    label="Phone (Optional)"
                    name="phone"
                    placeholder="(555) 123-4567"
                    type="tel"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                  />

                  <Input
                    aria-label="Company Name"
                    autoComplete="organization"
                    label="Company (Optional)"
                    name="company"
                    placeholder="Your company"
                    value={formData.company || ""}
                    onChange={handleInputChange}
                  />
                </div>

                <Input
                  aria-label="Message Subject"
                  label="Subject (Optional)"
                  name="subject"
                  placeholder="What is this about?"
                  value={formData.subject || ""}
                  onChange={handleInputChange}
                />

                <div className="space-y-1">
                  <Textarea
                    isRequired
                    aria-describedby={
                      errors.message ? "message-error" : "message-counter"
                    }
                    aria-invalid={!!errors.message}
                    aria-label="Your Message"
                    aria-required="true"
                    description={
                      <span className="text-xs" id="message-counter">
                        {formData.message.length}/{MESSAGE_MAX_LENGTH}{" "}
                        characters
                        {formData.message.length > MESSAGE_MAX_LENGTH * 0.9 && (
                          <span className="text-warning ml-1">
                            ({MESSAGE_MAX_LENGTH - formData.message.length}{" "}
                            remaining)
                          </span>
                        )}
                      </span>
                    }
                    errorMessage={errors.message}
                    isInvalid={!!errors.message}
                    label="Message"
                    maxRows={8}
                    minRows={4}
                    name="message"
                    placeholder="Tell us what's on your mind..."
                    value={formData.message}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Auto-save indicator */}
                <AnimatePresence>
                  {(formData.firstName ||
                    formData.lastName ||
                    formData.email ||
                    formData.message) && (
                    <motion.div
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex items-center justify-center gap-2 text-xs text-gray-500"
                      exit={{ opacity: 0, height: 0 }}
                      initial={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.svg
                        animate={{ rotate: [0, 360] }}
                        className="w-3 h-3"
                        fill="currentColor"
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                          clipRule="evenodd"
                          d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h2a1 1 0 100-2H6V5z"
                          fillRule="evenodd"
                        />
                      </motion.svg>
                      <span>Your progress is automatically saved</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </ModalBody>
              <ModalFooter>
                <Button
                  aria-label="Cancel and close form"
                  color="danger"
                  isDisabled={isSubmitting}
                  variant="light"
                  onPress={handleModalClose}
                >
                  Cancel
                </Button>
                <Button
                  aria-label="Send your message"
                  className="bg-dink-lime text-black font-bold"
                  isDisabled={submitStatus === "success" || isLoading}
                  isLoading={isSubmitting}
                  type="submit"
                >
                  {submitStatus === "success" ? "Sent!" : "Send Message"}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ContactFormModal;
export { ContactFormModal };
