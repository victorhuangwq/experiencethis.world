---
layout: post
title: "I Wanted WebMCP to Work"
date: 2026-07-25 09:00:00 -0700
categories: projects
tags:
    - web platform
    - standards
    - w3c
    - ai
    - security
    - product
description: "To contribute fixes to a new web standard, I first had to work out what actually needed fixing. Eight months of security and privacy work on WebMCP, and what it taught me about the product job in standards."
---

WebMCP is one of the better ideas I've seen come through the web platform in a while, and I want it to ship.

The pitch is simple. Right now, when an AI agent uses a website on your behalf, it does it from the outside. Either by looking at your screen and guessing — this rectangle is probably the "add to cart" button, that box is probably the quantity field — or by driving the page with an automation framework, clicking selectors written against markup that was never meant to be an API. Both work until the site changes. WebMCP lets a site skip all of that and just say what it can do — here is a function called `add_to_cart`, here is what it takes, here is what happens when you call it. The agent stops guessing, and the developer gets a say in what's on offer, which turns out to matter more than it sounds.

I've spent the last eight months working on the security and privacy side of it in the [W3C's Web Machine Learning Community Group](https://webmachinelearning.github.io/webmcp/). Not because I think it's dangerous. Because I think it's good, and I wanted to help fix the parts that weren't ready yet.

The problem was that when I started, nobody could tell me what those parts were.

---

## You can't fix a problem nobody has written down

When I joined the discussion in the autumn of 2025, the group had a healthy pile of open questions about security and privacy, scattered across issue threads and hallway conversations. Everyone had a rough sense that agents acting on your behalf raised *something*. But there was no single place that said: here is what this system assumes, here is what could go wrong, and here is which of those things WebMCP should handle versus which belong to the agent.

Without that, it's hard to contribute anything. Every proposal turns into a debate about whether the problem it solves is real, because there's no shared reference to check it against. I've watched good features stall that way.

So before proposing anything, I went and did the homework, and filed it as [issue #45](https://github.com/webmachinelearning/webmcp/issues/45).

It starts with assumptions rather than accusations, because that was the part people were talking past each other on: agents inherit your identity and your logged-in sessions, they carry context about you, and they operate across many sites in one session. Not predictions about a scary future. Just the conditions any proposal has to work under.

Then three problems that needed solving:

**Prompt injection.** WebMCP tools are both a route in and a thing to attack. A tool description is text the agent reads and trusts. A tool's return value can contain content the site didn't write — a review, a comment — which the agent also reads.

**Descriptions that don't match behavior.** A tool description is natural language written by the site, and nothing in the stack checks it against the implementation. A site can register `add_to_cart`, describe it as adding to your cart, and have it complete the purchase instead. This one interested me most, not because I expect widespread fraud, but because the far more common case is a well-meaning developer whose description quietly drifts out of sync with what their function actually does.

**Over-parameterization.** Agents carry context about you, and if a tool asks for a generous set of inputs, the agent will helpfully fill them in. Dietary restrictions for a booking, accessibility needs for seat selection. Each field is reasonable. Enough of them together is a personalization feature that has become a fingerprinting one, usually without anyone intending it.

---

## Kobe

I took this to the Community Group's face-to-face at [TPAC in Kobe](https://www.w3.org/2025/11/11-webmachinelearning-minutes.html) in November, as a short deck with worked examples.

It went the way you want this kind of thing to go: people made it better. Dominique Hazaël-Massieux took the over-parameterization case and sharpened it into the version I've used ever since:

> I don't want a site to know a user is pregnant or is visiting Japan at the moment, for example … privacy issue is quite substantial

We were, at that moment, all sitting in Japan. The point being that neither of those facts is a field anyone asks for. They're inferable from combinations of fields that look completely mundane one at a time, which is a better statement of my own argument than the one I'd brought.

The thing I most wanted on the record, though, was the other half of it, and the minutes have that too:

> from a privacy and security perspective, WebMCP is going to be good for the general privacy and security because it provides a standard way to interact with the Web, rather than computer vision and automated interactions

That's the part I'd underline, because the alternative to WebMCP isn't a world where agents leave your bank account alone. Agents are already doing this. Today, through computer use clicking coordinates on a rendered page, or through Playwright and its cousins driving the DOM by selector. The mechanisms differ, but the shape is identical: the site is being operated from the outside, through a surface nobody designed for the purpose, because that's the only door available. Declining to standardize a better one doesn't prevent any of it. It just means it keeps happening in the least inspectable way we could have chosen. Not building a golden path is closing our eyes to what agents are already trying to do.

Building one changes two things that matter.

The first is that the developer gets a say. When something drives a site from the outside, the people who built that site have no involvement in it whatsoever — no way to indicate which flows are meant for an agent and which aren't, no way to tell an agent from a person, no way to participate in the interaction at all. With WebMCP the developer decides what to expose. That's a design decision handed back to the people who know their own application.

The second is that the attack surface becomes finite. Anything driving the UI from outside can do whatever a user could do in that interface, which is to say everything. A set of declared tools is a list — bounded, enumerable, reviewable. You can look at it and reason about the worst case, which is not a sentence anyone can say about a screenshot or a selector script. It's also a thing a browser can put a permission prompt on.

Enumerating the problems and believing in the technology aren't in tension. The enumeration is what lets you argue for it honestly.

---

## Building it so people could add to it

Three days after Kobe I opened [PR #55](https://github.com/webmachinelearning/webmcp/pull/55): a security and privacy considerations document, explicitly a living one.

The design goal was that other people should be able to use it. That meant naming things consistently so proposals could refer to them, and leaving the structure open where the answers weren't in yet. Eighteen commits, most of them wording:

```
initial commit
add toc
standardize assets at risk
refine misalignment types
soften some language used
remove attacks on tool implementation for a separate PR in the future
```

"Standardize assets at risk" is me finding that I'd described what was at stake three different ways in three sections. "Soften some language used" is me rewriting passages that read like an accusation against a specific unnamed shopping site, which is both unfair and, practically, a good way to get a document ignored.

The last one matters more than it looks. Khushal, reviewing, flagged one attack vector as needing more thought. Rather than hold the document while I worked it out, I cut that section, shipped the rest, and brought it back three days later as [its own PR](https://github.com/webmachinelearning/webmcp/pull/59). A document that lands is worth more than a document that's complete.

It merged on December 5th. On the call that week I gave a progress report — "we're 70-80% done identifying the threats" — meaning the map is good enough now, we can start building on it. Eight months on, that estimate has held up, which for a technology this young feels like getting away with something.

The other thing I said on that call is the one I'd defend hardest, because it's the discipline the whole exercise depends on: security and privacy considerations "should not … go into hypothetical territory, wait and see how the adoption will be."

It's easy to write a threat model that is really a list of everything imaginable. Those documents are useless, because when everything is a risk there's no signal about what to build first, and the engineers correctly stop reading. On the same call I argued *against* one of the items on my own list — that input injection might not be a WebMCP concern at all, since a site taking tool input into its own LLM has a problem that exists with or without this API. Being the person who wrote the threat model doesn't mean defending every entry in it. Half the value is in the things you take back off the list.

A detail I like: I wrote the security document for this specification on November 14th, and was formally welcomed as a new participant in the Working Group on December 18th. The work came first. That's usually the order, and it's a good thing about how this group operates.

---

## What it was for

Here's the part that made the whole exercise worth it.

In February, Johann Hofmann wanted to document mitigations. He didn't start a mitigations document — he opened [a PR against mine](https://github.com/webmachinelearning/webmcp/pull/107). A few weeks later, when the group worked out how to flag tool responses containing untrusted user content, that went [into the same file](https://github.com/webmachinelearning/webmcp/pull/137). Proposals arrived for maximum input lengths, for shared prompt-injection evaluation datasets, for annotations that MCP has and WebMCP was missing. Each could point at where on the map it sat, and argue about the fix instead of relitigating whether there was anything to fix.

That's what the document was for. Not a warning. A shared surface to attach solutions to.

I think it worked because it was visibly unfinished. It shipped as a living document, with a section cut out before it even merged, and section 6.3.4 on same-origin boundaries is *still* a TODO in the spec today. A finished document is a monument and people walk around it. An unfinished one is an invitation.

---

## Two fixes

Enumerating problems is only useful if you then go and fix some.

In March, François Beaufort found that `provideContext()` let a script clear and replace tools another script had registered — so a third-party script on a page could stand in the middle of a first-party tool. Reading that thread, the underlying issue looked broader than the one method: unregistration was keyed on a plain string, so any script could remove any tool by name. I [proposed](https://github.com/webmachinelearning/webmcp/issues/129) that registration hand back a teardown handle, so only the code that registered a tool can remove it.

That issue lived twenty-three minutes before being folded into [Dominic's broader design issue](https://github.com/webmachinelearning/webmcp/issues/130), which is the right outcome and still slightly funny to watch happen in real time. `provideContext` is gone from the spec now, and registration takes a signal that scopes a tool's lifetime to whoever created it. The idea got there; my issue number didn't. In a working group those are the same result.

The second was in May, on whether tools should carry a hint marking consequential actions. The instinct was to inherit MCP's naming and call it `destructive`. I argued for a different shape — "reversible is a bigger set, consequential is a subset" — and, more importantly, against copying MCP's design wholesale, on the grounds that "not much consideration was put in the design of MCP hints" and that the two systems have different users:

> In MCP clients, people need to enlist into use of the hints, only then they can be used … We vet websites before use, thus defaults are more important than in MCP

That's the whole argument in one line. MCP hints are opt-in among people who went looking for them. On the web, the field's default is what happens to every developer who never learns it exists. Get it wrong and every unlabelled tool gets treated as dangerous, agents prompt constantly, and users learn to click straight through the prompts — which is worse than not prompting at all. The group [resolved](https://www.w3.org/2026/05/28-webmachinelearning-minutes.html) to specify a consequential hint defaulting to false.

Defaults are the part of an API most developers never see, which is exactly why they determine what it does in practice. Making the safe path the easy path is most of the job.

---

## Ending in paperwork

In May, on a call about getting WebMCP in front of the W3C's horizontal review groups, Johann said the considerations document I'd started was "already pretty solid" and should move into the specification itself. It did, and I sent [a cleanup PR](https://github.com/webmachinelearning/webmcp/pull/194) deleting the original and repointing the links — the least glamorous commit I've ever been pleased with.

Then Dominic pointed out we needed the answers to the W3C's Security and Privacy self-review questionnaire written down somewhere citable. As I said on the call, I'd "looked at the self-review questionnaire while authoring the initial S&P consideration" — it had been the scaffolding for the original document, I'd just never written the answers down where anyone could cite them. So I offered to open the PR. Twenty-two questions about what the specification exposes, what it does with personal data, how it interacts with private browsing. Twenty-six commits, four reviewers, [merged on June 16th](https://github.com/webmachinelearning/webmcp/pull/195).

It unblocked the requests for formal review from the TAG, the Privacy Working Group, and the Security Working Group. Which is the actual ending: not a launch, but the document that lets a much larger group of people start asking harder questions than mine.

---

## The product job

My name is in the acknowledgements of the spec, in a list of twelve, and that's the right weight for it. Brandon, Khushal and Dominic are the editors, and they own the API.

What I've come to think the product job is here: make the problems legible enough that the engineers can solve them. Not by raising alarms — an alarm mostly makes people defensive about a thing they've been building for a year. By writing down the assumptions everyone is arguing past, naming the failure modes so proposals have something to attach to, keeping the document open enough that everyone else fills it in, and doing the unglamorous paperwork when that's what's in the way.

The reason to do any of it is that you want the thing to exist. I'd rather agents interacted with the web through an interface the developer chose and the browser can reason about, than through a screenshot or a selector script that nobody agreed to and nobody can bound. That's a better web than the one we're drifting toward by default, and the fastest route to it was working out what stood in the way.

Section 6 of the spec has my headings in it. Almost none of the text underneath them is mine anymore, and that was the entire point.
