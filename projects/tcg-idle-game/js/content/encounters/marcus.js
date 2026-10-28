/**
 * Bumping into Marcus at Gus's: the first time the player is at the store
 * while he's at the table by the window. If they know him from the office,
 * they both pretend this is normal.
 */

import { Lines } from '../text/index.js';
import { Store } from '../../systems/store.js';
import { Trades } from '../../systems/trades.js';

export const MarcusAtGusEncounter = {
    id: 'marcus-at-gus',
    location: 'gus',
    art: 'marcus',
    on: 'action',
    check: (game, { name }) => name === 'story.visit' && game.state.story.here === 'gus' &&
        Store.isOpen(game) && Trades.here(game) && !game.state.people.marcus.metAtGus,
    text: game => Lines.marcus.bump(game.state.job.coworker > 0),
    choices: game => [{
        label: game.state.job.coworker > 0 ? Lines.marcus.pretend : Lines.marcus.sayHello,
        run: game => {
            game.state.people.marcus.metAtGus = true;
            game.say(Lines.marcus.bumped(game.state.job.coworker > 0));
        }
    }]
};
