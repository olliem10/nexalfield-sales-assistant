"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import {
  CallHeader,
  ProgressSidebar,
  QuickAccessBar,
  Sheet,
  type QuickTarget,
} from "@/components/call/shell";
import {
  Arrow,
  CoachNote,
  GoalBar,
  ISayCard,
  ResponseGrid,
  TheySayCard,
} from "@/components/call/blocks";
import {
  DiscoveryPanel,
  NotesPanel,
  ObjectionsPanel,
  OpportunityControl,
  PlaybookQuickJump,
} from "@/components/call/panels";
import { OutcomeView } from "@/components/call/OutcomeView";
import { ResearchPanel } from "@/components/ResearchPanel";
import {
  Button,
  EmptyState,
  LinkButton,
  SectionLabel,
} from "@/components/ui/primitives";
import { useCallRecord, useProspect, useScriptEdits } from "@/lib/hooks";
import { buildPlaybook, OUTCOME_NODE_ID } from "@/lib/playbook";
import type { CallStage, OpportunityRating, ResponseOption } from "@/lib/types";

/** Where each stage begins when you jump to it from the sidebar. */
const STAGE_ENTRY: Record<CallStage, string> = {
  preparation: "opening",
  opening: "opening",
  conversation: "hook",
  discovery: "discovery-1",
  opportunity: "opportunity-check",
  demo: "demo-offer",
  close: "close-options",
  outcome: OUTCOME_NODE_ID,
};

