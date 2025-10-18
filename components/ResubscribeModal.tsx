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

interface ResubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResubscribeModal: React.FC<ResubscribeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error" | "already_subscribed" | "not_found"
  >("idle");
  const [message, setMessage] = useState("");

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
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
    setMessage("");

    try {
      const response = await fetch("/api/resubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.already_subscribed) {
          setSubmitStatus("already_subscribed");
          setMessage(data.message);
        } else if (data.not_found) {
          setSubmitStatus("not_found");
          setMessage(data.message);
        } else {
          setSubmitStatus("success");
          setMessage(data.message);
          setEmail("");
        }
        setTimeout(() => {
          onClose();
          setSubmitStatus("idle");
          setEmail("");
          setMessage("");
        }, 3000);
      } else {
        setSubmitStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    } catch {
      setSubmitStatus("error");
      setMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({});
    }
  };

  return (
    <Modal isOpen={isOpen} placement="center" size="md" onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Resubscribe to Our Newsletter
            </ModalHeader>
            <form onSubmit={handleSubmit}>
              <ModalBody>
                <p className="text-sm text-gray-600 mb-4">
                  Changed your mind? Enter your email to resubscribe and stay
                  updated with the latest news from The Dink House.
                </p>

                {submitStatus === "success" && (
                  <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                    {message}
                  </div>
                )}

                {submitStatus === "already_subscribed" && (
                  <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
                    <div className="font-semibold mb-1">
                      Already Subscribed! 🎉
                    </div>
                    <div className="text-sm">{message}</div>
                  </div>
                )}

                {submitStatus === "not_found" && (
                  <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-lg">
                    <div className="font-semibold mb-1">Email Not Found</div>
                    <div className="text-sm">{message}</div>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {message}
                  </div>
                )}

                {submitStatus !== "already_subscribed" &&
                  submitStatus !== "not_found" && (
                    <Input
                      isRequired
                      autoComplete="email"
                      errorMessage={errors.email}
                      isInvalid={!!errors.email}
                      label="Email"
                      name="email"
                      placeholder="Enter your email"
                      type="email"
                      value={email}
                      onChange={handleInputChange}
                    />
                  )}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  isDisabled={isSubmitting}
                  variant="light"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-dink-lime text-black font-bold"
                  isDisabled={
                    submitStatus === "success" ||
                    submitStatus === "already_subscribed" ||
                    submitStatus === "not_found"
                  }
                  isLoading={isSubmitting}
                  type="submit"
                >
                  {submitStatus === "success"
                    ? "Success!"
                    : submitStatus === "already_subscribed"
                      ? "Already Subscribed"
                      : submitStatus === "not_found"
                        ? "Not Found"
                        : "Resubscribe"}
                </Button>
              </ModalFooter>
            </form>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ResubscribeModal;
