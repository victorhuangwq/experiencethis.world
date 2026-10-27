/**
 * Pacing: bots play the way real players do, and the story's milestones
 * must come about when STORY.md (Pacing) says they should. If a tuning
 * change in rules.js fails these, either the change or the target is wrong.
 * Run with --test-reporter=spec to see the measured times.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, act, finishOpening, START } from './helpers.js';
import { Rules } from '../js/rules.js';
import { Wallet } from '../js/systems/wallet.js';
import { Vending } from '../js/systems/vending.js';
import { Collection } from '../js/systems/collection.js';
import { Job } from '../js/systems/job.js';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const SEEDS = 20;

/**
 * One visit's worth of play: be kind to Pip, buy every pack the player can
 * afford, open them all, sell duplicates, and buy storage when it's needed
 */
function playVisit(game) {
    for (let tries = 0; tries < 20; tries++) {
        // Be kind: step aside for Pip, let the scalper have what's left
        if (game.state.encounter) {
            const choices = game.encounter().choices(game);
            act(game, 'encounter.choose', { index: game.state.encounter.id === 'scalper' ? choices.length - 1 : 0 });
            continue;
        }
        if (game.state.vending.jammedSlot !== null) {
            act(game, 'vending.walkAway');
        }
        const slot = game.state.vending.slots.findIndex(kind => kind && Wallet.canAfford(game, Rules.prices[kind]));
        if (!game.unlocked('mall') || !Vending.usable(game) || slot === -1) {
            break;
        }
        act(game, 'vending.buy', { slot });
    }
    for (const kind of ['normal', 'special', 'mega']) {
        while (game.state.collection.packs[kind] > 0) {
            act(game, 'collection.open', { kind });
        }
    }
    act(game, 'collection.sellDuplicates');
    const forSale = Collection.storageForSale(game);
    if (forSale && Wallet.canAfford(game, forSale.price + Rules.prices.normal)) {
        act(game, 'collection.buyStorage');
    }
}

/**
 * Play until a milestone, or give up. Each seed starts on a different day
 * of the week, since the day job depends on the day.
 * @param {Object} options - seed, step (time between moves), work (answer
 *                           emails whenever rested?), until(game), limit
 * @returns {number|null} - Time taken, or null if never reached
 */
function timeUntil({ seed, step, work, until, limit }) {
    const start = START + (seed % 7) * DAY;
    const game = newGame({ seed, now: start });
    finishOpening(game, 'sell');
    for (let now = start; now <= start + limit; now += step) {
        game.catchUp(now);
        if (work) {
            act(game, 'job.work', { at: Job.workplace(game) });
        }
        playVisit(game);
        if (until(game)) {
            return now - start;
        }
    }
    return null;
}

const firstPip = game => game.state.people.pip.encounters > 0;
const gus = game => game.unlocked('gus');
const binder = game => Collection.storage(game) !== 'shoebox';

// A player with the game open, answering emails whenever they can
const active = { step: 5 * SECOND, work: true, limit: 3 * HOUR };
// A player who checks in every few hours and never answers emails
const idle = { step: 4 * HOUR, work: false, limit: 7 * 24 * HOUR };

/**
 * Times for every seed, sorted, for a milestone
 */
function measure(player, until) {
    const times = [];
    for (let seed = 1; seed <= SEEDS; seed++) {
        const time = timeUntil({ ...player, seed, until });
        assert.notEqual(time, null, `seed ${seed} never got there`);
        times.push(time);
    }
    return times.sort((a, b) => a - b);
}

const median = times => times[Math.floor(times.length / 2)];
const minutes = time => `${Math.round(time / MINUTE)} min`;
const range = times => `${minutes(times[0])} to ${minutes(times[times.length - 1])}, median ${minutes(median(times))}`;

test('an active player can buy packs within a couple of minutes', (t) => {
    const times = measure(active, game => game.state.vending.packsBought > 0);
    t.diagnostic(`first pack: ${range(times)}`);
    assert.ok(times[times.length - 1] <= 3 * MINUTE);
});

test('an active player meets Pip at the first restock (target: about 30 minutes)', (t) => {
    const times = measure(active, firstPip);
    t.diagnostic(`first Pip: ${range(times)}`);
    assert.ok(times[0] >= Rules.pipNotBefore, 'not for the first stock');
    assert.ok(times[times.length - 1] <= 45 * MINUTE);
});

test('an active player finds Gus\'s store in the first session (target: about 30 minutes)', (t) => {
    const times = measure(active, gus);
    t.diagnostic(`Gus: ${range(times)}`);
    assert.ok(median(times) >= 15 * MINUTE && median(times) <= 60 * MINUTE);
    assert.ok(times[times.length - 1] <= 90 * MINUTE, 'nobody active waits more than an hour and a half');
});

test('an active player can afford a binder in the first session', (t) => {
    const times = measure(active, binder);
    t.diagnostic(`binder: ${range(times)}`);
    assert.ok(median(times) <= 90 * MINUTE);
});

test('a player who only checks in now and then still finds Gus within a day', (t) => {
    const times = measure(idle, gus);
    t.diagnostic(`Gus, checking in every 4 hours: ${range(times)}`);
    assert.ok(times[times.length - 1] <= 24 * HOUR);
});
