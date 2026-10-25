/**
 * Story: the season, the opening, places visited, and the narrator's
 * comments on idling and on the real clock
 */

import { Format } from '../core/util.js';
import { Rules } from '../rules.js';
import { Lines } from '../content/lines.js';

// Idle comments made since the player last did something. Not saved.
let idleComments = 0;

export const Story = {
    id: 'story',

    defaults: () => ({
        season: 'spring',
        // What the player did with the childhood shoebox: 'sold' or 'kept'
        shoebox: null,
        // Locations the player has opened at least once
        visited: ['home']
    }),

    setup(game) {
        game.on('start', ({ fresh }) => {
            if (fresh) {
                game.startEncounter('shoebox');
            } else {
                Story.clockComment(game);
            }
        });

        game.on('action', () => {
            idleComments = 0;
        });
    },

    tick(game, now) {
        // Only comment on idling while the player is actually watching
        if (game.awayReport || !game.unlocked('allowance')) {
            return;
        }
        const idleFor = now - game.lastActionAt;
        if (idleComments < Rules.idleJokesAt.length && idleFor >= Rules.idleJokesAt[idleComments]) {
            game.say(Lines.idle[idleComments]);
            idleComments++;
        }
    },

    /**
     * Comment on the time of day when the player comes back late at night
     */
    clockComment(game) {
        if (!game.unlocked('mall')) {
            return;
        }
        const hour = new Date(game.time).getHours();
        if (hour < 5) {
            game.say(Lines.mall.night(Format.clock(game.time)));
        } else if (hour < 7) {
            game.say(Lines.mall.earlyMorning(Format.clock(game.time)));
        }
    },

    actions: {
        visit(game, { location }) {
            const visited = game.state.story.visited;
            if (typeof location === 'string' && !visited.includes(location)) {
                visited.push(location);
            }
        }
    }
};
