# Coding-agent instructions

- Read [product context](docs/PRODUCT.md), [design reference](docs/DESIGN.md),
  and the [publishing guide](docs/publishing.md) as relevant to the task.
- Keep human documentation in `docs/`; do not create duplicate root product,
  design, or conversation notes. Keep this file limited to working instructions.
- Treat repository files as public. Keep documentation and examples technical
  and generic; do not copy personal background, preferences, private input, or
  conversation history into notes, examples, or PR descriptions.
- Preserve existing article URLs, asset credits, and interactive tools. Post
  categories and filenames affect URLs. Keep content views driven by metadata.
- Use `_sass/site.scss` for site styling; legacy Hydeout styles are inactive.
- Preserve exclusions for drafts, `_archive/`, `docs/`, `README.md`, and
  `AGENTS.md`. Exclusion from the build does not make repository source private.

For changes affecting the site or its configuration, run from the repository root:

```sh
bash _dev/site build
bash _dev/site check
```

Review desktop and mobile output when a change affects the interface. Keep
unrelated local changes out of commits.
