"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PlaybookPreview } from "@/components/PlaybookPreview";
import { ResearchPanel } from "@/components/ResearchPanel";
import {
  Button,
  Card,
  EmptyState,
  LinkButton,
  OpportunityBadge,
  Pill,
  SectionLabel,
  WebsiteStatusBadge,
} from "@/components/ui/primitives";
import { useCallRecord, useProspect } from "@/lib/hooks";
import { buildPlaybook } from "@/lib/playbook";
import { deleteLocalProspect, clearProspectOverride } from "@/lib/storage";
import { currentStageLabel } from "@/components/ProspectCard";

export default function ProspectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { prospect, loaded } = useProspect(id);
  const { record } = useCallRecord(id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const playbook = useMemo(
    () => (prospect ? buildPlaybook(prospect) : null),
    [prospect],
  );

  if (!loaded) {
    return (
      <AppShell>
        <div className="nf-card h-96 animate-pulse bg-canvas" />
      </AppShell>
    );
  }

  if (!prospect || !playbook) {
    return (
      <AppShell>
        <EmptyState
          title="Prospect not found"
          body="This prospect doesn't exist, or it was created in a different browser."
          action={
            <LinkButton href="/" variant="accent">
              Back to prospects
            </LinkButton>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Link
        href="/"
        className="text-[13px] font-medium text-ink-muted hover:text-ink"
      >
        ← All prospects
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <Pill tone="accent">Preview mode</Pill>
            {prospect.isExample ? <Pill tone="muted">Example data</Pill> : null}
            {prospect.source === "local" ? <Pill>Added in this browser</Pill> : null}
          </div>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[34px]">
            {prospect.companyName}
          </h1>
          <p className="mt-2 text-[15px] text-ink-muted">
            {prospect.businessType}
            {prospect.location ? ` · ${prospect.location}` : ""}
            {prospect.phone ? ` · ${prospect.phone}` : ""}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <WebsiteStatusBadge status={prospect.websiteStatus} />
            <OpportunityBadge rating={record?.opportunity ?? prospect.opportunity} />
            <span className="rounded-full border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink-muted">
              {currentStageLabel(record)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <LinkButton href={`/prospects/${id}/script`} variant="secondary">
            View full script
          </LinkButton>
          <LinkButton href={`/prospects/${id}/edit`} variant="secondary">
            Edit research
          </LinkButton>
          <LinkButton href={`/prospects/${id}/call`} variant="primary" size="lg">
            Start call →
          </LinkButton>
        </div>
      </div>

      {/* Body */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          <div className="mb-6">
            <SectionLabel>Call playbook</SectionLabel>
            <p className="mt-1.5 max-w-2xl text-[14px] text-ink-muted">
              Built from the research you prepared. Every line below is editable —
              use your own words, not mine.
            </p>
          </div>
          <PlaybookPreview playbook={playbook} />
        </div>

        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <Card className="p-5">
            <ResearchPanel prospect={prospect} />
          </Card>

          {record?.notes ? (
            <Card className="mt-4 p-5">
              <SectionLabel>Notes from last call</SectionLabel>
              <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-ink-muted">
                {record.notes}
              </p>
            </Card>
          ) : null}

          {prospect.source === "local" || prospect.isExample ? (
            <div className="mt-4 px-1">
              {confirmDelete ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] text-ink-muted">
                    {prospect.source === "local"
                      ? "Delete this prospect?"
                      : "Reset your edits to the prepared file?"}
                  </span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (prospect.source === "local") deleteLocalProspect(id);
                      else clearProspectOverride(id);
                      router.push("/");
                    }}
                  >
                    Yes, do it
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-[13px] font-medium text-ink-faint hover:text-ink"
                >
                  {prospect.source === "local"
                    ? "Delete prospect"
                    : "Reset my edits to this prospect"}
                </button>
              )}
            </div>
          ) : null}
        </aside>
      </div>
    </AppShell>
  );
}
