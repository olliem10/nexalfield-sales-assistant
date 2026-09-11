"use client";

import type { Prospect } from "@/lib/types";
import { OpportunityBadge, SectionLabel, WebsiteStatusBadge } from "@/components/ui/primitives";

function List({ items }: { items: string[] }) {
  if (items.length === 0)
    return <p className="text-[13px] text-ink-faint">Nothing recorded.</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-[14px] leading-relaxed text-ink">
          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-blush-300" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/**
 * Everything researched before the call, in one scrollable panel. Used on the
 * prospect page and slid in over the call screen so you never have to leave it.
 */
export function ResearchPanel({ prospect }: { prospect: Prospect }) {
  const { research } = prospect;

  return (
    <div className="space-y-6">
      <Block label="Company">
        <p className="text-[16px] font-semibold leading-tight">
          {prospect.companyName}
        </p>
        <p className="mt-1 text-[14px] text-ink-muted">
          {prospect.businessType}
          {prospect.location ? ` · ${prospect.location}` : ""}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <WebsiteStatusBadge status={prospect.websiteStatus} />
          <OpportunityBadge rating={prospect.opportunity} size="sm" />
        </div>
        <dl className="mt-4 space-y-1.5 text-[13px]">
          {prospect.phone ? (
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink-faint">Phone</dt>
              <dd>
                <a className="font-medium hover:underline" href={`tel:${prospect.phone.replace(/\s/g, "")}`}>
                  {prospect.phone}
                </a>
              </dd>
            </div>
          ) : null}
          {prospect.website ? (
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink-faint">Website</dt>
              <dd className="font-medium">{prospect.website}</dd>
            </div>
          ) : null}
          {prospect.social ? (
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink-faint">Social</dt>
              <dd className="font-medium">{prospect.social}</dd>
            </div>
          ) : null}
          {prospect.googleBusinessProfile ? (
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink-faint">Google profile</dt>
              <dd className="font-medium">{prospect.googleBusinessProfile}</dd>
            </div>
          ) : null}
        </dl>
      </Block>

      {research.summary ? (
        <Block label="What they do">
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
            {research.summary}
          </p>
        </Block>
      ) : null}

      {prospect.websiteObservations ? (
        <Block label="Website status">
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
            {prospect.websiteObservations}
          </p>
        </Block>
      ) : null}

      <Block label="Key problems">
        <List items={research.problems} />
      </Block>

      <Block label="Opportunities">
        <List items={research.opportunities} />
      </Block>

      <Block label="Personalised talking points">
        <List items={research.talkingPoints} />
      </Block>

      {research.observations.length > 0 ? (
        <Block label="What makes them a prospect">
          <List items={research.observations} />
        </Block>
      ) : null}

      {research.notes && research.notes.length > 0 ? (
        <Block label="Important notes">
          <List items={research.notes} />
        </Block>
      ) : null}
    </div>
  );
}
