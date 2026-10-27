/**
 * Story: the season, the days played, the opening, places visited, the
 * narrator's comments on idling and on the real clock, and what changed
 * since the release that last saved the game
 */

import { localDay } from '../core/time.js';
import { Format } from '../core/format.js';
import { Rules } from '../rules.js';
import { Lines } from '../content/text/index.js';
import { Releases, currentRelease } from '../content/releases.js';

// Idle comments made since the player last did something. Not saved.
let idleComments = 0;

// The seasons, in order
const SEASONS = ['spring', 'summer'];

export const Story = {
    id: 'story',

    defaults: now => ({
        season: 'spring',
        // Separate days (by the player's clock) the game has been played
        // on, and the last of them, as a localDay() number
        days: 1,
        lastDay: localDay(now),
        // What the player did with the childhood shoebox: 'sold' or 'kept'
        shoebox: null,
        // Locations the player has opened at least once
        visited: ['home'],
        // Where the player is looking now. Not saved: the page always
        // opens at home.
        here: 'home',
        // The release that last saved the game (an id from releases.js)
        release: currentRelease.id
    }),

    load(story) {
        if (!SEASONS.includes(story.season)) {
            story.season = 'spring';
        }
    },

    save({ here, ...story }) {
        return story;
    },

    setup(game) {
        game.on('start', ({ fresh }) => {
            if (fresh) {
                game.startEncounter('shoebox');
            } else {
                Story.releaseNotes(game);
                Story.clockComment(game);
            }
        });

        game.on('action', () => {
            idleComments = 0;
        });
    },

    tick(game, now) {
        const story = game.state.story;
        const today = localDay(now);
        if (today > story.lastDay) {
            story.days++;
            story.lastDay = today;
        }

        // Only comment on idling while the player is actually watching
        if (game.awayReport || !game.unlocked('allowance')) {
            return;
        }
        const idleFor = now - game.lastActionAt;
        if (idleComments < Rules.idleJokesAt.length && idleFor >= Rules.idleJokesAt[idleComments]) {
            game.say(Lines.story.idle[idleComments]);
            idleComments++;
        }
    },

    /**
     * Whether a set has come out yet: some come out in a later season
     * @param {Game} game - Game
     * @param {Object} set - A set from the catalogue
     */
    isOut(game, set) {
        return !set.out || SEASONS.indexOf(game.state.story.season) >= SEASONS.indexOf(set.out);
    },

    /**
     * Say what changed in every release since the one that last saved the
     * game, then mark the game as this release's
     */
    releaseNotes(game) {
        const story = game.state.story;
        const since = Releases.findIndex(release => release.id === story.release);
        // An unknown release may be a newer one; say nothing about it
        if (since !== -1) {
            for (const release of Releases.slice(since + 1)) {
                if (release.notes) {
                    game.say(release.notes, 'good');
                }
            }
        }
        story.release = currentRelease.id;
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
            game.say(Lines.story.night(Format.clock(game.time)));
        } else if (hour < 7) {
            game.say(Lines.story.earlyMorning(Format.clock(game.time)));
        }
    },

    actions: {
        visit(game, { location }) {
            if (typeof location !== 'string') {
                return;
            }
            const story = game.state.story;
            story.here = location;
            if (!story.visited.includes(location)) {
                story.visited.push(location);
            }
        }
    }
};
