# TCG Idle Collector

A text and ASCII idle game in the spirit of Candy Box and A Dark Room: an
adult rediscovers their childhood card collection and gets back into the
hobby, from single packs at a mall vending machine to the top of the scene.
Inside the story, the card game everyone collects is called Critter Clash.
The story, voice, and design are in [STORY.md](STORY.md).

## Current state

Act 1 (spring) is playable: the shoebox opening, a 120-card Base Set whose
checklist comes in the first pack, a self-given allowance, a
hybrid day job (the office on real Tuesdays to Thursdays, the kitchen table
on Mondays and Fridays), the CARD-O-MATIC 3000 restocking every 25 to 35
minutes of real time with a mix of packs that other people buy up, Pip, the
scalper, Terry waiting for the drop, the kindness code, Benny buying duplicates,
storage to buy as the collection outgrows it (each one organising the cards
better), and three secrets.

Act 2 is playable too: Gus's store opens on the second day of play, with
packs at a markup, a glass case of singles, grading (back a day later), and
Marcus trading on Thursday and Friday evenings and weekends. From the
fourth day there's Friday Night Clash (the local tourney) once a day,
against regulars the player learns to read. Winning it gets an invitation
to the pre-release, a first look at Set 2, and summer brings Set 2,
Backyard Brawl (102 cards), the day after: the fifth day of play at the
earliest.

## Code

Plain HTML, CSS, and JavaScript modules, with no build step. `js/main.js`
builds the game and is the only script the page loads. The code is in
layers; each folder with several files has an `index.js` that lists them.

```
js/
  main.js          Builds the game, ticks it, saves it
  rules.js         Every tuning value
  core/            The engine; nothing about this story
    game.js        State, systems, unlocks, encounters, events, endings
    save.js        Versioned save, upgraded step by step, plus the endings list
    time.js        Time constants and every() for clock-aligned windows
    format.js      Money and clock formatting
    merge.js       Lays a save over the defaults
    random.js      Seeded random numbers
  systems/         Game logic, one feature per file
    index.js       Every system, in tick order
    wallet.js  job.js  collection.js  vending.js  kindness.js  people.js
    story.js  store.js  trades.js  tournaments.js
    cards.js       Card logic (making cards, opening packs, save packing)
  content/         Data
    catalog.js     The card catalogue
    unlocks.js     Things that happen once a condition is met
    endings.js     Endings
    regulars.js    The people at Gus's tournaments, and how each one plays
    migrations.js  Steps that upgrade saves from older versions
    releases.js    Every release, with what changed, for players' saves
    encounters/    Choice moments, one file per encounter or group
    text/          Every line of text, one file per topic
  ui/
    ui.js          The shell: layout, click routing, redrawing
    html.js        HTML helpers
    reveal.js      The pack-opening animation
    scenes/        One file per place
    panels/        Status bar, navigation, log, encounter, ending, dev bar
    art/           ASCII art, one file per place, plus art/index.js for
                   art that content refers to by key
```

The header comment in `js/core/game.js` describes what a system is, and the
headers of `js/content/unlocks.js`, `js/content/encounters/index.js`, and
`js/ui/scenes/index.js` describe their entries.

### Adding things

- **A new feature:** add a system in `js/systems/` and list it in
  `js/systems/index.js`.
- **A new place:** add a scene in `js/ui/scenes/`, its art in `js/ui/art/`,
  and list it in `js/ui/scenes/index.js`.
- **A side quest or choice:** add an encounter in `js/content/encounters/`
  and list it in `js/content/encounters/index.js`.
- **Something that happens once a condition is met:** add an unlock in
  `js/content/unlocks.js`.
- **New text:** add it to the topic's file in `js/content/text/`, or add a
  topic file and list it in `js/content/text/index.js`.
- **A new card:** add it to `js/content/catalog.js`, at the end of its set,
  since a card's number is its place in its set.
- **Any new id** (a card, encounter, unlock, ending, place, storage, pack
  kind, strike, or release): add it to `tests/fixtures/ids.json`. Saves
  store ids, so once released an id is permanent; renaming or removing one
  needs a migration (see Saves below).
- **A timed event on the real clock:** use `every()` from `js/core/time.js`,
  or decide the time when something starts and save it, as the vending
  machine does for each pack. Never count down in the background: the game
  only works out what has happened by now, on each tick and when the player
  comes back.

### Saves

The save is versioned (`js/core/save.js`). Loading a save from an older
version upgrades it one step at a time with the steps in
`js/content/migrations.js`, after keeping a copy of it as it was
(`critterClashSave-v2`, and so on). If a step fails, the save is kept and a
new game starts.

- **New fields** need nothing: the game fills them in from its defaults.
  If old saves need another value, worked out from what they hold, a step
  can set it.
- **Changing the shape of saved data** (renaming, moving, or restructuring
  it, or retiring an id) needs a new step at the next version. A released
  step never changes. List any id it retires under `retired` in
  `tests/fixtures/ids.json`.
- **Save only facts,** and work everything else out from content: a card is
  saved as its own id, which card it is, and its condition.
- **Every release** gets an entry in `js/content/releases.js`. Each save
  records the release that last saved it, and a save from an older release
  hears the notes of every release since, once.

## Testing

GitHub Actions runs every test on pull requests and pushes to `master` that
touch the game (`.github/workflows/tcg-idle-game.yml`). To run them locally,
from this folder:

```
npm test                  # Game logic: Node 20 or later, no install needed
npm install               # Once, for the browser tests
npx playwright install chromium
npm run test:e2e          # Browser tests: build the site first (bundle exec jekyll build)
```

The tests are in `tests/`, and are not published with the site:

- `tests/helpers.js` sets up a game the way `js/main.js` does.
- One `<topic>.test.js` per system or topic, for its rules.
- `content.test.js` checks that content fits together: encounters, endings,
  cards, storage, text, and every button's action.
- `invariants.test.js` plays thousands of random moves over many seeds and
  checks that money, cards, strikes, the machine, and saves always make
  sense. A failure names the seed and step to replay.
- `pacing.test.js` has bots play like an active player and an idle one, and
  checks milestones against the targets in STORY.md. Add
  `--test-reporter=spec` to see the measured times.
- `old-saves.test.js` loads every save in `tests/fixtures/` (each made by a
  released version) the way the page does, and checks the game carries on
  from it.
- `ids.test.js` checks the register of ids, `tests/fixtures/ids.json`:
  every id in the game is registered, none that was released is gone
  unless a migration retired it, and old saves hold only ids the game
  knows once loaded.
- `e2e/` has browser tests: whole journeys through the built page in
  Chromium, with a paused clock that tests move forward themselves.
  Screenshots of failures go to `test-results/`.

When adding things:

- **A new feature or rule:** add tests for it next to its topic, and a move
  for it in `invariants.test.js`, with any new invariant it brings.
- **A change to what the game saves:** add a migration step if the shape
  changes, and before releasing it, add a save from the current release to
  `tests/fixtures/` as `save-<release>.json` (play to an interesting point
  with the released code and store `localStorage.critterClashSave`).
- **A new place or a new milestone:** add a browser journey through it, and
  a pacing check if STORY.md sets a target for it.

To try things in the browser, add `?dev` to the page URL for shortcuts to add
money, restock, call the kid into line, count another day of play (and bring
back cards from grading), and delete the save and endings.
