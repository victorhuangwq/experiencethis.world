# Critter Clash: TCG Idle Game

A text and ASCII idle game in the spirit of Candy Box: the journey of a
trading card collector, from buying single packs at a mall vending machine to
the top of the hobby. The story and design are in [STORY.md](STORY.md).

## Current state

Act 1 (the vending machine) is playable. Gus's Games & Grub appears at the end
of Act 1 as a teaser for Act 2.

- **Money:** an allowance accrues every second, including while the page is
  closed (up to 8 hours). Chores give a little extra on a short cooldown.
- **CARD-O-MATIC 3000:** 8 slots that refill at every quarter hour of the
  real clock. A restock sometimes includes a special pack with better odds.
  The machine occasionally jams; kicking it works half the time.
- **Packs:** 5 cards each. Most cards are randomly generated critters; the
  hit slot can contain a card from the fixed Base Set list.
- **Kindness code:** after a few purchases, a kid may wait in line. Stepping
  aside is rewarded. Buying anyway is a strike. Strikes are permanent; the
  second shows a warning and the third ends the run with the Shame ending,
  which deletes the save.
- **Binder:** set checklist for fixed cards and a list of other critters.
  Benny buys duplicates once you have some.
- **Endings:** endings found are kept across runs, including after a game over.

## Code

Plain HTML, CSS, and JavaScript, loaded in this order:

- `js/save-system.js`: versioned save in local storage, plus the endings list
  under a separate key.
- `js/cards.js`: card definitions, the fixed card list, pack generation, and
  compact card packing for the save.
- `js/game.js`: game state, tuning values (`Rules`), and every player action.
  Timed events use real clock timestamps.
- `js/ui.js`: ASCII art and rendering. Sections are only redrawn when their
  content changes, and one delegated click handler serves every button.
- `js/main.js`: starts the game, ticks it every second, and saves after each
  action, every 30 seconds, and when the page closes. A tab stops saving if
  another tab saves.

## Testing

Add `?dev` to the page URL to show shortcuts for adding money, restocking,
calling the kid into line, and deleting the save and endings.
