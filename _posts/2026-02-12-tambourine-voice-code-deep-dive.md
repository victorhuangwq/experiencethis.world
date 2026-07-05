---
layout: post
title: "Why I've been dictating everything lately"
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

I've been dictating a lot recently — emails, Slack messages, notes, even commit messages. The tool behind this is [Tambourine Voice](https://github.com/kstonekuan/tambourine-voice), an open source dictation app my friend [Kingston Kuan](https://github.com/kstonekuan) started. I've contributed a few small fixes here and there, but mostly I'm the resident power user.

I didn't expect it to stick. Dictation always felt like a toy to me, because every speech-to-text tool I'd tried would mangle technical vocabulary and leave me with a mess to clean up afterwards. Tambourine is the first one where I don't immediately reach back for the keyboard, and the reason turns out to be one architectural choice.

## The LLM is a formatter, not an assistant

Most dictation tools work like this: speech goes in, text comes out. Whatever the speech-to-text engine gives you, that's what you get — filler words, bad punctuation, mangled terms and all.

Tambourine puts an LLM between the transcription and your cursor. Your audio goes through a speech-to-text provider first (Whisper running locally, or a cloud provider like Deepgram), but that raw transcript isn't what gets typed. It passes through an LLM whose system prompt is very clear about its job:

> "Do NOT reply conversationally or engage with the content. You are a text processor, not a conversational assistant."

So if I dictate "What time is the meeting?" I get *What time is the meeting?* typed at my cursor — not an answer. It strips filler words, adds punctuation, fixes obvious transcription errors. If I say "comma" it types `,`; if I say "new paragraph" it makes one. The demos in the repo show it handling mid-sentence corrections too — "I'll bring cookies scratch that brownies" comes out as `I'll bring brownies`.

The LLM is a formatter, not an assistant. I really like that framing: it's why the output needs so little cleanup, without the tool ever trying to be clever about what you meant to *say*.

## Teaching it your vocabulary

The part I find most interesting is the prompt system. It's modular — universal dictation rules, an advanced layer for things like those mid-sentence corrections, and then a dictionary layer where you teach it your domain.

The repo ships with example prompt packs for cardiology, legal contracts, immunology, and Meta advertising, and they go well beyond glossaries. The cardiology pack knows that "BP 120 over 80" should come out as `BP 120/80 mmHg` and how to organize clinical notes into SOAP format. The legal pack capitalizes defined terms ("the agreement" → `the Agreement`), enforces Oxford commas, and keeps long sentences intact instead of chopping them up. The Meta Ads pack knows "row as" means `ROAS`.

In other words, each pack encodes how a profession *formats* its writing, not just what words it uses. A cardiologist and a lawyer both produce text, but they format it in completely different ways, and that turns out to be the thing that makes dictation actually usable for real work. The packs are just text files, so anyone who knows their domain can write one and share it — you don't need to be a developer.

## The clipboard trick

One detail I found fun: the "types anywhere" trick is a clipboard swap. The app saves your current clipboard, puts the formatted text on the clipboard, simulates Ctrl+V (or Cmd+V on Mac), then restores your original clipboard 100 milliseconds later. You don't notice. It just appears wherever your cursor is. I use it in Slack, in VS Code, in email, wherever.

## Running it privately

Dictation is personal — you're speaking your thoughts into a computer — and with a closed-source tool you're trusting the company with where that audio goes. With Tambourine you can run the speech-to-text locally (Whisper) and the LLM locally (Ollama) and keep everything on your machine, or use cloud providers if you'd rather have the speed. I go back and forth myself.

## What I'd love to see next

**Memory across sessions.** It doesn't learn that I prefer "OK" over "okay." You'd just inject learned preferences into the prompt, but nobody's built it yet.

**Context awareness.** It doesn't know if I'm typing in Slack or in a legal document. The prompt system is already modular, so wiring it up to the active window feels doable.

**Learning from corrections.** If I keep changing "per se" to "in itself" after the fact, that's signal the system should eventually pick up.

## The costs

The thing that surprised me is that I actually use this every day. There's a tambourine-like chime when you start recording — a small touch, but it makes the tool feel friendly rather than clinical. And it's had a spillover effect I didn't expect: I've started using voice everywhere, sending voice messages to friends, talking to Claude instead of typing.

But it's not free. For one, talking to a computer all day is kind of tiring — in a way typing isn't. Speaking takes a low-level effort that I never noticed until I was doing it for every email. And when I'm dictating, I can't listen to music, and I really like listening to music while I work.

So right now I've landed on: some tasks are typing tasks, some are speaking tasks. Ask me in six months whether the split held.
