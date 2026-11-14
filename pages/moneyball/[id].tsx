import type { GetServerSideProps } from "next";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";

import DefaultLayout from "@/layouts/default";
import { getBackendUrl } from "@/lib/backend";
import { logger } from "@/lib/logger";
import { PurseDisplay } from "@/components/moneyball/purse-display";
import { SignupForm } from "@/components/moneyball/signup-form";
import { useLivePurse } from "@/components/moneyball/use-live-purse";
import {
  duprRangeLabel,
  formatCurrency,
  formatEventWhen,
  type PublicMoneyball,
} from "@/components/moneyball/shared";

type Props = {
  id: string;
  /** Null when the server could not read it; the browser then tries again. */
  initialEvent: PublicMoneyball | null;
  missing: boolean;
};

type ReturnBanner = { type: "success" | "neutral"; text: string };

export const getServerSideProps: GetServerSideProps<Props> = async (
  context,
) => {
  const id = typeof context.params?.id === "string" ? context.params.id : "";

  try {
    const response = await fetch(
      `${getBackendUrl()}/api/moneyball/${encodeURIComponent(id)}`,
      { cache: "no-store" },
    );

    if (response.status === 404) {
      context.res.statusCode = 404;

      return { props: { id, initialEvent: null, missing: true } };
    }
    if (!response.ok) throw new Error(`Backend answered ${response.status}`);

    const data = (await response.json()) as { event: PublicMoneyball };

    return { props: { id, initialEvent: data.event, missing: false } };
  } catch (error) {
    logger.error("Moneyball event failed to load:", error);

    return { props: { id, initialEvent: null, missing: false } };
  }
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-gray-500">
        {label}
      </dt>
      <dd className="text-xl font-bold text-white">{value}</dd>
    </div>
  );
}

function Notice({ title, text }: { title: string; text: string }) {
  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="mb-3 font-display text-4xl uppercase tracking-wider">
        {title}
      </h1>
      <p className="mb-8 text-gray-400">{text}</p>
      <NextLink
        className="inline-block bg-dink-lime px-8 py-3 font-bold uppercase tracking-wider text-black transition-colors hover:bg-[#9FE600]"
        href="/moneyball"
      >
        See all Moneyball events
      </NextLink>
    </section>
  );
}

// Keyed by event so moving between two events starts from a clean slate.
export default function MoneyballEventPage(props: Props) {
  return <MoneyballEvent key={props.id} {...props} />;
}

