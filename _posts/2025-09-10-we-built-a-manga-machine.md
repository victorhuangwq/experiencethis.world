---
layout: post
title: "Building a Manga Machine in 48 Hours"
date: 2025-09-10 10:00:00 -0700
categories: projects
tags:
    - hackathon
    - ai
    - manga
    - web development
---

Kingston and I are manga fans, and we'd been following AI image generation pretty closely. At the start of this year you could already generate manga panels with AI, but character consistency was the dealbreaker — your protagonist would look like a different person in every panel, which makes storytelling impossible.

Then Google announced Gemini 2.5 Flash Image for the [Nano Banana hackathon](https://www.kaggle.com/competitions/banana). We played with it for about five minutes in the chat interface and the character consistency seemed to actually be there. We had 48 hours, so we built something.

![Story to Manga Machine homepage](/assets/images/story-to-manga-homepage.png)

## Keeping it simple

We knew from the start that if we wanted people to actually use this, it had to be dead simple. Nobody's going to sit around for 10 minutes crafting the perfect prompt or tweaking parameters — they want to drop in a story and see manga. So we built exactly that: a machine. You paste a story (max 500 words), hit generate, and watch your characters come to life.

## Racing against time zones

Kingston was in Europe, I was on the West Coast — a nine hour time difference. While I was debugging at midnight in California, Kingston was having his morning coffee, ready to take over. We passed the baton across continents and kept development going more or less around the clock.

## The technical quirks that almost broke us

Gemini 2.5 Flash Image has some interesting behaviors. It doesn't just return an image — it returns text like "Let me generate this picture for you...", then the image, then more text. We had to loop through responses to extract the actual images.

The funniest bug: we asked for "Japanese manga style" in our prompts, and suddenly all our speech bubbles were in Japanese, despite the input stories being in English. We had to explicitly add "output text in English" to fix it. Sometimes AI is too literal.

![Manga panel with Japanese text instead of English](/assets/images/story-to-manga-japanese-text-bug.png)
*When we asked for "Japanese manga style," Gemini took it literally and made all text Japanese*

## What we built in 48 hours

The final product has a four-stage pipeline under the hood:

1. **Story Analysis** - Gemini reads your story and extracts characters, themes, and narrative structure
2. **Character Reference Generation** - creates consistent character designs that lock in visual appearance
3. **Panel Layout Planning** - breaks your story into sequential panels with dialogue
4. **Panel Generation** - creates each manga panel while maintaining character consistency

From the user's side, the panels just appear one by one on screen as they're generated.

![Character references generation](/assets/images/story-to-manga-character-refs.png)
*Character references locking in the visual appearance*

![Panels being generated progressively](/assets/images/story-to-manga-panels-progress.png)
*Panels appearing one by one as they're generated*

We also spent some of the 48 hours on things that weren't strictly the generator: your work saves automatically, you can download individual panels or complete pages, there's a 1200x1200px export for sharing, and there's an American comic book style alongside manga. Some of that was us imagining what we'd want ourselves; some of it was honestly just hackathon-judging instinct.

## The meta moment

Our sample story is literally about Kingston and me frantically building this tool during the hackathon:

> Victor eyed the timer: 01:00:00. "Plenty of time."
> Kingston sighed. "That sentence always ages badly. We need to move."

We wanted to be a little meta, and it shows exactly what the tool can do — turn any moment into visual storytelling.

![The generated manga panels from our meta sample story](/assets/images/story-to-manga-meta-panels.png)

If you want to try it, it's at [app.storytomanga.com](https://app.storytomanga.com) — paste in any story under 500 words (feel free to use that embarrassing thing from last week). It's still hackathon code, so be kind to it.
