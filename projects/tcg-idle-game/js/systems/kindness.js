/**
 * The kindness code: unkind choices are strikes. Strikes never go away.
 * There is no counter on screen; the world reacts instead. The third
 * strike ends the run with the Shame ending.
 */

import { Rules } from '../rules.js';
import { Lines } from '../content/text/index.js';

export const Kindness = {
    id: 'kindness',

    defaults: () => ({
        // Every strike: { source, at }
        strikes: [],
        // The BE NICE note taped to the vending machine
        note: false
    }),

    /**
     * Add a strike
     * @param {Game} game - Game
     * @param {string} source - What the strike was for; a key of Lines.strikes
     * @param {string} who - Who it was against, for the message
     */
    addStrike(game, source, who) {
        const kindness = game.state.kindness;
        kindness.strikes.push({ source, at: game.time });
        const count = kindness.strikes.length;

        if (count >= Rules.maxStrikes) {
            game.end('shame');
            return;
        }

        game.say(Lines.strikes[source][count - 1](who), 'danger');
        if (count === Rules.maxStrikes - 1) {
            kindness.note = true;
            game.say(Lines.strikes.warning, 'danger');
        }
    }
};
