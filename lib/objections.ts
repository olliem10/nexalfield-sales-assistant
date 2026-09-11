import type { Objection } from "./types";

/**
 * The shared objection library. Wording is deliberately plain-spoken — this is
 * a normal person ringing a local business, not a sales script.
 *
 * `nodeId` links an objection to the branching conversation so the objection
 * panel can drop you straight into the right part of the call.
 */
export const OBJECTION_LIBRARY: Objection[] = [
  {
    id: "not-interested",
    objection: "I'm not interested.",
    meaning:
      "Almost always a reflex, not a decision. They've had the same call fifty times and haven't heard a reason yet.",
    response:
      "That's fair enough, you don't know what it's about yet. Can I give you the reason I rang in one sentence, and if it's not useful I'll leave you alone?",
    likelyReply: "Go on then. / No, you're alright.",
    followUp:
      "If they say go on: give the hook, keep it about them, and ask a question at the end so it becomes a conversation.",
    whenToStop:
      "Second clear no. Say: 'No problem at all, I appreciate you taking the call. All the best.' Then hang up.",
    nodeId: "obj-not-interested",
  },
  {
    id: "busy",
    objection: "I'm too busy.",
    meaning:
      "Usually true. It's a timing problem, not an interest problem — don't treat it as a rejection.",
    response:
      "No problem at all, I'll keep it to twenty seconds. The reason I rang is…",
    likelyReply: "Still can't talk. / Go on then.",
    followUp:
      "If they're still busy, book a time: 'When's normally quieter for you — morning or late afternoon?' Get a day and a rough time.",
    whenToStop:
      "If they won't give you a time, offer to try again another day and leave it there. Don't push a busy person.",
    nodeId: "obj-busy",
  },
  {
    id: "have-website",
    objection: "We already have a website.",
    meaning:
      "Could be a real site they're happy with, or something built years ago that nobody's touched. Find out before you assume.",
    response:
      "I did see that, and that's actually why I rang. Can I ask — when was it last properly updated, and is it bringing you any enquiries?",
    likelyReply: "It's fine. / It's a bit old. / It does nothing really.",
    followUp:
      "If it's old or doing nothing: 'That's normally the bit worth fixing — not the site itself, the enquiries.' If they're happy with it, respect that.",
    whenToStop:
      "If they've got a good site and it's working for them, tell them so honestly and end it. That's a professional exit, not a lost sale.",
    nodeId: "obj-have-website",
  },
  {
    id: "dont-need-website",
    objection: "We don't need a website.",
    meaning:
      "They think a website is decoration. They've never seen it as a way of getting enquiries.",
    response:
      "A lot of people I speak to say that, and if it was just a brochure I'd agree. The only reason I mention it is that people are already looking you up — the question is what they find when they do.",
    likelyReply: "We're busy enough. / Never needed one before.",
    followUp:
      "Ask: 'Are you turning work away at the moment, or would you take more if it came in?' Their answer tells you whether there's anything here.",
    whenToStop:
      "If they're genuinely full and happy, there's no opportunity. Thank them and move on.",
    nodeId: "obj-dont-need-website",
  },
  {
    id: "word-of-mouth",
    objection: "We get all our work through word of mouth.",
    meaning:
      "Often true and a good sign — it means people recommend them. It also means every recommendation gets googled afterwards.",
    response:
      "That's the best way to get work, honestly. The only thing I'd say is that when someone recommends you, the next thing that person does is search your name — and that's the bit I'd want to make sure looks right.",
    likelyReply: "Suppose so. / They just ring us.",
    followUp:
      "'Do people ever ring and ask what you do or what you charge before they book? That's normally the stuff a page answers for you.'",
    whenToStop:
      "If they've got more work than they can handle and no interest, leave it. Offer to ring back in a few months.",
    nodeId: "obj-word-of-mouth",
  },
  {
    id: "google-customers",
    objection: "We get customers from Google.",
    meaning:
      "Usually means a Google Business Profile listing. That's a real asset — and often the strongest argument for giving those people somewhere to land.",
    response:
      "That's good, that means people are already searching for you. When they tap through from Google, where do they end up at the moment?",
    likelyReply: "Just our listing. / Facebook. / They ring us.",
    followUp:
      "'That's the gap I noticed. You're doing the hard part already — getting found. There's just nowhere for them to go and check you out properly.'",
    whenToStop:
      "If their listing plus phone number genuinely converts and they're happy, say so and exit well.",
    nodeId: "obj-google-customers",
  },
  {
    id: "send-email",
    objection: "Just send me an email.",
    meaning:
      "Sometimes a genuine preference, more often a polite way to end the call. Emails from strangers don't get read.",
    response:
      "I can do that. Can I ask one quick thing first so I'm not sending you something generic — how do most of your customers find you at the moment?",
    likelyReply: "They answer. / Just send it over.",
    followUp:
      "If they answer, you're in a conversation — carry on. If they insist, get the address, agree a day to follow up, and actually do it.",
    whenToStop:
      "Second time they ask for an email, take it and go. Confirm the address, confirm when you'll follow up.",
    nodeId: "obj-send-email",
  },
  {
    id: "how-much",
    objection: "How much does it cost?",
    meaning:
      "Not an objection — usually interest. Dodging it costs you the call.",
    response:
      "The website is £400 as a one-off. What I'd normally suggest is I put something together for your business first so you can actually see it before you decide anything.",
    likelyReply: "That's not bad. / That's a lot. / What's included?",
    followUp:
      "Move straight back to the demo: 'Let me build the example, then the price is an easy decision either way.'",
    whenToStop:
      "Never stop on a price question — it's the best question they can ask you.",
    nodeId: "pricing-main",
  },
  {
    id: "too-expensive",
    objection: "That's too expensive.",
    meaning:
      "Usually means 'I can't see what I get for that yet'. Value hasn't landed, price isn't really the issue.",
    response:
      "I understand. It's a one-off rather than something monthly, and it's yours. Can I ask what you were expecting it to be — I'd rather know than guess.",
    likelyReply: "I thought a couple of hundred. / I don't know, I just can't justify it.",
    followUp:
      "'Let me do the example anyway. If one job comes out of it, it's paid for itself — and if you look at it and it's not for you, no hard feelings.'",
    whenToStop:
      "If money is genuinely tight right now, don't grind them. Offer to send the example over and leave the door open.",
    nodeId: "pricing-expensive",
  },
  {
    id: "think-about-it",
    objection: "I need to think about it.",
    meaning:
      "Either a soft no, or something specific is unresolved and they haven't said what.",
    response:
      "Of course. Just so I know I've explained it properly — is it the money, the timing, or are you not sure it'd actually make a difference?",
    likelyReply: "It's the money. / I just want to have a think.",
    followUp:
      "Whatever they name, answer that one thing, then offer the example as the no-risk next step and agree a day to speak again.",
    whenToStop:
      "Don't ask twice. Agree a follow-up day, thank them, and ring when you said you would.",
    nodeId: "obj-think",
  },
  {
    id: "speak-to-partner",
    objection: "I need to speak to my partner / business partner.",
    meaning:
      "Often genuine. Sometimes the polite version of 'not now'. Either way you want to make it easy for them to say it to someone else.",
    response:
      "That makes sense. What I'll do is put the example together — it's much easier to show someone than describe it. When are you likely to speak to them?",
    likelyReply: "This week. / Tonight. / I'll let you know.",
    followUp:
      "Agree the day you'll ring back and confirm you'll have the example ready by then.",
    whenToStop:
      "Don't ask to speak to the partner directly on the first call. Send the example, ring back when you said.",
    nodeId: "obj-partner",
  },
  {
    id: "no-budget",
    objection: "We don't have the budget.",
    meaning:
      "Could be real cashflow, could be 'not a priority'. Worth one honest question to find out which.",
    response:
      "Fair enough, I'd rather you told me than strung it out. Is it a bad time generally, or is it that £400 in one go is awkward?",
    likelyReply: "Just a quiet month. / It's not a priority right now.",
    followUp:
      "If it's timing: agree when to ring back and leave it there. If it's the lump sum and they ask, that's when monthly options are worth mentioning.",
    whenToStop:
      "If there's no money, there's no sale today. Be decent about it — that's how you get the callback in three months.",
    nodeId: "obj-no-budget",
  },
  {
    id: "tried-before",
    objection: "We've tried websites before and it did nothing.",
    meaning:
      "They've been burned — probably paid for something pretty that nobody ever visited. This is scepticism about results, not about you yet.",
    response:
      "I hear that a lot, and usually it's because someone built a nice-looking site and left it at that. What happened with yours — did you ever get enquiries from it?",
    likelyReply: "Not one. / A couple at the start.",
    followUp:
      "'That's the difference in how I'd do yours — it's built around getting people to ring you, not to win a design award. Let me show you what I mean rather than tell you.'",
    whenToStop:
      "If they're adamant it's a waste of money, accept it politely and leave the door open.",
    nodeId: "obj-tried-before",
  },
  {
    id: "dont-want-hassle",
    objection: "I don't want to have to deal with websites.",
    meaning:
      "They're picturing work: logins, updates, technical stuff they don't have time for.",
    response:
      "That's the bit I take off you. You don't touch anything — I build it, I put it live, and if something needs changing you send me a message and I do it.",
    likelyReply: "So I don't have to do anything? / What would you need from me?",
    followUp:
      "'About ten minutes of your time to tell me what you do and check I've got it right. That's it.'",
    whenToStop:
      "If they still don't want any involvement at all, that's a fair answer. Thank them and exit.",
    nodeId: "obj-dont-want-to-deal",
  },
  {
    id: "who-are-you",
    objection: "Who are you?",
    meaning:
      "Perfectly reasonable. They want to know they're not being scammed.",
    response:
      "My name's {{callerName}}, I run NexalField — I build websites for local businesses. I'm not part of a call centre, it's just me ringing round businesses near me.",
    likelyReply: "Where are you based? / Right, and what do you want?",
    followUp:
      "Answer straight, then get back to the reason you rang: 'The reason I picked up the phone to you specifically is…'",
    whenToStop:
      "Never dodge this one. Straight answers buy you the next thirty seconds.",
    nodeId: "who-are-you",
  },
  {
    id: "why-you",
    objection: "Why should I use you?",
    meaning:
      "They're half interested. This is a buying question dressed up as a challenge.",
    response:
      "Honestly? Because I'll show you before you pay anything. I'd rather build you something for your business and let you judge it than talk you into it over the phone.",
    likelyReply: "And how much is that? / What's the catch?",
    followUp:
      "'No catch. If you like it we go ahead, if you don't, you've lost nothing but the phone call.'",
    whenToStop:
      "Don't oversell here. One honest answer is stronger than a list of reasons.",
    nodeId: "obj-why-you",
  },
  {
    id: "already-use-someone",
    objection: "We already use someone for that.",
    meaning:
      "Could be an agency, a nephew, or someone they haven't spoken to in two years.",
    response:
      "No problem. Are they still looking after it for you, or is it one of those things that got set up and left?",
    likelyReply: "They still do it. / Haven't spoken to them in ages.",
    followUp:
      "If there's an active relationship, leave it alone and say so. If it's gone quiet: 'That's the common one. Would it be worth seeing what it could look like now?'",
    whenToStop:
      "If they've got someone they're happy with, don't try to unseat them. Ask to be kept in mind and end well.",
    nodeId: "obj-already-use-someone",
  },
  {
    id: "call-another-time",
    objection: "Can you call me another time?",
    meaning: "A real yes to the conversation, just not right now.",
    response:
      "Course I can. What's normally a quieter time for you — first thing, or later in the afternoon?",
    likelyReply: "Try Thursday morning. / Just try next week.",
    followUp:
      "Pin it down: day, rough time, and confirm you'll ring then. Write it in your notes before you hang up.",
    whenToStop:
      "If they won't give a time at all, it's usually a soft no. Say you'll try again another day and leave it.",
    nodeId: "obj-call-another-time",
  },
];

export function getObjection(id: string): Objection | undefined {
  return OBJECTION_LIBRARY.find((o) => o.id === id);
}
