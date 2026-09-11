"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  CallOutcomeType,
  CallRecord,
  NextAction,
  OpportunityRating,
  Prospect,
} from "@/lib/types";
import { Button, SectionLabel, cx } from "@/components/ui/primitives";
import { TextArea, TextInput } from "@/components/ui/fields";
import { appendCallHistory } from "@/lib/storage";
import { OpportunityControl } from "./panels";

const OUTCOMES: { value: CallOutcomeType; label: string; tone: string }[] = [
  { value: "sale", label: "🟢 Sale", tone: "border-emerald-300 bg-emerald-50" },
  { value: "demo-booked", label: "🔵 Demo booked", tone: "border-sky-300 bg-sky-50" },
  { value: "follow-up", label: "🟡 Follow-up required", tone: "border-amber-300 bg-amber-50" },
  { value: "send-info", label: "🟠 Send information", tone: "border-orange-300 bg-orange-50" },
  { value: "not-interested", label: "⚪ Not interested", tone: "border-line bg-canvas" },
  { value: "not-a-fit", label: "🔴 Not a fit", tone: "border-red-300 bg-red-50" },
  { value: "call-back", label: "📞 Call back later", tone: "border-blush-300 bg-blush-50" },
  { value: "other", label: "❓ Other", tone: "border-line bg-canvas" },
];

const NEXT_ACTIONS: { value: NextAction; label: string }[] = [
  { value: "call-back", label: "Call back" },
  { value: "build-demo", label: "Build demo" },
  { value: "send-email", label: "Send email" },
  { value: "follow-up-manually", label: "Follow up manually" },
  { value: "no-action", label: "No action" },
];

/** Suggests the obvious next action so one tap usually finishes the job. */
function suggestAction(outcome: CallOutcomeType | null): NextAction | null {
  switch (outcome) {
    case "sale":
      return "build-demo";
    case "demo-booked":
      return "build-demo";
    case "send-info":
      return "send-email";
    case "follow-up":
    case "call-back":
      return "call-back";
    case "not-interested":
    case "not-a-fit":
      return "no-action";
    default:
      return null;
  }
}

export function OutcomeView({
  prospect,
  record,
  rating,
  notes,
  onUpdate,
  onBack,
}: {
  prospect: Prospect;
  record: CallRecord | undefined;
  rating: OpportunityRating;
  notes: string;
  onUpdate: (patch: Partial<CallRecord>) => void;
  onBack: () => void;
}) {
  const router = useRouter();
  const [outcome, setOutcome] = useState<CallOutcomeType | null>(
    record?.outcome ?? null,
  );
  const [localNotes, setLocalNotes] = useState(notes);
  const [nextAction, setNextAction] = useState<NextAction | null>(
    record?.nextAction ?? null,
  );
  const [followUpDate, setFollowUpDate] = useState(record?.followUpDate ?? "");
  const [localRating, setLocalRating] = useState<OpportunityRating>(rating);
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (!outcome) {
      setError("Pick an outcome so the dashboard knows where this one stands.");
      return;
    }
    const completedAt = new Date().toISOString();
    const patch: Partial<CallRecord> = {
      outcome,
      notes: localNotes,
      nextAction,
      followUpDate: followUpDate || null,
      opportunity: localRating,
      stage: "outcome",
      completedAt,
    };
    onUpdate(patch);
    appendCallHistory({
      prospectId: prospect.id,
      outcome,
      notes: localNotes,
      nextAction,
      followUpDate: followUpDate || null,
      opportunity: localRating,
      stage: "outcome",
      path: record?.path ?? [],
      updatedAt: completedAt,
      completedAt,
    });
    router.push(`/prospects/${prospect.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="text-[24px] font-semibold tracking-tight sm:text-[28px]">
          Call outcome
        </h2>
        <p className="mt-2 text-[15px] text-ink-muted">
          Log it now while it&apos;s fresh — thirty seconds here saves you
          guessing next week.
        </p>
      </div>

      <section>
        <SectionLabel>Outcome</SectionLabel>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {OUTCOMES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setOutcome(option.value);
                setError(null);
                if (!nextAction) setNextAction(suggestAction(option.value));
              }}
              className={cx(
                "min-h-[56px] rounded-xl border px-4 py-3 text-left text-[16px] font-medium transition-colors",
                outcome === option.value
                  ? cx(option.tone, "shadow-card")
                  : "border-line bg-white hover:border-ink/20",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Notes</SectionLabel>
        <TextArea
          rows={6}
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          placeholder="What they said, what they care about, anything to pick up next time…"
          className="mt-3 text-[15px]"
        />
      </section>

      <section>
        <SectionLabel>Opportunity, now you&apos;ve spoken to them</SectionLabel>
        <div className="mt-3">
          <OpportunityControl rating={localRating} onChange={setLocalRating} />
        </div>
      </section>

      <section>
        <SectionLabel>Next action</SectionLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {NEXT_ACTIONS.map((action) => (
            <button
              key={action.value}
              type="button"
              onClick={() =>
                setNextAction(nextAction === action.value ? null : action.value)
              }
              className={cx(
                "rounded-xl border px-4 py-2.5 text-[14px] font-medium transition-colors",
                nextAction === action.value
                  ? "border-blush-300 bg-blush-100 text-ink"
                  : "border-line bg-white text-ink-muted hover:border-ink/20 hover:text-ink",
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Follow-up date</SectionLabel>
        <TextInput
          type="date"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
          className="mt-3 max-w-xs"
        />
      </section>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Back into the call
        </Button>
        <Button variant="primary" size="lg" onClick={save}>
          Save outcome and finish
        </Button>
      </div>
    </div>
  );
}
