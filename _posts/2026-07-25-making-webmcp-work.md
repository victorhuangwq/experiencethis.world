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

The pitch is simple. Right now, when an AI agent uses a website on your behalf, it mostly does it by looking at your screen and guessing: this rectangle is probably the "add to cart" button, that box is probably the quantity field. It works until the site changes its layout. WebMCP lets a site skip all of that and just say what it can do — here is a function called `add_to_cart`, here is what it takes, here is what happens when you call it. The agent stops guessing.

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

It went the way you want this kind of thing to go: people made it better. Dominique Hazaël-Massieux took the over-parameterization case and sharpened it in a way I've quoted ever since — the sensitive attribute isn't someone's dietary preference, it's whether they're pregnant, or where they travel. Those are inferable from field combinations that look completely mundane one at a time. That's a better version of my point than the one I brought.

The thing I most wanted on the record, though, was the other half of the argument, and the minutes have it: WebMCP "is going to be good for the general privacy and security because it provides a standard way to interact with the Web."

That's the part I'd underline. The alternative to WebMCP isn't a world where agents leave your bank account alone. It's the world we already have, where they operate by screenshotting your screen and clicking coordinates — no declared surface, no schema, nothing for the browser to reason about and nothing to show the user before something happens. A declared tool is a thing you can put a permission prompt on. A screenshot isn't.

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

It merged on December 5th. On a call that week I said we were "70-80% done identifying the threats" — meant as a progress report, in the sense of: the map is good enough now, we can start building on it. Eight months on, that estimate has held up, which for a technology this young feels like getting away with something.

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

The second was in May, on whether tools should carry a hint marking consequential actions. The instinct was to inherit MCP's naming and call it `destructive`. I argued for a different shape: "reversible" describes a larger and more useful set than "destructive," and — the part I actually cared about — the default decides what happens to the majority of developers who never touch the field at all. Get it wrong and every unlabelled tool from a developer who didn't know the field existed gets treated as dangerous, agents start prompting constantly, and users learn to click straight through the prompts. The group [resolved](https://www.w3.org/2026/05/28-webmachinelearning-minutes.html) to specify a consequential hint defaulting to false.

Defaults are the part of an API most developers never see, which is exactly why they determine what it does in practice. Making the safe path the easy path is most of the job.

---

## Ending in paperwork

In May, on a call about getting WebMCP in front of the W3C's horizontal review groups, Johann said the considerations document I'd started was "already pretty solid" and should move into the specification itself. It did, and I sent [a cleanup PR](https://github.com/webmachinelearning/webmcp/pull/194) deleting the original and repointing the links — the least glamorous commit I've ever been pleased with.

Then Dominic pointed out we needed the answers to the W3C's Security and Privacy self-review questionnaire written down somewhere citable. I'd worked through that questionnaire privately while writing the original document, so I offered to open the PR. Twenty-two questions about what the specification exposes, what it does with personal data, how it interacts with private browsing. Twenty-six commits, four reviewers, [merged on June 16th](https://github.com/webmachinelearning/webmcp/pull/195).

It unblocked the requests for formal review from the TAG, the Privacy Working Group, and the Security Working Group. Which is the actual ending: not a launch, but the document that lets a much larger group of people start asking harder questions than mine.

---

## The product job

My name is in the acknowledgements of the spec, in a list of twelve, and that's the right weight for it. Brandon, Khushal and Dominic are the editors, and they own the API.

What I've come to think the product job is here: make the problems legible enough that the engineers can solve them. Not by raising alarms — an alarm mostly makes people defensive about a thing they've been building for a year. By writing down the assumptions everyone is arguing past, naming the failure modes so proposals have something to attach to, keeping the document open enough that everyone else fills it in, and doing the unglamorous paperwork when that's what's in the way.

The reason to do any of it is that you want the thing to exist. I'd rather agents interacted with the web through a declared, inspectable interface than by squinting at pixels, and the fastest route there was working out what stood in the way.

Section 6 of the spec has my headings in it. Almost none of the text underneath them is mine anymore, and that was the entire point.
