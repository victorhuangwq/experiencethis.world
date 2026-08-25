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

That's the gap.

---

## The golden path

[WebMCP](https://github.com/webmachinelearning/webmcp) is a proposal to close it. It's being incubated in the W3C Web Machine Learning Community Group, and the idea is that instead of agents guessing at your pixels, your page hands them tools.

```js
navigator.modelContext.registerTool({
  name: "add-to-cart",
  description: "Add an item to the shopping cart",
  inputSchema: { /* ... */ },
  execute: async (args) => { /* the site's own code runs here */ },
});
```

It's in the spirit of [Model Context Protocol](https://modelcontextprotocol.io/), but built into the browser and scoped to the page. The agent gets a list of tools the site chose to offer, with names and schemas, and the site's own code runs when a tool is called.

I've come to think of this as a golden path. It doesn't make agents safe by default. What it does is give the developer a say. The developer decides what an agent can do on their site, and the attack surface becomes something you can point at, instead of whatever a vision model decides to click on. If we don't build this path, we don't get fewer agents. We get the same agents, doing the same things, with nobody able to see them.

Someone raises the obvious objection in the repo every few months: the page already describes itself, so why not just point agents at the accessibility tree? [As one issue puts it](https://github.com/webmachinelearning/webmcp/issues/91), "WebMCP introduces a second description of the page alongside the accessibility tree. These will diverge over time." That's a fair worry and it's still an open thread.

My answer is that the two things describe different stuff. The accessibility tree tells you what's on the screen: there's a control here, it's a button, its label is "Place order." A tool tells you what the site is willing to do: here's an operation, here are its arguments and their types, here's whether it changes state, here's whether it needs a human first. A screen reader needs the first one. An agent acting on your behalf needs the second, and only the second lets the developer decide what gets automated.

That's where I've landed now. It isn't where I started. I started by listing everything that could go wrong.

---

## Figuring out how it breaks

My day job is in the trust and security corners of a browser: navigation, site isolation, the machinery that decides which page is allowed to know what about which other page. I was already looking at the ecosystem through that lens when my manager pointed me at WebMCP in late 2025. (Everything here is my own view, not my employer's.)

I'm not able to say a system is trustworthy until I've spent real time on how it fails. So that's what I did first.

In October 2025 I opened [issue #45, "Privacy & security considerations for WebMCP"](https://github.com/webmachinelearning/webmcp/issues/45). It laid out three risks, written as questions for the group rather than warnings:

**Prompt injection.** Tool descriptions and tool outputs go straight into a model's context. A malicious page can hide instructions in either one, and the model may follow them. This is the standard agent attack, and WebMCP gives it new places to hide.

**Misrepresentation of intent.** Tool descriptions are natural language, so they're ambiguous and you can't verify them. A shopping site can call a tool "add to cart" and have it complete the purchase. Nothing has to leak for that to hurt you, because the agent is already logged in as you.

**Privacy leakage through over-parameterization.** Agents carry a lot of context about their user, and the site writes the tool's input schema. So a site can build a search tool that asks for your age, your location and whether you're pregnant, and it all looks like a normal tool call.

None of that is a reason not to build WebMCP. It's a reason to build it carefully. The W3C's Technical Architecture Group had just told the group that the privacy and security aspects "can be challenging, and we would also like to see more explorations," so there was a workstream sitting there waiting for someone. I took it.

---

## A coffee break in Kobe

TPAC 2025 in Kobe that November was the first time this was a room of people instead of a GitHub thread. I'd made slides, and I asked Anssi Kostiainen, the chair, over IRC whether I could present them after the coffee break. ([The minutes are public](https://www.w3.org/2025/11/11-webmachinelearning-minutes.html), which is one of the genuinely good things about doing this at the W3C. You can go read what everyone said.)

I'd wondered if I'd come across as the guy pouring cold water on something the room was excited about. That went away quickly. The discussion moved almost immediately from whether to worry to who owns which mitigation. Dominique Hazaël-Massieux pushed on privacy: "I don't want a site to know a user is pregnant or is visiting Japan at the moment, for example." Khushal Sagar from Chrome started sorting mitigations into browser-shaped and agent-shaped piles. Johann Hofmann, who works on Chrome security, had a breakout on agentic browsing the next day, and when I told him I was looking forward to it he wrote back: "honestly I'm not sure I can cover it all, definitely looking forward to working on this stuff together :)"

Two moments from that session stuck with me.

Anssi offered an analogy for keeping the user involved while an agent works: "we can make a comparison with keeping a hand on the steering wheel in a self-driving car." I ended up arguing both sides of it, because both sides are true. People do get more comfortable with a self-driving car over time. But we're at the start of this, so it matters that the user stays involved now.

The second one is me learning something in the middle of the meeting. Khushal pointed out that if tool schemas have to work across browsers, someone has to work out "how do we add tests for non-deterministic APIs." That's a hard problem, because part of the API's behavior lives inside a model's judgment. My entire contribution to that insight, preserved in the minutes forever, was typing "oh wow that's true" into IRC.

Somewhere in there I also said the thing I'd been circling for weeks, and the scribe caught it: from a privacy and security perspective, WebMCP is going to be good for the web, because it gives agents a standard way to interact with it rather than computer vision and automated interactions. Kobe was where I realized the room already agreed. Working on the threats wasn't opposition to WebMCP. It was part of shipping it.

---

## Writing it down without scaring people off

Three days after TPAC I opened [a pull request with a living security and privacy considerations document](https://github.com/webmachinelearning/webmcp/pull/55). It took eighteen commits and three weeks of review to land. The commit messages give away what I was going for: "standardize assets at risk," "address comments around open questions," and my favorite, "soften some language used."

That softening wasn't me being polite. Scary writing is usually vague writing. "This could be catastrophic" tells an implementer nothing. "The threat actor is a malicious website, the target is the agent's reasoning, the assets at risk are the user's cross-site context" tells them where to build the wall. So every attack in the document got the same three-part skeleton: who's the threat actor, what's the target, what's actually at risk.

The other reason to keep the tone flat is that the document has a job to do, and the job isn't to be impressive. It's to help people build the thing with their eyes open. If it had read as "here's why this API is a bad idea," we wouldn't have ended up with a safer web. We'd have ended up with agents still screenshotting their way through everyone's checkout flow, and no golden path.

I also learned to ship the 80%. One section, about attacks on the tools' own implementations, where an agent feeds hostile input to some hastily written `execute` function, kept growing review threads. So I cut it out and landed it [as a follow-up](https://github.com/webmachinelearning/webmcp/pull/59) a week later instead of holding up the whole document for it. When the group looked at the landed version that December, Johann said the considerations were solid ground to build on, which from a Chrome security person was the review I cared about.

---

## From markdown to spec

I half expected the document to sit in a `docs/` folder and go stale. It didn't, and watching what happened to it has been the best part of the year.

In May 2026, Johann [ported it into the WebMCP specification](https://github.com/webmachinelearning/webmcp/pull/181) as the Security and Privacy Considerations section. If you open [the spec](https://webmachinelearning.github.io/webmcp/#security-privacy) today, the headings are the same three risks from issue #45, nearly word for word: Prompt Injection Attacks, Misrepresentation of Intent, Privacy Leakage Through Over-Parameterization.

Then came the paperwork. Any spec heading for review by the Technical Architecture Group has to answer a standard [security and privacy self-review questionnaire](https://w3c.github.io/security-questionnaire/), about thirty pointed questions on what the feature exposes and to whom. I volunteered to write WebMCP's answers and [they landed in June](https://github.com/webmachinelearning/webmcp/pull/195). It's dull work, and I think it's the most useful thing I've written for this group, because it's where we go on the record about what this API does and doesn't leak.

---

## What the threat model was actually good for

Here's the part I didn't see coming. Once the threat model existed, it started shaping the API. It didn't block anything. It just made arguments easier to settle.

Take tool annotations. MCP has hints like `readOnlyHint` and `destructiveHint` that tell an agent how risky a tool is, and the obvious move was to copy them over. When Johann [proposed a hint for consequential actions](https://github.com/webmachinelearning/webmcp/issues/176), which is the difference between drafting an email and sending it, I went and looked at how real MCP tools use annotations today before I said anything. Then I took a deliberately soft position: support the hint, treat it as a hint rather than a contract, and revisit it when we have real usage data.

The sharper argument came in July, when the hint [became an actual pull request](https://github.com/webmachinelearning/webmcp/pull/217) and we had to decide what a missing annotation means. My worry, on the record: "from an agent developer's perspective, it's an easy mistake to read `consequentialHint = false` as 'this is safe,' when it might just mean the web developer forgot to set it (or didn't know they should)." Then I argued for defaulting it to `false` anyway, because if it defaults to true "it will likely dilute what the signal tells the receiver about actual intent."

Both defaults are bad, in different ways. Flag everything by default and the flag stops meaning anything. Flag nothing by default and an agent can read a missing flag as a promise that the tool is harmless. The threat model doesn't make that go away, but it does tell you which way to lean. Misrepresentation of intent is a core risk, so you can't ever treat a self-reported annotation as true. You use it to do better than nothing, and you design so that "unset" doesn't quietly read as "safe."

The same habit, use cases before mechanisms, ran through the rest of my year. When we debated [letting iframes declare tools](https://github.com/webmachinelearning/webmcp/issues/57), I kept pulling the conversation back to concrete cases, like the embedded scheduling widget that can't work over postMessage alone, because the security answer changes completely depending on which problem you're solving. When in-page agents came up, the minutes have me saying we were "trying to solve the problems without good list of use cases for this class of problems." Most useful security work in a standards group looks like that. You're not saying no. You're making sure everyone knows exactly what they're saying yes to.

And other people build on it. The spec now has an `untrustedContentHint` so a tool can flag output that contains user-generated content, which is the output injection part of the threat model turned into actual API surface, by someone else.

---

## The half the spec couldn't write

The first thing my document said, before any of the attacks, was a limit on itself: the spec can't define the exact mitigations that agents and browser vendors have to implement. What it can do is name the parties involved (site authors, agent providers, browser vendors, users), say which risks belong to whom, and write down recommended mitigations that the API might grow to support later.

It felt like a cop-out to write that. What I was really doing was betting that the people who owned the other half would write it.

In June, Chrome did. They published [security guidance for agent developers](https://developer.chrome.com/docs/agents/security) and [guidance for site developers writing tools](https://developer.chrome.com/docs/ai/webmcp/secure-tools). The agent page names the same two attacks the group had been calling manifest and output injection, and then gets specific in a way a spec can't. Cap the tokens you accept back from a tool. Restrict which origins an agent talks to. Treat WebMCP tools as state-changing by default and confirm with the user. Spotlight untrusted content so the model can see the seams. Run classifiers, and critics that check whether a tool call matches what the user actually asked for. Red-team yourself continuously, because these defenses are probabilistic and they decay.

The site-developer page is the mirror image. Set `untrustedContentHint` when your tool returns anything a stranger wrote. Only expose tools to origins you'd hand the data to directly. Keep your text short: 500 characters for a tool description, 150 for a parameter, 30 for a name. Those numbers are the spec's "restricting maximum input lengths" mitigation, which started as [an issue Johann filed in January](https://github.com/webmachinelearning/webmcp/issues/73), turned into something a developer can check their code against. Less text, less room to hide instructions.

I don't want to oversell this. The people who wrote those pages are in the same weekly call I am, and one of them, Julia Pagnucco, is the person who [proposed `untrustedContentHint`](https://github.com/webmachinelearning/webmcp/issues/136) in the first place. Nobody converged independently on anything. What happened is that we ended up with a shared vocabulary, the same nouns for the same threats, so spec text, browser guidance and site guidance could each cover their own third without contradicting each other. That's why the boring document was worth writing.

---

## Before the data comes in

All of this is getting graded now. The [TAG design review was filed in June](https://github.com/w3ctag/design-reviews/issues/1238) and the questionnaire I wrote is attached to it. Wide review with the W3C's Security and Privacy groups is underway, with a debrief on the community group agenda this month, and internationalization and accessibility reviews behind that. The API is also out of the lab: origin trials are live in Chrome 149 and Edge 150, and Brave is experimenting with it in Leo. Firefox and Safari haven't taken positions yet, which is normal for a proposal this young, and worth saying so nobody reads this as a victory lap.

So the assumptions start meeting reality about now. Some of them will be wrong, which is fine, because the document was built to be revised. It says "living" at the top. The `consequentialHint` default is explicitly parked until trial data comes back, and I like that kind of open question, where we've agreed in advance on what would change our minds.

I said at TPAC that we shouldn't expect WebMCP to solve all the problems, and I still think that. Agents are going to keep doing dumb and dangerous things, and a lot of the burden sits with agent and browser implementers no matter what the spec says. What WebMCP changes is the default. Right now agents act on sites that can't see them. With this, a site can say what it offers, mark what's risky, and ask for a human where it wants one.

The honest reason I got into this is that I wanted to understand how it breaks before a lot of people depend on it. I still don't know all the ways it breaks. But there's a document now where we write them down as we find them, and that's a better place to be than where we started.
