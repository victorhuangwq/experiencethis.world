/**
 * A random player presses every button in every order, with time passing
 * in between, over many seeds. After each step the game must still make
 * sense. A failure names the seed and step, so it can be replayed.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, act, finishOpening, START } from './helpers.js';
import { localDay } from '../js/core/time.js';
import { nextRandom } from '../js/core/random.js';
import { Rules } from '../js/rules.js';
import { Job } from '../js/systems/job.js';
import { Vending } from '../js/systems/vending.js';
import { Catalog } from '../js/content/catalog.js';
import { Locations } from '../js/ui/scenes/index.js';
import { renderEncounter } from '../js/ui/panels/encounter.js';
import { renderEnding } from '../js/ui/panels/ending.js';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

const SEEDS = 40;
const STEPS = 400;

// What the random player can do, and how often, out of the total weight
const MOVES = [
    { weight: 12, run: (game, roll) => act(game, 'vending.buy', { slot: Math.floor(roll() * Rules.slotCount) }) },
    { weight: 10, run: game => act(game, 'collection.open', { kind: 'normal' }) },
    { weight: 2, run: game => act(game, 'collection.open', { kind: 'special' }) },
    { weight: 2, run: (game, roll) => act(game, 'collection.open', { set: pickSet(roll), kind: roll() < 0.8 ? 'normal' : 'mega' }) },
    { weight: 3, run: (game, roll) => act(game, 'store.buyPack', { set: pickSet(roll) }) },
    { weight: 2, run: (game, roll) => act(game, 'store.buySingle', { spot: Math.floor(roll() * Rules.caseSlots.length) }) },
    { weight: 2, run: (game, roll) => act(game, 'store.grade', { id: pickCard(game, roll) }) },
    { weight: 1, run: (game, roll) => act(game, 'store.sellGraded', { id: pickCard(game, roll) }) },
    { weight: 3, run: game => act(game, 'tournaments.enterLocals') },
    { weight: 1, run: game => act(game, 'tournaments.enterPrerelease') },
    { weight: 2, run: (game, roll) => act(game, 'trades.trade', { index: Math.floor(roll() * Rules.marcusOffers) }) },
    { weight: 6, run: (game, roll) => act(game, 'encounter.choose', { index: roll() < 0.6 ? 0 : Math.floor(roll() * 3) }) },
    { weight: 2, run: game => act(game, 'vending.kick') },
    { weight: 2, run: game => act(game, 'vending.walkAway') },
    { weight: 3, run: game => act(game, 'vending.coinReturn') },
    { weight: 2, run: game => act(game, 'collection.smell') },
    { weight: 2, run: game => act(game, 'collection.sellDuplicates') },
    { weight: 3, run: game => act(game, 'collection.buyStorage') },
    { weight: 4, run: (game, roll) => act(game, 'job.work', { at: roll() < 0.8 ? Job.workplace(game) : 'home' }) },
    { weight: 2, run: game => act(game, 'job.openAtDesk') },
    { weight: 2, run: game => act(game, 'job.lunch') },
    { weight: 1, run: game => act(game, 'job.buyPack') },
    { weight: 1, run: game => act(game, 'people.knock') },
    { weight: 2, run: (game, roll) => act(game, 'story.visit', { location: Locations[Math.floor(roll() * Locations.length)].id }) },
    // Time passes: a few seconds, a while, or a long time away
    { weight: 10, run: (game, roll) => game.tick(game.time + Math.ceil(roll() * 30 * SECOND)) },
    { weight: 6, run: (game, roll) => game.tick(game.time + Math.ceil(roll() * 40 * MINUTE)) },
    { weight: 1, run: (game, roll) => game.catchUp(game.time + Math.ceil(roll() * 30 * HOUR)) }
];
const TOTAL_WEIGHT = MOVES.reduce((sum, move) => sum + move.weight, 0);

/**
 * The random player's own random numbers, separate from the game's
 */
function player(seed) {
    let state = seed;
    return () => {
        const [value, next] = nextRandom(state);
        state = next;
        return value;
    };
}

// The id of one of the player's cards, if they have any
function pickCard(game, roll) {
    const cards = game.state.collection.cards;
    return cards.length > 0 ? cards[Math.floor(roll() * cards.length)].id : 0;
}

// A set of packs, sometimes one that isn't sold in packs
function pickSet(roll) {
    return roll() < 0.9 ? Catalog.packSets()[Math.floor(roll() * Catalog.packSets().length)].id : 'promo';
}

function pickMove(roll) {
    let left = roll() * TOTAL_WEIGHT;
    return MOVES.find(move => (left -= move.weight) < 0) || MOVES[MOVES.length - 1];
}

