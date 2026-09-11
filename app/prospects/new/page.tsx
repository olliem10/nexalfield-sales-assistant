"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ProspectForm } from "@/components/ProspectForm";

export default function NewProspectPage() {
  return (
    <AppShell>
      <div className="mb-8">
        <Link
          href="/"
          className="text-[13px] font-medium text-ink-muted hover:text-ink"
        >
          ← All prospects
        </Link>
        <h1 className="mt-4 text-[28px] font-semibold leading-none tracking-tight sm:text-[32px]">
          Prepare your call
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] text-ink-muted">
          Give NexalField everything you know. We&apos;ll turn it into your call
          playbook.
        </p>
      </div>
      <ProspectForm mode="create" />
    </AppShell>
  );
}
