"use client";

import { useMemo, useState } from "react";
import type { Playbook } from "@/lib/playbook";
import type {
  DiscoveryQuestion,
  Objection,
  OpportunityRating,
} from "@/lib/types";
import { Button, cx } from "@/components/ui/primitives";
import { TextArea } from "@/components/ui/fields";

/* ------------------------------------------------------------------ */
/* Objection library                                                   */
/* ------------------------------------------------------------------ */

export function ObjectionsPanel({
  objections,
  onJump,
}: {
  objections: Objection[];
  onJump: (nodeId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return objections;
    return objections.filter((o) =>
      `${o.objection} ${o.meaning}`.toLowerCase().includes(q),
    );
  }, [objections, query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search objections…"
        className="nf-field mb-4"
      />
      <div className="space-y-2">
        {filtered.map((objection) => {
          const isOpen = openId === objection.id;
          return (
            <div
              key={objection.id}
              className="overflow-hidden rounded-xl border border-line bg-white"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : objection.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="text-[15px] font-medium leading-snug">
                  “{objection.objection}”
                </span>
                <span className="shrink-0 text-[12px] text-ink-faint">
                  {isOpen ? "–" : "+"}
                </span>
              </button>

              {isOpen ? (
                <div className="space-y-3.5 border-t border-line bg-canvas px-4 py-4">
                  <Detail label="What it probably means" text={objection.meaning} />
                  <div>
                    <div className="nf-label mb-1.5">What I should say</div>
                    <p className="rounded-xl border border-blush-200 bg-blush-50 px-4 py-3 text-[16px] leading-relaxed">
                      {objection.response}
                    </p>
                  </div>
                  <Detail label="Possible response" text={objection.likelyReply} />
                  <Detail label="What I say next" text={objection.followUp} />
                  <Detail label="When to stop" text={objection.whenToStop} />
                  {objection.nodeId ? (
                    <Button
                      size="sm"
                      variant="accent"
                      onClick={() => onJump(objection.nodeId as string)}
                    >
                      Take me to this branch →
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
        {filtered.length === 0 ? (
          <p className="px-1 py-4 text-[14px] text-ink-faint">
            Nothing matches “{query}”.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Detail({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="nf-label mb-1">{label}</div>
      <p className="text-[14px] leading-relaxed text-ink-muted">{text}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Discovery question list                                             */
/* ------------------------------------------------------------------ */

export function DiscoveryPanel({
  questions,
  currentIndex,
  onJump,
}: {
  questions: DiscoveryQuestion[];
  currentIndex: number;
  onJump: (index: number) => void;
}) {
  return (
    <div>
      <p className="mb-4 rounded-xl bg-canvas px-4 py-3 text-[13px] leading-relaxed text-ink-muted">
        Have a conversation — don&apos;t read a questionnaire. Ask naturally,
        listen to the answer, and pick the next question based on what they
        actually said. You will not need all of these.
      </p>
      <div className="space-y-2">
        {questions.map((question, index) => (
          <button
            key={question.id}
            type="button"
            onClick={() => onJump(index)}
            className={cx(
              "w-full rounded-xl border px-4 py-3 text-left transition-colors",
              index === currentIndex
                ? "border-blush-300 bg-blush-50"
                : "border-line bg-white hover:border-ink/20",
            )}
          >
            <p className="text-[15px] font-medium leading-snug">
              {question.question}
            </p>
            {question.why ? (
              <p className="mt-1 text-[13px] text-ink-muted">{question.why}</p>
            ) : null}
            {question.listenFor && question.listenFor.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {question.listenFor.map((cue, i) => (
                  <li key={i} className="text-[12px] text-ink-faint">
                    Listen for: {cue}
                  </li>
                ))}
              </ul>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notes                                                               */
/* ------------------------------------------------------------------ */

export function NotesPanel({
  notes,
  onChange,
}: {
  notes: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-[13px] text-ink-muted">
        Anything they tell you. Saved automatically and carried through to the
        outcome screen.
      </p>
      <TextArea
        rows={14}
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Said they get calls all day asking if things are in stock…"
        className="text-[15px]"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Opportunity rating control                                          */
/* ------------------------------------------------------------------ */

const RATING_META: Record<
  OpportunityRating,
  { label: string; dot: string; active: string; reasons: string[] }
> = {
  high: {
    label: "🟢 High",
    dot: "bg-emerald-500",
    active: "border-emerald-300 bg-emerald-50",
    reasons: [
      "No website or a poor one",
      "Clear problem they've admitted to",
      "Business is active and wants more work",
    ],
  },
  medium: {
    label: "🟡 Medium",
    dot: "bg-amber-500",
    active: "border-amber-300 bg-amber-50",
    reasons: [
      "Website exists but could be better",
      "Some online presence already",
      "A need, but not an urgent one",
    ],
  },
  low: {
    label: "🔴 Low",
    dot: "bg-red-500",
    active: "border-red-300 bg-red-50",
    reasons: [
      "Strong website and online presence",
      "No obvious problem to solve",
      "Little reason for them to change",
    ],
  },
};

export function OpportunityControl({
  rating,
  onChange,
  compact = false,
}: {
  rating: OpportunityRating;
  onChange: (rating: OpportunityRating) => void;
  compact?: boolean;
}) {
  return (
    <div>
      <div className="flex gap-1.5">
        {(Object.keys(RATING_META) as OpportunityRating[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cx(
              "flex-1 rounded-xl border px-2 py-2 text-[13px] font-semibold transition-colors",
              rating === key
                ? RATING_META[key].active
                : "border-line bg-white text-ink-muted hover:border-ink/20",
            )}
          >
            {RATING_META[key].label}
          </button>
        ))}
      </div>
      {!compact ? (
        <ul className="mt-3 space-y-1">
          {RATING_META[rating].reasons.map((reason, i) => (
            <li key={i} className="flex gap-2 text-[13px] text-ink-muted">
              <span className={cx("mt-[7px] h-1 w-1 shrink-0 rounded-full", RATING_META[rating].dot)} />
              {reason}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function PlaybookQuickJump({
  playbook,
  onJump,
}: {
  playbook: Playbook;
  onJump: (nodeId: string) => void;
}) {
  const shortcuts: { nodeId: string; label: string }[] = [
    { nodeId: "opening", label: "Back to the opening" },
    { nodeId: "hook", label: "The reason I rang" },
    { nodeId: "value-statement", label: "Value statement" },
    { nodeId: "demo-offer", label: "Offer the example" },
    { nodeId: "pricing-main", label: "Price question" },
    { nodeId: "close-buy", label: "They want to go ahead" },
    { nodeId: "polite-exit", label: "Professional exit" },
  ].filter((item) => playbook.nodes[item.nodeId]);

  return (
    <div className="space-y-2">
      {shortcuts.map((item) => (
        <button
          key={item.nodeId}
          type="button"
          onClick={() => onJump(item.nodeId)}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-left text-[15px] font-medium transition-colors hover:border-ink/20 hover:bg-canvas"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
