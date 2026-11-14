import { useState } from "react";

import {
  emptyGuest,
  PlayerFields,
  toGuest,
  validateGuest,
  type GuestDraft,
  type GuestErrors,
} from "./player-fields";
import {
  ApiFailure,
  errorText,
  formatCurrency,
  formatDupr,
  readApi,
  type PublicMoneyball,
  refundPolicyText,
} from "./shared";

type Mode = "team" | "solo";
type Banner = { type: "success" | "error"; text: string };

type Props = {
  event: PublicMoneyball;
  /** Called after a sign-up attempt so the page can re-read spots and the purse. */
  onChanged: () => void;
};

const TAB =
  "flex-1 px-4 py-3 text-sm font-bold uppercase tracking-wider border-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const BUTTON =
  "w-full sm:w-auto px-8 py-4 bg-dink-lime text-black font-bold uppercase tracking-wider hover:bg-[#9FE600] disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

function hasErrors(errors: GuestErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function SignupForm({ event, onChanged }: Props) {
  const teamsFull = event.teamsLeft === 0;
  const [mode, setMode] = useState<Mode>(teamsFull ? "solo" : "team");
  const [you, setYou] = useState<GuestDraft>(emptyGuest);
  const [partner, setPartner] = useState<GuestDraft>(emptyGuest);
  const [waiver, setWaiver] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [youErrors, setYouErrors] = useState<GuestErrors>({});
  const [partnerErrors, setPartnerErrors] = useState<GuestErrors>({});
  const [waiverError, setWaiverError] = useState("");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [done, setDone] = useState(false);

  const activeMode: Mode = teamsFull ? "solo" : mode;

  const switchMode = (next: Mode) => {
    setMode(next);
    setBanner(null);
    setYouErrors({});
    setPartnerErrors({});
    setWaiverError("");
  };

  const startOver = () => {
    setYou(emptyGuest());
    setPartner(emptyGuest());
    setWaiver(false);
    setBanner(null);
    setDone(false);
  };

  const handleSubmit = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();

    const self = you;
    const other = partner;
    const nextYou = validateGuest(self, "your", event);
    const nextPartner =
      activeMode === "team"
        ? validateGuest(other, "your partner's", event)
        : {};

    if (
      activeMode === "team" &&
      !nextYou.email &&
      !nextPartner.email &&
      self.email.trim().toLowerCase() === other.email.trim().toLowerCase()
    ) {
      nextPartner.email =
        "You and your partner need different email addresses.";
    }

    const nextWaiver = waiver ? "" : "Accept the liability waiver to sign up.";

    setYouErrors(nextYou);
    setPartnerErrors(nextPartner);
    setWaiverError(nextWaiver);

    if (hasErrors(nextYou) || hasErrors(nextPartner) || nextWaiver) {
      setBanner({
        type: "error",
        text: "Please fix the highlighted fields above.",
      });

      return;
    }

    setLoading(true);
    setBanner(null);

    try {
      const response = await fetch(
        `/api/moneyball/${encodeURIComponent(event.id)}/${activeMode}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            activeMode === "team"
              ? {
                  waiver: true,
                  captain: toGuest(self),
                  partner: toGuest(other),
                  _honeypot: honeypot,
                }
              : { waiver: true, player: toGuest(self), _honeypot: honeypot },
          ),
        },
      );

      if (activeMode === "team") {
        const data = await readApi<{ confirmed: boolean; url: string | null }>(
          response,
        );

        if (data.url) {
          // Stripe Checkout. The button stays busy while the browser leaves.
          window.location.href = data.url;

          return;
        }

        setBanner({
          type: "success",
          text: data.confirmed
            ? "Your team is in. You'll both get an email with the details."
            : "Your team is signed up. You'll both get an email with the next step.",
        });
      } else {
        const data = await readApi<{
          waiting: boolean;
          alreadyWaiting: boolean;
          dupr: number;
        }>(response);
        const near = `a solo player near DUPR ${formatDupr(data.dupr)}`;

        setBanner({
          type: "success",
          text: data.alreadyWaiting
            ? `You're already on the list. We'll email you as soon as ${near} signs up.`
            : data.waiting
              ? `You're on the list. We'll email you as soon as ${near} signs up.`
              : "We found you a partner. Check your email for their details and your payment link.",
        });
      }

      setDone(true);
      setLoading(false);
      onChanged();
    } catch (error) {
      // The backend judges ratings (one already on file wins over a typed one),
      // so its sentence goes next to the rating it is about as well.
      const code = error instanceof ApiFailure ? error.code : undefined;

      if (code === "dupr_needed" || code === "dupr_range") {
        setYouErrors({ dupr: errorText(error) });
      } else if (
        code === "partner_dupr_needed" ||
        code === "partner_dupr_range"
      ) {
        setPartnerErrors({ dupr: errorText(error) });
      }

      setBanner({ type: "error", text: errorText(error) });
      setLoading(false);
      onChanged();
    }
  };

  const bannerBox = banner && (
    <div
      className={`p-4 border-l-4 ${
        banner.type === "success"
          ? "bg-dink-lime/10 border-dink-lime text-gray-100"
          : "bg-red-950/40 border-red-500 text-red-200"
      }`}
      role={banner.type === "success" ? "status" : "alert"}
    >
      <p className="font-semibold">{banner.text}</p>
    </div>
  );

  if (done) {
    return (
      <div className="space-y-4">
        {bannerBox}
        <button
          className="text-sm text-gray-400 underline hover:text-dink-lime"
          type="button"
          onClick={startOver}
        >
          Sign up someone else
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        aria-label="How do you want to sign up?"
        className="flex gap-2"
        role="tablist"
      >
        <button
          aria-controls="moneyball-signup-panel"
          aria-selected={activeMode === "team"}
          className={`${TAB} ${
            activeMode === "team"
              ? "border-dink-lime bg-dink-lime text-black"
              : "border-gray-700 text-gray-300 hover:border-dink-lime"
          }`}
          disabled={teamsFull || loading}
          id="moneyball-tab-team"
          role="tab"
          type="button"
          onClick={() => switchMode("team")}
        >
          Team
        </button>
        <button
          aria-controls="moneyball-signup-panel"
          aria-selected={activeMode === "solo"}
          className={`${TAB} ${
            activeMode === "solo"
              ? "border-dink-lime bg-dink-lime text-black"
              : "border-gray-700 text-gray-300 hover:border-dink-lime"
          }`}
          disabled={loading}
          id="moneyball-tab-solo"
          role="tab"
          type="button"
          onClick={() => switchMode("solo")}
        >
          I need a partner
        </button>
      </div>
      {teamsFull && (
        <p className="mt-3 text-sm text-gray-400">
          Every team spot is taken right now, so team entry is closed. You can
          still join the partner list in case a spot opens up.
        </p>
      )}

      <form
        noValidate
        aria-labelledby={`moneyball-tab-${activeMode}`}
        className="mt-8 space-y-8"
        id="moneyball-signup-panel"
        role="tabpanel"
        onSubmit={handleSubmit}
      >
        <p className="text-gray-300">
          {activeMode === "team"
            ? `Enter with a partner. You pay the ${formatCurrency(event.teamFee)} team fee by card now, and your team's spot is locked in.`
            : `No partner? Sign up free. We pair you with another solo player rated within half a point of your DUPR and email you both. You pay nothing now and ${formatCurrency(event.halfFee)} once you're matched.`}
        </p>

        <PlayerFields
          autoFill
          disabled={loading}
          errors={youErrors}
          idPrefix="you"
          legend="You"
          limits={event}
          value={you}
          onChange={setYou}
        />

        {activeMode === "team" && (
          <PlayerFields
            autoFill={false}
            disabled={loading}
            errors={partnerErrors}
            idPrefix="partner"
            legend="Your partner"
            limits={event}
            value={partner}
            onChange={setPartner}
          />
        )}

        {activeMode === "solo" && (
          <p className="text-sm text-gray-400">
            Your name, email and phone number are shared with your matched
            partner so the two of you can get in touch.
          </p>
        )}

        <div className="space-y-2">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-200">
            <input
              aria-describedby={
                waiverError ? "moneyball-waiver-error" : undefined
              }
              aria-invalid={Boolean(waiverError)}
              checked={waiver}
              className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#B3FF00]"
              disabled={loading}
              name="waiver"
              type="checkbox"
              onChange={(e) => setWaiver(e.target.checked)}
            />
            {/*
              TODO(owner): PLACEHOLDER WAIVER. Replace the sentence below with The Dink
              House's real liability waiver wording before taking live entries.
            */}
            <span>
              I understand pickleball involves risk of injury and I take part at
              my own risk. I release The Dink House from liability for any
              injury or loss connected with this event.
            </span>
          </label>
          {waiverError && (
            <p className="text-sm text-red-400" id="moneyball-waiver-error">
              {waiverError}
            </p>
          )}
          {activeMode === "team" && (
            <p className="text-xs text-gray-500">
              This covers you only. Your partner signs their own waiver at the
              front desk before play.
            </p>
          )}
        </div>

        {/* Honeypot: hidden from people, filled by bots. */}
        <div aria-hidden="true" className="absolute -left-[9999px] opacity-0">
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

        {event.teamFee > 0 && (
          <p className="text-xs text-gray-400">{refundPolicyText(event)}</p>
        )}

        <button className={BUTTON} disabled={loading} type="submit">
          {loading
            ? "One moment..."
            : activeMode === "team"
              ? `Pay ${formatCurrency(event.teamFee)} and enter team`
              : "Find me a partner"}
        </button>

        {bannerBox}
      </form>
    </div>
  );
}
