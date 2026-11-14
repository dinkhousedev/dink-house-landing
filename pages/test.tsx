import { useState } from "react";

import DefaultLayout from "@/layouts/default";

const FIELD =
  "w-full px-4 py-3 bg-black border-2 border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dink-lime focus:border-dink-lime transition-all disabled:opacity-50";
const NOTE_MAX = 1000;
const TESTFLIGHT_URL = "https://testflight.apple.com/join/yVPcwQae";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.thedinkhouse.member&hl=en-US&ah=tpfakINLlP_pCn5ILV4B1xPdDA8";

type Result = { type: "success" | "error"; text: string };

export default function TestAppPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [iphone, setIphone] = useState(false);
  const [android, setAndroid] = useState(false);
  const [appleEmail, setAppleEmail] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const [note, setNote] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [showTestFlight, setShowTestFlight] = useState(false);
  const [showPlayStore, setShowPlayStore] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!iphone && !android) {
      setResult({ type: "error", text: "Pick iPhone, Android, or both." });

      return;
    }

    const requestedIphone = iphone;
    const requestedAndroid = android;

    setLoading(true);
    setResult(null);
    setShowTestFlight(false);
    setShowPlayStore(false);

    try {
      const response = await fetch("/api/app-testers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          iphone,
          android,
          appleEmail: iphone ? appleEmail.trim().toLowerCase() : undefined,
          googleEmail: android ? googleEmail.trim().toLowerCase() : undefined,
          note: note.trim() || undefined,
          _honeypot: honeypot,
        }),
      });
      const data = (await response.json()) as {
        success?: boolean;
        duplicate?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Something went wrong. Please try again.",
        );
      }

      const installLinks = [
        requestedIphone ? "TestFlight" : "",
        requestedAndroid ? "Play Store" : "",
      ].filter(Boolean);
      const installHint = installLinks.length
        ? ` Open the ${installLinks.join(" and ")} link below on that phone.`
        : "";

      setResult({
        type: "success",
        text: data.duplicate
          ? `You're already on the tester list.${installHint}`
          : `You're on the tester list.${installHint}`,
      });
      setShowTestFlight(requestedIphone);
      setShowPlayStore(requestedAndroid);

      if (!data.duplicate) {
        setFirstName("");
        setLastName("");
        setIphone(false);
        setAndroid(false);
        setAppleEmail("");
        setGoogleEmail("");
        setNote("");
      }
    } catch (error) {
      setResult({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout title="Test the app - The Dink House">
      <section className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <h1 className="text-4xl font-bold uppercase tracking-wider mb-3">
          Test the app
        </h1>
        <p className="text-gray-400 mb-10">
          A small group will try The Dink House member app before the club
          opens. Tell us where to send your invite.
        </p>

        <div className="space-y-8 text-gray-200 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-dink-lime mb-2">
              How it works
            </h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Request access below with the email on your app store account.
              </li>
              <li>
                On iPhone, the TestFlight link appears as soon as you submit.
                Open it on that iPhone and install the app.
              </li>
              <li>
                On Android, the Play Store link appears as soon as you submit.
                Open it on that phone and install the app.
              </li>
            </ol>
          </section>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm text-gray-300">
                First name
                <input
                  required
                  autoComplete="given-name"
                  className={FIELD}
                  disabled={loading}
                  maxLength={100}
                  name="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-gray-300">
                Last name
                <input
                  required
                  autoComplete="family-name"
                  className={FIELD}
                  disabled={loading}
                  maxLength={100}
                  name="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </label>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm text-gray-300 mb-2">
                Which phone do you use? Pick both if you have both.
              </legend>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  checked={iphone}
                  className="w-5 h-5 accent-[#B3FF00] cursor-pointer"
                  disabled={loading}
                  name="iphone"
                  type="checkbox"
                  onChange={(e) => setIphone(e.target.checked)}
                />
                iPhone
              </label>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  checked={android}
                  className="w-5 h-5 accent-[#B3FF00] cursor-pointer"
                  disabled={loading}
                  name="android"
                  type="checkbox"
                  onChange={(e) => setAndroid(e.target.checked)}
                />
                Android
              </label>
            </fieldset>

            {iphone && (
              <label className="flex flex-col gap-1 text-sm text-gray-300">
                Apple ID email
                <input
                  required
                  autoComplete="email"
                  className={FIELD}
                  disabled={loading}
                  maxLength={255}
                  name="appleEmail"
                  placeholder="you@icloud.com"
                  type="email"
                  value={appleEmail}
                  onChange={(e) => setAppleEmail(e.target.value)}
                />
                <span className="text-xs text-gray-500">
                  Use the email on the Apple ID signed in on your iPhone. Open
                  the TestFlight link on that phone.
                </span>
              </label>
            )}

            {android && (
              <label className="flex flex-col gap-1 text-sm text-gray-300">
                Google account email
                <input
                  required
                  autoComplete="email"
                  className={FIELD}
                  disabled={loading}
                  maxLength={255}
                  name="googleEmail"
                  placeholder="you@gmail.com"
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                />
                <span className="text-xs text-gray-500">
                  Use the Google account signed in to the Play Store on your
                  phone. Open the Play Store link on that phone.
                </span>
              </label>
            )}

            <label className="flex flex-col gap-1 text-sm text-gray-300">
              Anything we should know? (optional)
              <textarea
                className={`${FIELD} min-h-28`}
                disabled={loading}
                maxLength={NOTE_MAX}
                name="note"
                placeholder="Phone model, how often you play, what you'd like to try first..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>

            {/* Honeypot: hidden from people, filled by bots. */}
            <div
              aria-hidden="true"
              className="absolute -left-[9999px] opacity-0"
            >
              <label>
                Leave this empty
                <input
                  autoComplete="off"
                  name="website"
                  tabIndex={-1}
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </label>
            </div>

            <button
              className="px-8 py-3 bg-dink-lime text-black font-bold uppercase tracking-wider hover:bg-[#9FE600] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
              type="submit"
            >
              {loading ? "Sending..." : "Request access"}
            </button>

            {result && (
              <div
                className={`p-4 border-l-4 ${
                  result.type === "success"
                    ? "bg-dink-lime/10 border-dink-lime text-gray-100"
                    : "bg-red-950/40 border-red-500 text-red-200"
                }`}
                role="status"
              >
                <p className="font-semibold">{result.text}</p>
              </div>
            )}

            {result?.type === "success" && showTestFlight && (
              <div className="p-4 border-l-4 bg-dink-lime/10 border-dink-lime text-gray-100 space-y-3">
                <p>
                  Open this on the iPhone signed in with that Apple ID.
                </p>
                <p className="break-all select-all font-mono text-sm text-dink-lime">
                  {TESTFLIGHT_URL}
                </p>
                <a
                  className="inline-block px-8 py-3 bg-dink-lime text-black font-bold uppercase tracking-wider hover:bg-[#9FE600] transition-colors"
                  href={TESTFLIGHT_URL}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Open TestFlight
                </a>
              </div>
            )}

            {result?.type === "success" && showPlayStore && (
              <div className="p-4 border-l-4 bg-dink-lime/10 border-dink-lime text-gray-100 space-y-3">
                <p>
                  Open this on the Android phone signed in with that Google
                  account.
                </p>
                <p className="break-all select-all font-mono text-sm text-dink-lime">
                  {PLAY_STORE_URL}
                </p>
                <a
                  className="inline-block px-8 py-3 bg-dink-lime text-black font-bold uppercase tracking-wider hover:bg-[#9FE600] transition-colors"
                  href={PLAY_STORE_URL}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Open Play Store
                </a>
              </div>
            )}
          </form>

          <section>
            <p className="text-sm text-gray-500">
              Requesting access does not add you to the newsletter. iPhone
              testers get the TestFlight link on this page after they submit.
              Android testers get the Play Store link on this page after they
              submit.
            </p>
          </section>
        </div>
      </section>
    </DefaultLayout>
  );
}
