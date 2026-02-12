---
layout: post
title: "I Went Deep Into Tambourine Voice's Code to Understand Why It Feels Different"
date: 2026-02-12 08:00:00 -0500
categories: projects
tags:
    - ai
    - voice
    - dictation
    - code review
    - developer tools
hidden: false
---

I've been spending a lot of time with Tambourine Voice lately. Not just using it — studying it. I wanted to understand why this particular dictation tool feels different from everything else I've tried. So I did what any obsessive person would do: I pulled up the source code and traced every line from microphone input to text output.

Here's what I found.

## The Pipeline: More Than Meets the Ear

When you hit the hotkey and start speaking, your audio travels through a WebRTC connection to a Python server running Pipecat. Standard stuff so far. The audio hits one of eleven supported STT providers — Deepgram, Speechmatics, Whisper running locally, or eight others — and comes out as raw transcription.

But here's where it diverges from every other dictation tool I've used.

That transcription doesn't go straight to your cursor. Instead, it flows through what the codebase calls a "turn controller" — a state machine that tracks whether you're still speaking, waits for voice activity detection to confirm you've stopped, and then drains any late-arriving transcription fragments. It's solving the awkward "when is the user actually done?" problem that plagues real-time transcription.

Then comes the real trick: the text passes through an LLM — Claude, Gemini, GPT, Groq, or even Ollama running locally. Your choice.

## The LLM Isn't a Chatbot — It's a Formatter

This is the insight that makes Tambourine click. The system prompt explicitly tells the model:

> "Do NOT reply conversationally or engage with the content — you are a text processor, not a conversational assistant."

If you dictate "What time is the meeting?" — you get *What time is the meeting?* typed at your cursor. Not an answer. Not a clarification. Just clean, formatted text.

The prompt is modular, built from three sections that get concatenated together:

**Main** handles universal dictation rules. Remove filler words. Add punctuation. Convert "comma" to `,` and "new paragraph" to an actual paragraph break. Fix obvious transcription errors without changing meaning.

**Advanced** handles something I've never seen in other dictation tools: mid-sentence corrections. Say "at 2 actually 3" and it outputs `at 3`. Say "I'll bring cookies scratch that brownies" and it outputs `I'll bring brownies`. It also detects when you're dictating a list ("one... two... three...") and formats it with proper numbering.

**Dictionary** is where domain expertise lives. Phonetic mappings, technical terms, proper nouns. This is the customization layer.

## How It Actually Reaches Your Cursor

One detail I found satisfying: the "types anywhere" trick is a clipboard dance. When the LLM finishes formatting your text, the app saves whatever's currently on your clipboard, swaps in the new text, simulates Ctrl+V (or Cmd+V on Mac), and then quietly restores your original clipboard contents 100 milliseconds later. You never notice. It just appears at your cursor, in whatever app has focus, as if you typed it.

## The Domain Packs Are Where It Gets Interesting

The examples folder contains prompt packs for cardiology, legal contracts, immunology, and Meta advertising. Each one teaches the LLM the vocabulary of a profession.

Looking at the cardiology dictionary, I found entries like:

```
- metoprolol
- Eliquis = Eliquis (apixaban)
- b n p = BNP
- HFrEF = HFrEF (heart failure with reduced ejection fraction)
```

The legal pack italicizes Latin terms (*force majeure*), converts "section symbol" to §, and knows the difference between Lessor and Lessee.

The Meta Ads pack maps "row as" to ROAS, "see pee em" to CPM, and "advantage plus" to Advantage+.

This is solving a real problem. Every STT system I've used mangles technical vocabulary. Tambourine lets you teach it your domain, once, and then it just works.

## What I Think Should Come Next

After tracing through the code, a few gaps feel obvious:

**Memory.** Right now, every session starts fresh. The system doesn't learn that I prefer bullet points over numbered lists, or that I always want "okay" spelled as "OK." The architecture could support this — you'd inject learned preferences into the prompt — but nobody's built it yet.

**Context awareness.** The app doesn't know what application I'm typing into. Dictating a Slack message should feel different from dictating a legal brief. The prompt system is already modular; someone just needs to wire it up to the active window.

**Learning from corrections.** When I edit the output, that's signal. If I consistently change "per se" to "in itself," the system should notice. This feedback loop doesn't exist yet, but it could.

These feel like the obvious next steps. The foundation is there.

## My Personal Experience: Voice Changed How I Work

Here's the thing about Tambourine that surprised me: I actually use it.

There's something delightful about the tambourine-like audio cue when you start recording. It's a small touch, but it makes the tool feel friendly. Not clinical, not enterprise software — just a cute little chime that says "I'm listening."

I find myself reaching for it constantly now. Quick emails. Slack messages. Jotting down notes. Commit messages. The friction of typing feels unnecessary when I can just... talk.

And it's had a spillover effect I didn't expect. Because I'm using voice input more with Tambourine, I've started using voice features everywhere else too. Sending voice messages to friends. Talking to Claude instead of typing. Voice has become a primary input method for me in a way it never was before.

But there's a tradeoff I'm still figuring out.

When I'm speaking, I can't listen to music. And I really like listening to music while I work. So now I'm caught in this weird tension — voice is faster and more expressive, but it costs me my soundtrack. I haven't solved this yet. Maybe I need to batch my voice input into focused sessions. Maybe I need to accept that some tasks are typing tasks and some are speaking tasks.

Voice is a powerful medium. More powerful than I gave it credit for. But it demands your audio channel completely, and that's a bigger deal than I initially realized.

## The Bottom Line

Tambourine Voice is clever in a way that doesn't announce itself. The magic isn't the transcription — it's the post-processing. It treats the LLM as a formatting engine, not a chatbot. It lets you build domain-specific vocabularies. And it types directly at your cursor, in any app, anywhere.

For professionals with dense vocabularies — doctors, lawyers, researchers — this could be genuinely transformative. For the rest of us, it's just a really good dictation tool that makes voice input feel polished instead of janky.

I'm excited to see where it goes next. Memory, context, learning — the roadmap writes itself. Someone just needs to build it.

In the meantime, I'll be here, talking to my computer, trying to figure out when to speak and when to put my headphones back on.
