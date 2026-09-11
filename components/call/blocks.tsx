"use client";

import { useEffect, useRef, useState } from "react";
import type { ResponseOption } from "@/lib/types";
import { Button, cx } from "@/components/ui/primitives";

/* ------------------------------------------------------------------ */
/* 🗣️ THEY SAY                                                        */
/* ------------------------------------------------------------------ */

export function TheySayCard({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-line bg-canvas px-5 py-4">
      <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
        <span aria-hidden>🗣️</span> They say
      </div>
      <p className="text-[17px] italic leading-snug text-ink-muted">“{text}”</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 👉 I SAY                                                            */
/* ------------------------------------------------------------------ */

export function ISayCard({
  text,
  editable = false,
  edited = false,
  onSave,
  onReset,
  label = "I say",
  size = "lg",
}: {
  text: string;
  editable?: boolean;
  edited?: boolean;
  onSave?: (value: string) => void;
  onReset?: () => void;
  label?: string;
  size?: "lg" | "md";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setDraft(text), [text]);
  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  return (
    <div className="overflow-hidden rounded-2xl border border-blush-200 bg-blush-50 shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-blush-200/70 bg-blush-100/70 px-5 py-2.5">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink">
          <span aria-hidden>👉</span> {label}
          {edited ? (
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold tracking-normal text-ink-muted">
              edited
            </span>
          ) : null}
        </div>
        {editable ? (
          <div className="flex items-center gap-1">
            {edited && onReset ? (
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setEditing(false);
                }}
                className="rounded-lg px-2 py-1 text-[12px] font-medium text-ink-muted hover:bg-white/70 hover:text-ink"
              >
                Reset
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="rounded-lg px-2 py-1 text-[12px] font-semibold text-ink hover:bg-white/70"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>
        ) : null}
      </div>

      {editing ? (
        <div className="space-y-3 p-4">
          <textarea
            ref={ref}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={Math.max(4, Math.ceil(draft.length / 60))}
            className="w-full resize-y rounded-xl border border-blush-200 bg-white px-4 py-3 text-[16px] leading-relaxed outline-none focus:border-blush-300 focus:ring-4 focus:ring-blush-100"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                onSave?.(draft.trim());
                setEditing(false);
              }}
            >
              Save wording
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft(text);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p
          className={cx(
            "whitespace-pre-wrap px-4 py-3.5 font-medium leading-relaxed text-ink sm:px-5 sm:py-4",
            size === "lg" ? "text-[17px] sm:text-[19px] lg:text-[21px]" : "text-[16px]",
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 🎯 GOAL + coaching note                                             */
/* ------------------------------------------------------------------ */

export function GoalBar({ goal }: { goal: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] text-ink-muted">
      <span aria-hidden className="mt-[1px]">🎯</span>
      <span>
        <span className="font-semibold text-ink">Goal: </span>
        {goal}
      </span>
    </div>
  );
}

export function CoachNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-canvas px-4 py-2.5 text-[13px] leading-relaxed text-ink-muted">
      <span aria-hidden className="mt-[1px]">💡</span>
      <span>{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* What happens next                                                   */
/* ------------------------------------------------------------------ */

const TONE_STYLES: Record<ResponseOption["responseType"], string> = {
  positive:
    "border-emerald-200 bg-emerald-50/50 hover:border-emerald-400 hover:bg-emerald-50",
  neutral: "border-line bg-white hover:border-ink/25 hover:bg-canvas",
  resistant: "border-amber-200 bg-amber-50/50 hover:border-amber-400 hover:bg-amber-50",
  exit: "border-line bg-canvas hover:border-ink/25 hover:bg-white",
};

const TONE_DOT: Record<ResponseOption["responseType"], string> = {
  positive: "bg-emerald-500",
  neutral: "bg-ink/20",
  resistant: "bg-amber-500",
  exit: "bg-ink/30",
};

export function ResponseGrid({
  options,
  onSelect,
  heading = "What happens next?",
}: {
  options: ResponseOption[];
  onSelect: (option: ResponseOption) => void;
  heading?: string;
}) {
  return (
    <div>
      <div className="nf-label mb-2.5">{heading}</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option)}
            className={cx(
              "group flex min-h-[56px] w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-75",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blush-100",
              TONE_STYLES[option.responseType],
            )}
          >
            <span
              className={cx(
                "mt-[7px] h-2 w-2 shrink-0 rounded-full",
                TONE_DOT[option.responseType],
              )}
            />
            <span>
              <span className="block text-[15px] font-medium leading-snug text-ink">
                {option.label}
              </span>
              {option.hint ? (
                <span className="mt-0.5 block text-[12px] text-ink-faint">
                  {option.hint}
                </span>
              ) : null}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Arrow() {
  return (
    <div className="flex justify-center py-0.5 text-ink-faint sm:py-1" aria-hidden>
      <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
        <path
          d="M8 1v17m0 0 5-5m-5 5-5-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