export default function CallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { prospect, loaded } = useProspect(id);
  const { record, update } = useCallRecord(id);
  const edits = useScriptEdits(id);

  const playbook = useMemo(
    () => (prospect ? buildPlaybook(prospect) : null),
    [prospect],
  );

  const [history, setHistory] = useState<string[]>(["opening"]);
  const [sheet, setSheet] = useState<QuickTarget | null>(null);
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<OpportunityRating>("medium");
  const [ready, setReady] = useState(false);

  // Pull the last known notes/rating in once the browser has hydrated.
  useEffect(() => {
    if (!prospect || ready) return;
    setNotes(record?.notes ?? "");
    setRating(record?.opportunity ?? prospect.opportunity);
    setReady(true);
  }, [prospect, record, ready]);

  const currentId = history[history.length - 1];
  const node = playbook?.nodes[currentId];
  const stage: CallStage =
    currentId === OUTCOME_NODE_ID ? "outcome" : (node?.stage ?? "opening");

  const visited = useMemo(() => {
    const set = new Set<CallStage>(["preparation"]);
    for (const nodeId of history) {
      if (nodeId === OUTCOME_NODE_ID) set.add("outcome");
      else {
        const visitedNode = playbook?.nodes[nodeId];
        if (visitedNode) set.add(visitedNode.stage);
      }
    }
    return set;
  }, [history, playbook]);

  const go = useCallback(
    (nodeId: string) => {
      setHistory((prev) => [...prev, nodeId]);
      setSheet(null);
      if (typeof window !== "undefined") window.scrollTo({ top: 0 });
    },
    [],
  );

  const back = useCallback(() => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  // Persist where we are so the dashboard can show "call in progress".
  useEffect(() => {
    if (!ready) return;
    update({ stage, path: history });
    // `update` is stable per prospect; re-running on every render would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, stage, ready]);

  // Keyboard: 1–9 pick a response, Backspace goes back.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
      )
        return;
      if (event.key === "Backspace") {
        event.preventDefault();
        back();
        return;
      }
      const index = Number.parseInt(event.key, 10);
      if (!Number.isNaN(index) && node) {
        const option = node.possibleResponses[index - 1];
        if (option) go(option.nextNodeId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [node, go, back]);

  if (!loaded) {
    return (
      <div className="min-h-screen p-6">
        <div className="nf-card h-96 animate-pulse bg-canvas" />
      </div>
    );
  }

  if (!prospect || !playbook) {
    return (
      <div className="mx-auto max-w-2xl p-6 pt-20">
        <EmptyState
          title="Prospect not found"
          body="This prospect doesn't exist in this browser."
          action={
            <LinkButton href="/" variant="accent">
              Back to prospects
            </LinkButton>
          }
        />
      </div>
    );
  }

  const discoveryIndex = currentId.startsWith("discovery-")
    ? Number.parseInt(currentId.split("-")[1], 10) - 1
    : -1;

  const handleSelect = (option: ResponseOption) => go(option.nextNodeId);

  const handleQuick = (target: QuickTarget) => {
    if (target === "script") {
      setSheet(null);
      return;
    }
    if (target === "pricing") {
      go("pricing-main");
      return;
    }
    setSheet(sheet === target ? null : target);
  };

  const handleNotes = (value: string) => {
    setNotes(value);
    update({ notes: value });
  };

  const handleRating = (value: OpportunityRating) => {
    setRating(value);
    update({ opportunity: value });
  };

  const isOutcome = currentId === OUTCOME_NODE_ID;

  return (
    <div className="min-h-screen bg-canvas pb-28 lg:pb-10">
      <CallHeader
        prospect={prospect}
        stage={stage}
        rating={rating}
        onEndCall={() => go(OUTCOME_NODE_ID)}
      />

      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,1fr)_320px]">
        {/* Left: progress + controls */}
        <aside className="hidden lg:block">
          <div className="sticky top-[136px] space-y-6">
            <div className="nf-card p-4">
              <ProgressSidebar
                stage={stage}
                visited={visited}
                onJump={(target) => {
                  if (target === "preparation") setSheet("research");
                  else go(STAGE_ENTRY[target]);
                }}
              />
            </div>

            <div className="nf-card space-y-2 p-4">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={back}
                disabled={history.length < 2}
              >
                ← Back
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => go(STAGE_ENTRY[stage])}
              >
                Restart stage
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => go(OUTCOME_NODE_ID)}
              >
                End call
              </Button>
            </div>

            <div className="nf-card p-4">
              <SectionLabel>Quick access</SectionLabel>
              <div className="mt-3">
                <QuickAccessBar
                  onSelect={handleQuick}
                  active={sheet}
                  className="flex-col"
                />
              </div>
            </div>

            <div className="nf-card p-4">
              <SectionLabel>Opportunity</SectionLabel>
              <div className="mt-3">
                <OpportunityControl
                  rating={rating}
                  onChange={handleRating}
                  compact
                />
              </div>
            </div>

            <Link
              href={`/prospects/${id}`}
              className="block px-1 text-[13px] font-medium text-ink-faint hover:text-ink"
            >
              ← Leave call mode
            </Link>
          </div>
        </aside>

        {/* Centre: the conversation */}
        <section className="min-w-0">
          {isOutcome ? (
            <OutcomeView
              prospect={prospect}
              record={record}
              rating={rating}
              notes={notes}
              onUpdate={update}
              onBack={back}
            />
          ) : node ? (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="nf-label">{node.title}</div>
                </div>
                <div className="flex gap-2 lg:hidden">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={back}
                    disabled={history.length < 2}
                  >
                    ← Back
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => go(STAGE_ENTRY[stage])}
                  >
                    Restart stage
                  </Button>
                </div>
              </div>

              {node.theySay ? (
                <>
                  <TheySayCard text={node.theySay} />
                  <Arrow />
                </>
              ) : null}

              <ISayCard
                text={edits.get(node.id, node.whatISay)}
                editable={false}
                edited={edits.isEdited(node.id)}
              />

              {node.goal ? <GoalBar goal={node.goal} /> : null}
              {node.coach ? <CoachNote>{node.coach}</CoachNote> : null}

              {/* Discovery gets its question list inline so you can pick
                  whichever one follows on from what they just said. */}
              {stage === "discovery" && discoveryIndex >= 0 ? (
                <div className="rounded-2xl border border-line bg-white p-4">
                  <SectionLabel>Other questions worth asking</SectionLabel>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {playbook.discovery.map((question, index) =>
                      index === discoveryIndex ? null : (
                        <button
                          key={question.id}
                          type="button"
                          onClick={() => go(`discovery-${index + 1}`)}
                          className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] text-ink-muted transition-colors hover:border-ink/20 hover:text-ink"
                        >
                          {question.question}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              ) : null}

              {stage === "opportunity" ? (
                <div className="rounded-2xl border border-line bg-white p-4">
                  <SectionLabel>Your rating for this prospect</SectionLabel>
                  <div className="mt-3">
                    <OpportunityControl rating={rating} onChange={handleRating} />
                  </div>
                </div>
              ) : null}

              <Arrow />

              <ResponseGrid
                options={node.possibleResponses}
                onSelect={handleSelect}
                heading={
                  node.possibleResponses.some((o) => o.responseType === "positive")
                    ? "What happens next?"
                    : "Where does this go?"
                }
              />

              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setSheet("objections")}>
                  🛡️ They said something else — objections
                </Button>
                <Button variant="ghost" size="sm" onClick={() => go("other-freeform")}>
                  Off-script
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              title="That branch is missing"
              body="Jump back to the opening and carry on — nothing is lost."
              action={
                <Button variant="accent" onClick={() => go("opening")}>
                  Back to the opening
                </Button>
              }
            />
          )}
        </section>

        {/* Right: research, always visible on large screens */}
        <aside className="hidden xl:block">
          <div className="nf-scroll sticky top-[136px] max-h-[calc(100vh-160px)] overflow-y-auto">
            <div className="nf-card p-5">
              <ResearchPanel prospect={prospect} />
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile quick access */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-3 py-2 backdrop-blur lg:hidden">
        <QuickAccessBar onSelect={handleQuick} active={sheet} />
      </div>

      {/* Sheets */}
      <Sheet
        open={sheet === "objections"}
        title="Objection library"
        onClose={() => setSheet(null)}
      >
        <ObjectionsPanel objections={playbook.objections} onJump={go} />
      </Sheet>

      <Sheet
        open={sheet === "discovery"}
        title="Discovery questions"
        onClose={() => setSheet(null)}
      >
        <DiscoveryPanel
          questions={playbook.discovery}
          currentIndex={discoveryIndex}
          onJump={(index) => go(`discovery-${index + 1}`)}
        />
      </Sheet>

      <Sheet
        open={sheet === "research"}
        title="Prospect research"
        onClose={() => setSheet(null)}
      >
        <ResearchPanel prospect={prospect} />
        <div className="mt-6">
          <SectionLabel>Jump to</SectionLabel>
          <div className="mt-3">
            <PlaybookQuickJump playbook={playbook} onJump={go} />
          </div>
        </div>
      </Sheet>

      <Sheet
        open={sheet === "notes"}
        title="Call notes"
        onClose={() => setSheet(null)}
      >
        <NotesPanel notes={notes} onChange={handleNotes} />
      </Sheet>

      {/* Mobile-only leave link */}
      <div className="px-4 pb-4 lg:hidden">
        <button
          type="button"
          onClick={() => router.push(`/prospects/${id}`)}
          className="text-[13px] font-medium text-ink-faint hover:text-ink"
        >
          ← Leave call mode
        </button>
      </div>
    </div>
  );
}
