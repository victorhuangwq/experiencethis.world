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

An AI agent can use a website today without the developer building anything specifically for it.

One approach is screenshot-based computer use, where the agent looks at the page, works out where the "Add to cart" button is, clicks at those coordinates, and takes another screenshot to see what changed. It can do this through mouse and keyboard actions without reading the DOM.

Another is to drive the page the way a test suite does. [Playwright's MCP server](https://github.com/microsoft/playwright-mcp) gives the model an accessibility snapshot, with roles, labels and element references like `e21`, so it can find a button and click it by reference. That part doesn't need a vision model. It also lets the agent take screenshots, inspect the page and run JavaScript, so the agent can use more than one way of understanding the page.

These approaches overlap, and an agent can use both. What they have in common is that the agent is working out how to use an interface built for people, rather than calling operations the site has explicitly provided for agents.

Sites can try to detect automation, and they can already require confirmation for an action. What is missing is a standard browser API for a page to offer an agent a set of operations, describe what each one does, and indicate which ones need more care.

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

I've come to think of this as a golden path, one that doesn't make agents safe by default but does give the developer a say. The developer chooses which operations to expose through WebMCP, so that part of the attack surface becomes something you can point at and review. The security people I've talked to about this keep landing on the same point. Giving agents a defined set of tools to use is a win for security, even though it doesn't stop them from interacting with the rest of the page. If we don't build this path we don't get fewer agents, we get the same agents doing the same things through interfaces that were never meant for them.

An obvious question here is why we need another API when the page already has an accessibility tree. [As one issue puts it](https://github.com/webmachinelearning/webmcp/issues/91), "WebMCP introduces a second description of the page alongside the accessibility tree. These will diverge over time." I think that's a reasonable concern, especially if developers have to maintain both.

To me, the useful difference is how the developer describes an action. The accessibility tree can tell an agent that there is a button labeled "Place order," and the agent can use it to operate the page. With WebMCP, the developer can expose placing an order as an operation, define its inputs, and provide hints about its consequences. The agent doesn't have to work out the sequence of controls to get there. That doesn't replace the accessibility tree or stop an agent from using the ordinary page, but it gives the developer a way to offer an interface specifically for automation.

---

## Figuring out how it breaks

My day job is in the trust and security corners of a browser: navigation, site isolation, content security policies, the machinery that decides which page is allowed to know what about which other page. I was already looking at the ecosystem through that lens when I was asked to review WebMCP in the last quarter of 2025. (Everything here is my own view, not my employer's.)

So I started looking around, asking security people I trust, and working out how to frame the analysis. WebMCP feels a lot like MCP, but a few things are genuinely different once you're inside a browser. You have the browser context, and you have a user who is already signed in, so the agent inherits that session. And there's the [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy), which every site on the web is built on the assumption of, and which an agent moves across freely.

So in October 2025 I opened [issue #45](https://github.com/webmachinelearning/webmcp/issues/45) and shared my draft of the privacy and security considerations with the group for discussion. Here are the risks I wrote down:

**Prompt injection.** Tool descriptions and tool outputs go straight into a model's context, so a malicious page can hide instructions in either one and the model may well follow them. It's the standard agent attack, and WebMCP gives it new places to hide.

**Misrepresentation of intent.** Tool descriptions are natural language, so they're ambiguous and you can't verify them, which means a shopping site can call a tool "add to cart" and have it complete the purchase. Nothing has to leak for that to hurt you, because the agent is already logged in as you.

**Privacy leakage through over-parameterization.** Agents carry a lot of context about their user, and the site writes the tool's input schema. So a site can build a search tool that asks for your age, your location and whether you're pregnant, and it all looks like a normal tool call.

My thinking was that if this is going to be a real thing, we should build it right. The security analysis would have to happen sooner or later, and doing it early would help us work through the problems while the proposal was still taking shape. Around that time, the W3C's Technical Architecture Group [asked for more exploration of the privacy and security aspects](https://github.com/webmachinelearning/webmcp/issues/35). Since I was already looking at those questions, I volunteered to drive that work.

---

## A coffee break in Kobe

TPAC 2025 in Kobe that November was the first time this was a room of people instead of a GitHub thread. I'd made slides, and I asked Anssi Kostiainen, the chair, over IRC whether I could present them after the coffee break. ([The minutes are public](https://www.w3.org/2025/11/11-webmachinelearning-minutes.html), which is one of the genuinely good things about doing this at the W3C. You can go read what everyone said.)

I'd wondered if I'd come across as the guy pouring cold water on something the room was excited about, and that went away quickly. The discussion moved almost immediately from whether to worry to who owns which mitigation. Dominique Hazaël-Massieux pushed on privacy: "I don't want a site to know a user is pregnant or is visiting Japan at the moment, for example." Khushal Sagar from Chrome started sorting mitigations into browser-shaped and agent-shaped piles. Johann Hofmann, who works on Chrome security, had a breakout on agentic browsing the next day. When I told him I was looking forward to it, he wrote back: "honestly I'm not sure I can cover it all, definitely looking forward to working on this stuff together :)"

Two moments from that session stuck with me.

The first is the self-driving car analogy that came up while we were talking about keeping the user involved, the idea being that you want a hand on the steering wheel. I ended up arguing both sides of it, because both sides are true. People really do get more comfortable with a self-driving car over time, but we're at the start of this one, so it matters that the user stays involved now.

The second one is me learning something in the middle of the meeting. Khushal pointed out that if tool schemas have to work across browsers, someone has to work out "how do we add tests for non-deterministic APIs," which is a hard problem because part of the API's behavior lives inside a model's judgment. My entire contribution to that insight, preserved in the minutes forever, was typing "oh wow that's true" into IRC.

Somewhere in there I also said the thing I'd been circling for weeks — from a privacy and security perspective, WebMCP is going to be good for the web, because it gives agents a standard way to interact with it rather than computer vision and automated interactions. Kobe was where I realized the room already saw it that way too.

---

## Writing it down

Soon after TPAC, I opened [a pull request](https://github.com/webmachinelearning/webmcp/pull/55) to write down WebMCP's security and privacy considerations based on the discussion. That document has since become the spec's [Security and Privacy Considerations section](https://webmachinelearning.github.io/webmcp/#security-privacy). I also took the lead on answering the W3C's [security and privacy self-review questionnaire](https://w3c.github.io/security-questionnaire/), [which landed in June](https://github.com/webmachinelearning/webmcp/pull/195). To me, this was a way to work through the details of what the API exposes, who can access that information, and what protections we need, rather than leaving those questions as broad concerns.

---

## The design questions I weighed in on

The WebMCP repo has been a lively place for a while now, and I've been in it throughout, weighing in wherever something touched security or privacy, and plenty of times where it didn't. A sample of those arguments, with receipts:

* **What should `consequentialHint` default to?** MCP has hints like `readOnlyHint` and `destructiveHint`. When Johann [proposed a hint for consequential actions](https://github.com/webmachinelearning/webmcp/issues/176), the difference between drafting an email and sending it, I looked at how real MCP tools use annotations today before saying anything. When the hint [became a pull request](https://github.com/webmachinelearning/webmcp/pull/217), my worry on the record was that "it's an easy mistake to read `consequentialHint = false` as 'this is safe,' when it might just mean the web developer forgot to set it." I still argued for defaulting to `false`, because a default of true "will likely dilute what the signal tells the receiver about actual intent." A flag that's on for everything ends up meaning nothing. The decision is parked until origin trial data comes back, which I was [fine with](https://www.w3.org/2026/05/28-webmachinelearning-minutes.html).

* **Should iframes get to declare tools?** For [this one](https://github.com/webmachinelearning/webmcp/issues/57) I wrote up the two use cases hiding inside the feature request: an embedded widget (think a scheduling iframe) exposing its tools to the browser's agent, and a parent page reading the tools of a page it embeds. They have completely different security stories, and [I argued](https://www.w3.org/2026/04/02-webmachinelearning-minutes.html) that if the first use case is all we need, the parent frame never needs to see the child's tools at all. I also pushed for Document Policy over Permission Policy as the opt-in mechanism, since the embedding needs both sides to agree.

* **In-page agents.** When the idea of pages running their own agents came up, the minutes have me saying we were ["trying to solve the problems without good list of use cases for this class of problems."](https://www.w3.org/2026/03/05-webmachinelearning-minutes.html) That's most of what useful security review sounds like in a standards group. You're rarely saying no, you're making sure everyone knows exactly what they're saying yes to.

---

## People are actually using this now

The API is out of the lab, and it moved quickly. Origin trials are live in Chrome 149 and Edge 150, Brave is experimenting with it in Leo, and OpenAI has added WebMCP support to the browser in the ChatGPT desktop app, so ChatGPT and Codex can pick up tools straight off a page without a separate connector. There are real sites behind it too, with Shopify storefronts enabled and companies like Expedia, Instacart and Target trying it out. Firefox and Safari haven't taken positions yet, which is normal for a proposal this young, and worth saying so nobody reads this as a victory lap.

The review machinery is running alongside all of that. The [TAG design review was filed in June](https://github.com/w3ctag/design-reviews/issues/1238) with the questionnaire I wrote attached to it, wide review with the W3C's Security and Privacy groups is underway with a debrief on the community group agenda this month, and internationalization and accessibility reviews are behind that.

Which means the assumptions are meeting reality right now. The trial data will show which bits of the threat model were paranoid and which bits were naive, and with this many people testing it at once, we'll find out sooner than I thought. Some of it will be wrong, and that's fine, because the whole thing was written to be revised.

I said at TPAC that we shouldn't expect WebMCP to solve all the problems, and I still think that. Agents are going to keep doing dumb and dangerous things, and a lot of the burden sits with agent and browser implementers no matter what the spec says. What it changes is the default, which right now is that agents act on sites that can't see them. With this, a site gets to say what it offers, mark what's risky, and ask for a human where it wants one.
