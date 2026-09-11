import type { Prospect, WebsiteStatus } from "./types";

/** The name that goes out on the calls. Change it once, here. */
export const CALLER_NAME = "Ollie";
export const COMPANY_NAME = "NexalField";

/** One-off website price. The only price allowed on a first call. */
export const WEBSITE_PRICE = "£400";
/** Ongoing options — ONLY mentioned if the prospect asks for them. */
export const MONTHLY_OPTIONS = ["£75/month", "£50/month"] as const;

export const WEBSITE_STATUS_LABEL: Record<WebsiteStatus, string> = {
  none: "No website",
  exists: "Website exists",
  outdated: "Website appears outdated",
  poor: "Website appears poor",
  good: "Website looks good",
  unknown: "Unknown",
};

/**
 * The half-sentence that explains why *this* business got a call. Keeps the
 * opening honest: we never tell someone they have no website when they do.
 */
export function websiteObservationLine(status: WebsiteStatus): string {
  switch (status) {
    case "none":
      return "noticed you don't seem to have a website";
    case "outdated":
      return "had a look at your website and it looks like it's been a while since anyone touched it";
    case "poor":
      return "had a look at your website and thought there were a couple of things holding it back";
    case "exists":
      return "had a look at your website";
    case "good":
      return "had a look at your website, which is decent by the way";
    case "unknown":
    default:
      return "couldn't work out whether you've got a website or not";
  }
}

/** The problem sentence used in the hook and the value statement. */
export function websiteGapLine(status: WebsiteStatus): string {
  switch (status) {
    case "none":
      return "there isn't anywhere I could send someone to quickly see what you do and get in touch";
    case "outdated":
      return "it doesn't really do you justice compared to how the business actually is now";
    case "poor":
      return "it's hard work on a phone, and most people looking you up are on a phone";
    case "exists":
      return "I wasn't sure how much work it's actually bringing in for you";
    case "good":
      return "it already does a decent job, so it'd be more about getting more out of it than replacing it";
    case "unknown":
    default:
      return "I couldn't find much about you online beyond the basics";
  }
}

export function firstName(prospect: Prospect): string {
  if (prospect.contactName) return prospect.contactName.split(" ")[0];
  return prospect.companyName.split(" ")[0];
}

/**
 * Replaces {{tokens}} in prepared wording. Keeps prospect JSON short: write
 * "Hi, is that {{firstName}}?" once and it personalises everywhere.
 */
export function fillTokens(text: string, prospect: Prospect): string {
  const map: Record<string, string> = {
    company: prospect.companyName,
    companyName: prospect.companyName,
    firstName: firstName(prospect),
    contactName: prospect.contactName ?? firstName(prospect),
    businessType: prospect.businessType.toLowerCase(),
    location: prospect.location,
    callerName: CALLER_NAME,
    brand: COMPANY_NAME,
    price: WEBSITE_PRICE,
    websiteObservation: websiteObservationLine(prospect.websiteStatus),
    websiteGap: websiteGapLine(prospect.websiteStatus),
  };
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (whole, key: string) =>
    key in map ? map[key] : whole,
  );
}
