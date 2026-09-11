"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, Card, SectionLabel, cx } from "@/components/ui/primitives";
import { Field, Segmented, Select, TextArea, TextInput } from "@/components/ui/fields";
import {
  emptyProspect,
  getAllProspects,
  linesToList,
  listToLines,
  uniqueProspectId,
} from "@/lib/prospects";
import { saveLocalProspect, saveProspectOverride } from "@/lib/storage";
import { WEBSITE_STATUS_LABEL } from "@/lib/tokens";
import type {
  OpportunityRating,
  Prospect,
  WebsiteStatus,
} from "@/lib/types";

/** Quick tags — one tap instead of typing the same observation every time. */
const QUICK_TAGS = [
  "Recently opened",
  "Expanding",
  "New location",
  "Good reviews",
  "No website",
  "Website outdated",
  "Strong Google presence",
  "Active social media",
  "Poor online conversion",
  "Competitors have better websites",
  "Relies on word of mouth",
  "Busy trade business",
];

type FormState = {
  companyName: string;
  businessType: string;
  location: string;
  contactName: string;
  phone: string;
  website: string;
  social: string;
  googleBusinessProfile: string;
  websiteStatus: WebsiteStatus;
  websiteObservations: string;
  summary: string;
  observations: string;
  problems: string;
  opportunities: string;
  talkingPoints: string;
  notes: string;
  opportunity: OpportunityRating;
  opening: string;
  hook: string;
  valueStatement: string;
  demoOffer: string;
  pricing: string;
};

function toFormState(prospect: Prospect): FormState {
  return {
    companyName: prospect.companyName,
    businessType: prospect.businessType,
    location: prospect.location,
    contactName: prospect.contactName ?? "",
    phone: prospect.phone ?? "",
    website: prospect.website ?? "",
    social: prospect.social ?? "",
    googleBusinessProfile: prospect.googleBusinessProfile ?? "",
    websiteStatus: prospect.websiteStatus,
    websiteObservations: prospect.websiteObservations ?? "",
    summary: prospect.research.summary,
    observations: listToLines(prospect.research.observations),
    problems: listToLines(prospect.research.problems),
    opportunities: listToLines(prospect.research.opportunities),
    talkingPoints: listToLines(prospect.research.talkingPoints),
    notes: listToLines(prospect.research.notes),
    opportunity: prospect.opportunity,
    opening: prospect.script?.opening ?? "",
    hook: prospect.script?.hook ?? "",
    valueStatement: prospect.script?.valueStatement ?? "",
    demoOffer: prospect.script?.demoOffer ?? "",
    pricing: prospect.script?.pricing ?? "",
  };
}

/** Suggests a rating so the form isn't just an empty box to guess at. */
function suggestedRating(state: FormState): OpportunityRating {
  if (state.websiteStatus === "none" || state.websiteStatus === "poor") return "high";
  if (state.websiteStatus === "outdated") return "medium";
  if (state.websiteStatus === "good") return "low";
  return "medium";
}

