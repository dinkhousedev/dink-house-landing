import { logger } from "@/lib/logger";

// API configuration
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.dinkhousepb.com";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// API response types
export interface ApiResponse {
  success: boolean;
  message: string;
  inquiry_id?: string;
  already_subscribed?: boolean;
  subscriber_id?: string;
}

export interface NewsletterSignupData {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
  subject?: string;
  source?: "website" | "landing_page";
}

// Helper function to make API calls
async function apiCall<T>(endpoint: string, data: any): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();

      throw new Error(error.message || "An error occurred");
    }

    return await response.json();
  } catch (error) {
    logger.error("API call failed:", error);
    throw error;
  }
}

// Newsletter signup function
export async function submitNewsletterSignup(
  data: NewsletterSignupData,
): Promise<ApiResponse> {
  const payload = {
    p_email: data.email,
    p_first_name: data.firstName || "Newsletter",
    p_last_name: data.lastName || "Subscriber",
  };

  return apiCall<ApiResponse>("/rest/v1/rpc/submit_newsletter_signup", payload);
}

// Contact form submission function
export async function submitContactForm(
  data: ContactFormData,
): Promise<ApiResponse> {
  const payload = {
    p_first_name: data.firstName,
    p_last_name: data.lastName,
    p_email: data.email,
    p_message: data.message,
    p_phone: data.phone,
    p_company: data.company,
    p_subject: data.subject,
    p_source: data.source || "landing_page",
  };

  return apiCall<ApiResponse>("/rest/v1/rpc/submit_contact_form", payload);
}

// Example usage in a React component:
/*
import { submitNewsletterSignup, submitContactForm } from '@/lib/api';

// Newsletter signup
const handleNewsletterSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const result = await submitNewsletterSignup({
      email: 'user@example.com'
    });

    if (result.success) {
      if (result.already_subscribed) {
        alert('You are already subscribed!');
      } else {
        alert('Thank you for subscribing!');
      }
    }
  } catch (error) {
    alert('Something went wrong. Please try again.');
  }
};

// Contact form
const handleContactSubmit = async (formData: ContactFormData) => {
  try {
    const result = await submitContactForm(formData);

    if (result.success) {
      alert('Thank you for your message! We will get back to you soon.');
      // Reset form or redirect
    }
  } catch (error) {
    alert('Failed to send message. Please try again.');
  }
};
*/
