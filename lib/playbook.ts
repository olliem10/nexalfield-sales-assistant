import { OBJECTION_LIBRARY } from "./objections";
import type {
  CallNode,
  DiscoveryQuestion,
  Objection,
  Prospect,
  ResponseOption,
} from "./types";
import {
  fillTokens,
  MONTHLY_OPTIONS,
  websiteGapLine,
  WEBSITE_PRICE,
} from "./tokens";

/** Sentinel node id: reaching it ends the call and opens the outcome screen. */
export const OUTCOME_NODE_ID = "outcome";
/** Where discovery always begins. */
export const DISCOVERY_START_ID = "discovery-1";

export type Playbook = {
  prospect: Prospect;
  /** Every node in the conversation, keyed by id. */
  nodes: Record<string, CallNode>;
  rootId: string;
  discovery: DiscoveryQuestion[];
  objections: Objection[];
};

const END_CALL: ResponseOption = {
  id: "end-call",
  label: "End the call and log the outcome",
  responseType: "neutral",
  nextNodeId: OUTCOME_NODE_ID,
};

function r(
  id: string,
  label: string,
  nextNodeId: string,
  responseType: ResponseOption["responseType"] = "neutral",
  hint?: string,
): ResponseOption {
  return { id, label, nextNodeId, responseType, hint };
}

/* ------------------------------------------------------------------ */
/* Discovery                                                           */
/* ------------------------------------------------------------------ */

/**
 * Picks the discovery questions that actually make sense for this prospect
 * rather than firing all of them. Order matters — the first one should be the
 * easiest question in the world to answer.
 */
function defaultDiscovery(prospect: Prospect): DiscoveryQuestion[] {
  const all: (DiscoveryQuestion & { statuses?: string[] })[] = [
    {
      id: "how-found",
      question: "How do customers normally find you at the moment?",
      why: "Opens the conversation without sounding like a survey, and tells you where the gap is.",
      listenFor: [
        "\"Word of mouth\" — they're recommended, and recommendations get googled",
        "\"Google\" — they're already being searched for",
        "\"Facebook\" — they're relying on a page they don't own",
      ],
    },
    {
      id: "enquiries-google",
      question: "Do you get many enquiries coming through Google?",
      why: "Separates 'people can find us' from 'people actually contact us'.",
      listenFor: [
        "A vague answer usually means nobody's measuring it",
        "\"A few\" is an opening — there could be more",
      ],
    },
    {
      id: "customers-ask",
      question: "Do customers ever ask whether you've got a website?",
      why: "Lets them tell you about the problem instead of you telling them.",
      statuses: ["none", "unknown", "poor", "outdated"],
      listenFor: ["Any hesitation here is the opportunity"],
    },
    {
      id: "happy-online",
      question: "Are you happy with how you come across online at the moment?",
      why: "The honest ones will tell you exactly what to sell them.",
      listenFor: [
        "\"Not really\" — stop asking questions and move to the value statement",
      ],
    },
    {
      id: "where-send-people",
      question:
        "If someone rings and asks what you do, is there somewhere you can point them to?",
      why: "Makes the gap concrete without saying the word 'website'.",
      statuses: ["none", "unknown", "poor"],
    },
    {
      id: "considered-website",
      question: "Have you ever thought about getting a website sorted?",
      why: "Finds out whether this is a new idea or an old unfinished one.",
      statuses: ["none", "unknown"],
      listenFor: [
        "\"We keep meaning to\" — that's about as warm as a cold call gets",
      ],
    },
    {
      id: "site-working",
      question: "Is the website actually bringing you any work?",
      why: "The only question that matters when they already have one.",
      statuses: ["exists", "outdated", "poor", "good"],
    },
    {
      id: "improve",
      question:
        "Is there anything about how you come across online you'd change if it was easy?",
      why: "A good closing discovery question — it asks them to name the problem.",
    },
    {
      id: "busier",
      question: "Are you looking to take on more work at the moment, or are you flat out?",
      why: "Qualifies hard. If they're full and happy, there may be no opportunity here.",
    },
  ];

  return all
    .filter((q) => !q.statuses || q.statuses.includes(prospect.websiteStatus))
    .slice(0, 6)
    .map(({ statuses, ...q }) => q);
}

function buildDiscoveryNodes(
  questions: DiscoveryQuestion[],
): Record<string, CallNode> {
  const nodes: Record<string, CallNode> = {};

  questions.forEach((q, index) => {
    const id = `discovery-${index + 1}`;
    const next =
      index + 1 < questions.length ? `discovery-${index + 2}` : "opportunity-check";

    nodes[id] = {
      id,
      stage: "discovery",
      title: `Discovery — question ${index + 1} of ${questions.length}`,
      whatISay: q.question,
      goal: "Get them talking. One question, then listen properly.",
      coach:
        q.why ??
        "Ask it naturally and leave a gap. Their answer decides what you ask next — don't just work down the list.",
      possibleResponses: [
        r(
          `${id}-answered`,
          "They answered — next question",
          next,
          "positive",
          "Only ask another one if it follows on naturally",
        ),
        r(
          `${id}-problem`,
          "They've described a real problem",
          "value-statement",
          "positive",
          "Stop asking questions. Go straight to the value statement.",
        ),
        r(
          `${id}-enough`,
          "I've heard enough — rate the opportunity",
          "opportunity-check",
          "neutral",
        ),
        r(`${id}-price`, "\"How much does something like that cost?\"", "pricing-main", "positive"),
        r(
          `${id}-happy`,
          "They're happy as they are / no problem to solve",
          "no-fit-exit",
          "exit",
        ),
        r(`${id}-busy`, "\"I've got to go.\"", "obj-call-another-time", "resistant"),
      ],
    };
  });

  return nodes;
}

