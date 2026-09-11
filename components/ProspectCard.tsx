"use client";

import Link from "next/link";
import type { CallRecord, Prospect } from "@/lib/types";
import {
  LinkButton,
  OpportunityBadge,
  Pill,
  WebsiteStatusBadge,
} from "@/components/ui/primitives";

const OUTCOME_STAGE: Record<string, string> = {
  sale: "Sold — ready to build",
  "demo-booked": "Demo booked",
  "follow-up": "Follow-up required",
  "send-info": "Information sent",
  "not-interested": "Not interested",
  "not-a-fit": "Not a fit",
  "call-back": "Call back",
  other: "Called — see notes",
};

export function currentStageLabel(record: CallRecord | undefined): string {
  if (!record) return "Ready to call";
  if (record.outcome) return OUTCOME_STAGE[record.outcome] ?? "Called";
  if (record.path.length > 0) return "Call in progress";
  return "Ready to call";
}

function formatDate(iso: string | undefined | null): string {
  if (!iso) return "Never";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Never";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ProspectCard({
  prospect,
  call,
}: {
  prospect: Prospect;
  call?: CallRecord;
}) {
  const rating = call?.opportunity ?? prospect.opportunity;
  const stage = currentStageLabel(call);

  return (
    <div className="nf-card group flex flex-col justify-between p-5 transition-shadow hover:shadow-lift">
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <Link
              href={`/prospects/${prospect.id}`}
              className="text-[17px] font-semibold leading-tight tracking-tight hover:underline"
            >
              {prospect.companyName}
            </Link>
            <p className="mt-0.5 text-[13px] text-ink-muted">
              {prospect.businessType}
              {prospect.location ? ` · ${prospect.location}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            {prospect.isExample ? <Pill tone="muted">Example</Pill> : null}
            {prospect.source === "local" ? <Pill tone="accent">Local</Pill> : null}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          <WebsiteStatusBadge status={prospect.websiteStatus} />
          <OpportunityBadge rating={rating} size="sm" />
        </div>

        <dl className="mb-5 grid grid-cols-2 gap-3 border-t border-line pt-4 text-[12px]">
          <div>
            <dt className="nf-label mb-1">Stage</dt>
            <dd className="font-medium text-ink">{stage}</dd>
          </div>
          <div>
            <dt className="nf-label mb-1">Last contacted</dt>
            <dd className="font-medium text-ink">
              {formatDate(call?.completedAt ?? null)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex gap-2">
        <LinkButton
          href={`/prospects/${prospect.id}`}
          variant="secondary"
          size="sm"
          className="flex-1"
        >
          Open prospect
        </LinkButton>
        <LinkButton
          href={`/prospects/${prospect.id}/call`}
          variant="primary"
          size="sm"
          className="flex-1"
        >
          Start call
        </LinkButton>
      </div>
    </div>
  );
}
