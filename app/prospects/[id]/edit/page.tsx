"use client";

import Link from "next/link";
import { use } from "react";
import { AppShell } from "@/components/AppShell";
import { ProspectForm } from "@/components/ProspectForm";
import { useProspect } from "@/lib/hooks";
import { EmptyState, LinkButton } from "@/components/ui/primitives";

export default function EditProspectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { prospect, loaded } = useProspect(id);

  if (!loaded) {
    return (
      <AppShell>
        <div className="nf-card h-96 animate-pulse bg-canvas" />
      </AppShell>
    );
  }

  if (!prospect) {
    return (
      <AppShell>
        <EmptyState
          title="Prospect not found"
          body="It may have been created in a different browser."
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
      <div className="mb-8">
        <Link
          href={`/prospects/${id}`}
          className="text-[13px] font-medium text-ink-muted hover:text-ink"
        >
          ← {prospect.companyName}
        </Link>
        <h1 className="mt-4 text-[28px] font-semibold leading-none tracking-tight sm:text-[32px]">
          Edit research
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] text-ink-muted">
          Update what you know and the playbook updates with it.
        </p>
      </div>
      <ProspectForm mode="edit" initial={prospect} />
    </AppShell>
  );
}
