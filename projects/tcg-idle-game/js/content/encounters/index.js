/**
 * Every encounter: moments that take over a location and make the player
 * choose. One file per encounter, or per group of linked encounters. The
 * active encounter is saved, so reloading the page can't escape it.
 *
 *   id               Encounter id
 *   location         Where it happens; the view moves there
 *   art              Which ASCII art to show (a key from js/ui/art/index.js)
 *   on, check(game)  Optional: start when this game event fires and check
 *                    returns true. Without these, start it with
 *                    game.startEncounter(id).
 *   start(game)      Optional: runs when it starts
 *   text(game)       Lines of text
 *   choices(game)    [{ label, disabled, run(game) }]
 */

import { ShoeboxEncounters } from './shoebox.js';
import { PipEncounter } from './pip.js';
import { ScalperEncounter } from './scalper.js';
import { CamperEncounter } from './camper.js';

// When several could start on the same event, the first one listed does
export const Encounters = [...ShoeboxEncounters, PipEncounter, ScalperEncounter, CamperEncounter];
