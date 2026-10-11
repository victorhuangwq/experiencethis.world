---
layout: post
title: "The agents are already browsing — giving the web a say"
date: 2026-08-17 10:00:00 -0700
last_modified_at: 2026-10-11
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

If you're building an AI agent that uses a browser, you can give it tools to use existing websites without the developers of those websites building anything specifically for your agent.

Those tools can take screenshots and send mouse and keyboard actions. The agent looks at the page, works out where the *Add to cart* button is, clicks there, and takes another screenshot to see what changed. You can also give it access to the page's DOM or accessibility tree, so it doesn't have to work everything out from pixels.

You don't have to wire all of that up yourself. [Playwright's MCP server](https://github.com/microsoft/playwright-mcp) exposes browser automation tools through MCP, so an agent can take screenshots, read an accessibility snapshot, click elements and run JavaScript. The snapshot includes roles, labels and element references like `e21`, which lets the agent find a button and click it by reference.

Whether you build the tooling yourself or use something like Playwright MCP, the agent is still working out how to use an interface built for people. In that setup, the site hasn't provided an agent-facing operation to add an item to the cart, so the agent has to figure out which controls to use.

Sites can try to detect automation, and they can already require confirmation for an action. What is missing is a standard browser API for a page to offer an agent a set of operations, describe what each one does, and indicate which ones need more care.

---

## What's WebMCP all about

[WebMCP](https://github.com/webmachinelearning/webmcp) is a proposal to close that gap, and it didn't come from any one place. Through 2025 several people landed on roughly the same idea separately, and those efforts [converged into a joint Edge and Chrome proposal in August 2025](https://github.com/webmachinelearning/meetings/blob/main/telcons/2025-08-18-cg-minutes.md). It's being incubated in the W3C Web Machine Learning Community Group, and the idea is that instead of agents working out how to operate your page, your page hands them tools.

```js
await document.modelContext.registerTool({
  name: "add-to-cart",
  description: "Add an item to the shopping cart",
  inputSchema: {
    type: "object",
    properties: { productId: { type: "string" } },
    required: ["productId"],
  },
  execute: async ({ productId }) => addToCart(productId),
});
```

Here, `addToCart` is the site's own cart function. The browser handles the tool registration, and the page still does the work.

![An agent calls an add-to-cart tool through the browser, which invokes the website's own cart code in the existing page session](/assets/images/webmcp-tool-flow.svg)
*The site provides the operation, and its own code runs when the agent calls it.*

It's in the spirit of [Model Context Protocol](https://modelcontextprotocol.io/), but built into the browser and scoped to the page. The agent gets a list of tools the site chose to offer, with names and schemas.

I've come to think of this as a golden path, one that doesn't make agents safe by default but does give the developer a say. The developer chooses which operations to expose through WebMCP, so that part of the attack surface becomes something you can point at and review. The security people I've talked to about this keep landing on the same point. Giving agents a defined set of tools to use is a win for security, even though it doesn't stop them from interacting with the rest of the page. If we don't build this path we don't get fewer agents, we get the same agents doing the same things through interfaces that were never meant for them.

An obvious question here is why we need another API when the page already has an accessibility tree. [As one issue puts it](https://github.com/webmachinelearning/webmcp/issues/91):

> WebMCP introduces a second description of the page alongside the accessibility tree. These will diverge over time.

I think that's a reasonable concern, especially if developers have to maintain both.

To me, the useful difference is how the developer describes an action. The accessibility tree can tell an agent that there is a button labeled *Place order*, and the agent can use it to operate the page. With WebMCP, the developer can expose placing an order as an operation, define its inputs, and provide hints about its consequences. The agent doesn't have to work out the sequence of controls to get there. That doesn't replace the accessibility tree or stop an agent from using the ordinary page, but it gives the developer a way to offer an interface specifically for automation.

---

## Figuring out how it breaks

My day job is in the trust and security corners of a browser: navigation, site isolation, content security policies, the machinery that decides which page is allowed to know what about which other page. I was already looking at the ecosystem through that lens when I was asked to review WebMCP in the last quarter of 2025. (Everything here is my own view, not my employer's.)

So I spent quite a bit of time looking at how MCP's security model would translate to the web, and talking it through with security people I trust. WebMCP feels a lot like MCP, and concerns like prompt injection apply to both. But I wanted to work out which assumptions still held once the tools were running inside a browser, and which ones needed a different analysis.

One of the big differences is that the user may already be signed in. If you're on Amazon, for example, the page often already has your account session. A WebMCP tool runs in that page, so calling it can trigger actions using that session. MCP also supports authenticated tools, but WebMCP brings them into a page the user is already using, with the account and permissions they already have there. There's also the [same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy), which keeps different origins isolated. An agent can visit several of those sites and carry information between them, so we have to think about what crosses those boundaries through the agent as well.

So in October 2025 I opened [issue #45](https://github.com/webmachinelearning/webmcp/issues/45) and shared my draft of the privacy and security considerations with the group for discussion. Here are the risks I wrote down:

**Prompt injection.** Tool descriptions and tool outputs go straight into a model's context, so a malicious page can hide instructions in either one and the model may well follow them. It's the standard agent attack, and WebMCP gives it new places to hide.

**Misrepresentation of intent.** A tool description doesn't guarantee what the tool actually does. A shopping site can call a tool *add to cart* and have it complete the purchase. Nothing has to leak for that to hurt you, because the agent is already logged in as you.

**Privacy leakage through over-parameterization.** Agents carry a lot of context about their user, and the site writes the tool's input schema. So a site can build a search tool that asks for your age, your location and whether you're pregnant, and it all looks like a normal tool call.

My thinking was that if this is going to be a real thing, we should build it right. The security analysis would have to happen sooner or later, and doing it early would help us work through the problems while the proposal was still taking shape. Around that time, the W3C's Technical Architecture Group [asked for more exploration of the privacy and security aspects](https://github.com/webmachinelearning/webmcp/issues/35). Since I was already looking at those questions, I volunteered to drive that work.

---

## A coffee break in Kobe

TPAC 2025 in Kobe that November was the first time this was a room of people instead of a GitHub thread. I'd made slides, and I asked Anssi Kostiainen, the chair, over IRC whether I could present them after the coffee break. ([The minutes are public](https://www.w3.org/2025/11/11-webmachinelearning-minutes.html), which is one of the genuinely good things about doing this at the W3C. You can go read what everyone said.)

I'd wondered if I'd come across as the guy pouring cold water on something the room was excited about, and that went away quickly. The discussion moved almost immediately from whether to worry to who owns which mitigation. In the [minutes](https://www.w3.org/2025/11/11-webmachinelearning-minutes.html), Dominique Hazaël-Massieux put the privacy concern this way:

> I don't want a site to know a user is pregnant or is visiting Japan at the moment, for example.

Khushal Sagar from Chrome started separating what the browser could do from what the agent would have to handle. Johann Hofmann, who works on Chrome security, had a breakout on agentic browsing the next day. When I told him I was looking forward to it, he said he wasn't sure he could cover everything, but was looking forward to working on it together.

Two moments from that session stuck with me.

The first was the self-driving car analogy, which came up while we were talking about when an agent should ask the user to step in. When you first start using something like this, you might want to watch every action and check that it did what you expected. It's a bit like wanting to keep a hand on the steering wheel when you don't quite trust the car yet.

But I also argued that this could change over time. As the models get better and people get more comfortable using them, they may not need to be as involved in every action. My point was that we should work out how to keep the user involved at this stage, while leaving room for that relationship to change as the technology improves.

![Two illustrations of a self-driving car with an autonomous route and sensor display: the user watches closely with hands on the wheel at first, then sits back with hands in their lap as confidence grows](/assets/images/webmcp-self-driving-oversight.webp)
*Close supervision at first, then potentially less involvement as the system improves and the user gains confidence. Illustration generated for this post.*

The second one is me learning something in the middle of the meeting. Khushal pointed out the problem of testing non-deterministic behavior. The browser can test that a tool was registered or called, but part of what we're interested in depends on what the agent decides to do. My response in IRC was:

> oh wow that's true

Somewhere in there I also said the thing I'd been circling for weeks — from a privacy and security perspective, WebMCP is going to be good for the web, because it gives agents a standard way to interact with it rather than computer vision and automated interactions. Kobe was where I realized the room already saw it that way too.

---

## Writing it down

Soon after TPAC, I opened [a pull request](https://github.com/webmachinelearning/webmcp/pull/55) to write down WebMCP's security and privacy considerations based on the discussion. That document has since become the spec's [Security and Privacy Considerations section](https://webmachinelearning.github.io/webmcp/#security-privacy). I also took the lead on answering the W3C's [security and privacy self-review questionnaire](https://w3c.github.io/security-questionnaire/), [which landed in June](https://github.com/webmachinelearning/webmcp/pull/195). To me, this was a way to work through the details of what the API exposes, who can access that information, and what protections we need, rather than leaving those questions as broad concerns.

---

## The design questions I weighed in on

The WebMCP repo has been a lively place for a while now, and I've been in it throughout, weighing in wherever something touched security or privacy, and plenty of times where it didn't. Here are a few of the questions I spent time on:

### What should `consequentialHint` default to?

MCP has hints like `readOnlyHint` and `destructiveHint`. When Johann [proposed a hint for consequential actions](https://github.com/webmachinelearning/webmcp/issues/176), such as sending an email rather than drafting one, I looked at how real MCP tools use annotations today before saying anything. In the [pull request discussion](https://github.com/webmachinelearning/webmcp/pull/217#issuecomment-5037104607), my concern was that an agent developer might read `consequentialHint = false` as a guarantee of safety, when the site developer might simply have forgotten to set it.

I still [argued for defaulting to `false`](https://github.com/webmachinelearning/webmcp/pull/217#issuecomment-5082411446). If the flag is on for every tool by default, it doesn't tell the agent much about which actions the developer actually considers consequential. The group [resolved to default it to `false` in May](https://github.com/webmachinelearning/webmcp/issues/176#issuecomment-4566158429), and the spec change [merged in September](https://github.com/webmachinelearning/webmcp/pull/217). The hints describe the developer's intent; they don't prove that a tool is safe.

### Should iframes get to declare tools?

For [this one](https://github.com/webmachinelearning/webmcp/issues/57) I wrote up the two use cases hiding inside the feature request: an embedded widget (think a scheduling iframe) exposing its tools to the browser's agent, and a parent page reading the tools of a page it embeds. They have completely different security stories, and [I argued](https://github.com/webmachinelearning/webmcp/issues/57#issuecomment-4095354463) that if the first use case is all we need, the parent frame never needs to see the child's tools at all. I also [pushed for Document Policy over Permissions Policy](https://github.com/webmachinelearning/webmcp/issues/57) as the opt-in mechanism, since the embedding needs both sides to agree.

### In-page agents

When the idea of pages running their own agents came up, [I wanted us to establish the use cases first](https://www.w3.org/2026/03/05-webmachinelearning-minutes.html). We needed to be clear about what these agents would do before deciding which capabilities to give them.

---

## People are actually using this now

As of October 2026, [Chrome and Edge have origin trials, Brave is experimenting with it in Leo, and ChatGPT Desktop supports WebMCP](https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md). There are real sites behind it too: [Yoav Weiss describes deploying it to Shopify storefronts](https://github.com/w3ctag/design-reviews/issues/1238#issuecomment-5329869437). Browser support is still uneven. [Mozilla's recorded position is neutral](https://github.com/mozilla/standards-positions/issues/1412), and [WebKit opposes the proposal](https://github.com/WebKit/standards-positions/issues/670).

The [TAG design review was filed in June](https://github.com/w3ctag/design-reviews/issues/1238) with the questionnaire I wrote attached to it. The review is still open, and the group's [October agenda](https://github.com/webmachinelearning/meetings/blob/main/telcons/2026-10-01-cg-agenda.md) tracks privacy feedback and preparation for accessibility and internationalization reviews.

The origin trials are a chance to see how these decisions work on actual sites. I expect we'll find things the threat model missed, and things we worried about that turn out to matter less. That's why it needs to keep changing.

I said at TPAC that we shouldn't expect WebMCP to solve all the problems, and I still think that. Agents are going to keep doing dumb and dangerous things, and a lot of the burden sits with agent and browser implementers no matter what the spec says. What it changes is how the site participates. With WebMCP, a site can describe the operations it offers, flag actions that need more care, and build in a confirmation where it wants one.
