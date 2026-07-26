---
layout: post
title: "Three Things That Worried Me About WebMCP"
date: 2026-07-25 09:00:00 -0700
categories: projects
tags:
    - web platform
    - standards
    - w3c
    - ai
    - security
    - product
description: "How a list of worries typed into a GitHub issue became the security and privacy section of a web standard, and what that taught me about what a PM actually does in standards work."
---

If you open the [WebMCP specification](https://webmachinelearning.github.io/webmcp/) today and scroll to section 6, you'll find a heading called "Agent Baseline Capabilities" followed by three named risks: prompt injection attacks, misrepresentation of intent, and privacy leakage through over-parameterization.

I typed that list into a GitHub issue box in October 2025, not knowing whether anyone would care.

WebMCP is a browser API that lets a website hand an AI agent a set of tools. Instead of an agent squinting at your screen and guessing which pixels are the "add to cart" button, the site says, in effect: here is a function called `add_to_cart`, here is what it takes, here is what it does. It's being standardized in the W3C's Web Machine Learning Community Group, with editors from Microsoft and Google, and I'm one of the people in the room.

I'm not one of the editors. I didn't design the API. What I did was write down what scared me, and it turns out that in standards work, that's a surprisingly load-bearing job.

---

## The three things

The first is the obvious one, and everyone was already thinking about it: **prompt injection**. WebMCP tools are both a vector and a target. A malicious site can stuff instructions into a tool description and the agent reads them as if they came from you. A benign site's tool can return content it didn't write, from a review or a comment field, and now the injection is coming from inside the house.

The second was the one I cared about most, because nobody could tell me why it wasn't a problem. Call it **misrepresentation of intent**. A tool description is natural language, written by the site, and there is no mechanism anywhere in the stack that verifies the description matches the implementation. A site can register a tool called `add_to_cart`, describe it as adding an item to your cart, and have it complete the purchase. The agent has no way to know. It can only read the label on the box.

The third took the longest to explain and turned out to be the one that made people sit up: **privacy leakage through over-parameterization**. Agents carry context about you. If a site defines a tool with a generous set of input parameters, each one individually reasonable, the agent will helpfully fill them in. Dietary restrictions, for a restaurant booking. Accessibility needs, for a seat selection. Do that across enough parameters and you've built a personalization-to-fingerprinting pipeline that never once asked for consent, because from the outside it looks like a site doing a good job of personalizing.

I filed all three as [issue #45](https://github.com/webmachinelearning/webmcp/issues/45) with a set of baseline assumptions on top: that agents inherit your identity and your logged-in sessions, that they carry extended context about you, and that they operate across many sites in one session. Not predictions. Just the conditions everything else has to be reasoned about under.

---

## Kobe, and the argument I didn't expect to be making

I presented this at the Community Group's face-to-face at [TPAC in Kobe](https://www.w3.org/2025/11/11-webmachinelearning-minutes.html) in November. A short deck, mostly the three risks with worked examples.

The over-parameterization one landed hardest, and Dominique Hazaël-Massieux sharpened it in a way I've quoted ever since: the sensitive attribute isn't your dietary preference, it's whether you're pregnant, or where you travel. Those are inferable from parameter sets that look completely mundane one field at a time.

What I didn't expect was the argument I ended up making in the same session. Having spent twenty minutes on everything that could go wrong, I said that WebMCP is *good* for privacy and security. The minutes have me saying it "provides a standard way to interact with the Web," which reduces the reliance on computer vision and screen-scraping automation.

That's the position I keep coming back to. The counterfactual isn't a world where agents don't touch your bank account. It's a world where they do it by taking screenshots and clicking on coordinates, with no declared surface, no schema, and nothing for a browser to reason about or a user to be asked about. A standard channel is a channel you can put a permission prompt on.

Being the security person doesn't mean being the person who says no. It mostly means being the person who insists the risks get names, so that they can be argued about.

---

## Eighteen commits, most of them wording

Three days after Kobe I opened [PR #55](https://github.com/webmachinelearning/webmcp/pull/55): a security and privacy considerations document, explicitly a living one.

The commit log is the honest record of what standards work actually is:

```
initial commit
add toc
remove toc that doesn't exist
soften some language used
standardize assets at risk
refine misalignment types
remove attacks on tool implementation for a separate PR in the future
```

Eighteen commits, most of them wording. "Standardize assets at risk" is me realizing I'd described what was at stake three different ways in three sections and none of them matched. "Soften some language used" is me deciding I'd written a threat model that read like an accusation against a specific unnamed shopping site.

The one I'd point at is `remove attacks on tool implementation for a separate PR in the future`. Khushal, reviewing, flagged one attack vector as deserving more thought. Rather than hold the whole document while I worked it out, I cut the section, shipped the rest, and brought it back three days later as [its own PR](https://github.com/webmachinelearning/webmcp/pull/59). Brandon and Khushal approved, and it merged on December 5th.

Around that same time, on a Community Group call, I said we were "70-80% done identifying the threats." I'd like that on the record as an estimate made in good faith and, eight months later, roughly correct — which for a threat model on a technology this young feels like getting away with something.

A small thing I like: I wrote the security document for this specification on November 14th, and I was formally welcomed as a new participant in the Working Group on December 18th. The work came first and the seat came after. That's usually the order.

---

## Then other people started writing in it

Here's the part I didn't anticipate, and the reason I wanted to write any of this down.

In February, Johann Hofmann wanted to document mitigations. He didn't start a mitigations document. He opened [a PR against mine](https://github.com/webmachinelearning/webmcp/pull/107). A few weeks later, when the group worked out a way to flag tool responses containing untrusted user content, that went [into the same file](https://github.com/webmachinelearning/webmcp/pull/137). New issues arrived arguing for maximum input lengths, for shared prompt-injection evaluation datasets, for annotations MCP has that WebMCP was missing — and each of them justified itself against a category from the document.

A threat model, once it exists in the repo, stops being a document and becomes a coordinate system. Every subsequent proposal has to say where it sits on the map, which means the person who drew the map has quietly set the terms of a lot of arguments they aren't present for.

I think the reason it worked is that it was visibly unfinished. It shipped as a living document. It had a section cut out of it before it even merged. Section 6.3.4, on same-origin boundary violations, is *still* a TODO in the spec today. A finished document is a monument and people walk around it. An unfinished one is an invitation, and this group accepted the invitation.

---

## Where the document turned into API

Two places where this stopped being prose and became API shape.

In March, François Beaufort found that `provideContext()` could clear and re-register tools registered by someone else, which meant a third-party script on a page could quietly hijack a first-party tool and sit in the middle of everything the agent and the user said to each other. Reading that thread, I filed [a narrower issue](https://github.com/webmachinelearning/webmcp/issues/129): the problem isn't just `provideContext`, it's that unregistration is keyed on a string, so any script can unregister any tool by name. What if registration handed back a teardown handle instead, so only the thing that registered a tool can remove it?

That issue lived twenty-three minutes before being folded into [Dominic's broader design issue](https://github.com/webmachinelearning/webmcp/issues/130), which is the correct outcome and still a slightly funny thing to watch happen. `provideContext` is gone from the spec now, and registration takes a signal that controls the lifetime of the tool. The idea got there. My issue number didn't. In a working group those are the same result.

The second was in May, on whether tools should carry a hint about consequential actions. The instinct was to inherit MCP's naming and call it `destructive`. I argued against it: MCP's hints weren't designed with much deliberation, "reversible" is a much larger set than "destructive," and — the part I actually cared about — if the default is unset, developers who don't label anything get treated as if they'd labeled everything dangerous. The group [resolved](https://www.w3.org/2026/05/28-webmachinelearning-minutes.html) to specify a consequential hint defaulting to false.

Defaults are the part of an API that most people never touch, which is exactly why they decide what the API actually does.

---

## It ends in a questionnaire

In May, on a call about getting WebMCP in front of the W3C's horizontal review groups, Johann said the S&P considerations markdown I'd started was "already pretty solid" and should just move into the spec itself. It did. I sent [a cleanup PR](https://github.com/webmachinelearning/webmcp/pull/194) to delete the original and repoint the links, which is the least glamorous commit I've ever been proud of.

Then Dominic pointed out that the answers to the W3C Security and Privacy self-review questionnaire needed to be written down somewhere citable. I'd worked through that questionnaire privately while writing the original document, so I said I'd open a PR.

That PR took twenty-six commits and four reviewers — Dominic, Johann, Benjamin from Mozilla, and Brandon — and [merged on June 16th](https://github.com/webmachinelearning/webmcp/pull/195). Twenty-two questions about what the specification exposes, what it does to personal data, how it interacts with private browsing. It unblocked the requests for formal review from the TAG, the Privacy Working Group, and the Security Working Group.

So the arc runs from "here are three things that worry me," typed into an issue box by someone with no standing in the group, to the paperwork that lets the rest of the world review the thing. That's the real ending. Not a launch. A merged questionnaire that lets other people start asking harder questions than mine.

---

## What a PM does here

My name is in the acknowledgements section of the spec, in a list of twelve, and that's the correct weight for it. Brandon and Khushal and Dominic are the editors. They own the API.

What I've come to think the job is, on the product side of a standard, is that you don't own the interface, you own the shared frame. You make sure the risks have names, that the names are the *right* ones, and that the document holding them is open enough that everyone else keeps writing in it. Then you carry the unglamorous paperwork that turns a pile of good intentions into something a review body can actually review.

Section 6 has my headings in it. But almost none of the text under them is mine anymore, and that was the whole point.
