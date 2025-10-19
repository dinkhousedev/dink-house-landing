"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import DefaultLayout from "@/layouts/default";
import { logger } from "@/lib/logger";

const API_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://wchxzbuuwssrnaxshseu.supabase.co";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default function Unsubscribe() {
  const router = useRouter();
  const { token, email } = router.query;

  const [status, setStatus] = useState<
    "prompt" | "loading" | "success" | "error"
  >("prompt");
  const [message, setMessage] = useState("");
  const [unsubscribedEmail, setUnsubscribedEmail] = useState("");
  const [reason, setReason] = useState("");
  const [alreadyUnsubscribed, setAlreadyUnsubscribed] = useState(false);

  // Auto-unsubscribe if token is provided (one-click unsubscribe)
  useEffect(() => {
    if (token && status === "prompt") {
      // Automatically proceed with unsubscribe for one-click links
      handleUnsubscribe();
    }
  }, [token]);

  const handleUnsubscribe = async () => {
    setStatus("loading");

    try {
      const response = await fetch(
        `${API_URL}/rest/v1/rpc/unsubscribe_newsletter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: ANON_KEY,
          },
          body: JSON.stringify({
            p_unsubscribe_token: token || null,
            p_email: email || null,
            p_reason: reason || null,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setStatus("success");
        setMessage(
          result.message ||
            "You have been successfully unsubscribed from our newsletter.",
        );
        setUnsubscribedEmail(result.email || email || "");
        setAlreadyUnsubscribed(result.already_unsubscribed || false);
      } else {
        setStatus("error");
        setMessage(
          result.message ||
            "Unable to process your unsubscribe request. Please try again.",
        );
      }
    } catch (error) {
      logger.error("Unsubscribe error:", error);
      setStatus("error");
      setMessage("Something went wrong. Please try again or contact support.");
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-2xl w-full text-center">
          {status === "prompt" && !token && (
            <div className="space-y-6">
              <div className="text-6xl mb-4">💔</div>
              <h1 className="text-4xl font-bold mb-4 uppercase tracking-wider">
                Sorry to See You Go
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Are you sure you want to unsubscribe from The Dink House
                newsletter?
              </p>

              <div className="bg-[#1A1A1A] border-l-4 border-[#B3FF00] p-6 rounded-lg text-left mb-8">
                <h2 className="text-xl font-bold text-[#B3FF00] mb-3 uppercase">
                  You&apos;ll Miss Out On:
                </h2>
                <ul className="space-y-2 text-gray-300">
                  <li>🎯 Exclusive pickleball tips from pros</li>
                  <li>🏆 Early access to tournaments and events</li>
                  <li>💚 First dibs on court bookings when we open in 2026</li>
                  <li>📰 Community news and updates</li>
                </ul>
              </div>

              <div className="mb-6">
                <label
                  className="block text-left text-sm font-semibold text-gray-400 mb-2"
                  htmlFor="reason"
                >
                  Tell us why (optional)
                </label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-600 bg-[#1A1A1A] text-white focus:outline-none focus:ring-2 focus:ring-[#B3FF00] focus:border-[#B3FF00] transition-all"
                  id="reason"
                  placeholder="This helps us improve our content..."
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  className="px-8 py-3 bg-red-600 text-white font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                  onClick={handleUnsubscribe}
                >
                  Yes, Unsubscribe Me
                </button>
                <button
                  className="px-8 py-3 bg-[#B3FF00] text-black font-bold uppercase tracking-wider hover:bg-[#9FE600] transition-colors shadow-md hover:shadow-lg"
                  onClick={() => (window.location.href = "/")}
                >
                  No, Keep Me Subscribed
                </button>
              </div>
            </div>
          )}

          {status === "loading" && (
            <div className="animate-pulse">
              <div className="w-16 h-16 mx-auto mb-6 border-4 border-[#B3FF00] border-t-transparent rounded-full animate-spin" />
              <h1 className="text-3xl font-bold mb-4">Processing...</h1>
              <p className="text-gray-600">
                Please wait while we update your preferences.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="text-6xl mb-4">
                {alreadyUnsubscribed ? "✓" : "👋"}
              </div>
              <h1 className="text-4xl font-bold mb-4 uppercase tracking-wider">
                {alreadyUnsubscribed
                  ? "Already Unsubscribed"
                  : "Unsubscribed Successfully"}
              </h1>
              <p className="text-xl text-gray-300 mb-6">{message}</p>
              {unsubscribedEmail && (
                <p className="text-gray-400 mb-8">
                  Email:{" "}
                  <span className="text-[#B3FF00] font-semibold">
                    {unsubscribedEmail}
                  </span>
                </p>
              )}

              <div className="bg-[#1A1A1A] border-l-4 border-gray-500 p-6 rounded-lg text-left">
                <h2 className="text-xl font-bold text-gray-300 mb-3 uppercase">
                  Changed Your Mind?
                </h2>
                <p className="text-gray-400 mb-4">
                  You can resubscribe anytime by entering your email on our
                  homepage. We&apos;d love to have you back in the community!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  className="px-8 py-3 bg-[#B3FF00] text-black font-bold uppercase tracking-wider hover:bg-[#9FE600] transition-colors shadow-md hover:shadow-lg"
                  onClick={() => (window.location.href = "/")}
                >
                  Back to Home
                </button>
                <button
                  className="px-8 py-3 border-2 border-gray-500 text-gray-400 font-bold uppercase tracking-wider hover:border-gray-400 hover:text-gray-300 transition-colors"
                  onClick={() =>
                    window.open("https://instagram.com/dinkhousepb", "_blank")
                  }
                >
                  Follow on Instagram Instead
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-4xl font-bold text-red-500 mb-4 uppercase tracking-wider">
                Something Went Wrong
              </h1>
              <p className="text-xl text-gray-300 mb-6">{message}</p>

              <div className="bg-[#1A1A1A] border-l-4 border-red-500 p-6 rounded-lg text-left">
                <h2 className="text-xl font-bold text-red-400 mb-3 uppercase">
                  What Can You Do?
                </h2>
                <ul className="space-y-2 text-gray-300">
                  <li>🔄 Try the unsubscribe link again from your email</li>
                  <li>📧 Check if you&apos;re already unsubscribed</li>
                  <li>💬 Contact us directly for help</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  className="px-8 py-3 bg-[#B3FF00] text-black font-bold uppercase tracking-wider hover:bg-[#9FE600] transition-colors shadow-md hover:shadow-lg"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
                <button
                  className="px-8 py-3 border-2 border-gray-500 text-gray-400 font-bold uppercase tracking-wider hover:border-gray-400 hover:text-gray-300 transition-colors"
                  onClick={() => (window.location.href = "/contact")}
                >
                  Contact Support
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </DefaultLayout>
  );
}
