# TCG Idle Collector

A text and ASCII idle game in the spirit of Candy Box and A Dark Room: an
adult rediscovers their childhood card collection and gets back into the
hobby, from single packs at a mall vending machine to the top of the scene.
Inside the story, the card game everyone collects is called Critter Clash.
The story, voice, and design are in [STORY.md](STORY.md).

## Current state

Act 1 (spring) is playable: the shoebox opening, a self-given allowance and
emails for extra money, the CARD-O-MATIC 3000 restocking every quarter hour of
the real clock, Pip and the kindness code, Benny buying duplicates, storage
that grows with the collection, three secrets, and Gus's store, which opens
in summer (Act 2).

## Code

Plain HTML, CSS, and JavaScript modules, with no build step. `js/main.js`
builds the game and is the only script the page loads.

- `js/core/`
  - `game.js`: the `Game` core. Holds the state, runs systems, unlocks,
    encounters, and endings, and provides events, seeded randomness, and the
    "while you were away" summary. The header comment describes the system
    shape.
  - `save.js`: versioned save in local storage, plus the endings list under a
    separate key so it survives a game over.
  - `util.js`: time constants, money formatting (money is whole cents),
    `mergeDefaults` (lays a save over the defaults, so new fields need no
    migration), the seeded random generator, and `every()` for repeating
    windows on the local clock.
- `js/rules.js`: every tuning value.
- `js/systems/`: one file per feature, each owning its slice of the state,
  its clock behaviour, and its actions: `wallet`, `collection`, `vending`,
  `kindness`, `people`, `story`.
- `js/content/`: data. `lines.js` holds every line of text; `cards.js` the
  card list and pack generation; `unlocks.js`, `encounters.js`, and
  `endings.js` define one-time unlocks, choice moments, and endings.
- `js/ui/`: `ui.js` draws the game and routes button clicks to
  `game.perform("<system>.<action>")`; `locations.js` registers the places;
  `art.js` holds the ASCII art; `reveal.js` animates pack opening.

### Adding things

- **A new feature:** add a system in `js/systems/` and list it in `main.js`.
- **A new place:** add an entry to `Locations` in `js/ui/locations.js`.
- **A side quest or choice:** add an encounter in `js/content/encounters.js`.
- **Something that happens once a condition is met:** add an unlock in
  `js/content/unlocks.js`.
- **A timed event on the real clock:** use `every()` from `js/core/util.js`.

## Testing

Add `?dev` to the page URL to show shortcuts for adding money, restocking,
calling the kid into line, and deleting the save and endings.
