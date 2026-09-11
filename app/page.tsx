"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ProspectCard, currentStageLabel } from "@/components/ProspectCard";
import {
  EmptyState,
  LinkButton,
  SectionLabel,
  cx,
} from "@/components/ui/primitives";
import { useProspects, useMounted } from "@/lib/hooks";
import { getCalls } from "@/lib/storage";
import type { CallRecord, OpportunityRating } from "@/lib/types";

type Filter = "all" | OpportunityRating | "to-call";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "to-call", label: "Not called yet" },
  { value: "high", label: "🟢 High" },
  { value: "medium", label: "🟡 Medium" },
  { value: "low", label: "🔴 Low" },
];

export default function DashboardPage() {
  const { prospects } = useProspects();
  const mounted = useMounted();
  const [filter, setFilter] = useState<Filter>("all");

  const calls: Record<string, CallRecord> = useMemo(
    () => (mounted ? getCalls() : {}),
    // Re-read whenever the prospect list changes — both come from storage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mounted, prospects],
  );

  const visible = prospects.filter((p) => {
    const rating = calls[p.id]?.opportunity ?? p.opportunity;
    if (filter === "all") return true;
    if (filter === "to-call") return !calls[p.id]?.completedAt;
    return rating === filter;
  });

  const stats = {
    total: prospects.length,
    toCall: prospects.filter((p) => !calls[p.id]?.completedAt).length,
    demos: Object.values(calls).filter((c) => c.outcome === "demo-booked").length,
    followUps: Object.values(calls).filter(
      (c) => c.outcome === "follow-up" || c.outcome === "call-back",
    ).length,
  };

  return (
    <AppShell>
      {/* Hero */}
      <div className="mb-10 flex flex-col gap-6 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold leading-none tracking-tight sm:text-[34px]">
            NEXALFIELD SALES ASSISTANT
          </h1>
          <p className="mt-3 text-[15px] text-ink-muted">
            Research. Call. Conversation. Demo. Sale. Build.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/prospects/new" variant="primary" size="lg">
            + Prepare new prospect
          </LinkButton>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Prospects", value: stats.total },
          { label: "Still to call", value: stats.toCall },
          { label: "Demos booked", value: stats.demos },
          { label: "Follow-ups due", value: stats.followUps },
        ].map((stat) => (
          <div key={stat.label} className="nf-card px-5 py-4">
            <div className="nf-label mb-1.5">{stat.label}</div>
            <div className="text-[26px] font-semibold leading-none tracking-tight">
              {mounted ? stat.value : "–"}
            </div>
          </div>
        ))}
      </div>

      {/* Prospect list */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SectionLabel>My prospects</SectionLabel>
        <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-white p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cx(
                "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                filter === f.value
                  ? "bg-blush-100 text-ink"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {!mounted ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="nf-card h-60 animate-pulse bg-canvas" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          body={
            filter === "all"
              ? "Prepare a prospect and the call playbook builds itself around what you've researched."
              : "No prospects match that filter."
          }
          action={
            <LinkButton href="/prospects/new" variant="accent" size="md">
              + Prepare new prospect
            </LinkButton>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((prospect) => (
            <ProspectCard
              key={prospect.id}
              prospect={prospect}
              call={calls[prospect.id]}
            />
          ))}
        </div>
      )}

      {/* Recently called */}
      {mounted && Object.keys(calls).length > 0 ? (
        <div className="mt-12">
          <SectionLabel>Recent call outcomes</SectionLabel>
          <div className="nf-card mt-3 divide-y divide-line">
            {Object.values(calls)
              .filter((c) => c.completedAt)
              .sort((a, b) =>
                (b.completedAt ?? "").localeCompare(a.completedAt ?? ""),
              )
              .slice(0, 6)
              .map((call) => {
                const prospect = prospects.find((p) => p.id === call.prospectId);
                return (
                  <div
                    key={call.prospectId}
                    className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-[14px]"
                  >
                    <span className="font-medium">
                      {prospect?.companyName ?? call.prospectId}
                    </span>
                    <span className="text-ink-muted">
                      {currentStageLabel(call)}
                      {call.followUpDate ? ` · follow up ${call.followUpDate}` : ""}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
