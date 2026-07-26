---
layout: post
title: "The Agents Are Already Browsing"
date: 2026-07-26 10:00:00 -0700
categories: projects
tags:
    - web platform
    - browser
    - security
    - privacy
    - w3c
    - ai agents
description: "A year inside WebMCP's security and privacy work: why giving AI agents a real path into websites is better for the web than pretending they aren't here, and why mapping the threats was my way of helping."
---

Right now, somewhere, an AI agent is using a website by taking a screenshot of it. It looks at the pixels, guesses where the "Add to cart" button probably is, moves a synthetic mouse to those coordinates, clicks, takes another screenshot, and repeats. This loop has a name, computer use, and every major AI lab has shipped some version of it. The other common approach isn't much different in spirit: drive the page through the DOM or the accessibility tree, the way Playwright drives a browser in a test suite, finding elements by their labels and firing events at them.

Both approaches work, sort of. Both also have a property that I think about a lot: the website has no idea it's happening, and no say in it. The developer who built the page gets no vote on which actions an agent may take, no way to mark the dangerous ones, no way to even know an agent was there. Every protection the web has built over thirty years assumes a human is looking at the page. The agents route around all of it by pretending to be one.

For a long time the web's implicit answer to this has been to close its eyes and hope the agents go away. They are not going away.

---

## The golden path

