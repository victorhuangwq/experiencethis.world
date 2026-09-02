---
layout: post
title: "The Agents Are Already Browsing"
date: 2026-08-17 10:00:00 -0700
categories: projects
tags:
    - web platform
    - browser
    - security
    - privacy
    - w3c
    - ai agents
description: "A year of security and privacy work on WebMCP: how I ended up writing the threat model, what it changed, and why I think giving agents a real path into websites is good for the web."
---

There are two ways an AI agent uses a website today, and neither of them involves the website.

The first is computer use. The agent takes a screenshot, looks at the pixels, works out where the "Add to cart" button probably is, moves a synthetic mouse there, clicks, takes another screenshot, and goes again.

The second is to drive the page the way a test suite does. [Playwright's MCP server](https://github.com/microsoft/playwright-mcp) is the common example. It hands the model the page's accessibility tree, so the model gets roles, labels and element references like `e21` instead of pixels, and clicks by reference. It's faster and cheaper than screenshots and it doesn't need a vision model at all.

Both of these work. In both cases the site has no idea it's happening. The developer who built the page doesn't get to say which actions an agent may take, doesn't get to mark the dangerous ones, and doesn't even find out an agent came by.

Sites don't have a good response available either. They can try to detect automation and block it, or they can ignore it. What they can't do is cooperate on purpose. There's no way for a site to say: here's what I'll let an agent do, and here's where I want a human to confirm first.

---

## What's WebMCP all about

[WebMCP](https://github.com/webmachinelearning/webmcp) is a proposal to close that gap, and it didn't come from any one place. Through 2025 several people landed on roughly the same idea separately, and those efforts converged into a joint Edge and Chrome proposal in August 2025. It's being incubated in the W3C Web Machine Learning Community Group, and the idea is that instead of agents guessing at your pixels, your page hands them tools.

```js
navigator.modelContext.registerTool({
  name: "add-to-cart",
  description: "Add an item to the shopping cart",
  inputSchema: { /* ... */ },
  execute: async (args) => { /* the site's own code runs here */ },
});
```

It's in the spirit of [Model Context Protocol](https://modelcontextprotocol.io/), but built into the browser and scoped to the page. The agent gets a list of tools the site chose to offer, with names and schemas, and the site's own code runs when a tool is called.

I've come to think of this as a golden path, one that doesn't make agents safe by default but does give the developer a say. The developer decides what an agent can do on their site, and the attack surface becomes something you can point at, instead of whatever a vision model decides to click on. The security people I've talked to about this keep landing on the same point, that limiting the scope of what an agent can do on a site, down to a set of tools the site chose to offer, is by itself a win for security. If we don't build this path, we don't get fewer agents. We get the same agents, doing the same things, using interfaces that were never meant for them.

Anyone who has spent time around both AI and the web will ask about the accessibility tree here. The page already describes itself, so why not point agents at that? [As one issue puts it](https://github.com/webmachinelearning/webmcp/issues/91), "WebMCP introduces a second description of the page alongside the accessibility tree. These will diverge over time." It's a fair worry, and it got a real discussion before the thread was closed.

My answer is that the two things describe different stuff. The accessibility tree tells you what's on the screen: there's a control here, it's a button, its label is "Place order." A tool tells you what the site is willing to do: here's an operation, here are its arguments and their types, here's whether it changes state, here's whether it needs a human first. A screen reader needs the first one. An agent acting on your behalf needs the second, and only the second lets the developer decide what gets automated.

---

## Figuring out how it breaks

My day job is in the trust and security corners of a browser: navigation, site isolation, content security policies, the machinery that decides which page is allowed to know what about which other page. I was already looking at the ecosystem through that lens when I was asked to review WebMCP in the last quarter of 2025. (Everything here is my own view, not my employer's.)

So I started looking around, asking security people I trust, and working out how to frame the analysis. WebMCP feels a lot like MCP, but a few things are genuinely different once you're inside a browser. There's the browser context. There's the fact that the user is already signed in, so the agent inherits that session. And there's the [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy), which every site on the web is built on the assumption of, and which agents move across freely.

So in October 2025 I opened [issue #45](https://github.com/webmachinelearning/webmcp/issues/45) and shared my draft of the privacy and security considerations with the group for discussion. Here are the risks I wrote down:

**Prompt injection.** Tool descriptions and tool outputs go straight into a model's context. A malicious page can hide instructions in either one, and the model may follow them. This is the standard agent attack, and WebMCP gives it new places to hide.

**Misrepresentation of intent.** Tool descriptions are natural language, so they're ambiguous and you can't verify them. A shopping site can call a tool "add to cart" and have it complete the purchase. Nothing has to leak for that to hurt you, because the agent is already logged in as you.

**Privacy leakage through over-parameterization.** Agents carry a lot of context about their user, and the site writes the tool's input schema. So a site can build a search tool that asks for your age, your location and whether you're pregnant, and it all looks like a normal tool call.

None of that is a reason not to build WebMCP. My thinking was that if this is going to be a real thing, we should build it right, and there's a practical angle underneath that too. A proposal that takes security seriously is a much easier proposal to get behind. This analysis was going to happen sooner or later either way, and it's better done early by people who want the thing to work. The W3C's Technical Architecture Group had just told the group that the privacy and security aspects "can be challenging, and we would also like to see more explorations," so there was an opening, and I volunteered to drive it.

---

## A coffee break in Kobe

TPAC 2025 in Kobe that November was the first time this was a room of people instead of a GitHub thread. I'd made slides, and I asked Anssi Kostiainen, the chair, over IRC whether I could present them after the coffee break. ([The minutes are public](https://www.w3.org/2025/11/11-webmachinelearning-minutes.html), which is one of the genuinely good things about doing this at the W3C. You can go read what everyone said.)

I'd wondered if I'd come across as the guy pouring cold water on something the room was excited about. That went away quickly. The discussion moved almost immediately from whether to worry to who owns which mitigation. Dominique Hazaël-Massieux pushed on privacy: "I don't want a site to know a user is pregnant or is visiting Japan at the moment, for example." Khushal Sagar from Chrome started sorting mitigations into browser-shaped and agent-shaped piles. Johann Hofmann, who works on Chrome security, had a breakout on agentic browsing the next day, and when I told him I was looking forward to it he wrote back: "honestly I'm not sure I can cover it all, definitely looking forward to working on this stuff together :)"

Two moments from that session stuck with me.

The first is the self-driving car analogy that came up while we were talking about keeping the user involved, the idea being that you want a hand on the steering wheel. I ended up arguing both sides of it, because both sides are true. People do get more comfortable with a self-driving car over time. But we're at the start of this, so it matters that the user stays involved now.

The second one is me learning something in the middle of the meeting. Khushal pointed out that if tool schemas have to work across browsers, someone has to work out "how do we add tests for non-deterministic APIs." That's a hard problem, because part of the API's behavior lives inside a model's judgment. My entire contribution to that insight, preserved in the minutes forever, was typing "oh wow that's true" into IRC.

Somewhere in there I also said the thing I'd been circling for weeks, and the scribe caught it: from a privacy and security perspective, WebMCP is going to be good for the web, because it gives agents a standard way to interact with it rather than computer vision and automated interactions. Kobe was where I realized the room already saw it that way too.

---

## Writing it down

Three days after TPAC I opened [a pull request with a living security and privacy considerations document](https://github.com/webmachinelearning/webmcp/pull/55). It took eighteen commits and three weeks of review to land, and the commit messages give away what I was going for: "standardize assets at risk," "address comments around open questions," and my favorite, "soften some language used." Scary writing is usually vague writing, so every attack got the same three-part skeleton instead: who's the threat actor, what's the target, what's actually at risk. The document's job was to help people build the thing with their eyes open, not to talk them out of building it. One section, about attacks on the tools' own implementations, kept growing review threads, so I cut it out and landed it [as a follow-up](https://github.com/webmachinelearning/webmcp/pull/59) a week later instead of holding up the rest.

The document has since been ported into the spec as its [Security and Privacy Considerations section](https://webmachinelearning.github.io/webmcp/#security-privacy), where the headings are still the three risks from issue #45. Having written the considerations, I also felt like the natural person to take the lead on WebMCP's answers to the W3C's standard [security and privacy self-review questionnaire](https://w3c.github.io/security-questionnaire/), about thirty pointed questions on what the feature exposes and to whom, [which landed in June](https://github.com/webmachinelearning/webmcp/pull/195). It's dull work, and I think it's the most useful thing I've written for this group, because it's where we go on the record about what this API does and doesn't leak.

---

## The design questions I weighed in on

The WebMCP repo has been a lively place for a while now, and I've been in it throughout, weighing in wherever something touched security or privacy, and plenty of times where it didn't. A sample of those arguments, with receipts:

* **What should `consequentialHint` default to?** MCP has hints like `readOnlyHint` and `destructiveHint`, and when Johann [proposed a hint for consequential actions](https://github.com/webmachinelearning/webmcp/issues/176) (the difference between drafting an email and sending it), I looked at how real MCP tools use annotations today before saying anything. When the hint [became a pull request](https://github.com/webmachinelearning/webmcp/pull/217), my worry on the record was that "it's an easy mistake to read `consequentialHint = false` as 'this is safe,' when it might just mean the web developer forgot to set it." I still argued for defaulting to `false`, because a default of true "will likely dilute what the signal tells the receiver about actual intent." A flag that's on for everything means nothing. The decision is parked until origin trial data comes back, which I was [fine with](https://www.w3.org/2026/05/28-webmachinelearning-minutes.html).

* **Should iframes get to declare tools?** For [this one](https://github.com/webmachinelearning/webmcp/issues/57) I wrote up the two use cases hiding inside the feature request: an embedded widget (think a scheduling iframe) exposing its tools to the browser's agent, and a parent page reading the tools of a page it embeds. They have completely different security stories, and [I argued](https://www.w3.org/2026/04/02-webmachinelearning-minutes.html) that if the first use case is all we need, the parent frame never needs to see the child's tools at all. I also pushed for Document Policy over Permission Policy as the opt-in mechanism, since the embedding needs both sides to agree.

* **How do you unregister a tool?** Sounds trivial, isn't. [When we debated](https://www.w3.org/2026/03/19-webmachinelearning-minutes.html) whether you unregister by passing the tool object back or just by name, I argued for name, because with an object "you'd have to keep track of the exact tool you created," and unregistration is going to be a common pattern in single-page apps where tools change as you move through a shopping flow.

* **What does `updateTool()` cost the model?** When updating a registered tool [came up](https://www.w3.org/2026/06/25-webmachinelearning-minutes.html), I raised the agent-side view: if you can update a small section of a tool definition, the agent can apply a diff to its context instead of recreating the whole model context, so the prompt cache survives.

* **In-page agents.** When the idea of pages running their own agents came up, the minutes have me saying we were ["trying to solve the problems without good list of use cases for this class of problems."](https://www.w3.org/2026/03/05-webmachinelearning-minutes.html) That's most of what useful security review sounds like in a standards group. You're rarely saying no. You're making sure everyone knows exactly what they're saying yes to.

---

## Before the data comes in

The [TAG design review was filed in June](https://github.com/w3ctag/design-reviews/issues/1238) and the questionnaire I wrote is attached to it. Wide review with the W3C's Security and Privacy groups is underway, with a debrief on the community group agenda this month, and internationalization and accessibility reviews behind that. The API is also out of the lab. Origin trials are live in Chrome 149 and Edge 150, Brave is experimenting with it in Leo, and OpenAI has added WebMCP support to the browser in the ChatGPT desktop app, so ChatGPT and Codex can pick up tools from a page without a separate connector. There are real sites behind it too, with Shopify storefronts enabled and companies like Expedia, Instacart and Target trying it out. Firefox and Safari haven't taken positions yet, which is normal for a proposal this young, and worth saying so nobody reads this as a victory lap.

So the assumptions start meeting reality about now. Some of them will be wrong, which is fine, because the document was built to be revised.

I said at TPAC that we shouldn't expect WebMCP to solve all the problems, and I still think that. Agents are going to keep doing dumb and dangerous things, and a lot of the burden sits with agent and browser implementers no matter what the spec says. What WebMCP changes is the default. Right now agents act on sites that can't see them. With this, a site can say what it offers, mark what's risky, and ask for a human where it wants one.

The honest reason I got into this is that I wanted to see how WebMCP breaks while it's early and still cheap to change. That part isn't finished. The trial data will show which bits of the threat model were paranoid and which were naive, and with sites picking this up as fast as they are, we'll find out sooner than I thought. Either way the questions are written down now, somewhere the whole group can argue about them, which is about what I was hoping for when I opened that first issue.