/* ------------------------------------------------------------------ */
/* The conversation graph                                              */
/* ------------------------------------------------------------------ */

function buildBaseNodes(prospect: Prospect): Record<string, CallNode> {
  const gap = websiteGapLine(prospect.websiteStatus);
  const script = prospect.script ?? {};

  const opening =
    script.opening ??
    "Hi, is that {{firstName}}? It's {{callerName}} calling from {{brand}}. I know this is out of the blue so I'll keep it really quick — I was looking at your business online, {{websiteObservation}}, and I had an idea I thought might be useful. Have I caught you at an alright time for thirty seconds?";

  const hook =
    script.hook ??
    `I build websites for local businesses around {{location}}. The reason I rang you specifically rather than anyone else is that ${gap} — and for a {{businessType}} that's normally where the enquiries get lost. Can I ask you something quickly?`;

  const valueStatement =
    script.valueStatement ??
    `The reason I noticed you specifically is that you've already got people looking you up — that's the hard part and you're doing it. The bit that's missing is somewhere I could send those people to see what you do, decide they trust you, and get in touch in about ten seconds. That's the whole job, really.`;

  const demoOffer =
    script.demoOffer ??
    "What I'd actually like to do is put together a quick example for {{company}}. It takes me about fifteen minutes and then I can show you exactly what I had in mind. If you like it, great. If you don't, no problem — you've lost nothing.";

  const pricing =
    script.pricing ??
    `The main website package is ${WEBSITE_PRICE} as a one-off. What I'd normally suggest is that I put something together specifically for your business first, so you can actually see what I'd do before you decide anything.`;

  const nodes: CallNode[] = [
    /* ---------------- Opening ---------------- */
    {
      id: "opening",
      stage: "opening",
      title: "Opening",
      whatISay: opening,
      goal: "Earn thirty seconds. Nothing else.",
      coach:
        "Say it at normal speed and smile. The question at the end matters — it gives them something easy to say yes to.",
      possibleResponses: [
        r("open-yes", "\"Yeah, go on.\"", "hook", "positive"),
        r("open-what", "\"What's this regarding?\"", "whats-this-regarding", "neutral"),
        r("open-busy", "\"I'm busy.\"", "obj-busy", "resistant"),
        r("open-nope", "\"Not interested.\"", "obj-not-interested", "resistant"),
        r("open-have-site", "\"We already have a website.\"", "obj-have-website", "neutral"),
        r("open-email", "\"Just send me an email.\"", "obj-send-email", "resistant"),
        r("open-price", "\"How much does it cost?\"", "pricing-main", "positive"),
        r("open-who", "\"Who are you?\"", "who-are-you", "neutral"),
        r("open-what-do", "\"What exactly do you do?\"", "what-do-you-do", "neutral"),
        r(
          "open-gatekeeper",
          "It's not the owner / they're not in",
          "gatekeeper",
          "neutral",
        ),
        r("open-other", "They said something else", "other-freeform", "neutral"),
      ],
    },

    /* ---------------- Conversation ---------------- */
    {
      id: "hook",
      stage: "conversation",
      title: "The reason I rang",
      whatISay: hook,
      goal: "Give them a reason that's about their business, then hand the conversation over.",
      coach:
        "Finish on a question. If you finish on a statement they'll fill the silence with 'not interested'.",
      possibleResponses: [
        r("hook-go", "\"Go on then.\" / They're listening", DISCOVERY_START_ID, "positive"),
        r("hook-interested", "They sound genuinely interested", DISCOVERY_START_ID, "positive"),
        r("hook-what-mean", "\"What do you mean exactly?\"", "clarify-hook", "neutral"),
        r("hook-price", "\"How much?\"", "pricing-main", "positive"),
        r("hook-have-site", "\"We've got a website already.\"", "obj-have-website", "neutral"),
        r("hook-dont-need", "\"We don't need a website.\"", "obj-dont-need-website", "resistant"),
        r("hook-word", "\"It's all word of mouth for us.\"", "obj-word-of-mouth", "neutral"),
        r("hook-google", "\"We get everything off Google.\"", "obj-google-customers", "neutral"),
        r("hook-why", "\"Why should I use you?\"", "obj-why-you", "neutral"),
        r("hook-busy", "\"I really am busy.\"", "obj-busy", "resistant"),
        r("hook-nope", "\"Not interested.\"", "obj-not-interested", "resistant"),
        r("hook-other", "They said something else", "other-freeform", "neutral"),
      ],
    },
    {
      id: "whats-this-regarding",
      stage: "conversation",
      title: "\"What's this regarding?\"",
      theySay: "What's this regarding?",
      whatISay:
        "Websites, basically — I build them for local businesses. I'm not going to read you a script, I had one specific thought about {{company}} and it'll take twenty seconds to say.",
      goal: "Be straight with them. Vagueness here kills the call.",
      possibleResponses: [
        r("wtr-go", "\"Go on then.\"", "hook", "positive"),
        r("wtr-selling", "\"So you're selling me something?\"", "honest-selling", "neutral"),
        r("wtr-nope", "\"Not interested.\"", "obj-not-interested", "resistant"),
        r("wtr-busy", "\"I'm busy.\"", "obj-busy", "resistant"),
        r("wtr-email", "\"Send me an email.\"", "obj-send-email", "resistant"),
        r("wtr-other", "They said something else", "other-freeform", "neutral"),
      ],
    },
    {
      id: "honest-selling",
      stage: "conversation",
      title: "\"Are you selling me something?\"",
      theySay: "So you're trying to sell me something.",
      whatISay:
        "Yeah, eventually — I'm not going to pretend otherwise. But on this call I'm not asking you to buy anything. If it's any use to you I'd rather build you an example and let you look at it.",
      goal: "Honesty buys credibility. Don't wriggle.",
      possibleResponses: [
        r("hs-fair", "\"Fair enough, go on.\"", "hook", "positive"),
        r("hs-price", "\"How much?\"", "pricing-main", "positive"),
        r("hs-nope", "\"Still not interested.\"", "obj-not-interested", "resistant"),
        r("hs-other", "They said something else", "other-freeform", "neutral"),
      ],
    },
    {
      id: "who-are-you",
      stage: "conversation",
      title: "\"Who are you?\"",
      theySay: "Who are you? / Who's this?",
      whatISay:
        "My name's {{callerName}}, I run {{brand}} — I build websites for local businesses. It's just me ringing round, I'm not a call centre.",
      goal: "Answer straight, then get back to why you rang.",
      possibleResponses: [
        r("wya-ok", "\"Right, and what do you want?\"", "hook", "neutral"),
        r("wya-where", "\"Where are you based?\"", "hook", "neutral", "Answer, then straight back into the hook"),
        r("wya-nope", "\"Not interested.\"", "obj-not-interested", "resistant"),
        r("wya-other", "They said something else", "other-freeform", "neutral"),
      ],
    },
    {
      id: "what-do-you-do",
      stage: "conversation",
      title: "\"What exactly do you do?\"",
      theySay: "What exactly do you do?",
      whatISay:
        "I build simple websites for local businesses — the kind that tell people what you do, show you're legitimate, and make it easy to ring or message you. Nothing complicated, and I handle all of it.",
      goal: "Plain English. No jargon, no packages.",
      possibleResponses: [
        r("wdyd-go", "\"Right, go on.\"", "hook", "positive"),
        r("wdyd-price", "\"How much?\"", "pricing-main", "positive"),
        r("wdyd-have", "\"We've got one.\"", "obj-have-website", "neutral"),
        r("wdyd-nope", "\"Not for us.\"", "obj-not-interested", "resistant"),
        r("wdyd-other", "They said something else", "other-freeform", "neutral"),
      ],
    },
    {
      id: "clarify-hook",
      stage: "conversation",
      title: "\"What do you mean?\"",
      theySay: "What do you mean exactly?",
      whatISay:
        "So when someone hears about {{company}} — off a mate, off a van, off Google — the next thing they do is look you up. At the minute what they find doesn't really tell them much. That's all I'd be fixing.",
      goal: "Make the problem concrete in one picture.",
      possibleResponses: [
        r("ch-get-it", "\"I see what you mean.\"", DISCOVERY_START_ID, "positive"),
        r("ch-price", "\"And how much is that?\"", "pricing-main", "positive"),
        r("ch-doubt", "\"I'm not sure that'd make a difference.\"", "obj-tried-before", "resistant"),
        r("ch-other", "They said something else", "other-freeform", "neutral"),
      ],
    },
    {
      id: "gatekeeper",
      stage: "conversation",
      title: "Not the decision maker",
      theySay: "He's not in / I only work here.",
      whatISay:
        "No problem at all. Who's the best person to speak to about the website side of things, and when are they normally about?",
      goal: "Get a name and a time. Nothing else.",
      coach:
        "Don't pitch the person who answered — they can't say yes and they can say no.",
      possibleResponses: [
        r("gk-name", "They gave me a name and a time", "callback-arrange", "positive"),
        r("gk-vague", "\"Just try again sometime.\"", "callback-arrange", "neutral"),
        r("gk-no", "\"We're not interested in that sort of thing.\"", "polite-exit", "exit"),
        r("gk-put-through", "They're putting me through", "opening", "positive", "Start again from the opening with the owner"),
      ],
    },
    {
      id: "other-freeform",
      stage: "conversation",
      title: "They said something off-script",
      whatISay:
        "Repeat back the last thing they said in your own words, then ask a question about it. \"So it sounds like [what they said] — is that fair?\"",
      goal: "Get back into a conversation. Don't panic and pitch.",
      coach:
        "This screen isn't a script. Acknowledge, ask, listen — then pick whichever branch below matches where you've ended up.",
      possibleResponses: [
        r("of-positive", "They're engaged — move into discovery", DISCOVERY_START_ID, "positive"),
        r("of-hook", "Back to the reason I rang", "hook", "neutral"),
        r("of-objection", "It was an objection — handle it", "obj-not-interested", "resistant", "Or open the objection library for the exact one"),
        r("of-price", "They asked about price", "pricing-main", "positive"),
        r("of-demo", "They're interested — offer the example", "demo-offer", "positive"),
        r("of-close", "It's time to wrap the call up", "close-options", "neutral"),
        r("of-exit", "It's clearly a no", "polite-exit", "exit"),
      ],
    },

    /* ---------------- Objection branches ---------------- */
    {
      id: "obj-busy",
      stage: "conversation",
      title: "\"I'm busy\"",
      theySay: "I'm busy / I'm in the middle of something.",
      whatISay:
        "No problem at all, I'll keep it to twenty seconds. The reason I rang is that I {{websiteObservation}}, and for a {{businessType}} that's usually where enquiries go missing.",
      goal: "Twenty seconds, then a question. Don't ramble.",
      coach: "Say it faster than your normal pace — it proves you meant twenty seconds.",
      possibleResponses: [
        r("busy-go", "\"Go on then.\"", "hook", "positive"),
        r("busy-listening", "They're listening", DISCOVERY_START_ID, "positive"),
        r("busy-still", "\"I really can't talk now.\"", "obj-call-another-time", "resistant"),
        r("busy-nope", "\"Not interested.\"", "obj-not-interested", "resistant"),
        r("busy-email", "\"Send me an email.\"", "obj-send-email", "resistant"),
      ],
    },
    {
      id: "obj-not-interested",
      stage: "conversation",
      title: "\"Not interested\"",
      theySay: "Not interested.",
      whatISay:
        "That's fair enough — you don't know what it's about yet. Give me one sentence and if it's no use to you I'll leave you alone. I {{websiteObservation}}, and I had an idea for how {{company}} could pick up more enquiries without doing anything different.",
      goal: "Earn one more sentence. One. Not three.",
      coach:
        "This is a reflex, not a decision. But if the second no comes, take it properly — that's how you keep the door open.",
      possibleResponses: [
        r("ni-reconsider", "They reconsider — \"go on then\"", "hook", "positive"),
        r("ni-hear-more", "They agree to hear more", DISCOVERY_START_ID, "positive"),
        r("ni-still", "Still not interested", "polite-exit", "exit"),
        r("ni-annoyed", "They're getting annoyed", "polite-exit-annoyed", "exit"),
        r("ni-have-site", "\"We've got a website.\"", "obj-have-website", "neutral"),
        r("ni-busy", "\"I'm busy.\"", "obj-busy", "resistant"),
      ],
    },
    {
      id: "obj-have-website",
      stage: "conversation",
      title: "\"We already have a website\"",
      theySay: "We already have a website.",
      whatISay:
        "I did see that, and that's actually why I rang. Can I ask — is it bringing you any enquiries, or is it one of those that got set up and left?",
      goal: "Find out if the site works. Never assume it doesn't.",
      coach:
        "If they're happy with it and it works, say so honestly and exit well. Not every business needs you.",
      possibleResponses: [
        r("hw-old", "\"It's a bit old / been a while.\"", "value-statement", "positive"),
        r("hw-nothing", "\"It doesn't really do anything.\"", "value-statement", "positive"),
        r("hw-fine", "\"It's fine, we're happy with it.\"", "website-fine", "neutral"),
        r("hw-someone", "\"Someone else looks after it.\"", "obj-already-use-someone", "neutral"),
        r("hw-tried", "\"We tried that, it did nothing.\"", "obj-tried-before", "resistant"),
        r("hw-nope", "\"Not interested.\"", "obj-not-interested", "resistant"),
      ],
    },
    {
      id: "website-fine",
      stage: "conversation",
      title: "\"The site's fine\"",
      theySay: "It's fine, we're happy with it.",
      whatISay:
        "Fair enough — if it's doing its job I'm not going to try and talk you out of it. Last question and I'll leave you be: when someone lands on it from their phone, is it easy for them to get hold of you?",
      goal: "One honest question. If the answer's good, walk away well.",
      coach:
        "Pushing a happy customer is how you get remembered for the wrong reason. One question, then accept the answer.",
      possibleResponses: [
        r("wf-doubt", "They hesitate / admit it's not great", "value-statement", "positive"),
        r("wf-yes", "\"Yeah, it's all fine.\"", "no-fit-exit", "exit"),
        r("wf-curious", "\"Why, what would you do differently?\"", "value-statement", "positive"),
      ],
    },
    {
      id: "obj-dont-need-website",
      stage: "conversation",
      title: "\"We don't need a website\"",
      theySay: "We don't need a website.",
      whatISay:
        "A lot of people say that and if it was just a brochure I'd agree with you. The only reason I mention it is people are already looking you up — it's more about what they find when they do. Can I ask, are you turning work away at the minute or would you take more on?",
      goal: "Turn it into a question about their workload.",
      possibleResponses: [
        r("dn-more", "\"We'd take more on.\"", DISCOVERY_START_ID, "positive"),
        r("dn-full", "\"We're flat out as it is.\"", "no-fit-exit", "exit"),
        r("dn-maybe", "\"Depends what it costs.\"", "pricing-main", "positive"),
        r("dn-nope", "\"Still not for us.\"", "polite-exit", "exit"),
      ],
    },
    {
      id: "obj-word-of-mouth",
      stage: "conversation",
      title: "\"It's all word of mouth\"",
      theySay: "We get all our work through word of mouth.",
      whatISay:
        "That's the best way to get work, genuinely. The only thing I'd say is when someone recommends you, the next thing that person does is search your name — and that's the bit I'd want to make sure looks right.",
      goal: "Agree with them first. Then add the one thing they haven't thought about.",
      possibleResponses: [
        r("wom-think", "\"Suppose that's true.\"", DISCOVERY_START_ID, "positive"),
        r("wom-ask", "\"What would it actually do for us?\"", "value-statement", "positive"),
        r("wom-fine", "\"We're fine as we are.\"", "no-fit-exit", "exit"),
        r("wom-price", "\"How much?\"", "pricing-main", "positive"),
      ],
    },
    {
      id: "obj-google-customers",
      stage: "conversation",
      title: "\"We get customers from Google\"",
      theySay: "We get our customers from Google.",
      whatISay:
        "That's good — it means people are already searching for you. When they tap through from Google, where do they end up at the moment?",
      goal: "Expose the gap between being found and being contacted.",
      possibleResponses: [
        r("gc-listing", "\"Just the Google listing.\"", "value-statement", "positive"),
        r("gc-facebook", "\"Our Facebook page.\"", "value-statement", "positive"),
        r("gc-phone", "\"They just ring us.\"", DISCOVERY_START_ID, "positive"),
        r("gc-site", "\"Our website.\"", "obj-have-website", "neutral"),
        r("gc-fine", "\"It works fine for us.\"", "no-fit-exit", "exit"),
      ],
    },
    {
      id: "obj-send-email",
      stage: "conversation",
      title: "\"Just send me an email\"",
      theySay: "Just send me an email.",
      whatISay:
        "I can do that. Can I ask one quick thing first so I'm not sending you something generic — how do most of your customers find you at the moment?",
      goal: "One question before you accept the email. Often it restarts the conversation.",
      coach:
        "If they ask a second time, take the address and go. Then actually send it when you said you would.",
      possibleResponses: [
        r("se-answers", "They answer the question", DISCOVERY_START_ID, "positive"),
        r("se-insist", "\"Just send it over.\"", "email-close", "neutral"),
        r("se-nope", "\"Actually, don't bother.\"", "polite-exit", "exit"),
      ],
    },
    {
      id: "obj-tried-before",
      stage: "conversation",
      title: "\"We tried a website before\"",
      theySay: "We've had a website before and it did nothing.",
      whatISay:
        "I hear that a lot, and it's normally because someone built something nice-looking and left it at that. What happened with yours — did you ever get enquiries off it?",
      goal: "Separate 'websites don't work' from 'that website didn't work'.",
      possibleResponses: [
        r("tb-none", "\"Not a single one.\"", "value-statement", "positive"),
        r("tb-some", "\"A couple at the start.\"", "value-statement", "positive"),
        r("tb-adamant", "\"Waste of money, never again.\"", "polite-exit", "exit"),
        r("tb-price", "\"What would yours cost?\"", "pricing-main", "positive"),
      ],
    },
    {
      id: "obj-dont-want-to-deal",
      stage: "conversation",
      title: "\"I don't want the hassle\"",
      theySay: "I haven't got time to be messing about with websites.",
      whatISay:
        "That's the bit I take off you. You don't touch anything — I build it, I put it live, and if something needs changing you send me a message and I do it.",
      goal: "Remove the work from their side of the table.",
      possibleResponses: [
        r("dw-relief", "\"So I don't have to do anything?\"", "demo-offer", "positive"),
        r("dw-what-need", "\"What would you need from me?\"", "demo-offer", "positive", "About ten minutes of their time — say that"),
        r("dw-still", "\"Still not for me.\"", "polite-exit", "exit"),
      ],
    },
    {
      id: "obj-why-you",
      stage: "conversation",
      title: "\"Why should I use you?\"",
      theySay: "Why should I use you?",
      whatISay:
        "Honestly? Because I'll show you before you pay anything. I'd rather build you something for {{company}} and let you judge it than try and talk you into it over the phone.",
      goal: "One honest reason beats five rehearsed ones.",
      possibleResponses: [
        r("wy-ok", "\"Alright, fair enough.\"", "demo-offer", "positive"),
        r("wy-price", "\"And what's that going to cost?\"", "pricing-main", "positive"),
        r("wy-catch", "\"What's the catch?\"", "demo-offer", "neutral", "There isn't one — say that plainly"),
        r("wy-nope", "\"I'll pass.\"", "polite-exit", "exit"),
      ],
    },
    {
      id: "obj-already-use-someone",
      stage: "conversation",
      title: "\"We already use someone\"",
      theySay: "We've already got someone who does that.",
      whatISay:
        "No problem. Are they still looking after it for you, or is it one of those things that got set up and then went quiet?",
      goal: "Find out if the relationship is live. If it is, back off.",
      possibleResponses: [
        r("aus-active", "\"Yeah, they still do it.\"", "no-fit-exit", "exit"),
        r("aus-quiet", "\"Haven't heard from them in ages.\"", "value-statement", "positive"),
        r("aus-curious", "\"What would you charge?\"", "pricing-main", "positive"),
      ],
    },
    {
      id: "obj-call-another-time",
      stage: "conversation",
      title: "\"Call me another time\"",
      theySay: "Can you ring me another time?",
      whatISay:
        "Course I can. What's normally quieter for you — first thing in the morning or later in the afternoon?",
      goal: "A day and a rough time. Write it down before you hang up.",
      possibleResponses: [
        r("cat-time", "They gave me a day/time", "callback-arrange", "positive"),
        r("cat-vague", "\"Just try again sometime.\"", "callback-arrange", "neutral"),
        r("cat-never", "It's a soft no", "polite-exit", "exit"),
      ],
    },
    {
      id: "obj-think",
      stage: "close",
      title: "\"I need to think about it\"",
      theySay: "I'll have a think about it.",
      whatISay:
        "Of course. Just so I know I've explained it properly — is it the money, the timing, or are you not sure it'd actually make a difference?",
      goal: "Find the real reason. 'I'll think about it' is never the reason.",
      coach: "Ask once. Don't ask twice — that's where it turns into pressure.",
      possibleResponses: [
        r("th-money", "\"It's the money.\"", "pricing-expensive", "neutral"),
        r("th-partner", "\"I need to speak to someone.\"", "obj-partner", "neutral"),
        r("th-unsure", "\"Not sure it'd help.\"", "value-statement", "neutral"),
        r("th-time", "\"Just want to think it over.\"", "follow-up-agreed", "neutral"),
      ],
    },
    {
      id: "obj-partner",
      stage: "close",
      title: "\"I need to speak to my partner\"",
      theySay: "I'd have to speak to my wife / my business partner.",
      whatISay:
        "That makes sense. What I'll do is put the example together anyway — it's a lot easier to show someone than to describe it. When are you likely to speak to them?",
      goal: "Give them something to show. Then pin a day.",
      possibleResponses: [
        r("pt-day", "They gave me a day", "follow-up-agreed", "positive"),
        r("pt-demo", "\"Yeah, send it over.\"", "demo-book", "positive"),
        r("pt-vague", "\"I'll let you know.\"", "follow-up-agreed", "neutral"),
      ],
    },
    {
      id: "obj-no-budget",
      stage: "close",
      title: "\"We haven't got the budget\"",
      theySay: "We haven't got the budget for that.",
      whatISay:
        "Fair enough, I'd rather you said than strung it out. Is it a quiet patch generally, or is it that {{price}} in one go is awkward?",
      goal: "Work out whether it's timing or the lump sum.",
      coach:
        "Only mention monthly options if they ask about spreading it. Don't offer them to rescue a call.",
      possibleResponses: [
        r("nb-timing", "\"Just a quiet month.\"", "follow-up-agreed", "neutral"),
        r("nb-lump", "\"Is there any other way of paying?\"", "pricing-monthly", "positive"),
        r("nb-none", "\"There's no money for it, full stop.\"", "polite-exit", "exit"),
      ],
    },

    /* ---------------- Opportunity ---------------- */
    {
      id: "opportunity-check",
      stage: "opportunity",
      title: "Is there actually an opportunity here?",
      whatISay:
        "Nothing to say here — this one's for you. Based on what they've just told you, is there a real problem worth solving?",
      goal: "Be honest with yourself before you pitch anything.",
      coach:
        "If the answer is no, the right outcome is a professional exit. A clean no beats a wasted demo.",
      possibleResponses: [
        r("op-high", "🟢 High — there's a clear problem and they've admitted it", "value-statement", "positive"),
        r("op-medium", "🟡 Medium — something there, but not urgent", "value-statement-soft", "neutral"),
        r("op-low", "🔴 Low — they're sorted, no real problem", "no-fit-exit", "exit"),
        r("op-more", "Not sure yet — ask another question", DISCOVERY_START_ID, "neutral"),
      ],
    },

    /* ---------------- Value ---------------- */
    {
      id: "value-statement",
      stage: "opportunity",
      title: "Value statement",
      whatISay: valueStatement,
      goal: "Connect the problem they just described to what you'd actually do.",
      coach:
        "Use their words, not yours. If they said 'people ring asking if we do bathrooms', say that back to them.",
      possibleResponses: [
        r("vs-interested", "They're interested", "demo-offer", "positive"),
        r("vs-price", "\"How much is it?\"", "pricing-main", "positive"),
        r("vs-hassle", "\"Sounds like a faff.\"", "obj-dont-want-to-deal", "resistant"),
        r("vs-unsure", "\"I don't know…\"", "value-statement-soft", "neutral"),
        r("vs-tried", "\"We tried that before.\"", "obj-tried-before", "resistant"),
        r("vs-nope", "\"Not for us.\"", "polite-exit", "exit"),
      ],
    },
    {
      id: "value-statement-soft",
      stage: "opportunity",
      title: "Value statement — softer version",
      whatISay:
        "I'm not going to pretend it'd transform the business overnight. What it does is make sure that when somebody's already looking for you, they can see what you do and get hold of you easily. For most places I work with that's a handful of extra jobs a year, and it pays for itself on the first one.",
      goal: "Realistic, not salesy. Medium-opportunity prospects smell hype instantly.",
      possibleResponses: [
        r("vss-ok", "\"That makes sense.\"", "demo-offer", "positive"),
        r("vss-price", "\"What does it cost?\"", "pricing-main", "positive"),
        r("vss-think", "\"I'll have a think.\"", "obj-think", "neutral"),
        r("vss-no", "\"Not right now.\"", "follow-up-agreed", "neutral"),
      ],
    },

    /* ---------------- Pricing ---------------- */
    {
      id: "pricing-main",
      stage: "demo",
      title: "Price — answer it straight",
      theySay: "How much does it cost?",
      whatISay: pricing,
      goal: "Answer the question, then move back to showing them something.",
      coach:
        `Say the ${WEBSITE_PRICE} clearly and don't flinch. Do not bring up monthly options — only mention those if they ask about spreading the cost.`,
      possibleResponses: [
        r("pm-fine", "\"That's not bad actually.\"", "demo-offer", "positive"),
        r("pm-expensive", "\"That's a lot.\"", "pricing-expensive", "resistant"),
        r("pm-includes", "\"What does that include?\"", "pricing-includes", "neutral"),
        r("pm-monthly", "\"Is there anything monthly / can I spread it?\"", "pricing-monthly", "neutral"),
        r("pm-think", "\"I'll have a think.\"", "obj-think", "neutral"),
        r("pm-budget", "\"We haven't got the budget.\"", "obj-no-budget", "resistant"),
      ],
    },
    {
      id: "pricing-includes",
      stage: "demo",
      title: "\"What does that include?\"",
      theySay: "What do I get for that?",
      whatISay:
        "The site itself, built around {{company}} — what you do, the areas you cover, photos, and an easy way for people to ring or message you. I set it all up and put it live. You don't have to do anything technical.",
      goal: "Keep it concrete. No feature lists, no packages.",
      possibleResponses: [
        r("pi-good", "\"Sounds alright.\"", "demo-offer", "positive"),
        r("pi-monthly", "\"Is there anything ongoing?\"", "pricing-monthly", "neutral"),
        r("pi-expensive", "\"Still sounds a lot.\"", "pricing-expensive", "resistant"),
      ],
    },
    {
      id: "pricing-monthly",
      stage: "demo",
      title: "Monthly options — only because they asked",
      theySay: "Is there a monthly option? / Can I spread the cost?",
      whatISay: `Since you've asked — yes. Most people do the ${WEBSITE_PRICE} one-off, but there are monthly options at ${MONTHLY_OPTIONS.join(" or ")} depending on what's included. I'd still say let me build the example first, then we can work out which way suits you.`,
      goal: "Answer it and get straight back to the demo.",
      coach:
        "This screen only exists because they asked. Never open with it, and don't list everything — give the numbers and move on.",
      possibleResponses: [
        r("pmo-good", "\"That's more manageable.\"", "demo-offer", "positive"),
        r("pmo-think", "\"Let me think about it.\"", "obj-think", "neutral"),
        r("pmo-one-off", "\"I'd rather just pay once.\"", "demo-offer", "positive"),
      ],
    },
    {
      id: "pricing-expensive",
      stage: "demo",
      title: "\"That's too expensive\"",
      theySay: "That's too expensive.",
      whatISay:
        "I understand. It's a one-off rather than something monthly, and it's yours. Can I ask what you were expecting — I'd rather know than guess.",
      goal: "Find out whether it's price or value. Usually it's value.",
      possibleResponses: [
        r("pe-number", "They gave me a number", "demo-offer", "neutral", "Offer the example anyway — let the work do the arguing"),
        r("pe-justify", "\"I just can't justify it.\"", "demo-offer", "neutral"),
        r("pe-monthly", "\"Could I pay it monthly?\"", "pricing-monthly", "positive"),
        r("pe-no", "\"It's not happening.\"", "polite-exit", "exit"),
      ],
    },

    /* ---------------- Demo ---------------- */
    {
      id: "demo-offer",
      stage: "demo",
      title: "Offer the example",
      whatISay: demoOffer,
      goal: "Get agreement to look at something. That's the win on a first call — not a sale.",
      coach:
        "This is the real close on call one. Make it small, make it free, make it easy to say yes to.",
      possibleResponses: [
        r("do-yes", "\"Yeah, go on then.\"", "demo-book", "positive"),
        r("do-email", "\"Send me something first.\"", "email-close", "neutral"),
        r("do-unsure", "\"I'm not sure…\"", "demo-hesitation", "neutral"),
        r("do-price", "\"How much though?\"", "pricing-main", "positive"),
        r("do-partner", "\"I'd need to speak to someone.\"", "obj-partner", "neutral"),
        r("do-buy", "\"Just do it, how do we start?\"", "close-buy", "positive"),
        r("do-no", "\"No thanks.\"", "polite-exit", "exit"),
      ],
    },
    {
      id: "demo-hesitation",
      stage: "demo",
      title: "They're hesitating",
      theySay: "I'm not sure… / What's the point?",
      whatISay:
        "There's no commitment in it at all. I'll build it, send you a link, and you either like it or you don't. Worst case you've seen what your business could look like online and it's cost you nothing.",
      goal: "Take the risk out of it. Don't add pressure.",
      possibleResponses: [
        r("dh-ok", "\"Alright then.\"", "demo-book", "positive"),
        r("dh-email", "\"Email me the details.\"", "email-close", "neutral"),
        r("dh-later", "\"Maybe another time.\"", "follow-up-agreed", "neutral"),
        r("dh-no", "\"No, you're alright.\"", "polite-exit", "exit"),
      ],
    },
    {
      id: "demo-book",
      stage: "close",
      title: "Demo agreed — lock it in",
      whatISay:
        "Brilliant. I'll get that done for you. What's the best email or number to send the link to? And I'll give you a ring on [day] once it's ready to walk you through it — does [time] suit?",
      goal: "Contact details plus a specific day and time. Vague follow-ups die.",
      coach:
        "Read the details back to them. Then log it on the outcome screen before you forget.",
      terminal: true,
      possibleResponses: [
        r("db-done", "Details taken and time agreed", OUTCOME_NODE_ID, "positive"),
        r("db-no-time", "They'd rather I just send it over", "email-close", "neutral"),
        END_CALL,
      ],
    },

    /* ---------------- Close / exits ---------------- */
    {
      id: "close-options",
      stage: "close",
      title: "Where has this landed?",
      whatISay:
        "Nothing to read out here — pick whichever situation you're actually in and the wording is on the next screen.",
      goal: "Move them to the right next step, not to a sale they aren't ready for.",
      coach:
        "Most first calls should end in a demo, a follow-up, or a clean no. All three are fine.",
      possibleResponses: [
        r("co-demo", "They've agreed to see an example", "demo-book", "positive"),
        r("co-buy", "They want to go ahead now", "close-buy", "positive"),
        r("co-info", "They want something sent over", "email-close", "neutral"),
        r("co-think", "They need to think about it", "obj-think", "neutral"),
        r("co-callback", "They want a call another time", "callback-arrange", "neutral"),
        r("co-follow", "Follow-up agreed", "follow-up-agreed", "neutral"),
        r("co-no", "Not interested — exit professionally", "polite-exit", "exit"),
        r("co-nofit", "No real opportunity here", "no-fit-exit", "exit"),
      ],
    },
    {
      id: "close-buy",
      stage: "close",
      title: "They want to go ahead",
      theySay: "Let's do it.",
      whatISay:
        `That's great. So the next step is I'll put the site together for you — ${WEBSITE_PRICE} one-off, nothing due until you've seen it and you're happy. I'll take a few details now and send you everything in writing so you've got it.`,
      goal: "Confirm the terms out loud, then get the details.",
      coach: "Don't oversell after a yes. Take the details and get off the phone.",
      terminal: true,
      possibleResponses: [
        r("cb-details", "Details taken — we're going ahead", OUTCOME_NODE_ID, "positive"),
        r("cb-pause", "They want it in writing first", "email-close", "neutral"),
        END_CALL,
      ],
    },
    {
      id: "email-close",
      stage: "close",
      title: "Send information",
      whatISay:
        "No problem. What's the best email? I'll send you a couple of examples and a note on what I'd do for {{company}} specifically — and I'll give you a ring [day] just to see what you thought. That alright?",
      goal: "Get the address AND permission to follow up. An email with no follow-up is a dead end.",
      terminal: true,
      possibleResponses: [
        r("ec-yes", "Email taken and follow-up agreed", OUTCOME_NODE_ID, "positive"),
        r("ec-no-call", "They'd rather I didn't ring back", OUTCOME_NODE_ID, "neutral"),
        END_CALL,
      ],
    },
    {
      id: "callback-arrange",
      stage: "close",
      title: "Arrange a call back",
      whatISay:
        "No problem at all. I'll give you a ring [day] around [time] instead — I'll keep it short, I promise. Is that number the best one for you?",
      goal: "A specific day and time, written down before you hang up.",
      terminal: true,
      possibleResponses: [
        r("ca-yes", "Call back booked", OUTCOME_NODE_ID, "positive"),
        r("ca-vague", "No firm time — I'll try again", OUTCOME_NODE_ID, "neutral"),
        END_CALL,
      ],
    },
    {
      id: "follow-up-agreed",
      stage: "close",
      title: "Follow-up agreed",
      whatISay:
        "That's absolutely fine. I'll leave it with you and give you a ring [day] to see where you've got to. If it's a no by then just tell me straight and I won't keep bothering you.",
      goal: "Leave with a date and no awkwardness.",
      coach: "Saying 'just tell me straight' now saves three chasing calls later.",
      terminal: true,
      possibleResponses: [
        r("fa-yes", "Follow-up date agreed", OUTCOME_NODE_ID, "positive"),
        r("fa-demo", "Actually — build the example anyway", "demo-book", "positive"),
        END_CALL,
      ],
    },
    {
      id: "polite-exit",
      stage: "close",
      title: "Professional exit",
      whatISay:
        "No problem at all, I appreciate you taking the call. If it ever comes up, you've got my name — {{callerName}} at {{brand}}. All the best.",
      goal: "Leave them thinking that was a decent phone call.",
      coach:
        "Don't squeeze one last line in. The clean exit is what makes a callback in six months possible.",
      terminal: true,
      possibleResponses: [
        r("pe-logged", "Call ended politely", OUTCOME_NODE_ID, "exit"),
        r("pe-reopened", "They started talking again", "hook", "positive"),
        END_CALL,
      ],
    },
    {
      id: "polite-exit-annoyed",
      stage: "close",
      title: "They're annoyed — exit now",
      theySay: "(Irritated / sharp)",
      whatISay:
        "Understood — sorry to have bothered you. I'll take you off my list. Have a good day.",
      goal: "End it immediately and respectfully. Nothing else.",
      coach:
        "No last attempt, no justification. Say it, mean it, and make a note not to ring again.",
      terminal: true,
      possibleResponses: [
        r("pea-logged", "Call ended — do not call again", OUTCOME_NODE_ID, "exit"),
      ],
    },
    {
      id: "no-fit-exit",
      stage: "close",
      title: "No real opportunity — exit well",
      whatISay:
        "Honestly, from what you've said it sounds like you've got that side of things covered — I'm not going to try and sell you something you don't need. If that ever changes, give me a shout. Thanks for your time.",
      goal: "Disqualify honestly. This is a good outcome, not a failure.",
      coach:
        "People remember the person who told them they didn't need it. That's where referrals come from.",
      terminal: true,
      possibleResponses: [
        r("nf-logged", "Logged as not a fit", OUTCOME_NODE_ID, "exit"),
        r("nf-changed", "They changed their mind", "demo-offer", "positive"),
      ],
    },
  ];

  const map: Record<string, CallNode> = {};
  for (const node of nodes) map[node.id] = node;
  return map;
}

