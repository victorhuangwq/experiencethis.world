# Writing and publishing

The homepage and section pages build themselves from Markdown. A new published
post joins Writing automatically, and the latest three appear on the homepage.
Categories also put it in Projects or Travel. Keep existing categories and
filenames when editing old articles: they contribute to the article URL.

## A normal post

Add `_posts/YYYY-MM-DD-your-title.md`, following the existing posts:

```yaml
---
layout: post
title: Your post title
date: 2026-01-20 10:00:00 +0000
categories: projects
---
```

Write the body underneath. Use `travel` for travel recommendations and stories,
`projects` for work or experiments, or another category for other writing.
Writing always includes every published article. The date controls ordering.
An optional `summary` supplies the listing excerpt; otherwise the site uses
`description` or the article's existing excerpt.

## Homepage features

Add `featured: true` to any articles you want to feature. The homepage displays
the newest three flagged posts by their `date`. One gets the larger lead
treatment; up to two more appear in a compact row beneath it, stacking on mobile.
One or two flagged posts work without empty slots. With no flags, the feature
section disappears.

All displayed features are excluded from Latest writing and remain in the full
Writing archive. If more than three posts have the flag, the older flagged posts
stay eligible for ordinary recent writing. Change `home_feature_limit` in
`_config.yml` to 2 if you prefer a maximum of two features.

Optional fields:

```yaml
summary: A short introduction to the article.
aside: A brief annotation.
feature_action: Read the guide
```

The template adds parentheses and red styling to `aside`.
Change `home_post_limit` in `_config.yml` if you
want more than three recent articles.

## Projects

Posts in `categories: projects` join the Projects page automatically. All work
belongs here, including toy projects. Optional fields change the project view
without duplicating the article:

```yaml
project_name: A shorter project name
project_summary: What it does and your contribution.
project_url: https://example.com
project_action: Try the project
project_aside: A short project note.
selected: true
```

Selected entries appear above the remaining projects, which sort by date.
`selected` is optional. For an optional screenshot, use `project_image`, a
descriptive `project_image_alt`, and its intrinsic `project_image_width` and
`project_image_height`.

For a live project without an article, add a Markdown record to `_projects/`:

```yaml
---
title: A project or experiment
date: 2026-01-20 10:00:00 +0000
link_only: true
project_url: /your-tool/
project_summary: A short explanation of what it does.
---
```

These records share the same automatic date ordering. Playable files can remain
in their original directory. Project listings use post metadata and these
Markdown records.

## Drafts

Use `published: false` for a draft. This keeps its page and content out of the
public build and RSS feed. The older `hidden: true` flag alone only controls
listings. `_archive/` is excluded from publishing. Both drafts and archived files
remain readable in a public repository; use private storage for private writing.

For setup and preview commands, see the [development guide](README.md).
Publishing uses the repository’s existing GitHub Pages flow.
