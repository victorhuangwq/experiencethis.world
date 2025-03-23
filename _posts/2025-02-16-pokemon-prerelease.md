---
layout: post
title: "Pokemon Prerelease Event built with LLMs"
date: 2025-02-16 14:30:00 -0700
categories: projects
tags:
    - pokemon
    - ai
    - web development
---

I recently hosted a Pokemon TCG prerelease event for my friends, most of whom were new to the card game. In typical developer fashion, I over-engineered the solution by building a small website instead of just using a phone timer and printed rules.

As the Pokemon enthusiast in my group, I wanted to introduce everyone to the Brilliant Stars set and make it as easy as possible for newcomers to learn. To create a fun and engaging experience, I built a mini-site featuring a retro-styled landing page, a tournament timer, and a handy rules reference—all developed with the help of AI coding tools.

## Using AI as my development partner

I tested several AI coding tools for this project. My process was pretty straightforward:

1. Wrote a detailed prompt describing what I wanted
2. Refined it using ChatGPT to clarify requirements
3. Used Copilot Edit to generate the initial code
4. Iterated multiple times to match my vision

## What I ended up with

The site had three main components:

### 1. A retro-styled home page

Simple landing page with event info and an ASCII art Pikachu that captured the nostalgic vibe I wanted.

### 2. A tournament timer

A dual-player timer that:
- Tracked 30-minute match time
- Kept track of each player's 2-minute turn
- Entered "extra turns" mode when time ran out
- Had a clever UI with the top player's controls rotated 180° for face-to-face play

It worked great on mobile, though we used it less than expected during the event.

### 3. A rules reference

This became the most valuable part - a clean reference with all essentials:
- Game setup
- Turn structure
- Win conditions
- Status conditions
- Tournament procedures

The AI even added emoji icons to make scanning easier. This was most used by my friends to be honest.

## How the event actually went

The Brilliant Stars Set was a hit, with several friends pulling illustration rares from just eight packs each. The Lucario starter deck dominated our tournament, and I learned that the pre-constructed starters influenced strategy more than the booster packs.

The website proved most valuable as a reference document. I displayed it on my laptop connected to a TV while explaining deck building, and everyone referenced it during matches.

By the end, even newcomers were discussing type advantages and energy acceleration strategies - definitely the most rewarding part.

## My takeaways about LLM-assisted development

A few key takeaways:

1. **Natural language programming works** – describing what I wanted and getting working code was genuinely useful. I was surprised at how well it worked.

2. **Initial prompts matter** – they significantly influence the overall design, making major changes difficult later.

3. **AI handles boilerplate beautifully** – CSS layouts, responsive design, and basic interactivity were no problem.

4. **Visual design needs specific guidance** – AI tools aren't quite there yet for polished design without detailed prompts.

5. **Human oversight is essential** – I still needed to review content for accuracy.

I've shared this with friends who run Pokemon leagues, and they're interested in using it for their events. Might add features like a pack simulator and tournament brackets in the future.

If you're interested, check out the mini-site [here](/pokemon) (feel free to use it for your own events!)