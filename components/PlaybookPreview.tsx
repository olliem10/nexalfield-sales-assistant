"use client";

import { useState } from "react";
import type { Playbook } from "@/lib/playbook";
import { useScriptEdits } from "@/lib/hooks";
import { ISayCard } from "@/components/call/blocks";
import { Card, SectionLabel, cx } from "@/components/ui/primitives";

const PREVIEW_SECTIONS: { nodeId: string; heading: string; caption: string }[] = [
  {
    nodeId: "opening",
    heading: "Opening",
    caption: "The first fifteen seconds. Everything else depends on it.",
  },
  {
    nodeId: "hook",
    heading: "The reason I rang",
    caption: "Why this business, specifically.",
  },
  {
    nodeId: "value-statement",
    heading: "Value statement",
    caption: "Their problem, then what you'd do about it.",
  },
  {
    nodeId: "pricing-main",
    heading: "Price",
    caption: "Answer it straight, then get back to showing them something.",
  },
  {
    nodeId: "demo-offer",
    heading: "Demo offer",
    caption: "The real close on a first call.",
  },
  {
    nodeId: "demo-book",
    heading: "Close — demo booked",
    caption: "Contact details, day and time. Then get off the phone.",
  },
];

/**
 * Preview mode: the prepared wording, editable, before you pick up the phone.
 */
export function PlaybookPreview({ playbook }: { playbook: Playbook }) {
  const edits = useScriptEdits(playbook.prospect.id);
  const opening = playbook.nodes.opening;

  return (
    <div className="space-y-10">
      {PREVIEW_SECTIONS.map(({ nodeId, heading, caption }) => {
        const node = playbook.nodes[nodeId];
        if (!node) return null;
        return (
          <section key={nodeId}>
            <div className="mb-3">
              <SectionLabel>{heading}</SectionLabel>
              <p className="mt-1.5 text-[13px] text-ink-muted">{caption}</p>
            </div>
            <ISayCard
              text={edits.get(node.id, node.whatISay)}
              editable
              edited={edits.isEdited(node.id)}
              onSave={(value) => edits.set(node.id, value)}
              onReset={() => edits.reset(node.id)}
              size="md"
            />
            {nodeId === "opening" ? (
              <div className="mt-4">
                <div className="nf-label mb-2">Likely responses</div>
                <div className="flex flex-wrap gap-1.5">
                  {opening.possibleResponses.map((option) => (
                    <span
                      key={option.id}
                      className={cx(
                        "rounded-full border px-3 py-1.5 text-[13px]",
                        option.responseType === "positive"
                          ? "border-emerald-200 bg-emerald-50/60 text-emerald-800"
                          : option.responseType === "resistant"
                            ? "border-amber-200 bg-amber-50/60 text-amber-800"
                            : "border-line bg-white text-ink-muted",
                      )}
                    >
                      {option.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        );
      })}

      {/* Discovery */}
      <section>
        <div className="mb-3">
          <SectionLabel>Discovery questions</SectionLabel>
          <p className="mt-1.5 text-[13px] text-ink-muted">
            Chosen for this prospect. Ask the ones that follow on from what they
            actually say — never all of them.
          </p>
        </div>
        <Card className="divide-y divide-line">
          {playbook.discovery.map((question, index) => (
            <div key={question.id} className="px-5 py-4">
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blush-100 text-[12px] font-semibold">
                  {index + 1}
                </span>
                <div>
                  <p className="text-[15px] font-medium leading-snug">
                    {question.question}
                  </p>
                  {question.why ? (
                    <p className="mt-1 text-[13px] text-ink-muted">{question.why}</p>
                  ) : null}
                  {question.listenFor && question.listenFor.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {question.listenFor.map((cue, i) => (
                        <li key={i} className="text-[13px] text-ink-faint">
                          Listen for: {cue}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </Card>
      </section>

      {/* Objections */}
      <section>
        <div className="mb-3">
          <SectionLabel>Objection library</SectionLabel>
          <p className="mt-1.5 text-[13px] text-ink-muted">
            Available on one tap during the call too.
          </p>
        </div>
        <ObjectionAccordion playbook={playbook} />
      </section>
    </div>
  );
}

function ObjectionAccordion({ playbook }: { playbook: Playbook }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <Card className="divide-y divide-line">
      {playbook.objections.map((objection) => {
        const isOpen = open === objection.id;
        return (
          <div key={objection.id}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : objection.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left"
            >
              <span className="text-[15px] font-medium">
                “{objection.objection}”
              </span>
              <span className="text-[13px] text-ink-faint">
                {isOpen ? "Close" : "Open"}
              </span>
            </button>
            {isOpen ? (
              <div className="space-y-4 border-t border-line bg-canvas px-5 py-4">
                <Line label="What it probably means" text={objection.meaning} />
                <div>
                  <div className="nf-label mb-1.5">What I should say</div>
                  <p className="rounded-xl border border-blush-200 bg-blush-50 px-4 py-3 text-[15px] leading-relaxed">
                    {objection.response}
                  </p>
                </div>
                <Line label="Possible response" text={objection.likelyReply} />
                <Line label="What I say next" text={objection.followUp} />
                <Line label="When to stop" text={objection.whenToStop} />
              </div>
            ) : null}
          </div>
        );
      })}
    </Card>
  );
}

function Line({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="nf-label mb-1">{label}</div>
      <p className="text-[14px] leading-relaxed text-ink-muted">{text}</p>
    </div>
  );
}
