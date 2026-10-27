/**
 * ASCII art that content refers to by key: encounters and endings name one
 * of these in their "art" field. Scenes import their art directly.
 */

import { shoebox } from './home.js';
import { machine, guard } from './mall.js';
import { table } from './gus.js';
import { Lines } from '../../content/text/index.js';
import { Catalog } from '../../content/catalog.js';
import { Regulars } from '../../content/regulars.js';

export const ArtByKey = {
    shoebox: () => shoebox(['CARDS - DO NOT', 'TOUCH']),
    machine: (game, encounter) => machine(game.state, { pip: 'kid', scalper: 'flip', camper: 'terry' }[encounter.id] || null),
    guard: () => guard,
    // The tournament table, with the last round's cards on it
    table: game => {
        const current = game.state.tournaments.current;
        const regular = Regulars.find(each => each.id === current.opponents[current.results.length]);
        const round = current.rounds.at(-1);
        const last = round && { theirs: Catalog.find(round.theirs), mine: Catalog.find(round.mine) };
        return table(regular.face, Lines.tournaments.regulars[regular.id].name, last);
    }
};
