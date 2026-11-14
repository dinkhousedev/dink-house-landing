import {
  formatCurrency,
  ordinal,
  type Payout,
  type PublicMoneyball,
} from "./shared";

type Props = {
  purse: number;
  payouts?: Payout[];
  payoutLabel?: PublicMoneyball["payoutLabel"];
  size?: "md" | "lg";
};

/** The live purse, and how it splits between the top finishers. */
export function PurseDisplay({
  purse,
  payouts,
  payoutLabel,
  size = "md",
}: Props) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
        Current purse
      </p>
      <p
        aria-live="polite"
        className={`font-display leading-none text-dink-lime ${
          size === "lg" ? "text-7xl sm:text-8xl" : "text-5xl"
        }`}
      >
        {formatCurrency(purse)}
      </p>
      {payoutLabel && !payouts && (
        <p className="mt-2 text-sm text-gray-400">Split {payoutLabel}</p>
      )}
      {payouts && payouts.length > 0 && (
        <ul className="mt-6 divide-y divide-gray-800 border-y border-gray-800">
          {payouts.map((payout) => (
            <li
              key={payout.place}
              className="flex items-baseline justify-between gap-4 py-3"
            >
              <span className="font-bold uppercase tracking-wider text-gray-200">
                {ordinal(payout.place)} place
              </span>
              <span className="text-right">
                <span className="text-xl font-bold text-white">
                  {formatCurrency(payout.amount)}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  {payout.percent}%
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
