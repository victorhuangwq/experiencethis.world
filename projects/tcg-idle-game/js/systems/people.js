/**
 * People: what each character knows about the player
 */

import { Lines } from '../content/lines.js';

export const People = {
    id: 'people',

    defaults: () => ({
        pip: { encounters: 0, kindness: 0, mentionedGus: false },
        benny: { met: false },
        gus: { knocks: 0 }
    }),

    actions: {
        knock(game) {
            if (!game.unlocked('gus')) {
                return;
            }
            const gus = game.state.people.gus;
            gus.knocks++;
            game.say(gus.knocks === 1 ? Lines.gus.firstKnock : game.pick(Lines.gus.knocks));
        }
    }
};
