# Experience This

A Jekyll website that automatically organizes Markdown into Writing, Projects, and Travel.

```text
pages/       homepage, sections, about, tags, 404, and redirects
projects/    Pokémon toolkit and TCG game source
_posts/      articles
_archive/    writing excluded from the published site
assets/      shared images, stylesheet, and favicon
```

## Publishing

Add `_posts/YYYY-MM-DD-title.md` with front matter, then write below it:

```yaml
---
layout: post
title: Article title
date: 2026-01-01 10:00:00 +0000
categories: travel
---
```

Writing includes all published articles; `travel` and `projects` categories also place them in those sections. Dates sort entries newest first, and `summary` supplies listing text. Existing filenames and categories affect article URLs.

- `featured: true` puts up to three newest flagged articles on the homepage, excluding them from recent writing. Limits live in `_config.yml`.
- `selected: true` highlights a Projects entry; `project_name`, `project_summary`, and `project_url` customize its listing.
- `projects_per_page` in `_config.yml` sets the number of other projects per page (default: six).
- App pages use `project: true`, a title, an ISO date (e.g. `2026-01-01T10:00:00Z`), and `project_summary` in their front matter. Projects includes them automatically.
- `published: false` hides a draft from the site and feed. Files in a public repository remain readable.

Edit `_sass/site.scss` for appearance, `_layouts/` and `_includes/` for page structure, `_data/navigation.yml` for navigation, and `_config.yml` for site settings. `_includes/head.html` loads Google Fonts. Run with Ruby from `.ruby-version`:

```sh
bundle install
bundle exec jekyll serve
```

Preview at http://localhost:4000 on that machine. Build with `bundle exec jekyll build`.

[Agent instructions](AGENTS.md) · [License](LICENSE.md)
