/**
 * ASCII art that content refers to by key: encounters and endings name one
 * of these in their "art" field. Scenes import their art directly.
 */

import { shoebox } from './home.js';
import { machine, guard } from './mall.js';

export const ArtByKey = {
    shoebox: () => shoebox(['CARDS - DO NOT', 'TOUCH']),
    machine: (game, encounter) => machine(game.state, { pip: 'kid', scalper: 'flip', camper: 'terry' }[encounter.id] || null),
    guard: () => guard
};
