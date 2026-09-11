"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import {
  Card,
  EmptyState,
  LinkButton,
  OpportunityBadge,
  WebsiteStatusBadge,
} from "@/components/ui/primitives";
import { useProspect, useScriptEdits } from "@/lib/hooks";
import { buildPlaybook } from "@/lib/playbook";
import type { CallNode } from "@/lib/types";

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-8">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="text-[13px] font-semibold text-ink-faint">
          {String(number).padStart(2, "0")}
        </span>
        <h2 className="text-[20px] font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Say({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-blush-200 bg-blush-50 px-5 py-4 text-[16px] leading-relaxed">
      {text}
    </p>
  );
}

function Bullets({ items }: { items: string[] }) {
  if (items.length === 0)
    return <p className="text-[14px] text-ink-faint">Nothing recorded.</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-[15px] leading-relaxed">
          <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-blush-300" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function FullScriptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { prospect, loaded } = useProspect(id);
  const edits = useScriptEdits(id);
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
          body="This prospect doesn't exist in this browser."
          action={
            <LinkButton href="/" variant="accent">
              Back to prospects
            </LinkButton>
          }
        />
      </AppShell>
    );
  }

  const say = (nodeId: string) => {
    const node: CallNode | undefined = playbook.nodes[nodeId];
    if (!node) return "";
    return edits.get(node.id, node.whatISay);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/prospects/${id}`}
            className="text-[13px] font-medium text-ink-muted hover:text-ink"
          >
            ← {prospect.companyName}
          </Link>
          <LinkButton href={`/prospects/${id}/call`} variant="primary" size="sm">
            Start call →
          </LinkButton>
        </div>

        <h1 className="text-[30px] font-semibold leading-tight tracking-tight">
          Full call script
        </h1>
        <p className="mt-2 text-[15px] text-ink-muted">
          Everything prepared for {prospect.companyName}, in order. Read it once
          before you dial.
        </p>

        <div className="mt-10 space-y-10">
          <Section number={1} title="Prospect">
            <Card className="p-5">
              <p className="text-[18px] font-semibold">{prospect.companyName}</p>
              <p className="mt-1 text-[15px] text-ink-muted">
                {prospect.businessType}
                {prospect.location ? ` · ${prospect.location}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <WebsiteStatusBadge status={prospect.websiteStatus} />
                <OpportunityBadge rating={prospect.opportunity} size="sm" />
              </div>
              {prospect.phone ? (
                <p className="mt-3 text-[14px]">
                  <span className="text-ink-faint">Phone: </span>
                  {prospect.phone}
                </p>
              ) : null}
            </Card>
          </Section>

          <Section number={2} title="Research">
            {prospect.research.summary ? (
              <p className="mb-5 whitespace-pre-wrap text-[15px] leading-relaxed">
                {prospect.research.summary}
              </p>
            ) : null}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <div className="nf-label mb-2">Problems</div>
                <Bullets items={prospect.research.problems} />
              </div>
              <div>
                <div className="nf-label mb-2">Opportunities</div>
                <Bullets items={prospect.research.opportunities} />
              </div>
              <div>
                <div className="nf-label mb-2">Talking points</div>
                <Bullets items={prospect.research.talkingPoints} />
              </div>
              <div>
                <div className="nf-label mb-2">Notes</div>
                <Bullets items={prospect.research.notes ?? []} />
              </div>
            </div>
          </Section>

          <Section number={3} title="Opening">
            <Say text={say("opening")} />
          </Section>

          <Section number={4} title="Likely responses">
            <ul className="space-y-2">
              {playbook.nodes.opening.possibleResponses.map((option) => {
                const next = playbook.nodes[option.nextNodeId];
                return (
                  <li
                    key={option.id}
                    className="rounded-xl border border-line bg-white px-4 py-3"
                  >
                    <p className="text-[15px] font-medium">{option.label}</p>
                    {next ? (
                      <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">
                        → {edits.get(next.id, next.whatISay)}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section number={5} title="Discovery">
            <p className="mb-4 text-[14px] text-ink-muted">
              Ask naturally. Listen to the answer. Choose the next question based
              on what they actually said — you will not need all of these.
            </p>
            <ol className="space-y-3">
              {playbook.discovery.map((question, index) => (
                <li key={question.id} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blush-100 text-[12px] font-semibold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[15px] font-medium">{question.question}</p>
                    {question.why ? (
                      <p className="mt-0.5 text-[13px] text-ink-muted">
                        {question.why}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          <Section number={6} title="Value proposition">
            <Say text={say("value-statement")} />
            <p className="mt-3 text-[14px] text-ink-muted">
              Softer version, if the opportunity is only medium:
            </p>
            <p className="mt-2 rounded-xl border border-line bg-white px-4 py-3 text-[15px] leading-relaxed">
              {say("value-statement-soft")}
            </p>
          </Section>

          <Section number={7} title="Objections">
            <div className="space-y-5">
              {playbook.objections.map((objection) => (
                <div key={objection.id} className="rounded-2xl border border-line bg-white p-5">
                  <p className="text-[15px] font-semibold">
                    “{objection.objection}”
                  </p>
                  <p className="mt-1 text-[13px] text-ink-faint">
                    {objection.meaning}
                  </p>
                  <p className="mt-3 rounded-xl bg-blush-50 px-4 py-3 text-[15px] leading-relaxed">
                    {objection.response}
                  </p>
                  <p className="mt-2 text-[14px] text-ink-muted">
                    <span className="font-semibold text-ink">Then: </span>
                    {objection.followUp}
                  </p>
                  <p className="mt-1.5 text-[13px] text-ink-faint">
                    When to stop: {objection.whenToStop}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section number={8} title="Pricing">
            <Say text={say("pricing-main")} />
            <p className="mt-3 text-[14px] text-ink-muted">
              Only if they ask about spreading the cost:
            </p>
            <p className="mt-2 rounded-xl border border-line bg-white px-4 py-3 text-[15px] leading-relaxed">
              {say("pricing-monthly")}
            </p>
            <p className="mt-3 text-[13px] text-ink-faint">
              Never lead with price, and never introduce the monthly options
              yourself on a first call.
            </p>
          </Section>

          <Section number={9} title="Demo">
            <Say text={say("demo-offer")} />
            <p className="mt-3 text-[14px] text-ink-muted">
              If they hesitate: {say("demo-hesitation")}
            </p>
          </Section>

          <Section number={10} title="Close">
            <div className="space-y-4">
              {[
                ["Demo booked", "demo-book"],
                ["They want to go ahead", "close-buy"],
                ["Send information", "email-close"],
                ["Not interested — professional exit", "polite-exit"],
                ["No real opportunity", "no-fit-exit"],
              ].map(([label, nodeId]) => (
                <div key={nodeId}>
                  <div className="nf-label mb-1.5">{label}</div>
                  <p className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] leading-relaxed">
                    {say(nodeId)}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          <Section number={11} title="Follow-up">
            <div className="space-y-4">
              <div>
                <div className="nf-label mb-1.5">Call back arranged</div>
                <p className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] leading-relaxed">
                  {say("callback-arrange")}
                </p>
              </div>
              <div>
                <div className="nf-label mb-1.5">They want to think about it</div>
                <p className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] leading-relaxed">
                  {say("follow-up-agreed")}
                </p>
              </div>
            </div>
          </Section>
        </div>

        <div className="mt-12 flex justify-center">
          <LinkButton href={`/prospects/${id}/call`} variant="primary" size="lg">
            Start call →
          </LinkButton>
        </div>
      </div>
    </AppShell>
  );
}