const storageIndex = id => Rules.storage.findIndex(stage => stage.id === id);
const isCount = value => Number.isInteger(value) && value >= 0;

/**
 * Everything that must always be true
 * @param {Game} game - Game
 * @param {Object} last - What was true at the step before, to compare with
 */
function checkInvariants(game, last) {
    const state = game.state;

    assert.ok(isCount(state.wallet.cents), `money is whole cents and never negative: ${state.wallet.cents}`);
    assert.ok(isCount(state.wallet.allowanceEarned));
    assert.deepEqual(Object.keys(state.collection.packs), Catalog.packSets().map(set => set.id), 'packs of each set');
    for (const kinds of Object.values(state.collection.packs)) {
        assert.deepEqual(Object.keys(kinds), ['normal', 'special', 'mega'], 'packs of each kind');
        assert.ok(Object.values(kinds).every(isCount), 'pack counts');
    }
    assert.ok(Number.isInteger(state.story.days) && state.story.days >= Math.max(1, last.days), 'days played only go up');
    assert.ok(!game.unlocked('gus-open') || (game.unlocked('gus') && state.story.days >= Rules.gusOpensOnDay), 'Gus opens on a later day');
    assert.ok(state.collection.packsOpened >= last.packsOpened, 'packs opened never goes down');

    const collection = state.collection;
    const vending = state.vending;
    assert.ok(vending.slots.every(slot => slot === null || Vending.kinds.includes(slot)), 'slots');
    assert.equal(vending.goneAt.length, vending.slots.length, 'a time for each slot');
    assert.ok(vending.jammedSlot === null || (vending.jammedSlot >= 0 && vending.jammedSlot < Rules.slotCount), 'jammed slot');
    if (game.unlocked('mall') && !state.meta.ended) {
        assert.equal(vending.slots.length, Rules.slotCount);
        const due = vending.nextRestockAt;
        assert.ok(due > state.meta.lastTick, 'the next restock is in the future');
        assert.ok(due <= state.meta.lastTick + Rules.restockEvery + Rules.restockVariation, 'the next restock is not far off');
        assert.equal(due % MINUTE, 0, 'the driver comes on the minute');
    }

    const job = state.job;
    assert.ok(isCount(job.emailsAnswered) && job.emailsAnswered >= last.emailsAnswered, 'emails answered');
    assert.ok([0, 1, 2].includes(job.coworker) && job.coworker >= last.coworker, 'Marcus only gets friendlier');
    assert.ok(job.packsOpenedAtDesk <= collection.packsOpened, 'packs opened at the desk are packs opened');

    const ids = new Set();
    for (const card of collection.cards) {
        assert.ok(!ids.has(card.id), `card ${card.id} is there twice`);
        ids.add(card.id);
        assert.ok(card.id > 0 && card.id < collection.nextId, `card id ${card.id}`);
        const definition = Catalog.find(card.cardId);
        assert.ok(definition, `card ${card.cardId} is in the catalogue`);
        for (const field of ['name', 'type', 'rarity', 'power', 'value']) {
            assert.equal(card[field], definition[field], `${card.cardId} ${field}`);
        }
        assert.ok(Number.isInteger(card.condition) && card.condition >= 1 && card.condition <= 10, `condition ${card.condition}`);
    }
    assert.ok(collection.mostCards >= collection.cards.length);
    const away = state.store.grading.map(entry => entry.id);
    assert.ok([...away, ...collection.graded].every(id => ids.has(id)), 'cards being graded, or graded, are the player\'s');
    assert.equal(new Set([...away, ...collection.graded]).size, away.length + collection.graded.length, 'graded once each');
    assert.ok(state.store.grading.every(entry => entry.backAt > state.meta.lastTick || !game.unlocked('gus-open')), 'graded cards come back when due');
    assert.ok(state.store.singles.every(single => single === null || Catalog.find(single.cardId)), 'singles');

    const tournament = state.tournaments.current;
    assert.equal(tournament !== null, ['match', 'lunch'].includes(state.encounter?.id), 'a match is on only during a tournament');
    assert.ok(isCount(job.lunches) && job.lunches >= last.lunches, 'lunches with Marcus');
    assert.ok(job.lunches === 0 || job.coworker === 2, 'lunch is after Marcus asks');
    assert.ok(job.packDay === 0 || job.lunches >= Rules.lunchesBeforePacks, 'Marcus brings packs after a couple of lunches');
    if (tournament) {
        assert.ok(tournament.results.length < Rules.tournamentMatches, 'the tournament is not over');
        assert.ok(tournament.rounds.filter(round => round.won).length < 2 && tournament.rounds.filter(round => !round.won).length < 2, 'the match is not over');
        const played = tournament.rounds.map(round => round.copy).filter(Boolean);
        assert.equal(new Set(played).size, played.length, 'each card is played once a match');
    }
    assert.ok(state.tournaments.localsWon <= state.tournaments.localsPlayed);
    assert.ok(['spring', 'summer'].includes(state.story.season), 'season');
    if (state.story.season === 'summer') {
        const played = state.tournaments.prereleaseDay;
        assert.ok(played > 0 && played < localDay(state.meta.lastTick), 'summer comes the day after the pre-release');
    }
    assert.ok(state.tournaments.prereleaseDay === 0 || game.unlocked('prerelease-invite'), 'the pre-release is for regulars');
    assert.ok(state.tournaments.localsPlayed === 0 || state.story.days >= Rules.clashFromDay, 'Friday Night Clash starts on the fourth day');
    assert.equal(vending.sets.length, Rules.slotCount);
    vending.sets.forEach((set, index) => {
        assert.ok(set === 'base' || (state.story.season === 'summer' && vending.slots[index] !== 'special'), `slot ${index}: ${set}`);
    });
    assert.ok(state.trades.offers.every(offer => offer === null ||
        (Catalog.find(offer.give).rarity === Catalog.find(offer.want).rarity)), 'Marcus trades the same rarity');
    assert.ok(last.completed.every(part => collection.completed.includes(part)), 'completed checklists stay completed');
    assert.ok(storageIndex(collection.storage) >= 0, `storage ${collection.storage}`);
    assert.ok(storageIndex(collection.storage) >= storageIndex(last.storage), 'storage never goes back');

    const strikes = state.kindness.strikes.length;
    assert.ok(strikes >= last.strikes, 'strikes stick');
    assert.ok(strikes <= Rules.maxStrikes);
    assert.equal(strikes === Rules.maxStrikes, state.meta.ended === 'shame', 'the last strike ends the run');

    assert.ok(state.encounter === null || game.encounters.has(state.encounter.id), 'encounter');
    assert.equal(new Set(state.progress.unlocked).size, state.progress.unlocked.length, 'unlocked once each');
    for (const id of last.unlocked) {
        assert.ok(game.unlocked(id), `${id} stays unlocked`);
    }

    for (const message of game.messages) {
        assert.equal(typeof message.text, 'string');
        assert.ok(message.text.length > 0 && !/undefined|NaN|\[object/.test(message.text), `message: ${message.text}`);
    }
}

/**
 * The screens must draw whatever state the game is in
 */
function checkScreens(game) {
    const drawn = [];
    if (game.state.meta.ended) {
        drawn.push(renderEnding(game, game.state.meta.ended));
    } else if (game.encounter()) {
        drawn.push(renderEncounter(game, game.encounter()));
    }
    for (const place of Locations.filter(each => each.visible(game))) {
        for (const panel of [undefined, 'gus', 'packs', 'grading', 'board', 'case', 'table']) {
            drawn.push(place.render(game, { panel }));
        }
    }
    for (const html of drawn) {
        assert.ok(!/undefined|NaN|\[object/.test(html), html);
    }
}

/**
 * Saving and loading at any moment must give back the same game
 */
function checkSave(game) {
    const data = JSON.parse(JSON.stringify(game.toSaveData()));
    const loaded = newGame({ save: data, now: game.time });
    assert.deepEqual(loaded.toSaveData(), game.toSaveData());
}

function snapshot(game) {
    return {
        packsOpened: game.state.collection.packsOpened,
        storage: game.state.collection.storage,
        strikes: game.state.kindness.strikes.length,
        emailsAnswered: game.state.job.emailsAnswered,
        completed: [...game.state.collection.completed],
        coworker: game.state.job.coworker,
        days: game.state.story.days,
        lunches: game.state.job.lunches,
        unlocked: [...game.state.progress.unlocked]
    };
}

/**
 * Bring a new game to summer: Gus's store found and open, locals won, and
 * the pre-release played
 */
function toSummer(game) {
    finishOpening(game);
    game.state.collection.cardsOpened = Rules.gusWithoutTip;
    // To the day of the first Friday Night Clash
    for (let day = 1; day < Rules.clashFromDay; day++) {
        game.tick(game.time + 24 * HOUR);
    }
    game.state.wallet.cents += 10000;
    game.state.collection.packs.base.normal = 10;
    for (let pack = 0; pack < 10; pack++) {
        act(game, 'collection.open', { kind: 'normal' });
    }
    game.state.tournaments.localsWon = 1;
    game.state.tournaments.localsPlayed = 1;
    game.checkUnlocks();
    act(game, 'tournaments.enterPrerelease');
    while (game.state.tournaments.current) {
        const choices = game.encounter().choices(game);
        act(game, 'encounter.choose', { index: choices.findIndex(choice => !choice.disabled) });
    }
    game.tick(game.time + 24 * HOUR);
    assert.equal(game.state.story.season, 'summer');
}

/**
 * Play one random game
 * @param {number} seed - Seed
 * @param {number} steps - Moves to make
 * @param {Object} options - summer: start from a game in summer
 * @returns {Object} - The game and what happened in it
 */
function playRandomly(seed, steps = STEPS, { summer = false } = {}) {
    const roll = player(seed);
    // Start at any hour of any day of the week
    const game = newGame({ seed, now: START + Math.floor(roll() * 7 * 24) * HOUR });
    if (summer) {
        toSummer(game);
    }
    let last = snapshot(game);

    for (let step = 1; step <= steps && !game.state.meta.ended; step++) {
        pickMove(roll).run(game, roll);
        try {
            checkInvariants(game, last);
            if (step % 50 === 0 || game.state.meta.ended) {
                checkScreens(game);
                checkSave(game);
            }
        } catch (error) {
            error.message = `seed ${seed}, step ${step}: ${error.message}`;
            throw error;
        }
        last = snapshot(game);
    }
    return game;
}

test('the game always makes sense, whatever the player does', (t) => {
    const reached = { storage: new Set(), endings: 0, gus: 0, gusOpen: 0, graded: 0, locals: 0, trades: 0, summer: 0, cards: 0, lunch: 0, lunches: 0, flip: 0, terry: 0 };
    for (let seed = 1; seed <= SEEDS; seed++) {
        const game = playRandomly(seed);
        reached.storage.add(game.state.collection.storage);
        reached.endings += game.state.meta.ended ? 1 : 0;
        reached.gus += game.unlocked('gus') ? 1 : 0;
        reached.gusOpen += game.unlocked('gus-open') ? 1 : 0;
        reached.graded += game.state.collection.graded.length > 0 ? 1 : 0;
        reached.locals += game.state.tournaments.localsPlayed > 0 ? 1 : 0;
        reached.trades += game.state.trades.made > 0 ? 1 : 0;
        reached.summer += game.state.story.season === 'summer' ? 1 : 0;
        reached.cards = Math.max(reached.cards, game.state.collection.cards.length);
        reached.lunch += game.state.job.coworker === 2 ? 1 : 0;
        reached.lunches += game.state.job.lunches > 0 ? 1 : 0;
        reached.flip += game.state.people.flip.encounters > 0 ? 1 : 0;
        reached.terry += game.state.people.terry.encounters > 0 ? 1 : 0;
    }

    t.diagnostic(`storage reached: ${[...reached.storage].join(', ')}; Gus found in ${reached.gus} games, open in ${reached.gusOpen}, a graded card in ${reached.graded}, locals in ${reached.locals}, a trade with Marcus in ${reached.trades}, summer in ${reached.summer}; ${reached.endings} ended; most cards ${reached.cards}; Marcus asked ${reached.lunch} to lunch and played ${reached.lunches}; met Flip in ${reached.flip}, Terry in ${reached.terry}`);
    // The random player has to get far enough for this test to mean something
    assert.ok([...reached.storage].some(id => id !== 'shoebox'), 'some games bought storage');
    assert.ok(reached.gus > 0, 'some games found Gus');
    assert.ok(reached.gusOpen > 0, 'some games were there when Gus opened');
    assert.ok(reached.graded > 0, 'some games got a card back from grading');
    assert.ok(reached.locals > 0 && reached.trades > 0, 'some games played locals and traded with Marcus');
    assert.ok(reached.endings > 0, 'some games ended in shame');
    assert.ok(reached.lunch > 0, 'some games got as far as lunch with Marcus');
    assert.ok(reached.flip > 0 && reached.terry > 0, 'some games met the scalper and Terry');
});

test('the game still makes sense in summer, with Set 2 out', (t) => {
    let newSetPacks = 0;
    for (let seed = 1; seed <= SEEDS / 2; seed++) {
        const game = playRandomly(seed, STEPS / 2, { summer: true });
        newSetPacks += game.state.collection.packs.backyard.normal + game.state.collection.cards.filter(card => Catalog.find(card.cardId).set === 'backyard').length;
    }
    t.diagnostic(`Set 2 cards and packs held: ${newSetPacks}`);
    assert.ok(newSetPacks > 0);
});

test('the same seed and the same moves give the same game', () => {
    for (const seed of [3, 17, 29]) {
        const first = playRandomly(seed);
        const second = playRandomly(seed);
        assert.deepEqual(second.toSaveData(), first.toSaveData(), `seed ${seed}`);
        assert.deepEqual(second.messages, first.messages, `seed ${seed}`);
    }
});