This is where [WebMCP](https://github.com/webmachinelearning/webmcp) comes in. It's a proposal being incubated in the W3C Web Machine Learning Community Group, and the idea fits in a sentence: instead of agents guessing at your pixels, your page can hand them tools.

```js
navigator.modelContext.registerTool({
  name: "add-to-cart",
  description: "Add an item to the shopping cart",
  inputSchema: { /* ... */ },
  execute: async (args) => { /* the site's own code runs here */ },
});
```

A structured, developer-defined interface, in the spirit of [Model Context Protocol](https://modelcontextprotocol.io/) but built into the browser, scoped to the page. The agent sees a list of tools the site chose to offer, with names and schemas, instead of a screenshot to squint at.

I've come to think of this as a golden path. Not because it makes agents safe by default, it doesn't, but because it finally gives the people who build websites a seat at the table. The developer decides what an agent can do. The attack surface becomes something you can point at and reason about, instead of "whatever a vision model decides to click." If we don't provide this path, we don't get fewer agents on the web. We get the same agents, still browsing, just blind and unaccountable.

That's the thesis. But I didn't start with the thesis. I started with a list of ways it could all go wrong.

---

## Figuring out how it breaks

My day job has me in the trust-and-security corners of a browser: navigation, site isolation, the machinery that decides which page gets to know what about which other page. When WebMCP crossed my path in late 2025, that was the lens I brought with me. (Everything here is my own view, not my employer's.)

And the honest way to say what I did next is: before I could help build anything, I needed to understand what the problems actually were. The way I know how to trust a system is to first map how it breaks.

So in October 2025 I opened [issue #45, "Privacy & security considerations for WebMCP"](https://github.com/webmachinelearning/webmcp/issues/45). It laid out three risk areas, deliberately phrased as questions to the group rather than alarms:

**Prompt injection.** Tool descriptions and tool outputs flow straight into a language model's context. A malicious page can hide instructions in either, and the model may follow them. This is the classic agent attack, and WebMCP hands it new delivery mechanisms.

**Misrepresentation of intent.** Tool descriptions are natural language, which is ambiguous and unverifiable. A shopping site can describe a tool as "add to cart" and have it quietly complete the purchase. No user data needs to leak for this to hurt; the agent is already logged in as you.

**Privacy leakage through over-parameterization.** Agents carry rich context about their user, and a tool's input schema is a shopping list the site writes. A search tool that "needs" your age, your location, and whether you're pregnant is a profile-building machine wearing a tool's clothes.

None of these were reasons not to build WebMCP. All of them were reasons to build it carefully. The group had just gotten early feedback from the W3C's Technical Architecture Group saying the privacy and security aspects "can be challenging, and we would also like to see more explorations," so there was a workstream waiting for someone to pick it up. I picked it up.

---

## A coffee break in Kobe

The group's face-to-face at TPAC 2025 in Kobe that November was where the workstream became a room full of people. I'd prepared slides, and at some point I typed into IRC asking Anssi Kostiainen, the chair, whether I could present them after the coffee break. ([The minutes are public](https://www.w3.org/2025/11/11-webmachinelearning-minutes.html), which is one of the quietly great things about doing this work at the W3C: you can go read exactly what everyone said.)

If I'd worried about being the person throwing cold water on a proposal everyone was excited about, the room settled that fast. What I remember is how quickly the discussion went from "should we worry" to "who owns which mitigation." Dominique Hazaël-Massieux from the W3C pressed on the privacy side: "I don't want a site to know a user is pregnant or is visiting Japan at the moment, for example." Khushal Sagar from Chrome started sorting mitigations into browser-shaped and agent-shaped piles. Johann Hofmann, who works on Chrome security, was giving a whole breakout on agentic browsing the next day, and when I told him over IRC that I was looking forward to it, he wrote back: "honestly I'm not sure I can cover it all, definitely looking forward to working on this stuff together :)"

Two exchanges from that session stuck with me. Anssi offered an analogy for keeping users engaged while agents act: "we can make a comparison with keeping a hand on the steering wheel in a self-driving car." I found myself arguing both sides of it, because both sides are true: "conversely, people get more and more comfortable with a self-driving car over time... but we're at the start of the journey and so it's important to make sure the user stays involved."

The other was a moment where I got smarter in public. Khushal pointed out that if tool schemas are going to work across browsers, someone has to figure out "how do we add tests for non-deterministic APIs," which is a genuinely hard problem, since the API's behavior partly lives inside a model's judgment. My entire contribution to that insight, faithfully preserved in the minutes, was typing "oh wow that's true" into IRC.

And somewhere in that session I said the thing I'd been circling for weeks, which the scribe caught: from a privacy and security perspective, WebMCP is going to be *good* for the web, because it provides a standard way to interact with it, rather than computer vision and automated interactions. That's the golden path argument, and Kobe was where I understood the room already believed it. The threat modeling wasn't opposition to WebMCP. It was the price of admission for shipping it.

---

## Writing it down without the sirens

Three days after TPAC I opened [a pull request with a living security and privacy considerations document](https://github.com/webmachinelearning/webmcp/pull/55). It took eighteen commits and three weeks of review to land, and the commit messages tell you what kind of document I was trying to write: "standardize assets at risk," "address comments around open questions," and my favorite, "soften some language used."

That softening was deliberate craft, not diplomacy. Scary language is usually imprecise language. "This could be catastrophic" tells an implementer nothing; "the threat actor is a malicious website, the target is the agent's reasoning, the assets at risk are the user's cross-site context" tells them exactly where to build the wall. So every attack in the document got the same skeleton: who's the threat actor, what's the target, what's actually at risk. Adjectives out, nouns in.

There was a second reason to keep the sirens off. A security document for an emerging standard has a job, and the job is not to be impressive. It's to keep builders building, with their eyes open. If the document had read as "here's why this API is a bad idea," the realistic outcome wouldn't have been a safer web. It would have been agents continuing to screenshot their way through everyone's checkout flows while the golden path died in committee.

I also learned to ship the 80%. One section, on attacks against the tools' own implementations (agents feeding hostile inputs to hastily-written `execute` functions), kept growing review threads, so I cut it from the PR and landed it [as its own follow-up](https://github.com/webmachinelearning/webmcp/pull/59) a week later rather than holding everything hostage. When the group reviewed the landed document that December, Johann's read was that the considerations were solid ground to build on, which from a Chrome security person was the review I actually cared about.

---

## From markdown to spec

Documents like that usually rot in a `docs/` folder. This one didn't, and watching what happened to it has been the most satisfying part of the whole year.

In May 2026, Johann [ported the document into the WebMCP specification itself](https://github.com/webmachinelearning/webmcp/pull/181), as the normative Security and Privacy Considerations section. If you open [the spec](https://webmachinelearning.github.io/webmcp/#security-privacy) today, the section headings are the taxonomy from issue #45, almost word for word: Prompt Injection Attacks, Misrepresentation of Intent, Privacy Leakage Through Over-Parameterization. The questions I asked in October became the structure the spec answers in.

Then came the formal paperwork. Every W3C spec heading toward review by the Technical Architecture Group has to answer a standard [security and privacy self-review questionnaire](https://w3c.github.io/security-questionnaire/), thirty-ish pointed questions about what the feature exposes and to whom. I volunteered to write WebMCP's answers, [and that landed in June](https://github.com/webmachinelearning/webmcp/pull/195). It's the least glamorous artifact imaginable and I'd argue it's the most important one I've produced: it's the document where the group commits, on the record, to what this API does and doesn't leak.

---

## The threat model earns its keep

Here's the part I didn't fully anticipate: once the threat model existed, it started shaping the API itself. Not by blocking things. By making design arguments resolvable.

Take tool annotations. MCP has hints like `readOnlyHint` and `destructiveHint` that tell an agent how risky a tool is, and the obvious move was to copy them into WebMCP wholesale. When [the debate came up](https://github.com/webmachinelearning/webmcp/issues/176) over adding a hint for consequential actions, I went and reviewed how existing MCP tools actually use these annotations in the wild before taking a position, and the position I took was soft on purpose: support the hint, treat it as a hint rather than a deterministic contract, and stay open to revising when origin trial data comes in. The threat model says misrepresentation of intent is a core risk, which means you can never *trust* a self-reported annotation; you can only use it to do better than nothing. That one insight settles a surprising number of arguments.

The same instinct, use cases before mechanisms, ran through the rest of my year in the group. When we debated [letting iframes declare tools](https://github.com/webmachinelearning/webmcp/issues/57), I kept dragging the conversation back to concrete cases (the embedded scheduling widget that can't work through postMessage alone) because the security answer depends entirely on which problem you're solving. When in-page agents came up, the minutes have me saying we were "trying to solve the problems without good list of use cases for this class of problems." I've come to believe this is most of what useful security work looks like in a standards body: not saying no, but insisting the group knows precisely what it's saying yes to. And the ideas keep compounding; the spec now has an `untrustedContentHint` so tools can flag outputs containing user-generated content, which is the output-injection section of the threat model turned into API surface, built by other people. That's what a living document is for.

---

## Before the data comes in

WebMCP is now heading toward TAG review, with the questionnaire as its cover letter, and origin trial data from real usage will start testing the threat model's assumptions against reality. Some of those assumptions will be wrong. That's fine; the document was designed to be revised, it says "living" right at the top.

I said at TPAC that we shouldn't expect WebMCP to solve all the problems, and I'd say it again. Agents will still do dumb and dangerous things, and a lot of the safety burden lands on agent and browser implementers no matter what the spec says. What WebMCP changes is the default posture of the web: from a place where agents act on sites that can't see them, to a place where a site can say *here is what I offer, here is what's risky, here is where I need a human*. Developer involvement, scoped attack surface, users kept in the loop.

The web is at the start of this journey, hands still on the wheel. The agents are already browsing. The only real question was whether we'd build them a path we can all see, and I'm glad to be one of the people laying the pavement.
