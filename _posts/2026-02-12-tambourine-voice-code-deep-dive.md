---
layout: post
title: "Tambourine Voice: Open Source Dictation That Actually Gets Your Words Right"
date: 2026-02-12 08:00:00 -0500
categories: projects
tags:
    - ai
    - voice
    - dictation
    - open source
    - developer tools
hidden: false
---

I've been dictating a lot recently. Emails, Slack messages, notes, even commit messages. And the tool I keep reaching for is [Tambourine Voice](https://github.com/kstonekuan/tambourine-voice). It's an open source dictation app built by my friend [Kingston Kuan](https://github.com/kstonekuan), and I can't stop using it.

What got me interested wasn't just that it works well (it does), but that it's open source. You can pull up the code, see exactly how it processes your voice, and write your own prompt packs to teach it your vocabulary. That last part is what really hooked me. I went through the source code to understand why it feels so different from every other dictation tool I've tried, and I want to walk through what I found.

## It's not just transcription

Most dictation tools work like this: speech goes in, text comes out. Whatever the speech-to-text engine gives you, that's what you get. Filler words, bad punctuation, mangled technical terms and all.

Tambourine does something different. Your audio goes through a speech-to-text provider (it supports eleven of them, including Deepgram, Speechmatics, and Whisper running locally), but the raw transcription isn't what ends up at your cursor. It passes through an LLM first. Claude, Gemini, GPT, Groq, even Ollama locally. You pick.

Here's the key though. The LLM isn't acting as a chatbot. The system prompt explicitly says:

> "Do NOT reply conversationally or engage with the content. You are a text processor, not a conversational assistant."

So if I dictate "What time is the meeting?" I get *What time is the meeting?* typed at my cursor. Not an answer. Just clean, properly formatted text. It strips filler words, adds punctuation, fixes obvious transcription errors. If I say "comma" it types `,`. If I say "new paragraph" it actually makes a new paragraph.

It even handles mid-sentence corrections. Say "I need to be there at 2 actually 3" and it outputs `I need to be there at 3`. Say "I'll bring cookies scratch that brownies" and it outputs `I'll bring brownies`. That one blew my mind.

The LLM is a formatter, not an assistant. I really like that framing.

## The prompt packs are the whole point

This is the part I think is most interesting, and honestly the reason I wanted to write this post.

The prompt system is modular. There's a main prompt for universal dictation rules, an advanced prompt for things like those mid-sentence corrections I mentioned, and then there's the dictionary layer. The dictionary is where you teach it your domain.

The repo ships with example prompt packs for cardiology, legal contracts, immunology, and Meta advertising. When I first heard "prompt packs" I assumed it was just a glossary of terms. It's not. Each pack teaches the LLM how an entire profession formats its writing.

### Cardiology

The dictionary maps spoken medical shorthand to proper terms, but the main prompt goes further — it knows how to format vitals, medications, lab values, and organize clinical notes into SOAP format (Subjective, Objective, Assessment, Plan).

> **Terminology:** "b n p" → `BNP` / "Eliquis" → `Eliquis (apixaban)`
>
> **Vitals:** "BP 120 over 80" → `BP 120/80 mmHg` / "heart rate 72" → `HR 72 bpm`
>
> **Medications:** "metoprolol 25 milligrams twice daily" → `metoprolol 25 mg BID`
>
> **Lab values:** "troponin 0.04" → `troponin 0.04 ng/mL`
>
> **Error correction:** "better blocker" → `beta blocker`

### Legal

The legal pack is a different world entirely. It enforces Oxford commas, preserves long complex sentences instead of chopping them up, and supports legal numbering styles like (a), (b), (c) and i, ii, iii — because legal precision demands it.

> **Defined terms:** "the agreement" → `the Agreement` / "the company" → `the Company` / "the effective date" → `the Effective Date`
>
> **Latin terms:** automatically italicized — *force majeure*, *mutatis mutandis*
>
> **Numbering:** supports legal styles like (a), (b), (c) and i, ii, iii

### Meta Ads

The Meta Ads pack has a whole section dedicated to numbers, currency, and product naming. It knows how every Meta product name should be capitalized and how spoken metrics map to industry abbreviations.

> **Numbers:** "twenty percent" → `20%` / "ten thousand" → `10,000`
>
> **Product names:** "Advantage plus" → `Advantage+` / "lookalike audience" → `Lookalike Audience`
>
> **Metrics:** "row as" → `ROAS` / "see pee em" → `CPM`

This is what makes the prompt packs more than a spellchecker. Each one encodes how a profession thinks about formatting. A cardiologist and a lawyer both use text, but they format it in completely different ways. The prompt packs capture that.

Every speech-to-text system I've used mangles technical vocabulary. It's the thing that always made dictation feel like a toy for me. Tambourine's answer is: don't fix the STT, fix the output. Let the LLM clean it up, and give it a full set of formatting rules for your domain. You write the pack once, and then it just works.

Because it's open source, anyone can write and share these packs. A radiologist could write one, share it on GitHub, and every other radiologist using Tambourine benefits. That's a really compelling model. The community builds out domain expertise, one prompt pack at a time.

## How it gets text to your cursor

One detail I found fun: the "types anywhere" trick is a clipboard swap. The app saves your current clipboard, puts the formatted text on the clipboard, simulates Ctrl+V (or Cmd+V on Mac), then restores your original clipboard 100 milliseconds later. You don't notice. It just appears wherever your cursor is. I use it in Slack, in VS Code, in email, wherever.

## The open source angle matters

I want to be clear about why the open source part is a big deal to me. Dictation is personal. You're literally speaking your thoughts into a computer. With a closed-source tool, your voice data goes... somewhere. You trust the company. With Tambourine, you can run the STT locally (Whisper), run the LLM locally (Ollama), and keep everything on your machine. Or you can use cloud providers if you prefer the speed. Your choice.

And because it's open source, if it doesn't do something you want, you can just build it. The prompt packs are literally text files. You don't need to be a developer to write one. You just need to know your domain.

## What I'd love to see next

A few things I think would make this even better:

**Memory across sessions.** Right now, every session starts fresh. It doesn't learn that I prefer "OK" over "okay" or that I like bullet points. The architecture could support it, since you'd just inject learned preferences into the prompt. But nobody's built it yet.

**Context awareness.** It doesn't know if I'm typing in Slack or in a legal document. The prompt system is already modular, so wiring it up to the active window feels doable.

**Learning from corrections.** When I edit the output, that's useful signal. If I keep changing "per se" to "in itself," the system should pick that up eventually.

These all feel very buildable. The foundation is there.

## It actually changed how I work

The thing that surprised me is that I actually use this. Every day. There's a tambourine-like audio cue when you start recording, which is a small touch but it makes the tool feel friendly. Not clinical, not enterprise software. Just a cute chime that says "I'm listening."

I find myself reaching for it constantly now. Quick emails, Slack messages, jotting down notes. The friction of typing feels unnecessary when I can just... talk. And it's had a spillover effect I didn't expect. I've started using voice features everywhere. Sending voice messages to friends. Talking to Claude instead of typing.

There's a tradeoff though. When I'm speaking, I can't listen to music. And I really like listening to music while I work. So I'm caught in this weird tension where voice is faster and more expressive, but it costs me my soundtrack. Haven't solved this yet. Maybe some tasks are typing tasks and some are speaking tasks.

## Try it out

If you're a doctor, a lawyer, a researcher, or anyone who's been frustrated by dictation tools mangling your terminology, I think this is worth trying. It's open source, the prompt packs are easy to write, and you can run the whole thing locally if you care about privacy.

And if you write a prompt pack for your field, share it. That's kind of the whole point. [Check it out on GitHub.](https://github.com/kstonekuan/tambourine-voice)
