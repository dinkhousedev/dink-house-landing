"use client";

import { useState } from "react";
import { Button } from "@heroui/button";

import { Head } from "./head";

import { Navbar } from "@/components/navbar";
import ResubscribeModal from "@/components/ResubscribeModal";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isResubscribeModalOpen, setIsResubscribeModalOpen] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName: "",
          lastName: "",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: data.message.includes("already on our waitlist")
            ? "You're already subscribed!"
            : "Thank you for subscribing!",
        });
        setEmail("");
      } else {
        setMessage({
          type: "error",
          text: data.error || "Something went wrong",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <Head />
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="w-full bg-black text-white py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-display text-2xl uppercase mb-2">
                <span className="text-white">The Dink</span>{" "}
                <span className="bg-dink-lime text-black px-1">House</span>
              </h3>
              <p className="text-gray-400 text-sm">Where Champions Play</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <p className="text-dink-lime font-bold mb-2">HOURS</p>
              <p className="text-sm text-gray-300">24/7</p>
            </div>
            <div className="flex flex-col items-center md:items-end text-center md:text-right">
              <p className="text-dink-lime font-bold mb-2">CONTACT</p>
              <p className="text-sm text-gray-300">contact@dinkhousepb.com</p>
            </div>
          </div>
          {/* Resubscribe Section */}
          <div className="border-t border-gray-800 mt-6 pt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-2">Changed your mind?</p>
              <Button
                className="bg-dink-lime text-black font-bold"
                size="sm"
                onPress={() => setIsResubscribeModalOpen(true)}
              >
                Resubscribe to Newsletter
              </Button>
            </div>
          </div>

          {/* Copyright Section */}
          <div className="border-t border-gray-800 mt-6 pt-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-400 text-sm">
                © 2025 The Dink House - All Rights Reserved
              </p>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <span className="text-dink-lime text-2xl">★</span>
                <span className="text-dink-lime text-3xl">★</span>
                <span className="text-dink-lime text-2xl">★</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <ResubscribeModal
        isOpen={isResubscribeModalOpen}
        onClose={() => setIsResubscribeModalOpen(false)}
      />
    </div>
  );
}
