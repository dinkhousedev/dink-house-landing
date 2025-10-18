"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import DefaultLayout from "@/layouts/default";

const API_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://wchxzbuuwssrnaxshseu.supabase.co";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default function ConfirmSubscription() {
  const router = useRouter();
  const { token } = router.query;

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) return;

    const confirmSubscription = async () => {
      try {
        const response = await fetch(
          `${API_URL}/rest/v1/rpc/confirm_newsletter_subscription`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: ANON_KEY,
            },
            body: JSON.stringify({
              p_verification_token: token,
            }),
          },
        );

        const result = await response.json();

        if (result.success) {
          setStatus("success");
          setMessage(
            result.message ||
              "Your subscription has been confirmed! Welcome to The Dink House community.",
          );
          setEmail(result.email || "");
        } else {
          setStatus("error");
          setMessage(
            result.message ||
              "Invalid or expired confirmation link. Please try subscribing again.",
          );
        }
      } catch (error) {
        console.error("Confirmation error:", error);
        setStatus("error");
        setMessage(
          "Something went wrong. Please try again or contact support.",
        );
      }
    };

    confirmSubscription();
  }, [token]);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-2xl w-full text-center">
          {status === "loading" && (
            <div className="animate-pulse">
              <div className="w-16 h-16 mx-auto mb-6 border-4 border-[#B3FF00] border-t-transparent rounded-full animate-spin" />
              <h1 className="text-3xl font-bold mb-4">
                Confirming Your Subscription...
              </h1>
              <p className="text-gray-600">Please wait a moment.</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-4xl font-bold text-[#B3FF00] mb-4 uppercase tracking-wider">
                You&apos;re In!
              </h1>
              <p className="text-xl text-gray-300 mb-6">{message}</p>
              {email && (
                <p className="text-gray-400 mb-8">
                  We&apos;ll send updates and exclusive content to{" "}
                  <span className="text-[#B3FF00] font-semibold">{email}</span>
                </p>
              )}

              <div className="bg-[#1A1A1A] border-l-4 border-[#B3FF00] p-6 rounded-lg text-left">
                <h2 className="text-xl font-bold text-[#B3FF00] mb-3 uppercase">
                  What&apos;s Next?
                </h2>
                <ul className="space-y-2 text-gray-300">
                  <li>
                    ✅ You&apos;ll receive exclusive pickleball tips & content
                  </li>
                  <li>
                    🎯 Get early access to court bookings when we open in 2026
                  </li>
                  <li>🏆 Be first to know about tournaments and events</li>
                  <li>💚 Join a community of passionate pickleball players</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  className="px-8 py-3 bg-[#B3FF00] text-black font-bold uppercase tracking-wider hover:bg-[#9FE600] transition-colors shadow-md hover:shadow-lg"
                  onClick={() => (window.location.href = "/")}
                >
                  Back to Home
                </button>
                <button
                  className="px-8 py-3 border-2 border-[#B3FF00] text-[#B3FF00] font-bold uppercase tracking-wider hover:bg-[#B3FF00] hover:text-black transition-colors"
                  onClick={() =>
                    window.open("https://instagram.com/dinkhousepb", "_blank")
                  }
                >
                  Follow Us on Instagram
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-4xl font-bold text-red-500 mb-4 uppercase tracking-wider">
                Oops!
              </h1>
              <p className="text-xl text-gray-300 mb-6">{message}</p>

              <div className="bg-[#1A1A1A] border-l-4 border-red-500 p-6 rounded-lg text-left">
                <h2 className="text-xl font-bold text-red-400 mb-3 uppercase">
                  What Can You Do?
                </h2>
                <ul className="space-y-2 text-gray-300">
                  <li>🔄 Try the confirmation link again from your email</li>
                  <li>📧 Check if you already confirmed your subscription</li>
                  <li>
                    ✉️ Subscribe again if the link expired (links expire after 7
                    days)
                  </li>
                  <li>💬 Contact us if you continue having issues</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  className="px-8 py-3 bg-[#B3FF00] text-black font-bold uppercase tracking-wider hover:bg-[#9FE600] transition-colors shadow-md hover:shadow-lg"
                  onClick={() => (window.location.href = "/")}
                >
                  Subscribe Again
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
