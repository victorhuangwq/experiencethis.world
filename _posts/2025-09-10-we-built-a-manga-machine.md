---
layout: post
title: "We Built a Manga Machine That Actually Works"
date: 2025-09-10 10:00:00 -0700
categories: projects
tags:
    - hackathon
    - ai
    - manga
    - web development
---

Kingston and I are manga fans. We've also been tracking AI image generation tools pretty closely. At the start of this year, you could generate manga panels with AI, but honestly? They kind of sucked. The main issue - character consistency. Your protagonist would look like a completely different person in every panel. Not exactly compelling storytelling.

Then Google announced Gemini 2.5 Flash Image for the [Nano Banana hackathon](https://www.kaggle.com/competitions/banana). We played around with it for like 5 minutes in the chat interface and were like - wait, this might actually work. The character consistency was there. We had 48 hours. Let's build something.

![Story to Manga Machine homepage](/assets/images/story-to-manga-homepage.png)

## The problem with going viral

We knew from the start - if we wanted people to actually use this, it had to be dead simple. The magic had to happen immediately. Nobody's going to sit around for 10 minutes crafting the perfect prompt or tweaking parameters. They want to drop in a story and see manga. That's it.

So we built exactly that - a machine. You paste a story (max 500 words), hit generate, and watch your characters come to life. No signup, no complex settings, just instant gratification.

## Racing against time zones

Here's the fun part - Kingston was in Europe, I was on the West Coast. Nine hour time difference. While I was debugging at midnight in California, Kingston was having his morning coffee ready to take over. We literally passed the baton across continents, keeping development going 24/7.


## The technical quirks that almost broke us

Gemini 2.5 Flash Image has some... interesting behaviors. It doesn't just return an image. It returns text like "Let me generate this picture for you..." then the image, then more text. Not exactly intuitive. We had to loop through responses to extract the actual images.

But the funniest bug? We asked for "Japanese manga style" in our prompts, and suddenly all our speech bubbles were in Japanese. Despite the input stories being in English. We had to explicitly add "output text in English" to fix it. Sometimes AI is too literal.

![Manga panel with Japanese text instead of English](/assets/images/story-to-manga-japanese-text-bug.png)
*When we asked for "Japanese manga style," Gemini took it literally and made all text Japanese*

## What we built in 48 hours

The final product has a pretty sophisticated pipeline under the hood:

1. **Story Analysis** - Gemini reads your story and extracts characters, themes, and narrative structure
2. **Character Reference Generation** - Creates consistent character designs that lock in visual appearance
3. **Panel Layout Planning** - Intelligently breaks your story into sequential panels with dialogue
4. **Panel Generation** - Creates each manga panel while maintaining character consistency

But from the user's perspective? They just see magic happening progressively on their screen.

![Character references generation](/assets/images/story-to-manga-character-refs.png)
*Character references locking in the visual appearance*

![Panels being generated progressively](/assets/images/story-to-manga-panels-progress.png)
*Panels appearing one by one as they're generated*

We also added features we knew people would want:
- State persistence (your work saves automatically)
- Shareable 1200x1200px social media images
- Download individual panels or complete pages
- Both manga and American comic book styles

## The meta moment

My favorite touch? Our sample story. It's literally about Kingston and me frantically building this tool during the hackathon:

> Victor eyed the timer: 01:00:00. "Plenty of time."
> Kingston sighed. "That sentence always ages badly. We need to move."

We wanted to be a little meta. Plus it shows exactly what the tool can do - turn any moment into visual storytelling.

![The generated manga panels from our meta sample story](/assets/images/story-to-manga-meta-panels.png)

## What's next

This is just the beginning. We built this as a stepping stone toward something bigger - a full manga UGC platform where anyone can create and share visual stories. But first, we wanted to nail the core experience: drop a story, get manga that doesn't suck.

The beauty of keeping it simple is that people immediately get it. Write a short story, generate it, share with friends. Get a laugh, tell a story, or just be impressed that AI can finally maintain character consistency across panels.

## Try it yourself

Want to turn your stories into manga? Check out the Story to Manga Machine at [app.storytomanga.com](https://app.storytomanga.com). 

Drop in any story under 500 words - that embarrassing moment from last week, a wild dream you had, or just make something up. The machine doesn't judge. It just makes manga.

And honestly? It just works.