/**
 * Releases of the game, oldest first. Each save records the release that
 * last saved it (story.release). When a save from an older release loads,
 * the notes of every release since are said once, so players hear what
 * changed while they were away.
 *
 *   id      Saved in the save; never change one
 *   notes   What the developer says about it, or null to say nothing
 *
 * Add an entry with every release, after the others, and list its id in
 * tests/fixtures/ids.json.
 */

export const Releases = [
    // Act 1: the shoebox, the vending machine, Pip, the binders, the office
    { id: 'act-1', notes: null },
    {
        id: 'checklists',
        notes: 'A note from the developer: the game was updated while you were away. Every card is on a checklist now, and your old critters have been reprinted as real ones. The vending machine has more going on. Pip comes a little later. Please be nice to Terry.'
    },
    // Saves upgrade step by step, and remember their release
    { id: 'save-upgrades', notes: null }
];

export const currentRelease = Releases[Releases.length - 1];
