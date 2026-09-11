import { FILE_PROSPECTS } from "@/data/prospects";
import type { Prospect } from "./types";
import {
  getLocalProspects,
  getProspectOverrides,
  type ProspectOverride,
} from "./storage";

/**
 * The single place the app asks for prospects.
 *
 * V1: prepared JSON files in /data/prospects, plus anything created in the
 * browser, plus any edits made to the file-based ones. V2 replaces the body of
 * these functions with database calls — nothing above this line changes.
 */

function applyOverride(
  prospect: Prospect,
  override: ProspectOverride | undefined,
): Prospect {
  if (!override) return prospect;
  return {
    ...prospect,
    ...override,
    research: { ...prospect.research, ...(override.research ?? {}) },
    script: { ...(prospect.script ?? {}), ...(override.script ?? {}) },
  };
}

/** File-based prospects only — safe to call during server render. */
export function getFileProspects(): Prospect[] {
  return FILE_PROSPECTS.map((p) => ({ ...p, source: "file" as const }));
}

/** Everything, including browser-created prospects. Client-side only. */
export function getAllProspects(): Prospect[] {
  const overrides = getProspectOverrides();
  const files = getFileProspects().map((p) => applyOverride(p, overrides[p.id]));
  const locals = getLocalProspects().map((p) => ({
    ...p,
    source: "local" as const,
  }));
  return [...locals, ...files];
}

export function findProspect(id: string): Prospect | undefined {
  return getAllProspects().find((p) => p.id === id);
}

/** Turns a company name into a stable, readable id. */
export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || `prospect-${Date.now().toString(36)}`;
}

export function uniqueProspectId(name: string, existing: string[]): string {
  const base = slugify(name);
  if (!existing.includes(base)) return base;
  let n = 2;
  while (existing.includes(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function emptyProspect(): Prospect {
  return {
    id: "",
    companyName: "",
    businessType: "",
    location: "",
    contactName: "",
    phone: "",
    website: "",
    social: "",
    googleBusinessProfile: "",
    websiteStatus: "unknown",
    websiteObservations: "",
    opportunity: "medium",
    research: {
      summary: "",
      observations: [],
      problems: [],
      opportunities: [],
      talkingPoints: [],
      notes: [],
    },
    source: "local",
  };
}

/** Textareas take one item per line; this is the shared parser. */
export function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

export function listToLines(list: string[] | undefined): string {
  return (list ?? []).join("\n");
}
