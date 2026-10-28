/**
 * Shared setup for the tests: a game wired up like main.js, with endings
 * kept in memory instead of local storage
 */

import { Game } from '../js/core/game.js';
import { Systems } from '../js/systems/index.js';
import { Unlocks } from '../js/content/unlocks.js';
import { Encounters } from '../js/content/encounters/index.js';
import { Rules } from '../js/rules.js';

// Sunday 25 October 2026, 2:07 PM local time
export const START = new Date(2026, 9, 25, 14, 7).getTime();

export function memoryEndings() {
    const found = [];
    return {
        found: () => [...found],
        record: id => {
            if (!found.includes(id)) {
                found.push(id);
            }
        }
    };
}

/**
 * Start a game
 * @param {Object} options - now, save (game save data), seed (for a new game)
 */
export function newGame({ now = START, save = null, seed = 12345 } = {}) {
    const game = new Game({ systems: Systems, unlocks: Unlocks, encounters: Encounters, endings: memoryEndings() });
    game.start(save, now);
    if (!save) {
        game.state.meta.seed = seed;
    }
    return game;
}

/**
 * Run a player action at the game's current time, or at a given time
 */
export function act(game, name, args = {}, now = game.time) {
    game.perform(name, args, now);
}

/**
 * Play the opening: look in the shoebox, then sell or keep it
 */
export function finishOpening(game, choice = 'sell') {
    act(game, 'encounter.choose', { index: 0 });
    act(game, 'encounter.choose', { index: choice === 'sell' ? 0 : 1 });
}

/**
 * A game past the opening, with the shoebox sold and the mall open
 */
export function gameAtMall(options) {
    const game = newGame(options);
    finishOpening(game, 'sell');
    return game;
}

/**
 * A game on the day Gus's store opened (the day after it was found), or
 * some days of play later
 * @param {Object} options - seed, cents (money to spend), later (days of
 *                           play after the opening)
 */
export function gameAtGus({ seed, cents = 100000, later = 0 } = {}) {
    const game = gameAtMall({ seed });
    game.state.collection.cardsOpened = Rules.gusWithoutTip;
    game.checkUnlocks();
    for (let day = 0; day <= later; day++) {
        game.tick(game.time + 24 * 60 * 60 * 1000);
    }
    game.state.wallet.cents = cents;
    return game;
}

/**
 * A game on the day of the first Friday Night Clash
 */
export function gameAtClash(options = {}) {
    return gameAtGus({ ...options, later: Rules.clashFromDay - Rules.gusOpensOnDay });
}

/**
 * Change tuning values for one test
 * @param {Object} t - The test context
 * @param {Object} changes - Rules to change
 */
export function overrideRules(t, changes) {
    const original = {};
    for (const key of Object.keys(changes)) {
        original[key] = Rules[key];
    }
    Object.assign(Rules, changes);
    t.after(() => Object.assign(Rules, original));
}

/**
 * Buy the first pack in the machine
 */
export function buyFirst(game) {
    const slot = game.state.vending.slots.findIndex(kind => kind !== null);
    act(game, 'vending.buy', { slot });
}

/**
 * Move time forward to the vending machine's next restock
 */
export function restock(game) {
    game.tick(game.state.vending.nextRestockAt);
}

export function newestMessage(game) {
    return game.messages[0]?.text;
}

/**
 * A stand-in for the browser's local storage
 */
export class MemoryStorage {
    constructor() {
        this.items = new Map();
    }
    getItem(key) {
        return this.items.has(key) ? this.items.get(key) : null;
    }
    setItem(key, value) {
        this.items.set(key, String(value));
    }
    removeItem(key) {
        this.items.delete(key);
    }
}
