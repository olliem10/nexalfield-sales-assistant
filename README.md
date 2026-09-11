# NexalField Sales Assistant

A private internal call assistant for cold-calling local businesses.

The whole product answers one question, over and over, while you are on the
phone:

> **What do I say next?**

You prepare what you know about a business, the app turns it into a branching
call playbook, and during the call you tap what they actually said and read the
next line straight off the screen.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run validate   # checks every prepared prospect's playbook has no dead ends
```

Deploys to Vercel as a standard Next.js app — no environment variables, no
database, nothing to configure.

## What's in V1

- **Next.js (App Router) + React + TypeScript + Tailwind.**
- Prospects prepared in the repo as JSON files under `data/prospects/`.
- Prospects you add yourself, script wording you edit, and call outcomes are
  stored in the browser's `localStorage`.
- No Supabase, no authentication, no AI API, no backend. Deliberately.

## The two modes

| Mode | Where | What it's for |
| --- | --- | --- |
| **Prepare** | `/prospects/new` | Paste your research before the call |
| **Preview** | `/prospects/[id]` | Read and edit the wording before you dial |
| **Call** | `/prospects/[id]/call` | The focused interface you use on the phone |

The full prepared script in one page is at `/prospects/[id]/script`.

---

## Adding a prospect

### Option A — in the app (quickest)

Click **+ Prepare new prospect**, fill in what you know, and hit **Generate call
playbook**. It's saved in your browser. The playbook (opening, branching
conversation, discovery questions, objections, pricing, demo, close) is built
from what you entered.

### Option B — as a prepared file (permanent)

Prepared prospects live in the repo so they survive a cleared browser and can be
written carefully in advance.

1. Copy `data/prospects/kenon-plumbers.json` to a new file, e.g.
   `data/prospects/harbour-lane-bakery.json`.
2. Fill it in (see the shape below).
3. Add it to the array in `data/prospects/index.ts`.
4. `npm run validate` to check the playbook has no dead ends.

Minimum viable prospect file:

```jsonc
{
  "id": "harbour-lane-bakery",        // must match the filename
  "companyName": "Harbour Lane Bakery",
  "businessType": "Bakery",
  "location": "SE10",
  "contactName": "Marta",             // used in the opening line
  "phone": "020 0000 0000",
  "websiteStatus": "none",            // none | exists | outdated | poor | good | unknown
  "opportunity": "high",              // high | medium | low
  "research": {
    "summary": "...",
    "observations": ["..."],
    "problems": ["..."],
    "opportunities": ["..."],
    "talkingPoints": ["..."],
    "notes": ["..."]
  }
}
```

Everything under `script` is optional. Leave it out and the playbook writes the
wording itself from `websiteStatus`, `businessType` and `location`. Supply it
when you want the exact words:

```jsonc
"script": {
  "opening": "Hi, is that {{firstName}}? It's {{callerName}} from {{brand}}...",
  "hook": "...",
  "valueStatement": "...",
  "demoOffer": "...",
  "pricing": "...",
  "discovery": [
    { "id": "how-found", "question": "How do customers normally find you?", "why": "...", "listenFor": ["..."] }
  ],
  "extraObjections": [ /* same shape as lib/objections.ts */ ],
  "customNodes": [ /* overrides any generated node by id */ ]
}
```

**Tokens** available in any prepared wording: `{{firstName}}`, `{{contactName}}`,
`{{company}}`, `{{businessType}}`, `{{location}}`, `{{callerName}}`, `{{brand}}`,
`{{price}}`, `{{websiteObservation}}`, `{{websiteGap}}`.

Bundled examples are marked `"isExample": true` and show an **Example data**
badge — they were written to demonstrate the system, not researched.

---

## How the conversation works

`lib/playbook.ts` turns a prospect into a graph of ~48 `CallNode`s. Each node is
one thing you say plus the realistic things they might say back, and every
response points at another node. Nothing is a dead end: `npm run validate`
proves that every node can reach the outcome screen and that every node is
reachable from the opening.

```
CallNode { id, stage, title, theySay?, whatISay, goal?, coach?, possibleResponses[] }
ResponseOption { id, label, responseType, nextNodeId }
```

Stages: `preparation → opening → conversation → discovery → opportunity → demo →
close → outcome`. Real calls skip around, and so does the app — the sidebar lets
you jump to any stage and **← Back** always works.

### The sales rules baked in

- The first call aims at a **personalised demo**, not a sale.
- **Never lead with price.** If they ask, say **£400** clearly and move back to
  offering the example.
- **£75/month and £50/month only appear** if the prospect asks about ongoing or
  monthly options — there's a dedicated branch for it and nothing else links to
  it.
- Every objection has a **when to stop**. If someone genuinely doesn't need a
  website, the right outcome is a professional exit, and `no-fit-exit` exists
  for exactly that.

---

## Project layout

```
app/
  page.tsx                      dashboard
  prospects/new/                prepare a call
  prospects/[id]/               preview mode + playbook
  prospects/[id]/script/        full script, one page
  prospects/[id]/call/          call mode
components/
  call/blocks.tsx               🗣️ they say / 👉 I say / 🎯 goal / response grid
  call/shell.tsx                header, progress sidebar, quick access, sheets
  call/panels.tsx               objections, discovery, notes, opportunity
  call/OutcomeView.tsx          outcome, notes, next action, follow-up date
  ProspectForm.tsx              the prepare screen
  PlaybookPreview.tsx           editable wording
  ResearchPanel.tsx             research, available mid-call
data/prospects/                 prepared prospects (JSON) + index.ts
lib/
  types.ts                      the domain model
  playbook.ts                   builds the branching conversation
  objections.ts                 the 18-objection library
  prospects.ts                  the only place prospects are loaded
  storage.ts                    localStorage layer
  tokens.ts                     caller name, pricing, {{token}} filling
scripts/validate-playbooks.ts   dead-end check
```

## Keyboard

During a call: **1–9** picks that numbered response, **Backspace** goes back.

## Where V2 plugs in

`lib/prospects.ts` and `lib/storage.ts` are the only places that know where data
comes from — swapping them for a database changes nothing above. `lib/playbook.ts`
is the seam for AI-generated scripts: the UI only ever consumes the `Playbook`
shape, never the raw prospect.
