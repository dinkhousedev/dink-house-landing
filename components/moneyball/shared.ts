// Shapes the Moneyball API returns, and the small formatters every page shares.

export type Gender = "male" | "female";

export type Payout = { place: number; percent: number; amount: number };

export type PublicMoneyball = {
  id: string;
  title: string;
  description: string | null;
  start: string;
  end: string;
  /** Lowest and highest DUPR rating allowed in; null on a side with no limit. */
  duprMin: number | null;
  duprMax: number | null;
  /** "Open" when any rating may enter, otherwise e.g. "3.00 to 3.99". */
  duprRange: string;
  // Cancellation policy. Optional for a backend that predates it.
  cancelHours?: number;
  lateRefundPercent?: number;
  teamFee: number;
  halfFee: number;
  maxTeams: number;
  teamsEntered: number;
  teamsLeft: number;
  purse: number;
  payouts: Payout[];
  payoutLabel: string;
  entriesOpen: boolean;
  /** Solo players waiting, grouped by rating; `band` is a ready-made label. */
  solosWaiting: { band: string; count: number }[];
};

export type Guest = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: Gender;
  /** Self-reported DUPR rating, 2.00 to 8.00. */
  dupr: number;
  /** Their DUPR account ID, when they gave one. */
  duprId?: string;
};

export type PayInfo = {
  eventId: string;
  title: string;
  start: string;
  firstName: string;
  partnerName: string;
  partnerPaid: boolean;
  amount: number;
  payBy: string | null;
  state: "due" | "paid" | "in" | "closed";
};

export type ApiError = { error?: string; code?: string };

/** The span of the DUPR scale the backend accepts. */
export const DUPR_LOWEST = 2;
export const DUPR_HIGHEST = 8;

export const CLUB_TIME_ZONE = "America/Chicago";

export const FALLBACK_ERROR = "Something went wrong. Please try again.";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

// Newer runtimes put a narrow no-break space before AM/PM and older ones a plain
// space. Normalising keeps the server and browser output identical.
function plainSpaces(value: string): string {
  return value.replace(/[  ]/g, " ");
}

function formatDay(iso: string): string {
  return plainSpaces(
    new Intl.DateTimeFormat("en-US", {
      timeZone: CLUB_TIME_ZONE,
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date(iso)),
  );
}

function formatTime(iso: string): string {
  return plainSpaces(
    new Intl.DateTimeFormat("en-US", {
      timeZone: CLUB_TIME_ZONE,
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso)),
  );
}

/** "Monday, November 23 · 6:00 PM to 9:00 PM CT", always in club time. */
export function formatEventWhen(start: string, end: string): string {
  return `${formatDay(start)} · ${formatTime(start)} to ${formatTime(end)} CT`;
}

/** "Monday, November 23 at 6:00 PM CT", always in club time. */
export function formatDayTime(iso: string): string {
  return `${formatDay(iso)} at ${formatTime(iso)} CT`;
}

/** A rating the way DUPR writes it: "3.40". */
export function formatDupr(rating: number): string {
  return rating.toFixed(2);
}

type DuprLimits = Pick<PublicMoneyball, "duprMin" | "duprMax" | "duprRange">;

export function hasDuprRange(event: DuprLimits): boolean {
  return event.duprMin !== null || event.duprMax !== null;
}

/** "DUPR 3.00 to 3.99", or "Open to all DUPR ratings" when anyone may enter. */
export function duprRangeLabel(event: DuprLimits): string {
  return !event.duprRange || event.duprRange === "Open"
    ? "Open to all DUPR ratings"
    : `DUPR ${event.duprRange}`;
}

export function ordinal(place: number): string {
  const tens = place % 100;

  if (tens >= 11 && tens <= 13) return `${place}th`;

  return `${place}${["th", "st", "nd", "rd"][place % 10] ?? "th"}`;
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** Reads a proxy response; a failure throws the backend's own sentence. */
export async function readApi<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & ApiError;

  if (!response.ok) {
    throw new ApiFailure(
      data.error || FALLBACK_ERROR,
      response.status,
      data.code,
    );
  }

  return data;
}

export class ApiFailure extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function errorText(error: unknown): string {
  return error instanceof ApiFailure ? error.message : FALLBACK_ERROR;
}

// The cancellation policy in one sentence, shown next to every pay button.
export function refundPolicyText(event: {
  cancelHours?: number;
  lateRefundPercent?: number;
}) {
  const hours = event.cancelHours ?? 24;
  const percent = event.lateRefundPercent ?? 50;

  return `Full refund if you withdraw ${hours} hours or more before the start. After that, ${percent}% is refunded. To withdraw, contact the front desk.`;
}
