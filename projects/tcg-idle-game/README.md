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
better), three secrets, and Gus's store, which opens in summer (Act 2).

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
    save.js        Versioned save, plus the endings list
    time.js        Time constants and every() for clock-aligned windows
    format.js      Money and clock formatting
    merge.js       Lays a save over the defaults
    random.js      Seeded random numbers
  systems/         Game logic, one feature per file
    index.js       Every system, in tick order
    wallet.js  job.js  collection.js  vending.js  kindness.js  people.js
    story.js
    cards.js       Card logic (making cards, opening packs, save packing)
  content/         Data
    catalog.js     The card catalogue
    unlocks.js     Things that happen once a condition is met
    endings.js     Endings
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
  since a card's number is its place in its set. Never change a card's id;
  saves store it.
- **A timed event on the real clock:** use `every()` from `js/core/time.js`,
  or decide the time when something starts and save it, as the vending
  machine does for each pack. Never count down in the background: the game
  only works out what has happened by now, on each tick and when the player
  comes back.

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
- `old-saves.test.js` loads every save in `tests/fixtures/`, each made by a
  released version, and checks the game carries on from it.
- `e2e/` has browser tests: whole journeys through the built page in
  Chromium, with a paused clock that tests move forward themselves.
  Screenshots of failures go to `test-results/`.

When adding things:

- **A new feature or rule:** add tests for it next to its topic, and a move
  for it in `invariants.test.js`, with any new invariant it brings.
- **A change to what the game saves:** before releasing it, add a save from
  the current release to `tests/fixtures/` (play to an interesting point
  with the released code and store `localStorage.critterClashSave`).
- **A new place or a new milestone:** add a browser journey through it, and
  a pacing check if STORY.md sets a target for it.

To try things in the browser, add `?dev` to the page URL for shortcuts to add
money, restock, call the kid into line, and delete the save and endings.
