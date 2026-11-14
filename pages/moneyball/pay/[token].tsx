import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";

import DefaultLayout from "@/layouts/default";
import {
  ApiFailure,
  errorText,
  formatCurrency,
  formatDayTime,
  readApi,
  type PayInfo,
  refundPolicyText,
} from "@/components/moneyball/shared";

const POLL_MS = 2500;
const POLL_TRIES = 6;
const BUTTON =
  "inline-block w-full sm:w-auto px-8 py-4 bg-dink-lime text-black text-center font-bold uppercase tracking-wider hover:bg-[#9FE600] disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

type Load = "loading" | "ready" | "invalid" | "error";

export default function MoneyballPayPage() {
  const router = useRouter();
  const token =
    typeof router.query.token === "string" ? router.query.token : "";
  const [info, setInfo] = useState<PayInfo | null>(null);
  const [load, setLoad] = useState<Load>("loading");
  const [justPaid, setJustPaid] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const fetchInfo = useCallback(async (): Promise<PayInfo | null> => {
    try {
      const response = await fetch(
        `/api/moneyball/pay/${encodeURIComponent(token)}`,
        { cache: "no-store" },
      );
      const data = await readApi<PayInfo>(response);

      setInfo(data);
      setLoad("ready");

      return data;
    } catch (error) {
      if (error instanceof ApiFailure && error.status === 404) {
        setLoad("invalid");
      } else {
        setLoad((current) => (current === "ready" ? "ready" : "error"));
      }

      return null;
    }
  }, [token]);

  useEffect(() => {
    if (!router.isReady || !token) return;

    // Back from Stripe: the payment confirmation lands a moment later, so keep
    // checking until this spot shows as paid.
    const returned = router.query.paid === "1";
    let cancelled = false;
    let timer: number | undefined;
    let tries = 0;

    const check = async () => {
      const data = await fetchInfo();

      if (cancelled || !returned) return;

      tries += 1;

      if (data?.state === "due" && tries < POLL_TRIES) {
        timer = window.setTimeout(check, POLL_MS);
      } else {
        setConfirming(false);
      }
    };

    if (returned) {
      setJustPaid(true);
      setConfirming(true);
      // Tidy the address so a refresh doesn't repeat the message.
      router.replace(`/moneyball/pay/${encodeURIComponent(token)}`, undefined, {
        shallow: true,
      });
    }
    check();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [router.isReady, token]);

  const handlePay = async () => {
    setPaying(true);
    setPayError("");

    try {
      const response = await fetch(
        `/api/moneyball/pay/${encodeURIComponent(token)}`,
        { method: "POST" },
      );
      const data = await readApi<{ url: string }>(response);

      // Stripe Checkout. The button stays busy while the browser leaves.
      window.location.href = data.url;
    } catch (error) {
      setPayError(errorText(error));
      setPaying(false);
      // Already paid or out of time: show where things stand now.
      fetchInfo();
    }
  };

  let body: React.ReactNode;

  if (load === "loading") {
    body = (
      <p className="uppercase tracking-widest text-gray-500" role="status">
        Loading...
      </p>
    );
  } else if (load === "invalid") {
    body = (
      <>
        <h1 className="mb-3 font-display text-4xl uppercase tracking-wider">
          This link is no longer valid
        </h1>
        <p className="mb-8 text-gray-400">
          Check that you opened the newest email from us, or take a look at the
          events coming up.
        </p>
        <NextLink className={BUTTON} href="/moneyball">
          See Moneyball events
        </NextLink>
      </>
    );
  } else if (load === "error" || !info) {
    body = (
      <>
        <h1 className="mb-3 font-display text-4xl uppercase tracking-wider">
          Something went wrong
        </h1>
        <p className="text-gray-400">
          We couldn&apos;t load your payment link just now. Please refresh in a
          moment.
        </p>
      </>
    );
  } else {
    const eventHref = `/moneyball/${encodeURIComponent(info.eventId)}`;
    const awaitingConfirmation = justPaid && info.state === "due";

    body = (
      <>
        <p className="text-sm font-bold uppercase tracking-widest text-dink-lime">
          Moneyball
        </p>
        <p className="mb-1 break-words font-display text-3xl uppercase tracking-wider">
          {info.title}
        </p>
        <p className="mb-8 text-gray-400">{formatDayTime(info.start)}</p>

        {justPaid && (
          <div
            className="mb-8 border-l-4 border-dink-lime bg-dink-lime/10 p-4 text-gray-100"
            role="status"
          >
            <p className="font-semibold">
              Payment received.
              {awaitingConfirmation &&
                (confirming
                  ? " We're confirming it now. This page will update on its own."
                  : " It's taking a little longer than usual to confirm. Refresh this page in a minute.")}
            </p>
          </div>
        )}

        {info.state === "due" && (
          <>
            <h1 className="mb-3 font-display text-4xl uppercase tracking-wider">
              Hi {info.firstName}, you&apos;re paired with {info.partnerName}
            </h1>
            {!awaitingConfirmation && (
              <>
                <p className="mb-6 text-gray-300">
                  Pay your half of the team fee to lock in your spot.
                  {info.partnerPaid
                    ? ` ${info.partnerName} has already paid, so your team is in as soon as you do.`
                    : " Your team is in once you have both paid."}
                </p>
                <div className="mb-8 border-2 border-gray-800 bg-gray-900 p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Your half
                  </p>
                  <p className="font-display text-6xl leading-none text-dink-lime">
                    {formatCurrency(info.amount)}
                  </p>
                  {info.payBy && (
                    <p className="mt-3 text-sm text-gray-300">
                      Pay by{" "}
                      <span className="font-bold text-white">
                        {formatDayTime(info.payBy)}
                      </span>{" "}
                      to keep your spot.
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400">{refundPolicyText({})}</p>
                <button
                  className={BUTTON}
                  disabled={paying}
                  type="button"
                  onClick={handlePay}
                >
                  {paying
                    ? "One moment..."
                    : `Pay your half (${formatCurrency(info.amount)})`}
                </button>
              </>
            )}
          </>
        )}

        {info.state === "paid" && (
          <>
            <h1 className="mb-3 font-display text-4xl uppercase tracking-wider">
              You&apos;re paid. Waiting on {info.partnerName}.
            </h1>
            <p className="mb-8 text-gray-300">
              Your team is in as soon as {info.partnerName} pays their half.
              We&apos;ll email you when that happens.
            </p>
            <NextLink className={BUTTON} href={eventHref}>
              See the event
            </NextLink>
          </>
        )}

        {info.state === "in" && (
          <>
            <h1 className="mb-3 font-display text-4xl uppercase tracking-wider">
              Your team is in.
            </h1>
            <p className="mb-8 text-gray-300">
              You and {info.partnerName} are both paid. See you on the court.
            </p>
            <NextLink className={BUTTON} href={eventHref}>
              See the event and the purse
            </NextLink>
          </>
        )}

        {info.state === "closed" && (
          <>
            <h1 className="mb-3 font-display text-4xl uppercase tracking-wider">
              This link is no longer active
            </h1>
            <p className="mb-8 text-gray-300">
              The time to pay for this spot has passed, or the event has
              changed. You can sign up again if entries are still open.
            </p>
            <NextLink className={BUTTON} href="/moneyball">
              See Moneyball events
            </NextLink>
          </>
        )}

        {payError && (
          <div
            className="mt-6 border-l-4 border-red-500 bg-red-950/40 p-4 text-red-200"
            role="alert"
          >
            <p className="font-semibold">{payError}</p>
          </div>
        )}
      </>
    );
  }

  return (
    <DefaultLayout title="Pay your half - Moneyball - The Dink House">
      <section className="mx-auto max-w-2xl px-4 py-12 md:py-20">
        {body}
      </section>
    </DefaultLayout>
  );
}
