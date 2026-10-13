---
name: Experience This
description: A readable, flat interface with warm text and restrained red accents.
colors:
  paper: "#fffdfc"
  ink: "#422b25"
  muted: "#72594d"
  accent: "#ae2524"
  secondary: "#6c482b"
  line: "#e4d9d1"
  code-paper: "#f9efec"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "38px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "25px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-.025em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-.02em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.8
  article:
    fontFamily: "Manrope, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.9
  aside:
    fontFamily: "Manrope, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.7
  metadata:
    fontFamily: "Manrope, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  inline-code: "3px"
spacing:
  row-gap: "16px"
  row-block: "22px"
  section-rule-bottom: "13px"
  paragraph-bottom: "17px"
components:
  red-aside:
    textColor: "{colors.accent}"
    typography: "{typography.aside}"
  text-link:
    textColor: "{colors.accent}"
  article-row:
    padding: "22px 0"
  feature:
    textColor: "{colors.ink}"
  search-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "10px 12px"
    width: "100%"
  navigation-link:
    textColor: "{colors.ink}"
    padding: "4px 0"
  navigation-link-current:
    textColor: "{colors.accent}"
  food-order:
    padding: "19px 0"
---

# Design System: Experience This

## Overview

**Creative North Star: "Quiet & grounded"**

The interface uses near-white paper, warm dark text, and restrained red accents.
Manrope carries headings and body copy. Spacing, fine rules, and short annotations
establish hierarchy without decorative containers.

This document records the implemented system in `_sass/site.scss`. Source paths
are relative to the repository root. Keep the reference aligned with that
stylesheet when changing the design.

**Key Characteristics:**
- One quiet sans-serif voice for headings and reading.
- Flat paper surfaces, open features, and selective fine rules.
- Red links and brief annotations, with clear keyboard focus.
- Compact chronological indexes and comfortable article rhythm.

## Colors

Red & espresso combines a near-white surface with warm brown text and a deep
red accent. Frontmatter values match the CSS custom properties in `:root`.

### Primary
- **Red accent** (`accent`): links, annotations, active navigation, focus
  outlines, selected text background, and some syntax highlighting.

### Secondary
- **Espresso brown** (`secondary`): the wordmark, feature headings, travel
  headings, year headings, blockquotes, and selected code tokens.

### Neutral
- **Near-white paper** (`paper`): page background and search field surface.
- **Brown ink** (`ink`): main text and index titles.
- **Muted brown** (`muted`): dates, summaries, captions, and secondary footer text.
- **Fine warm rule** (`line`): selected separators, image and field borders.
- **Code paper** (`code-paper`): inline and block code backgrounds.

**The Red Asides Rule.** Annotations use the accent color and remain secondary
to the article or project they accompany.

## Typography

Manrope is self-hosted in `assets/fonts/` at regular (400) and bold (700), with
`sans-serif` fallback and `font-display: swap`. Its license is stored beside the
font files. No external Google Fonts request is needed.

The frontmatter defines the recurring roles. Page titles use `display`; section
headings use `headline`; chronological entries use `title`. Article paragraphs
use the more open `article` rhythm. Article titles are 37px with 1.25 line height;
lead feature titles are 28px with 1.3 line height. Supporting feature titles use
the 20px title role. Listing dates are 11px; article
metadata uses `metadata`. Dates use tabular numerals.

At the narrow breakpoint, page titles reduce to 33px, article titles to 32px,
and feature titles to 26px. Article reading text stays 17px. About asides inherit
their surrounding text size; lede asides use .85em. Code uses the system stack
`ui-monospace, SFMono-Regular, Consolas, monospace`.

## Layout

The reading container is centered at a maximum 680px, with a width of
`calc(100% - 48px)` and 47px/65px top/bottom padding. Masthead and footer use a
wider maximum of 1050px. The introduction is limited to 57ch; feature titles to
30ch. Features remain open on the page background.

A group of featured articles uses one full-width lead followed by a two-column
supporting row (32px gap), with a fine top rule. A lone supporting article spans
the row and keeps a 57ch maximum measure. At the narrow breakpoint the row stacks
with 28px gaps. One feature retains the original open layout; no features leave
no empty section.

At `max-width: 44rem`, the container uses 86% width and 30px/56px vertical padding.
The masthead stacks its wordmark above the wrapping navigation. Article rows
change from an 80px date column plus text (16px gap) to one column with the date
above the title (8px gap). The footer stacks, and its contact links align left.
No hamburger menu is used. At `min-width: 64rem`, article image paragraphs may
extend 60px beyond each reading-column edge.

Print removes navigation controls and food filters, expands the reading area,
and restores images inside the column. Respect native link behavior and keep
the skip-to-content target intact.

## Elevation & Depth

The system is flat and has no shadows or animated transitions. Hierarchy comes
from spacing, type, restrained rules, and the code background. Focus is an
immediate accent outline, not a raised surface.

## Shapes

Features and article rows are open, unboxed regions. Most surfaces have square
corners. Inline code alone has the small radius recorded in the frontmatter.
Project screenshots use a thin rule border; the About portrait retains its
original silhouette and is not reused as a homepage centerpiece.

## Components

### Navigation and links

The text wordmark is secondary brown with a red period. Navigation links use
ink, turning accent on hover; current links add an accent bottom border and
`aria-current`. General links have a single underline that thickens on hover.
Interactive elements use a 2px accent focus outline with 4px offset. Reader’s
marks and decorative double underlines are not part of the selected system.

### Article rows and features

Chronological rows pair a muted date with an ink title and optional muted
summary. Their responsive date placement follows Layout. Feature headings use
secondary brown; accompanying red asides and ordinary text links remain small.
The lead uses up to 40 summary words; supporting features use up to 24 words
and 14px summaries so a group stays compact. DOM order follows reading order.
Project screenshots represent actual work, with descriptive alternative text.

### Red asides and footer

Short parenthetical annotations remain subordinate to headings and article text.
The footer pairs a brief closing line with compact contact and RSS links.
Use generic examples in this reference; site copy belongs in content files.

### Search and food filters

Search uses a full-width paper field with an ink value, thin rule border, and
10px/12px padding. The food guide uses native labeled checkboxes, accent-colored
checks, and a wrapping fieldset with fine top and bottom rules. Preserve keyboard
operation and the site's shared focus outline.

### Food order

The food-order pattern is a definition list with a small red term and an ordinary
recommendation. It uses an 88px term column and 20px gap; on narrow
screens these become 66px and 16px. Fine rules bracket the list. Use this pattern
for authored recommendations, not fabricated endorsements.

### Article content

Blockquotes have a single accent left rule. Tables and code blocks scroll within
their own width. Image captions use muted text; tags remain text links. Adjacent
article navigation uses a fine divider and descriptive older/newer links.

## Do's and Don'ts

### Do:
- Do preserve the flat reading layout and restrained annotation hierarchy.
- Do use the shared palette and self-hosted Manrope for new site surfaces.
- Do retain readable articles, native links, and visible keyboard focus.
- Do use generic reference examples and preserve existing asset credits.

### Don't:
- Don't add Reader’s marks or decorative double underlines.
- Don't add colors outside the palette without updating the design tokens.
- Don't box the homepage feature or add ornamental shadows to this flat system.
- Don't reuse About imagery as a homepage centerpiece.
