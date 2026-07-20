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
description: "The story of BackToOpener, a Chromium feature that gives the back button back to users in an era where AI chat apps have made new tabs the default."
---

Sometime last year I noticed something I'd been doing multiple times a day without thinking about it. I'd be deep in a conversation with an AI chat, it would link me somewhere, I'd read the page, and then I'd reach for the back button to get back to the chat. And it just wasn't there: greyed out, new tab, no history, nothing to go back to. So I'd close the tab instead. Sometimes the chat was just the next tab over, and closing dropped me right back into it. Other times I'd squint at a tab bar with forty tabs, fail to find the conversation, and just open a fresh chat and start over.

![Animation of the stranded state in Chrome: a recipe page opened from a Claude chat has a greyed-out back button, so the tab has to be closed by hand before hunting for the conversation in the tab bar](/assets/images/backtoopener-before-stranded.gif)
*The status quo. A page opened from a Claude chat, a dead back button, and the walk back through the tab bar by hand.*

For a long time I assumed this was simply how browsers work. It turns out it's how browsers work *so far*.

---

## A decades-old behavior meets a new world

The back button has been disabled in new tabs for as long as tabs have existed. Open a link in a new tab and it starts fresh: no history, nothing to go back to. For most of the web's history, this barely mattered. Search engines like Google opened links in the same tab, so back just worked. You read a result, pressed back, and you were on the results page again. And for the people it did bother, there were workarounds: [extensions](https://microsoftedge.microsoft.com/addons/detail/tab-origin/pjokhhddbfamccemjneocheekkoognbo?hl=en-US) and [add-ons](https://www.ghacks.net/2017/03/01/backtrack-tab-history-add-on-for-firefox/) that tried to bolt on a way back. But nothing default.

Then came the AI chat apps. ChatGPT, Copilot, Google AI Mode, Perplexity: these aren't search results pages. They're long-running conversations. If you click a link and navigate away from the chat, you lose your thread. So they open links in new tabs deliberately, to keep the conversation alive while you read.

Which is totally rational! But the side effect is that users get stranded. You're in a new tab, the back button is useless, and your chat is buried somewhere behind forty other tabs.

This isn't a Bing problem or a ChatGPT problem. It's a browser problem. And it was getting worse as more of the web became context-dependent.

When I started digging into this, I found that Bing had already tried to patch it, years before I touched the problem. There was a workaround: a redirect page that added a fake entry to the new tab's history stack, so pressing back would at least do *something*. It worked, but it added a measurable latency cost to every single navigation, and at search-engine scale that kind of friction adds up. The fix was working against the very engagement it was meant to support.

So the workaround was slow *and* janky. What struck me was that the user problem and the business problem were the same problem viewed from different angles: fix the root cause and you help both.

---

## The first idea, and why it was wrong

