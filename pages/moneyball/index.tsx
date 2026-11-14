import type { GetServerSideProps } from "next";

import NextLink from "next/link";

import DefaultLayout from "@/layouts/default";
import { getBackendUrl } from "@/lib/backend";
import { logger } from "@/lib/logger";
import { PurseDisplay } from "@/components/moneyball/purse-display";
import {
  duprRangeLabel,
  formatCurrency,
  formatEventWhen,
  plural,
  type PublicMoneyball,
} from "@/components/moneyball/shared";

type Props = { events: PublicMoneyball[]; failed: boolean };

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const response = await fetch(`${getBackendUrl()}/api/moneyball`, {
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`Backend answered ${response.status}`);

    const data = (await response.json()) as { events?: PublicMoneyball[] };

    return {
      props: {
        events: Array.isArray(data.events) ? data.events : [],
        failed: false,
      },
    };
  } catch (error) {
    logger.error("Moneyball list failed to load:", error);

    return { props: { events: [], failed: true } };
  }
};

const STEPS = [
  {
    title: "Enter as a team",
    text: "Sign up with your partner and pay one flat team fee by card. No account and no app needed.",
  },
  {
    title: "Or come solo",
    text: "Sign up free. We pair you with another solo player rated within half a point of your DUPR, email you both, and you each pay half.",
  },
  {
    title: "Play for the purse",
    text: "Most of every team fee goes into the purse. It grows as teams pay and is split among the top finishers.",
  },
];

export default function MoneyballListPage({ events, failed }: Props) {
  return (
    <DefaultLayout title="Moneyball - The Dink House">
      <section className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <p className="text-sm font-bold uppercase tracking-widest text-dink-lime">
          Doubles team tournament
        </p>
        <h1 className="mb-4 font-display text-5xl uppercase tracking-wider sm:text-6xl">
          Moneyball
        </h1>
        <p className="mb-10 max-w-2xl text-lg text-gray-300">
          Grab a partner, pay one team fee, and play for a purse that grows
          every time another team enters. Anyone can sign up right here.
        </p>

        <ol className="mb-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="border-2 border-gray-800 bg-gray-900 p-5"
            >
              <p className="font-display text-3xl text-dink-lime">
                {index + 1}
              </p>
              <h2 className="mb-1 font-bold uppercase tracking-wider">
                {step.title}
              </h2>
              <p className="text-sm text-gray-400">{step.text}</p>
            </li>
          ))}
        </ol>

        <h2 className="mb-6 font-display text-3xl uppercase tracking-wider">
          Upcoming events
        </h2>

        {failed && (
          <div
            className="border-l-4 border-red-500 bg-red-950/40 p-4 text-red-200"
            role="alert"
          >
            <p className="font-semibold">
              We couldn&apos;t load the events just now. Please refresh in a
              moment.
            </p>
          </div>
        )}

        {!failed && events.length === 0 && (
          <div className="border-2 border-dashed border-gray-700 p-8 text-center">
            <p className="mb-1 text-lg font-bold uppercase tracking-wider">
              No Moneyball on the calendar yet
            </p>
            <p className="text-gray-400">
              Check back soon. New events show up here as soon as they are
              announced.
            </p>
          </div>
        )}

        <ul className="space-y-6">
          {events.map((event) => (
            <li key={event.id}>
              <NextLink
                className="group block border-2 border-gray-800 bg-gray-900 p-6 transition-colors hover:border-dink-lime focus:outline-none focus-visible:border-dink-lime"
                href={`/moneyball/${event.id}`}
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="mb-1 font-display text-3xl uppercase tracking-wider group-hover:text-dink-lime">
                      {event.title}
                    </h3>
                    <p className="text-gray-300">
                      {formatEventWhen(event.start, event.end)}
                    </p>
                    <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                      <div>
                        <dt className="text-xs uppercase tracking-widest text-gray-500">
                          Rating
                        </dt>
                        <dd className="font-bold text-white">
                          {duprRangeLabel(event)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-widest text-gray-500">
                          Team fee
                        </dt>
                        <dd className="font-bold text-white">
                          {formatCurrency(event.teamFee)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-widest text-gray-500">
                          Teams entered
                        </dt>
                        <dd className="font-bold text-white">
                          {event.teamsEntered} of {event.maxTeams}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="shrink-0 sm:text-right">
                    <PurseDisplay
                      payoutLabel={event.payoutLabel}
                      purse={event.purse}
                    />
                  </div>
                </div>
                <p className="mt-5 text-sm font-bold uppercase tracking-wider text-dink-lime">
                  {!event.entriesOpen
                    ? "Entries closed · See details"
                    : event.teamsLeft === 0
                      ? "Team spots full · See details"
                      : `${plural(event.teamsLeft, "team spot")} left · Sign up`}
                </p>
              </NextLink>
            </li>
          ))}
        </ul>
      </section>
    </DefaultLayout>
  );
}
