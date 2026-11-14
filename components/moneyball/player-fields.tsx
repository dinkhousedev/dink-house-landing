import {
  DUPR_HIGHEST,
  DUPR_LOWEST,
  formatDupr,
  hasDuprRange,
  type Gender,
  type Guest,
  type PublicMoneyball,
} from "./shared";

export const FIELD =
  "w-full px-4 py-3 bg-black border-2 border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-dink-lime focus:border-dink-lime transition-all disabled:opacity-50";

/** A person as typed so far: the select starts empty and the rating is text. */
export type GuestDraft = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: Gender | "";
  dupr: string;
  duprId: string;
};

export type GuestErrors = Partial<Record<keyof Guest, string>>;

/** The event's rating limits, as the public event carries them. */
export type DuprLimits = Pick<
  PublicMoneyball,
  "duprMin" | "duprMax" | "duprRange"
>;

export function emptyGuest(): GuestDraft {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dupr: "",
    duprId: "",
  };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// One digit, then up to two decimals: "3", "3.5", "3.75".
const RATING = /^\d(\.\d{1,2})?$/;

/** The typed rating as a number, or null when it is not a DUPR rating. */
export function parseDupr(typed: string): number | null {
  const value = typed.trim();

  if (!RATING.test(value)) return null;

  const rating = Number(value);

  return rating >= DUPR_LOWEST && rating <= DUPR_HIGHEST ? rating : null;
}

/**
 * The sentence to show when a valid rating is outside the event's range.
 * The backend has the last word: a rating already on file wins over a typed one.
 */
export function duprRangeError(typed: string, limits: DuprLimits): string {
  const rating = parseDupr(typed);

  if (rating === null || !hasDuprRange(limits)) return "";

  const tooLow = limits.duprMin !== null && rating < limits.duprMin;
  const tooHigh = limits.duprMax !== null && rating > limits.duprMax;

  return tooLow || tooHigh
    ? `This Moneyball is for DUPR ${limits.duprRange}.`
    : "";
}

/** The same checks the backend makes. `whose` is "your" or "your partner's". */
export function validateGuest(
  draft: GuestDraft,
  whose: string,
  limits: DuprLimits,
): GuestErrors {
  const errors: GuestErrors = {};

  if (!draft.firstName.trim()) errors.firstName = `Enter ${whose} first name.`;
  if (!draft.lastName.trim()) errors.lastName = `Enter ${whose} last name.`;
  if (!EMAIL.test(draft.email.trim())) {
    errors.email = `Enter ${whose} email address, like name@example.com.`;
  }
  if (draft.phone.replace(/\D/g, "").length < 10) {
    errors.phone = `Enter ${whose} phone number with area code.`;
  }
  if (!draft.gender) errors.gender = `Choose ${whose} gender.`;
  if (!draft.dupr.trim()) {
    errors.dupr = `Enter ${whose} DUPR rating.`;
  } else if (parseDupr(draft.dupr) === null) {
    errors.dupr = `Enter ${whose} DUPR rating as a number from ${formatDupr(DUPR_LOWEST)} to ${formatDupr(DUPR_HIGHEST)}, like 3.5.`;
  } else {
    const outside = duprRangeError(draft.dupr, limits);

    if (outside) errors.dupr = outside;
  }

  return errors;
}

export function toGuest(draft: GuestDraft): Guest {
  return {
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    email: draft.email.trim().toLowerCase(),
    phone: draft.phone.trim(),
    gender: draft.gender as Gender,
    dupr: Number(draft.dupr.trim()),
    ...(draft.duprId.trim() ? { duprId: draft.duprId.trim() } : {}),
  };
}

type Props = {
  legend: string;
  /** Unique per group on the page; it prefixes every input id. */
  idPrefix: string;
  value: GuestDraft;
  errors: GuestErrors;
  /** The event's DUPR range, checked as the rating is typed. */
  limits: DuprLimits;
  disabled: boolean;
  /** Off for the partner so the browser doesn't fill in your own details. */
  autoFill: boolean;
  onChange: (next: GuestDraft) => void;
};

