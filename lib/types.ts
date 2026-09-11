/**
 * Core domain types for the NexalField Sales Assistant.
 *
 * V1 is deliberately storage-free: prospects live as static JSON files in
 * /data/prospects plus anything the user creates in the browser. The shapes
 * below are the contract a future database (V2) would have to satisfy, so
 * swapping the loader in lib/prospects.ts is the only change needed.
 */

export type WebsiteStatus =
  | "none"
  | "exists"
  | "outdated"
  | "poor"
  | "good"
  | "unknown";

export type OpportunityRating = "high" | "medium" | "low";

export type CallStage =
  | "preparation"
  | "opening"
  | "conversation"
  | "discovery"
  | "opportunity"
  | "demo"
  | "close"
  | "outcome";

/** Where a branch ends up — used to colour buttons and drive the sidebar. */
export type ResponseTone = "positive" | "neutral" | "resistant" | "exit";

export type ResponseOption = {
  id: string;
  /** The words the prospect actually says, as they'd say them. */
  label: string;
  /** Short hint shown under the label, e.g. "Polite brush-off". */
  hint?: string;
  responseType: ResponseTone;
  nextNodeId: string;
};

export type CallNode = {
  id: string;
  stage: CallStage;
  title: string;
  /** Optional framing of what the prospect just said, for context. */
  theySay?: string;
  whatISay: string;
  goal?: string;
  /** Small coaching note — never read aloud. */
  coach?: string;
  possibleResponses: ResponseOption[];
  /** Marks a node the call can legitimately finish on. */
  terminal?: boolean;
};

export type Objection = {
  id: string;
  /** Their words. */
  objection: string;
  /** What it probably means underneath. */
  meaning: string;
  /** What I should say. */
  response: string;
  /** What they'll probably come back with. */
  likelyReply: string;
  /** What I say next. */
  followUp: string;
  /** When to stop pushing and exit professionally. */
  whenToStop: string;
  /** Jump straight into the branching conversation at this node. */
  nodeId?: string;
};

export type DiscoveryQuestion = {
  id: string;
  question: string;
  /** Why this question is worth asking for this prospect. */
  why?: string;
  /** Listen-for cues that signal a real opportunity. */
  listenFor?: string[];
};

export type ProspectResearch = {
  summary: string;
  observations: string[];
  problems: string[];
  opportunities: string[];
  talkingPoints: string[];
  /** Anything personal/relevant: recently opened, expanding, good reviews... */
  notes?: string[];
};

/**
 * Script customisation supplied per prospect. Everything is optional: the
 * playbook builder (lib/playbook.ts) fills in a complete, realistic branching
 * conversation and these fields override the wording where it should be
 * personal.
 */
export type ProspectScript = {
  /** Overrides the opening line. */
  opening?: string;
  /** Overrides the "reason I called" hook. */
  hook?: string;
  /** Overrides the value statement (problem -> solution). */
  valueStatement?: string;
  /** Overrides the demo offer. */
  demoOffer?: string;
  /** Overrides the £400 pricing answer. */
  pricing?: string;
  /** Prospect-specific discovery questions, in the order to try them. */
  discovery?: DiscoveryQuestion[];
  /** Extra objections on top of the shared library. */
  extraObjections?: Objection[];
  /** Fully custom nodes — merged over the generated graph by id. */
  customNodes?: CallNode[];
};

export type Prospect = {
  id: string;
  companyName: string;
  businessType: string;
  location: string;
  contactName?: string;
  phone?: string;
  website?: string;
  social?: string;
  googleBusinessProfile?: string;

  websiteStatus: WebsiteStatus;
  websiteObservations?: string;

  research: ProspectResearch;
  opportunity: OpportunityRating;

  script?: ProspectScript;

  /** "file" = prepared in the repo, "local" = created in this browser. */
  source?: "file" | "local";
  /** Set on the bundled examples so the UI never pretends they're researched. */
  isExample?: boolean;
  createdAt?: string;
};

export type CallOutcomeType =
  | "sale"
  | "demo-booked"
  | "follow-up"
  | "send-info"
  | "not-interested"
  | "not-a-fit"
  | "call-back"
  | "other";

export type NextAction =
  | "call-back"
  | "build-demo"
  | "send-email"
  | "no-action"
  | "follow-up-manually";

export type CallRecord = {
  prospectId: string;
  outcome: CallOutcomeType | null;
  notes: string;
  nextAction: NextAction | null;
  followUpDate: string | null;
  /** Rating as adjusted by the salesperson during the call. */
  opportunity: OpportunityRating | null;
  stage: CallStage;
  /** Node ids visited, newest last. */
  path: string[];
  updatedAt: string;
  completedAt?: string | null;
};
