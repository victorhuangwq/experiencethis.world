---
layout: post
title: "The Back Button That Wasn't There"
date: 2026-03-01 10:00:00 -0700
categories: projects
tags:
    - chromium
    - browser
    - edge
    - product
    - web platform
hidden: true
description: "The story of BackToOpener — a Chromium feature that gives the back button back to users in an era where AI chat apps have made new tabs the default."
---

You're deep in a conversation with an AI. It finds something useful and links you to it. You open the link. You read it. You're done — and you want to go back to the chat.

You reach for the back button.

It's grey. Disabled. The new tab has no history, so there's nothing to go back to.

You scan the tab bar. Somewhere in those forty tabs is the conversation you were having. You either spend the next thirty seconds hunting for it, or you give up and open a fresh chat and start over.

I've been that person. And for a long time, I just assumed this was how browsers worked.

---

## A 20-year-old behavior meets a new world

The back button has worked the same way since browsers were invented. When you open a link in a new tab, that tab starts fresh — no history, back disabled. For most of the web's history, this barely mattered. Search engines like Google opened links in the same tab, so back just worked. You read a result, pressed back, and you were on the results page again.

That changed with AI chat. ChatGPT, Copilot, Google AI Mode, Perplexity — these aren't search results pages. They're long-running conversations. If you click a link and navigate away from the chat, you lose your thread. So they open links in new tabs deliberately, to keep the conversation alive while you read.

Which is totally rational! But the side effect is that users get stranded. You're in a new tab, the back button is useless, and your chat is buried somewhere behind forty other tabs.

This isn't a Bing problem or a ChatGPT problem. It's a browser problem. And it was getting worse as more of the web became context-dependent.

When I started digging into this, I found that Bing had already tried to patch it — years before I touched the problem. There was a workaround: a redirect page that added a fake entry to the new tab's history stack, so pressing back would at least do *something*. It worked, but it cost around 100ms on every single navigation. That might sound small, but at search engine scale it's not: navigation slowdown directly correlates with engagement drop. Users who hit friction open fewer links. The fix was actively hurting the metric it was designed to support.

So the workaround was slow *and* janky. And here's the thing — the user problem and the business problem were actually the same problem, just viewed from different angles. Fix the root cause and you help both.

---

## The first idea, and why it was wrong

My first instinct was a web platform API. Sites would opt in — a signal that says "if a user opens a link from me, give them a back button that returns here." I put together a proposal and brought it to Dominic Denicola, a web standards engineer at Google based in Tokyo. We'd worked together before and he's someone who gives you honest feedback fast.

His take: this feels inconsistent. If returning to the opener is useful, why should it only work on sites that remembered to opt in? The user's experience shouldn't depend on whether a developer added an attribute.

Honestly, I misread that feedback at first. I thought it meant he wasn't interested in the feature at all — like it just didn't land. I sat with that for a bit. But when I went back and thought about it more carefully, I realized I'd gotten it backwards. He wasn't rejecting the idea. He was rejecting the API approach. He actually thought the behavior was *good* — good enough that it should just work everywhere, without any site having to ask for it.

Once that clicked, the next step was obvious. Don't build an API. Build it into Chromium itself. No opt-in needed. The browser detects when a tab was opened from another tab and enables the behavior automatically.

I sent a follow-up email making that case. Dominic connected me with a Chrome engineer who had been thinking about the same thing from their side. Suddenly the proposal had legs on both ends.

---

## "You're messing with something users know"

The harder sell was actually internal. The back button hasn't changed in fifteen years. That's not just a technical fact — it's kind of a social contract. The pushback I got was real: you're changing something people have deeply internalized. What if users click back expecting a normal navigation and their tab just... closes?

The counter I kept coming back to: this doesn't take anything away. For users who never want to go back to an opener, the feature is completely invisible to them. For users who *do* want to go back, it's now possible when it wasn't before. It's optionality. And honestly — as a user myself, this is something I genuinely wished I had.

What helped was pulling in evidence. Safari already does this on macOS and iOS. Android's system back button already handles this. And developers in the community had *already* built browser extensions for exactly this gap — Tab Origin, Last Tab Back, BackTrack Tab History. The demand existed. People had shipped workarounds. Nobody had just... solved it natively in Chromium.

---

## The part that looked easy and wasn't

The core behavior fits in one sentence: press back on a new tab → close the tab → return focus to the tab that opened it. Sounds simple.

But there was a design question underneath it that opened up a lot of complexity. What happens if the opener tab is already closed by the time you click back?