My first instinct was a web platform API. Sites would opt in: a signal that says "if a user opens a link from me, give them a back button that returns here." I wrote up [an explainer](https://github.com/MicrosoftEdge/MSEdgeExplainers/blob/main/BackToOpener/explainer.md) proposing exactly that: a site could add `rel="addOpenerToHistory"` to a link (or a `window.open` flag) to opt in. I brought it to [Domenic Denicola](https://github.com/domenic), a web standards engineer at Google based in Tokyo. We'd worked together before and he's someone who gives you honest feedback fast.

His take, [filed in the open on the explainer repo](https://github.com/MicrosoftEdge/MSEdgeExplainers/issues/1068), was that the opt-in was the weak part. The biggest question mark, he wrote, was whether this should be opt-in at all or just applied across the entire browser. My own arguments for why the problem mattered steered him toward applying it everywhere; Chrome for Android already does. And if opt-in was the right call, where were the clear examples of the behavior being confusing or harmful?

My first read of that feedback was opposition, like the idea just hadn't landed. On a second read it was something more specific: right behavior, wrong layer. He wasn't rejecting the feature. He thought the behavior was *good*, good enough that it should just work everywhere, without any site having to ask for it. And the way I came to see it, he was right about the consistency too: an opt-in means the back button behaves differently from site to site, and that per-site inconsistency would itself confuse users more than just turning the behavior on everywhere.

Once that clicked, the next step was obvious. Don't build an API. Build it into Chromium itself. No opt-in needed. The browser detects when a tab was opened from another tab and enables the behavior automatically. (The explainer is now archived with a one-line summary of the pivot: "We are pursuing this feature as a Chromium feature instead of a web platform one.")

I sent a follow-up email making that case, and Domenic connected me with a Chrome engineer who had been thinking about the same thing from their side.

---

## "You're messing with something users know"

The harder sell was actually internal. The back button hasn't meaningfully changed in decades. That's not just a technical fact; it's kind of a social contract. The pushback I got was real: you're changing something people have deeply internalized. What if users click back expecting a normal navigation and their tab just closes?

The counter I kept coming back to: this doesn't take anything away. For users who never want to go back to an opener, the feature is completely invisible to them. For users who *do* want to go back, it's now possible when it wasn't before. It's optionality. And honestly, as a user myself, this is something I genuinely wished I had.

What helped was pulling in evidence. Safari already does this on macOS and iOS. Android's system back button already handles this. And developers in the community had *already* built browser extensions for exactly this gap: [Tab Origin](https://microsoftedge.microsoft.com/addons/detail/tab-origin/pjokhhddbfamccemjneocheekkoognbo?hl=en-US), [Last Tab Back](https://chromewebstore.google.com/detail/last-tab-back/oijipkokfkhgojikimbbcafnbppebnhe?pli=1), and, in legacy Firefox, [BackTrack Tab History](https://www.ghacks.net/2017/03/01/backtrack-tab-history-add-on-for-firefox/). The demand existed, people had shipped workarounds, but nobody had solved it natively in Chromium.

---

## The part that looked easy and wasn't

The core behavior fits in one sentence: press back on a new tab → close the tab → return focus to the tab that opened it. But there was a design question underneath it that opened up a lot of complexity. What happens if the opener tab is already closed by the time you click back?

![A recipe page opened in a new tab from ChatGPT in Edge, with the back button enabled instead of greyed out](/assets/images/backtoopener-back-button-enabled.png)
*The core behavior in Edge. A recipe opened from ChatGPT in a new tab, and the back button, historically greyed out here, is live.*

My first instinct was: just navigate the destination tab to the opener's URL. So even if the original tab is gone, the user lands somewhere familiar. That required prepending an entry to the navigation history stack.

The Chromium engineers pushed back on this pretty hard. Navigation history stacks are append-only, and that's not just a convention. It's an invariant that a lot of browser internals and web developers both rely on. History has a max size (50 entries). Security partitioning, referrer handling, all sorts of other features assume history only ever grows forward. Prepending breaks that assumption in ways that create subtle, hard-to-track bugs all the way down.

So we made the simpler call: if the opener tab is gone, the back button is just disabled. (iOS Safari actually goes a different route here: it navigates to the opener URL and wipes your forward history in the process. We chose the more conservative path.) Domenic had [raised the same principle from the web developer's side](https://github.com/MicrosoftEdge/MSEdgeExplainers/issues/1067): the feature should stay purely user-facing, without touching the session history that pages can observe through JavaScript.

One more detail worth mentioning: when you long-press the back button, it shows your history. The problem is that this new BackToOpener action is different from a regular history item, because it closes the current tab *and* moves you somewhere else. If it looks like a normal entry, users might click it expecting a regular navigation and be surprised when their tab disappears. Safari solves this by labeling the entry as the action it performs rather than disguising it as a normal history item: in current Safari, the entry reads "Close and Return to [opener title]."

![Safari's long-press back button menu on a recipe page opened from ChatGPT, showing "Close and Return to ChatGPT"](/assets/images/backtoopener-safari-close-and-return.png)
*Safari's prior art, today. The long-press menu labels the action instead of faking a history entry.*

We followed that pattern in Edge, where the entry reads "Close and go back to [opener title]." One small label change, but it communicates a lot.

![Edge's long-press back button menu on the same recipe page opened from ChatGPT, showing "Close and go back to ChatGPT" as the top entry](/assets/images/backtoopener-close-and-go-back-dropdown.png)
*The same page, the same menu, in Edge with BackToOpener.*

---

## Closing the loop with Bing and MSN

Shipping the Chromium feature was only half the project for Edge. The old Bing and MSN redirect hacks were still running, and now that the browser handled this natively, they needed to go.

Working with the Bing and MSN teams to remove the hacks was the less glamorous part of this. Aligning timelines, validating coverage, making sure nothing quietly broke. It's the part that doesn't show up in any announcement.

MSN was enthusiastic, and when I dug into why, I understood. Their existing workaround had shipped years ago with a narrow scope and never fully caught up: whole categories of links and surfaces it simply didn't cover.

Bing had a whole list too. Beyond the latency cost, the redirect links were long encoded URLs that added weight to every results page. And whenever a user copied a link from Bing results, they'd paste the redirect URL rather than the actual destination. A small thing, but it happens constantly.

All of it goes away with BackToOpener: one native browser behavior, and years of accumulated workarounds become unnecessary. It's not often that the browser team, the search team, and the content team all want the same change at the same time.

---

## Where it stands

BackToOpener is currently running as an A/B experiment in Edge Stable ([the feature is tracked publicly in Chromium's issue tracker](https://issues.chromium.org/issues/448173940)), so we'll see what the numbers say. The one guardrail I care most about is that new tab launch latency must not regress. The whole point of the feature is smoother navigation, and it would be a bad joke if it slowed down tab creation to get there.

![Animation of BackToOpener in Chrome: a recipe page opened from a Gemini conversation is closed with the back button, returning focus to the chat](/assets/images/backtoopener-in-action.gif)
*The whole loop, this time in Chrome: a page opened from a Gemini chat, one press of back, and you're back in the conversation. Same feature, different browser. That's the point of fixing it in Chromium.*

---

## Before I know how it ends

When coworkers started trying BackToOpener internally, the reaction wasn't "this is nice"; it was closer to "wait, how did this not exist?" Which is the funny thing about it: the feature seems obvious in hindsight, but it sat unbuilt in Chromium for years, because obvious and shipped are very different things.

I work on a browser used by hundreds of millions of people, and most of what I do is too diffuse to point at. If this ships, I'll be able to point at the back button and say: I did that. That's a pretty fun thing to get to say at a party.

The experiment is still running and I'm not counting chickens. That's why I'm writing this down now, before I know how it ends.

