"use client";

import { useEffect } from "react";
import type { CallStage, OpportunityRating, Prospect } from "@/lib/types";
import { cx } from "@/components/ui/primitives";
import { WEBSITE_STATUS_LABEL } from "@/lib/tokens";

/* ------------------------------------------------------------------ */
/* Stages                                                              */
/* ------------------------------------------------------------------ */

export const SIDEBAR_STAGES: { stage: CallStage; label: string }[] = [
  { stage: "preparation", label: "Preparation" },
  { stage: "opening", label: "Opening" },
  { stage: "conversation", label: "Conversation" },
  { stage: "discovery", label: "Discovery" },
  { stage: "opportunity", label: "Opportunity" },
  { stage: "demo", label: "Demo" },
  { stage: "close", label: "Close" },
  { stage: "outcome", label: "Outcome" },
];

const HEADER_STAGES: { stage: CallStage; label: string }[] = [
  { stage: "opening", label: "Opening" },
  { stage: "discovery", label: "Discovery" },
  { stage: "opportunity", label: "Opportunity" },
  { stage: "demo", label: "Demo" },
  { stage: "close", label: "Close" },
  { stage: "outcome", label: "Outcome" },
];

const ORDER: CallStage[] = SIDEBAR_STAGES.map((s) => s.stage);

export function stageIndex(stage: CallStage): number {
  return ORDER.indexOf(stage);
}

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

const RATING_DOT: Record<OpportunityRating, string> = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-red-500",
};

export function CallHeader({
  prospect,
  stage,
  rating,
  onEndCall,
}: {
  prospect: Prospect;
  stage: CallStage;
  rating: OpportunityRating;
  onEndCall: () => void;
}) {
  const current = stageIndex(stage);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-[1500px] px-4 py-3 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-[18px] font-semibold uppercase leading-tight tracking-tight sm:text-[22px]">
              {prospect.companyName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-muted">
              {prospect.location ? <span>{prospect.location}</span> : null}
              <span className="hidden sm:inline text-line">|</span>
              <span>Website: {WEBSITE_STATUS_LABEL[prospect.websiteStatus]}</span>
              <span className="hidden sm:inline text-line">|</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                <span className={cx("h-1.5 w-1.5 rounded-full", RATING_DOT[rating])} />
                {rating.toUpperCase()}
              </span>
              {prospect.phone ? (
                <>
                  <span className="hidden sm:inline text-line">|</span>
                  <a
                    href={`tel:${prospect.phone.replace(/\s/g, "")}`}
                    className="font-medium text-ink hover:underline"
                  >
                    {prospect.phone}
                  </a>
                </>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onEndCall}
            className="shrink-0 rounded-xl border border-line bg-white px-3 py-2 text-[13px] font-semibold text-ink transition-colors hover:border-ink/25 hover:bg-canvas"
          >
            End call
          </button>
        </div>

        {/* Stage progress */}
        <nav className="nf-scroll mt-3 flex items-center gap-1 overflow-x-auto pb-0.5">
          {HEADER_STAGES.map((item, index) => {
            const itemIndex = stageIndex(item.stage);
            const isCurrent =
              item.stage === stage ||
              (stage === "conversation" && item.stage === "opening");
            const isDone = itemIndex < current;
            return (
              <div key={item.stage} className="flex shrink-0 items-center gap-1">
                <span
                  className={cx(
                    "rounded-lg px-2.5 py-1 text-[12px] font-semibold transition-colors",
                    isCurrent
                      ? "bg-blush-100 text-ink"
                      : isDone
                        ? "text-ink-muted"
                        : "text-ink-faint",
                  )}
                >
                  {item.label}
                </span>
                {index < HEADER_STAGES.length - 1 ? (
                  <span className="text-ink-faint/50" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Progress sidebar                                                    */
/* ------------------------------------------------------------------ */

export function ProgressSidebar({
  stage,
  visited,
  onJump,
}: {
  stage: CallStage;
  visited: Set<CallStage>;
  onJump: (stage: CallStage) => void;
}) {
  return (
    <div>
      <div className="nf-label mb-3">Call progress</div>
      <ol className="space-y-0.5">
        {SIDEBAR_STAGES.map((item) => {
          const isCurrent = item.stage === stage;
          const isDone = visited.has(item.stage) && !isCurrent;
          return (
            <li key={item.stage}>
              <button
                type="button"
                onClick={() => onJump(item.stage)}
                className={cx(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[14px] transition-colors",
                  isCurrent
                    ? "bg-blush-100 font-semibold text-ink"
                    : "text-ink-muted hover:bg-canvas hover:text-ink",
                )}
              >
                <span
                  className={cx(
                    "w-3 text-center text-[12px]",
                    isCurrent ? "text-ink" : isDone ? "text-emerald-600" : "text-ink-faint",
                  )}
                  aria-hidden
                >
                  {isCurrent ? "●" : isDone ? "✓" : "○"}
                </span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Quick access                                                        */
/* ------------------------------------------------------------------ */

export type QuickTarget =
  | "script"
  | "objections"
  | "discovery"
  | "pricing"
  | "research"
  | "notes";

export const QUICK_ITEMS: { key: QuickTarget; label: string; icon: string }[] = [
  { key: "script", label: "Script", icon: "📄" },
  { key: "objections", label: "Objections", icon: "🛡️" },
  { key: "discovery", label: "Discovery", icon: "❓" },
  { key: "pricing", label: "Pricing", icon: "£" },
  { key: "research", label: "Research", icon: "🔍" },
  { key: "notes", label: "Notes", icon: "✏️" },
];

export function QuickAccessBar({
  onSelect,
  active,
  className,
}: {
  onSelect: (target: QuickTarget) => void;
  active?: QuickTarget | null;
  className?: string;
}) {
  return (
    <div className={cx("flex gap-1.5", className)}>
      {QUICK_ITEMS.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onSelect(item.key)}
          className={cx(
            "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl border px-2 py-2 text-[11px] font-semibold transition-colors lg:flex-row lg:gap-2 lg:px-3 lg:py-2 lg:text-[13px]",
            active === item.key
              ? "border-blush-300 bg-blush-100 text-ink"
              : "border-line bg-white text-ink-muted hover:border-ink/20 hover:text-ink",
          )}
        >
          <span aria-hidden className="text-[13px] leading-none">
            {item.icon}
          </span>
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sheet (mobile drawer / desktop side panel)                          */
/* ------------------------------------------------------------------ */

export function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-ink/20"
      />
      <div className="nf-scroll relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-line bg-white shadow-lift animate-fade-in">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/95 px-5 py-3 backdrop-blur">
          <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-ink-muted hover:bg-canvas hover:text-ink"
          >
            Close
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