export function PlayerFields({
  legend,
  idPrefix,
  value,
  errors,
  limits,
  disabled,
  autoFill,
  onChange,
}: Props) {
  const set = <K extends keyof GuestDraft>(key: K, next: GuestDraft[K]) =>
    onChange({ ...value, [key]: next });

  // A rating outside the event's range is flagged as soon as it is typed.
  const duprError = errors.dupr || duprRangeError(value.dupr, limits);

  const describe = (key: keyof Guest) =>
    errors[key] ? `${idPrefix}-${key}-error` : undefined;

  const problem = (key: keyof Guest) =>
    errors[key] ? (
      <span className="text-sm text-red-400" id={`${idPrefix}-${key}-error`}>
        {errors[key]}
      </span>
    ) : null;

  return (
    <fieldset className="space-y-4">
      <legend className="mb-3 font-display text-2xl uppercase tracking-wider text-dink-lime">
        {legend}
      </legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-gray-300">
          First name
          <input
            aria-describedby={describe("firstName")}
            aria-invalid={Boolean(errors.firstName)}
            autoComplete={autoFill ? "given-name" : "off"}
            className={FIELD}
            disabled={disabled}
            id={`${idPrefix}-firstName`}
            maxLength={60}
            name={`${idPrefix}-firstName`}
            type="text"
            value={value.firstName}
            onChange={(e) => set("firstName", e.target.value)}
          />
          {problem("firstName")}
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-300">
          Last name
          <input
            aria-describedby={describe("lastName")}
            aria-invalid={Boolean(errors.lastName)}
            autoComplete={autoFill ? "family-name" : "off"}
            className={FIELD}
            disabled={disabled}
            id={`${idPrefix}-lastName`}
            maxLength={60}
            name={`${idPrefix}-lastName`}
            type="text"
            value={value.lastName}
            onChange={(e) => set("lastName", e.target.value)}
          />
          {problem("lastName")}
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-300">
          Email
          <input
            aria-describedby={describe("email")}
            aria-invalid={Boolean(errors.email)}
            autoCapitalize="none"
            autoComplete={autoFill ? "email" : "off"}
            className={FIELD}
            disabled={disabled}
            id={`${idPrefix}-email`}
            inputMode="email"
            maxLength={254}
            name={`${idPrefix}-email`}
            type="email"
            value={value.email}
            onChange={(e) => set("email", e.target.value)}
          />
          {problem("email")}
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-300">
          Mobile phone
          <input
            aria-describedby={describe("phone")}
            aria-invalid={Boolean(errors.phone)}
            autoComplete={autoFill ? "tel" : "off"}
            className={FIELD}
            disabled={disabled}
            id={`${idPrefix}-phone`}
            inputMode="tel"
            maxLength={30}
            name={`${idPrefix}-phone`}
            type="tel"
            value={value.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          {problem("phone")}
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-300">
          Gender
          <select
            aria-describedby={describe("gender")}
            aria-invalid={Boolean(errors.gender)}
            className={FIELD}
            disabled={disabled}
            id={`${idPrefix}-gender`}
            name={`${idPrefix}-gender`}
            value={value.gender}
            onChange={(e) => set("gender", e.target.value as Gender | "")}
          >
            <option value="">Choose one</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {problem("gender")}
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-300">
          DUPR rating
          <input
            aria-describedby={
              duprError
                ? `${idPrefix}-dupr-error ${idPrefix}-dupr-note`
                : `${idPrefix}-dupr-note`
            }
            aria-invalid={Boolean(duprError)}
            autoComplete="off"
            className={FIELD}
            disabled={disabled}
            id={`${idPrefix}-dupr`}
            inputMode="decimal"
            maxLength={4}
            name={`${idPrefix}-dupr`}
            placeholder="3.50"
            type="text"
            value={value.dupr}
            onChange={(e) => set("dupr", e.target.value)}
          />
          {duprError && (
            <span
              className="text-sm text-red-400"
              id={`${idPrefix}-dupr-error`}
            >
              {duprError}
            </span>
          )}
          <span className="text-xs text-gray-500" id={`${idPrefix}-dupr-note`}>
            Don&apos;t have a DUPR rating? Create a free account at{" "}
            <a
              className="underline hover:text-dink-lime"
              href="https://www.dupr.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              dupr.com
            </a>
            , or enter your best estimate; staff confirm ratings at check-in.
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-300">
          DUPR ID
          <input
            aria-describedby={`${idPrefix}-duprId-note`}
            autoCapitalize="characters"
            autoComplete="off"
            className={FIELD}
            disabled={disabled}
            id={`${idPrefix}-duprId`}
            maxLength={20}
            name={`${idPrefix}-duprId`}
            type="text"
            value={value.duprId}
            onChange={(e) => set("duprId", e.target.value)}
          />
          <span
            className="text-xs text-gray-500"
            id={`${idPrefix}-duprId-note`}
          >
            Optional. Found on your DUPR profile; lets us report your matches.
          </span>
        </label>
      </div>
    </fieldset>
  );
}
