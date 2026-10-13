# Product: Experience This

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

An author publishes articles and projects. Readers browse the writing archive,
project list, and travel section.

## Product Purpose

A writing-first website with automatically organized Markdown content. A new
article should appear in the appropriate views without separate manual entries.

## Operating Context

The existing site uses Jekyll, Liquid, Sass, and GitHub Pages. Articles live in
`_posts/`; optional project records without articles live in `_projects/`.
See the [publishing guide](publishing.md) for metadata and
[development guide](README.md) for local setup. Source paths below are relative
to the repository root.

## Capabilities and Constraints

- Writing includes every public article in reverse chronological order.
- Projects combines selected work with automatically ordered additional work;
  Travel filters the same articles without requiring duplicate content.
- Up to three optional homepage features are chosen through article metadata,
  newest first. The latest three other articles follow automatically.
- The wordmark returns home. Primary routes are Writing, Projects, Travel, About.
- Preserve existing article URLs, redirects, and standalone interactive tools.
  Categories and filenames affect existing URLs.
- Drafts must remain unpublished and absent from public listings and feeds.
  `published: false` prevents output; `hidden: true` alone only filters listings.
- Do not require separate manually maintained portfolio entries for articles.
- Publishing and dependency maintenance remain separate from visual design.
- Keep repository documentation limited to architecture, content mechanics,
  maintenance, and design implementation. Use generic examples and preserve
  existing asset credits in published content.

## Product Principles

- Make writing the primary reason to return.
- Publish once in Markdown and let relevant views update automatically.
- Support both substantial projects and small experiments.
- Preserve the continuity of existing links and working tools.
- Keep navigation straightforward and long articles readable.
