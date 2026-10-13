# Experience This

A Jekyll website with writing, projects, and travel articles organized from Markdown.

## How the theme works

The theme lives in this repository's layouts, includes, and styles. It does not
use a theme gem or `remote_theme`; Hydeout is no longer a dependency. Jekyll and
GitHub Pages still build and host the site.

At build time, Jekyll converts Markdown to HTML, renders Liquid templates, and
compiles Sass to CSS. The resulting static site is written to `_site/`.

| File or directory | Role |
| --- | --- |
| `_layouts/default.html` | Shared page shell: document head, navigation, main content, and footer. |
| `_layouts/index.html` | Homepage introduction, featured articles, and recent writing. |
| `_layouts/page.html`, `_layouts/post.html`, `_layouts/tags.html` | Section/About pages, individual articles, and the tag index. These all inherit the default layout. |
| `_includes/` | Reusable markup for navigation, article listings, metadata, and features. |
| `_data/navigation.yml` | Top navigation labels and links. |
| `_sass/site.scss` | Color and font variables, typography, spacing, and responsive layouts. |
| `assets/css/main.scss` | Imports the site styles; Jekyll compiles it to `/assets/css/main.css`. |
| `_includes/head.html` | Loads the CSS and Manrope from Google Fonts (regular and bold), plus page metadata. |
| `_config.yml` | Site metadata, plugins, project collection, and homepage listing limits. |

The section pages (`writing.html`, `category/projects.html`, and
`category/travel.html`) select and sort content from Markdown metadata. An
article can appear in several sections without duplicating its source. Routine
publishing needs only a Markdown file; edit templates when changing page structure
and `_sass/site.scss` when changing appearance.

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

[AGENTS.md](AGENTS.md) contains coding-agent instructions.
See [LICENSE.md](LICENSE.md) for the repository license.