/* ------------------------------------------------------------------ */
/* Assembly                                                            */
/* ------------------------------------------------------------------ */

/**
 * Turns prepared prospect research into the call playbook. This is the seam
 * where a V4 AI script generator would slot in — the UI only ever consumes the
 * Playbook shape, never the raw prospect.
 */
export function buildPlaybook(prospect: Prospect): Playbook {
  const script = prospect.script ?? {};
  const discovery =
    script.discovery && script.discovery.length > 0
      ? script.discovery
      : defaultDiscovery(prospect);

  const nodes: Record<string, CallNode> = {
    ...buildBaseNodes(prospect),
    ...buildDiscoveryNodes(discovery),
  };

  // Prospect-specific nodes win over the generated ones.
  for (const custom of script.customNodes ?? []) {
    nodes[custom.id] = { ...nodes[custom.id], ...custom };
  }

  // Fill {{tokens}} everywhere so the UI never has to think about it.
  const filled: Record<string, CallNode> = {};
  for (const [id, node] of Object.entries(nodes)) {
    filled[id] = {
      ...node,
      title: fillTokens(node.title, prospect),
      theySay: node.theySay ? fillTokens(node.theySay, prospect) : undefined,
      whatISay: fillTokens(node.whatISay, prospect),
      goal: node.goal ? fillTokens(node.goal, prospect) : undefined,
      coach: node.coach ? fillTokens(node.coach, prospect) : undefined,
      possibleResponses: node.possibleResponses.map((opt) => ({
        ...opt,
        label: fillTokens(opt.label, prospect),
      })),
    };
  }

  const objections = [
    ...OBJECTION_LIBRARY,
    ...(script.extraObjections ?? []),
  ].map((o) => ({
    ...o,
    objection: fillTokens(o.objection, prospect),
    response: fillTokens(o.response, prospect),
    followUp: fillTokens(o.followUp, prospect),
    meaning: fillTokens(o.meaning, prospect),
    likelyReply: fillTokens(o.likelyReply, prospect),
    whenToStop: fillTokens(o.whenToStop, prospect),
  }));

  return {
    prospect,
    nodes: filled,
    rootId: "opening",
    discovery: discovery.map((q) => ({
      ...q,
      question: fillTokens(q.question, prospect),
    })),
    objections,
  };
}

/**
 * Development safety net: every branch must lead somewhere real. Used by the
 * data test so a new prospect file can never strand you mid-call.
 */
export function findBrokenLinks(playbook: Playbook): string[] {
  const broken: string[] = [];
  for (const node of Object.values(playbook.nodes)) {
    for (const option of node.possibleResponses) {
      if (option.nextNodeId === OUTCOME_NODE_ID) continue;
      if (!playbook.nodes[option.nextNodeId]) {
        broken.push(`${node.id} → ${option.nextNodeId} (${option.label})`);
      }
    }
    if (node.possibleResponses.length === 0 && !node.terminal) {
      broken.push(`${node.id} has no way out`);
    }
  }
  return broken;
}