My first instinct was: just navigate the destination tab to the opener's URL. So even if the original tab is gone, the user lands somewhere familiar. That required prepending an entry to the navigation history stack.

The Chromium engineers pushed back on this pretty hard. Navigation history stacks are append-only — that's not just a convention, it's an invariant that a lot of browser internals and web developers both rely on. History has a max size (50 entries). Security partitioning, referrer handling, all sorts of other features assume history only ever grows forward. Prepending breaks that assumption in ways that create subtle, hard-to-track bugs all the way down.

So we made the simpler call: if the opener tab is gone, the back button is just disabled. A clean no, rather than a clever-but-risky workaround. (iOS Safari actually goes a different route here — it navigates to the opener URL and wipes your forward history in the process. We chose the more conservative path.)

One more detail worth mentioning: when you long-press the back button, it shows your history. The problem is that this new BackToOpener action is different from a regular history item — it closes the current tab *and* moves you somewhere else. If it looks like a normal entry, users might click it expecting a regular navigation and be surprised when their tab disappears. Safari's solution is to label it explicitly: "Close and return to [page title]." We followed the same pattern. One small label change, but it communicates a lot.

*[Screenshot placeholder: Long-press back button dropdown showing "Close and return to [Opener Title]" at the top of the list]*

*[Screenshot placeholder: Back button enabled on a new tab opened from Bing or an AI chat]*

---

## Closing the loop with Bing and MSN

Shipping the Chromium feature was only half the project for Edge. The old Bing and MSN redirect hacks were still running — and now that the browser handled this natively, they needed to go.

Working with the Bing and MSN teams to remove the hacks was the less glamorous part of this. Aligning timelines, validating coverage, making sure nothing quietly broke. The part that doesn't show up in any announcement.

MSN was enthusiastic — and honestly, when I dug into why, I understood. Their existing hack only covered normal content links. Not sponsored links. And ads, of all things, are exactly the kind of link a user is most likely to want to go back from. The workaround also only applied to the MSN New Tab Page feed, not MSN.com itself. It had shipped years ago with a narrow scope and never fully caught up.

Bing had a whole list. Beyond the 100ms penalty, the redirect links were bloating the search results page — each link a long encoded URL with extra metadata baked in, adding weight to the DOM on every single page load. And whenever a user copied a link from Bing results, they'd paste the redirect URL rather than the actual destination. A small thing, but it happens constantly.

All of it goes away with BackToOpener. One native browser behavior, and years of accumulated workarounds become unnecessary. That alignment — browser team, search team, content team, all moving the same direction at once — felt like what platform work is supposed to feel like.

*[Screenshot placeholder: MSN or Bing page open in a new tab, back button enabled with BackToOpener]*

---

## Where it stands

BackToOpener is currently live as an A/B test in Chromium. Real users, real behavior, real data. We'll see what the numbers say.

One guardrail I care a lot about: new tab launch latency must not regress. The whole point of this feature is to make navigation smoother — if it added slowdown anywhere in the tab creation flow, it would undercut everything. That's non-negotiable.

*[Screenshot placeholder: BackToOpener in action — back button clicked on a new tab, tab closes, original tab comes into focus]*

---

## The obvious feature nobody built

When my coworkers first started trying BackToOpener internally, the reaction I got wasn't "this is nice." It was more like — "wait. I can't believe this didn't exist before. I can't imagine using a browser without this now."

That's the feeling I keep coming back to.

The feature feels obvious in hindsight. Once you have it, it seems like it should've always been there. But it wasn't — not in Chromium, not for years. And if it was so obvious, why not?

Because obvious and easy to ship are two completely different things. Getting here meant recognizing this was solvable at the browser platform level (not just a product-side patch), pitching it across companies, pushing back on fifteen years of "don't touch the back button," designing edge cases carefully enough not to break things for the people who don't want it — and doing all of that while the feature stays invisible to anyone who never clicks it.

The distance between obvious and done is exactly where product craft lives.

And what I like about this one is that there's no tension between who benefits. Users get back to where they were in one click. Web owners get users who are more likely to return and engage. Bing and MSN get to rip out infrastructure that was costing them every single page load. A single behavior change, and all three things get better together. That's a rare thing.

I work on a browser used by hundreds of millions of people. Most of what I do is too diffuse to ever point at directly. But someday, if this ships, I'll be able to point at the back button and say: I did that. That's a pretty fun thing to be able to say at a party.

The experiment is still running. I'm not counting chickens. But I really hope it lands.

That's what I'm writing this down for — before I know how it ends.
