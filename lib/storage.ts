"use client";

import type { CallRecord, Prospect } from "./types";

/**
 * Browser storage layer. Everything the salesperson creates during V1 lives
 * here — prospects they add, wording they edit, and call outcomes.
 *
 * Every read is defensive: a corrupted or missing key must never break the
 * call screen while someone is on the phone. When V2 adds a database, only
 * this file and lib/prospects.ts need replacing.
 */

const KEYS = {
  localProspects: "nf:prospects:local",
  prospectOverrides: "nf:prospects:overrides",
  scriptEdits: "nf:script-edits",
  calls: "nf:calls",
  callHistory: "nf:call-history",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("nf:storage", { detail: { key } }));
  } catch {
    /* storage full or blocked — the call carries on regardless */
  }
}

/* ---------------- Prospects created in the browser ---------------- */

export function getLocalProspects(): Prospect[] {
  return read<Prospect[]>(KEYS.localProspects, []);
}

export function saveLocalProspect(prospect: Prospect): void {
  const all = getLocalProspects();
  const index = all.findIndex((p) => p.id === prospect.id);
  if (index >= 0) all[index] = prospect;
  else all.unshift(prospect);
  write(KEYS.localProspects, all);
}

export function deleteLocalProspect(id: string): void {
  write(
    KEYS.localProspects,
    getLocalProspects().filter((p) => p.id !== id),
  );
}

/* ---------------- Edits to prospects that live in files ---------------- */

export type ProspectOverride = Partial<Prospect>;

export function getProspectOverrides(): Record<string, ProspectOverride> {
  return read<Record<string, ProspectOverride>>(KEYS.prospectOverrides, {});
}

export function saveProspectOverride(
  id: string,
  override: ProspectOverride,
): void {
  const all = getProspectOverrides();
  all[id] = { ...all[id], ...override };
  write(KEYS.prospectOverrides, all);
}

export function clearProspectOverride(id: string): void {
  const all = getProspectOverrides();
  delete all[id];
  write(KEYS.prospectOverrides, all);
}

/* ---------------- Edited wording ---------------- */

/** Keyed `${prospectId}::${nodeId}::${field}`. */
export type ScriptEdits = Record<string, string>;

export function scriptEditKey(
  prospectId: string,
  nodeId: string,
  field = "whatISay",
): string {
  return `${prospectId}::${nodeId}::${field}`;
}

export function getScriptEdits(): ScriptEdits {
  return read<ScriptEdits>(KEYS.scriptEdits, {});
}

export function saveScriptEdit(key: string, value: string): void {
  const all = getScriptEdits();
  all[key] = value;
  write(KEYS.scriptEdits, all);
}

export function clearScriptEdit(key: string): void {
  const all = getScriptEdits();
  delete all[key];
  write(KEYS.scriptEdits, all);
}

/* ---------------- Calls ---------------- */

export function getCalls(): Record<string, CallRecord> {
  return read<Record<string, CallRecord>>(KEYS.calls, {});
}

export function getCall(prospectId: string): CallRecord | undefined {
  return getCalls()[prospectId];
}

export function saveCall(record: CallRecord): void {
  const all = getCalls();
  all[record.prospectId] = record;
  write(KEYS.calls, all);
}

export function getCallHistory(): CallRecord[] {
  return read<CallRecord[]>(KEYS.callHistory, []);
}

/** Called when a call is logged on the outcome screen. */
export function appendCallHistory(record: CallRecord): void {
  const history = getCallHistory();
  history.unshift(record);
  write(KEYS.callHistory, history.slice(0, 200));
}

export const STORAGE_EVENT = "nf:storage";
