# Experience This

A Jekyll website with writing, projects, and travel articles organized from Markdown.

## Publishing

Add an article to `_posts/YYYY-MM-DD-title.md`:

```yaml
---
layout: post
title: Article title
date: 2026-01-01 10:00:00 +0000
categories: travel
---
```

Writing includes all published articles. Categories `travel` and `projects`
also include the article in those sections. Dates determine ordering; an optional
`summary` supplies the listing text. Preserve existing filenames and categories
when editing articles because they affect URLs.

- `featured: true` adds a homepage feature. The newest three flagged articles
  appear, with displayed features excluded from the three recent articles.
  Limits are set by `home_feature_limit` and `home_post_limit` in `_config.yml`.
- `selected: true` highlights an entry in Projects. Optional `project_name`,
  `project_summary`, and `project_url` customize its listing.
- `_projects/` contains records for projects without an article, using `title`,
  `date`, `link_only: true`, and `project_url`.
- `published: false` excludes a draft from the site and feed. `_archive/` is
  also excluded. Source in a public repository remains publicly readable.

## Development

Use the Ruby version in `.ruby-version`:

```sh
bundle install
bundle exec jekyll serve
```

Open http://localhost:4000 on that machine. Build with `bundle exec jekyll build`.
Templates are in `_layouts/` and `_includes/`; styles are in `_sass/site.scss`.

[AGENTS.md](AGENTS.md) contains coding-agent instructions.
See [LICENSE.md](LICENSE.md) for the repository license.