export function ProspectForm({
  initial,
  mode,
}: {
  initial?: Prospect;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const base = initial ?? emptyProspect();
  const [state, setState] = useState<FormState>(() => toFormState(base));
  const [showScript, setShowScript] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const activeTags = useMemo(
    () => new Set(linesToList(state.observations)),
    [state.observations],
  );

  const toggleTag = (tag: string) => {
    const list = linesToList(state.observations);
    const next = list.includes(tag)
      ? list.filter((item) => item !== tag)
      : [...list, tag];
    set("observations", next.join("\n"));
  };

  const handleSave = () => {
    if (!state.companyName.trim()) {
      setError("A company name is needed before the playbook can be built.");
      return;
    }

    const id =
      mode === "edit" && base.id
        ? base.id
        : uniqueProspectId(
            state.companyName,
            getAllProspects().map((p) => p.id),
          );

    const script = {
      ...(base.script ?? {}),
      opening: state.opening.trim() || undefined,
      hook: state.hook.trim() || undefined,
      valueStatement: state.valueStatement.trim() || undefined,
      demoOffer: state.demoOffer.trim() || undefined,
      pricing: state.pricing.trim() || undefined,
    };

    const prospect: Prospect = {
      ...base,
      id,
      companyName: state.companyName.trim(),
      businessType: state.businessType.trim() || "Local business",
      location: state.location.trim(),
      contactName: state.contactName.trim() || undefined,
      phone: state.phone.trim() || undefined,
      website: state.website.trim() || undefined,
      social: state.social.trim() || undefined,
      googleBusinessProfile: state.googleBusinessProfile.trim() || undefined,
      websiteStatus: state.websiteStatus,
      websiteObservations: state.websiteObservations.trim() || undefined,
      opportunity: state.opportunity,
      research: {
        summary: state.summary.trim(),
        observations: linesToList(state.observations),
        problems: linesToList(state.problems),
        opportunities: linesToList(state.opportunities),
        talkingPoints: linesToList(state.talkingPoints),
        notes: linesToList(state.notes),
      },
      script,
      createdAt: base.createdAt ?? new Date().toISOString(),
    };

    if (base.source === "file") {
      // Keep the prepared file intact — store the edit as an override.
      saveProspectOverride(id, prospect);
    } else {
      saveLocalProspect({ ...prospect, source: "local" });
    }

    router.push(`/prospects/${id}`);
  };

  return (
    <div className="space-y-8">
      {/* Company information */}
      <Card className="p-6">
        <SectionLabel>Company information</SectionLabel>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Company name">
            <TextInput
              value={state.companyName}
              onChange={(e) => set("companyName", e.target.value)}
              placeholder="Kenon Plumbers Merchants"
            />
          </Field>
          <Field label="Business type">
            <TextInput
              value={state.businessType}
              onChange={(e) => set("businessType", e.target.value)}
              placeholder="Plumbers merchant"
            />
          </Field>
          <Field label="Location">
            <TextInput
              value={state.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="SW14"
            />
          </Field>
          <Field
            label="Who am I asking for?"
            hint="Used in the opening line — “Hi, is that Kenon?”"
          >
            <TextInput
              value={state.contactName}
              onChange={(e) => set("contactName", e.target.value)}
              placeholder="Kenon"
            />
          </Field>
          <Field label="Phone number">
            <TextInput
              value={state.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="020 0000 0000"
            />
          </Field>
          <Field label="Website">
            <TextInput
              value={state.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="example.co.uk (leave blank if none)"
            />
          </Field>
          <Field label="Social media">
            <TextInput
              value={state.social}
              onChange={(e) => set("social", e.target.value)}
              placeholder="Facebook page, last posted 2022"
            />
          </Field>
          <Field label="Google Business Profile">
            <TextInput
              value={state.googleBusinessProfile}
              onChange={(e) => set("googleBusinessProfile", e.target.value)}
              placeholder="Yes — 40 reviews, 4.8 stars"
            />
          </Field>
        </div>
      </Card>

      {/* Website / online presence */}
      <Card className="p-6">
        <SectionLabel>Website / online presence</SectionLabel>
        <div className="mt-5 grid gap-5">
          <Field
            label="Do they have a website?"
            hint="This decides how the opening line describes what you noticed — so get it right."
          >
            <Select
              value={state.websiteStatus}
              onChange={(e) => {
                const status = e.target.value as WebsiteStatus;
                set("websiteStatus", status);
              }}
            >
              {(Object.keys(WEBSITE_STATUS_LABEL) as WebsiteStatus[]).map((key) => (
                <option key={key} value={key}>
                  {WEBSITE_STATUS_LABEL[key]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Website observations">
            <TextArea
              rows={4}
              value={state.websiteObservations}
              onChange={(e) => set("websiteObservations", e.target.value)}
              placeholder="Website is old, difficult to navigate, not mobile-friendly, weak calls to action, no obvious quote form..."
            />
          </Field>
        </div>
      </Card>

      {/* Research */}
      <Card className="p-6">
        <SectionLabel>Business research</SectionLabel>
        <div className="mt-5 grid gap-5">
          <Field
            label="What did you discover about this business?"
            hint="Paste everything — it becomes the research panel you can open mid-call."
          >
            <TextArea
              rows={8}
              value={state.summary}
              onChange={(e) => set("summary", e.target.value)}
              placeholder="Paste your research here..."
            />
          </Field>

          <div>
            <div className="mb-2 text-[13px] font-semibold">Quick tags</div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cx(
                    "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                    activeTags.has(tag)
                      ? "border-blush-300 bg-blush-100 text-ink"
                      : "border-line bg-white text-ink-muted hover:border-ink/20 hover:text-ink",
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="What makes this a good prospect?"
              hint="One observation per line."
            >
              <TextArea
                rows={5}
                value={state.observations}
                onChange={(e) => set("observations", e.target.value)}
                placeholder={"No website\nGood Google reviews\nCompetitors all have sites"}
              />
            </Field>
            <Field label="Problems you identified" hint="One per line.">
              <TextArea
                rows={5}
                value={state.problems}
                onChange={(e) => set("problems", e.target.value)}
                placeholder={"Nowhere to check opening hours\nEvery enquiry has to go through the phone"}
              />
            </Field>
            <Field label="Opportunities you identified" hint="One per line.">
              <TextArea
                rows={5}
                value={state.opportunities}
                onChange={(e) => set("opportunities", e.target.value)}
                placeholder={"Simple site with hours, stock and delivery\nEnquiry form to take pressure off the phone"}
              />
            </Field>
            <Field
              label="Personalised talking points"
              hint="The specific things worth mentioning on the call. One per line."
            >
              <TextArea
                rows={5}
                value={state.talkingPoints}
                onChange={(e) => set("talkingPoints", e.target.value)}
                placeholder={"People are already searching for them\nThe phone is doing a job a page could do"}
              />
            </Field>
          </div>

          <Field
            label="Anything personal or relevant worth mentioning?"
            hint="Recently opened, expanding, new location, awards, anything human. One per line."
          >
            <TextArea
              rows={3}
              value={state.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder={"Recently opened a second branch\nBest time to ring is mid-morning"}
            />
          </Field>
        </div>
      </Card>

      {/* Opportunity */}
      <Card className="p-6">
        <SectionLabel>Opportunity rating</SectionLabel>
        <p className="mb-4 mt-2 text-[13px] text-ink-muted">
          Your honest read before the call. You can change it mid-call once
          you&apos;ve heard from them.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Segmented<OpportunityRating>
            value={state.opportunity}
            onChange={(value) => set("opportunity", value)}
            options={[
              { value: "high", label: "🟢 High" },
              { value: "medium", label: "🟡 Medium" },
              { value: "low", label: "🔴 Low" },
            ]}
          />
          {suggestedRating(state) !== state.opportunity ? (
            <button
              type="button"
              onClick={() => set("opportunity", suggestedRating(state))}
              className="text-[13px] font-medium text-ink-muted underline underline-offset-4 hover:text-ink"
            >
              Website status suggests {suggestedRating(state)} — use that
            </button>
          ) : null}
        </div>
      </Card>

      {/* Optional wording */}
      <Card className="p-6">
        <button
          type="button"
          onClick={() => setShowScript((v) => !v)}
          className="flex w-full items-center justify-between gap-4 text-left"
        >
          <span>
            <SectionLabel>Personalise the wording (optional)</SectionLabel>
            <p className="mt-2 text-[13px] text-ink-muted">
              Leave blank and the playbook writes these for you from the research
              above. You can also edit every line later, during preview.
            </p>
          </span>
          <span className="text-[13px] font-semibold text-ink-muted">
            {showScript ? "Hide" : "Show"}
          </span>
        </button>

        {showScript ? (
          <div className="mt-5 grid gap-5">
            <Field
              label="Opening line"
              hint="Tokens you can use: {{firstName}}, {{company}}, {{location}}, {{callerName}}, {{websiteObservation}}"
            >
              <TextArea
                rows={4}
                value={state.opening}
                onChange={(e) => set("opening", e.target.value)}
                placeholder="Hi, is that {{firstName}}? It's {{callerName}} calling from NexalField..."
              />
            </Field>
            <Field label="The reason I rang (hook)">
              <TextArea
                rows={4}
                value={state.hook}
                onChange={(e) => set("hook", e.target.value)}
                placeholder="I build websites for local businesses around {{location}}. The reason I rang you specifically..."
              />
            </Field>
            <Field label="Value statement">
              <TextArea
                rows={4}
                value={state.valueStatement}
                onChange={(e) => set("valueStatement", e.target.value)}
                placeholder="The reason I noticed you specifically is..."
              />
            </Field>
            <Field label="Demo offer">
              <TextArea
                rows={3}
                value={state.demoOffer}
                onChange={(e) => set("demoOffer", e.target.value)}
                placeholder="What I'd actually like to do is put together a quick example for {{company}}..."
              />
            </Field>
            <Field label="Price answer">
              <TextArea
                rows={3}
                value={state.pricing}
                onChange={(e) => set("pricing", e.target.value)}
                placeholder="The main website package is £400 as a one-off..."
              />
            </Field>
          </div>
        ) : null}
      </Card>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">
          {error}
        </p>
      ) : null}

      <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-line bg-white/95 p-4 shadow-lift backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-ink-muted">
          {mode === "create"
            ? "Everything you've entered becomes the call playbook and the research panel."
            : "Changes are saved in this browser. The prepared file in the project stays as it is."}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button variant="primary" size="lg" onClick={handleSave}>
            {mode === "create" ? "Generate call playbook" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