function MoneyballEvent({ id, initialEvent, missing }: Props) {
  const router = useRouter();
  const { event, status, refresh } = useLivePurse(id, initialEvent, missing);
  const [returnBanner, setReturnBanner] = useState<ReturnBanner | null>(null);

  // Back from Stripe: say what happened, then tidy the address bar.
  useEffect(() => {
    if (!router.isReady) return;

    const entered = router.query.entered;

    if (entered !== "team" && entered !== "cancelled") return;

    if (entered === "team") {
      setReturnBanner({
        type: "success",
        text: "Payment received. Your team is being confirmed; you'll both get an email.",
      });
      // The payment confirmation lands a moment after the browser returns.
      window.setTimeout(refresh, 2000);
      window.setTimeout(refresh, 6000);
    } else {
      setReturnBanner({
        type: "neutral",
        text: "Payment was cancelled. Your spot is held for a few more minutes.",
      });
    }

    router.replace(`/moneyball/${encodeURIComponent(id)}`, undefined, {
      shallow: true,
    });

    // The timers are left to run: tidying the address re-runs this effect.
  }, [router.isReady, router.query.entered]);

  if (status === "missing") {
    return (
      <DefaultLayout title="Event not found - The Dink House">
        <Notice
          text="This Moneyball may have finished or the link may be mistyped."
          title="We can't find that event"
        />
      </DefaultLayout>
    );
  }

  if (!event) {
    return (
      <DefaultLayout title="Moneyball - The Dink House">
        {status === "error" ? (
          <Notice
            text="We couldn't load this event just now. Please refresh in a moment."
            title="Something went wrong"
          />
        ) : (
          <p
            className="px-4 py-24 text-center uppercase tracking-widest text-gray-500"
            role="status"
          >
            Loading event...
          </p>
        )}
      </DefaultLayout>
    );
  }

  const waiting = event.solosWaiting.filter((group) => group.count > 0);

  return (
    <DefaultLayout title={`${event.title} - Moneyball - The Dink House`}>
      <section className="mx-auto max-w-5xl px-4 py-10 md:py-16">
        <NextLink
          className="text-sm uppercase tracking-wider text-gray-400 hover:text-dink-lime"
          href="/moneyball"
        >
          ← All Moneyball events
        </NextLink>

        {returnBanner && (
          <div
            className={`mt-6 border-l-4 p-4 ${
              returnBanner.type === "success"
                ? "border-dink-lime bg-dink-lime/10 text-gray-100"
                : "border-gray-500 bg-gray-900 text-gray-200"
            }`}
            role="status"
          >
            <p className="font-semibold">{returnBanner.text}</p>
          </div>
        )}

        <header className="mt-6">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-bold uppercase tracking-widest text-dink-lime">
            <span>Moneyball · {duprRangeLabel(event)}</span>
            <span className="border border-dink-lime px-2 py-0.5 text-xs">
              DUPR event
            </span>
          </p>
          <h1 className="mb-2 break-words font-display text-4xl uppercase tracking-wider sm:text-6xl">
            {event.title}
          </h1>
          <p className="text-lg text-gray-300">
            {formatEventWhen(event.start, event.end)}
          </p>
          {event.description && (
            <p className="mt-4 max-w-2xl whitespace-pre-line text-gray-400">
              {event.description}
            </p>
          )}
        </header>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-5">
          <div className="border-2 border-dink-lime/40 bg-gray-900 p-6 md:col-span-3">
            <PurseDisplay
              payouts={event.payouts}
              purse={event.purse}
              size="lg"
            />
            <p className="mt-4 text-sm text-gray-500">
              The purse goes up every time a team pays. This page updates on its
              own.
            </p>
          </div>

          <div className="border-2 border-gray-800 bg-gray-900 p-6 md:col-span-2">
            <dl className="grid grid-cols-2 gap-6 md:grid-cols-1">
              <Fact label="Team fee" value={formatCurrency(event.teamFee)} />
              <Fact
                label="Teams entered"
                value={`${event.teamsEntered} of ${event.maxTeams}`}
              />
              <Fact label="Spots left" value={String(event.teamsLeft)} />
              <Fact label="Rating" value={duprRangeLabel(event)} />
            </dl>
            {waiting.length > 0 && (
              <ul className="mt-6 space-y-1 border-t border-gray-800 pt-4 text-sm text-gray-300">
                {waiting.map((group) => (
                  <li key={group.band}>
                    <span className="font-bold text-dink-lime">
                      {group.count}
                    </span>{" "}
                    {group.count === 1 ? "player" : "players"} looking for a
                    partner · {group.band}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <section aria-labelledby="moneyball-signup" className="mt-14 max-w-3xl">
          <h2
            className="mb-6 font-display text-3xl uppercase tracking-wider"
            id="moneyball-signup"
          >
            Sign up
          </h2>
          {event.entriesOpen ? (
            <SignupForm event={event} onChanged={refresh} />
          ) : (
            <div className="border-l-4 border-gray-500 bg-gray-900 p-4">
              <p className="font-bold uppercase tracking-wider">
                Entries are closed
              </p>
              <p className="text-gray-400">
                Sign-up for this event has ended. Take a look at the other
                Moneyball events coming up.
              </p>
            </div>
          )}
        </section>
      </section>
    </DefaultLayout>
  );
}
