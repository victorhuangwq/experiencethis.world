/**
 * People: what each character knows about the player
 */

import { Lines } from '../content/text/index.js';

export const People = {
    id: 'people',

    defaults: () => ({
        pip: { encounters: 0, kindness: 0, mentionedGus: false },
        benny: { met: false },
        gus: { knocks: 0 },
        // The scalper behind the player in line; he gets more annoyed each
        // time the player buys him out
        flip: { encounters: 0, annoyed: 0 },
        // Terry waits for the drop. A friend splits it and texts about mega
        // packs.
        terry: { encounters: 0, friend: false }
    }),

    actions: {
        knock(game) {
            // Once the store is open, the door is too
            if (!game.unlocked('gus') || game.unlocked('gus-open')) {
                return;
            }
            const gus = game.state.people.gus;
            gus.knocks++;
            game.say(gus.knocks === 1 ? Lines.gus.firstKnock : game.pick(Lines.gus.knocks));
        }
    }
};
