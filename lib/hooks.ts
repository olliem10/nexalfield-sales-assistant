"use client";

import { useCallback, useEffect, useState } from "react";
import { findProspect, getAllProspects } from "./prospects";
import {
  getCall,
  getScriptEdits,
  saveCall,
  saveScriptEdit,
  clearScriptEdit,
  scriptEditKey,
  STORAGE_EVENT,
  type ScriptEdits,
} from "./storage";
import type { CallRecord, Prospect } from "./types";

/** True once the browser has hydrated — keeps SSR and first paint identical. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** Re-runs `read` whenever anything in this app writes to localStorage. */
function useStoredValue<T>(read: () => T, initial: T): [T, () => void] {
  const [value, setValue] = useState<T>(initial);

  const refresh = useCallback(() => setValue(read()), [read]);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(STORAGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(STORAGE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  return [value, refresh];
}

export function useProspects(): { prospects: Prospect[]; loaded: boolean } {
  const mounted = useMounted();
  const read = useCallback(() => getAllProspects(), []);
  const [prospects] = useStoredValue<Prospect[]>(read, []);
  return { prospects, loaded: mounted };
}

export function useProspect(id: string): {
  prospect: Prospect | undefined;
  loaded: boolean;
} {
  const mounted = useMounted();
  const read = useCallback(() => findProspect(id), [id]);
  const [prospect] = useStoredValue<Prospect | undefined>(read, undefined);
  return { prospect, loaded: mounted };
}

/** Wording the salesperson has rewritten, keyed by prospect + node + field. */
export function useScriptEdits(prospectId: string) {
  const read = useCallback(() => getScriptEdits(), []);
  const [edits] = useStoredValue<ScriptEdits>(read, {});

  const get = useCallback(
    (nodeId: string, fallback: string, field = "whatISay") =>
      edits[scriptEditKey(prospectId, nodeId, field)] ?? fallback,
    [edits, prospectId],
  );

  const set = useCallback(
    (nodeId: string, value: string, field = "whatISay") =>
      saveScriptEdit(scriptEditKey(prospectId, nodeId, field), value),
    [prospectId],
  );

  const reset = useCallback(
    (nodeId: string, field = "whatISay") =>
      clearScriptEdit(scriptEditKey(prospectId, nodeId, field)),
    [prospectId],
  );

  const isEdited = useCallback(
    (nodeId: string, field = "whatISay") =>
      scriptEditKey(prospectId, nodeId, field) in edits,
    [edits, prospectId],
  );

  return { get, set, reset, isEdited };
}

/** The in-progress / last call for a prospect. */
export function useCallRecord(prospectId: string) {
  const read = useCallback(() => getCall(prospectId), [prospectId]);
  const [record] = useStoredValue<CallRecord | undefined>(read, undefined);

  const update = useCallback(
    (patch: Partial<CallRecord>) => {
      const base: CallRecord = getCall(prospectId) ?? {
        prospectId,
        outcome: null,
        notes: "",
        nextAction: null,
        followUpDate: null,
        opportunity: null,
        stage: "preparation",
        path: [],
        updatedAt: new Date().toISOString(),
      };
      saveCall({ ...base, ...patch, updatedAt: new Date().toISOString() });
    },
    [prospectId],
  );

  return { record, update };
}
