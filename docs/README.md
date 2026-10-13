# Development

Site documentation:
[publishing](publishing.md), [design](DESIGN.md), and [product context](PRODUCT.md).
All source paths and commands below refer to the repository root.

## Run locally

Docker must be running and accessible through `/var/run/docker.sock`. The helper
uses Ruby 2.7.5 from `.ruby-version` and pins Bundler 2.4.22. The site uses Jekyll
3.9.5 with GitHub Pages.

```sh
bash _dev/site setup  # Install dependencies; repeat if Gemfile changes
bash _dev/site serve  # Preview with automatic rebuilds and live reload
bash _dev/site build  # Build the complete site
bash _dev/site check  # Validate content ordering, features, drafts, and links
```

Open http://localhost:4000 on the machine running Docker. Cloud localhost belongs
to the cloud machine; opening it on your computer or phone requires a supported
connection or separately hosted preview. Stop the server with Ctrl+C. Ports 4000
and 35729 bind to loopback.

Dependencies live in ignored `vendor/`; generated pages go to ignored `_site/`.
Development mode disables production analytics. Documentation is excluded from
publishing in `_config.yml`.

## Source map

- `_layouts/index.html`: homepage feature selection and recent writing.
- `_includes/`: shared navigation, head, footer, and article fragments.
- `_sass/site.scss`: palette, typography, components, and responsive rules.
- `assets/css/main.scss`: imports the site stylesheet.
- `assets/fonts/`: self-hosted Manrope 400/700 and its license.
- `_data/navigation.yml`: primary navigation.
- `writing.html` and `category/`: automatic Writing, Projects, and Travel views.
- `_posts/`, `_projects/`, and `about.md`: published content and project records.

Manrope is served with the site. Legacy Hydeout files are not the active
stylesheet. `.impeccable/design.json` holds machine-readable design metadata;
the corresponding reference is [DESIGN.md](DESIGN.md).

## Validation

Run `build` before `check`. The checker validates chronology, feature selection,
recent-writing exclusion, draft/archive/documentation exclusion, legacy redirects,
and local links/assets. Browser review should cover desktop and mobile, keyboard
navigation, article readability, and article filters when affected.

The homepage supports `home_feature_limit` featured articles (default 3); only
displayed features are excluded from recent writing. See the [publishing guide](publishing.md)
for the metadata. PR homepage screenshots are kept in `.github/previews/`.

## Repository documentation

The guides describe publishing, development, and design implementation.
[AGENTS.md](../AGENTS.md) contains coding-agent instructions. This repository is
public; excluding documentation from the website build does not make its source
private.
