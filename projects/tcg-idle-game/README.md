# TCG Idle Collector

A text and ASCII idle game in the spirit of Candy Box and A Dark Room: an
adult rediscovers their childhood card collection and gets back into the
hobby, from single packs at a mall vending machine to the top of the scene.
Inside the story, the card game everyone collects is called Critter Clash.
The story, voice, and design are in [STORY.md](STORY.md).

## Current state

Act 1 (spring) is playable: the shoebox opening, a self-given allowance and
emails for extra money, the CARD-O-MATIC 3000 restocking every 25 to 35
minutes of real time, Pip and the kindness code, Benny buying duplicates,
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
    wallet.js  collection.js  vending.js  kindness.js  people.js  story.js
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
- **A timed event on the real clock:** use `every()` from `js/core/time.js`.

## Testing

The game logic has automated tests, using Node's built-in test runner (Node
20 or later, no dependencies). From this folder:

```
npm test
```

The tests are in `tests/`; `tests/helpers.js` sets up a game the way
`js/main.js` does. They and `package.json` are not published with the site.

To try things in the browser, add `?dev` to the page URL for shortcuts to add
money, restock, call the kid into line, and delete the save and endings.
