import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameAtGus, gameAtClash, newGame, act, overrideRules, restock, newestMessage } from './helpers.js';
import { Tournaments } from '../js/systems/tournaments.js';
import { Store } from '../js/systems/store.js';
import { Vending } from '../js/systems/vending.js';
import { Collection } from '../js/systems/collection.js';
import { Cards } from '../js/systems/cards.js';
import { Catalog } from '../js/content/catalog.js';
import { Rules } from '../js/rules.js';
import { Lines } from '../js/content/text/index.js';
import { localDay } from '../js/core/time.js';

const DAY = 24 * 60 * 60 * 1000;
const SET_2 = Catalog.inSet('backyard');

/**
 * A game at Gus's (on the second day) that has won locals, so it is
 * invited to the pre-release
 */
function invitedGame(seed) {
    const game = gameAtClash({ seed });
    Collection.add(game, Catalog.inSet('base').map(card => Cards.card(card.id, 8)));
    game.state.collection.packsOpened = 30;
    game.state.tournaments.localsWon = 1;
    game.checkUnlocks();
    assert.ok(game.unlocked('prerelease-invite'));
    return game;
}

/**
 * Play every round of the tournament on, picking the first type offered
 */
function playOut(game) {
    while (game.state.tournaments.current) {
        const choices = game.encounter().choices(game);
        act(game, 'encounter.choose', { index: choices.findIndex(choice => !choice.disabled) });
    }
}

/**
 * A game in summer, the day after the pre-release
 */
function summerGame(seed) {
    const game = invitedGame(seed);
    act(game, 'tournaments.enterPrerelease');
    playOut(game);
    game.tick(game.time + DAY);
    assert.equal(game.state.story.season, 'summer');
    return game;
}

test('Set 2, Backyard Brawl, has 102 cards, 34 of each type, like a real set', () => {
    const count = rarity => SET_2.filter(card => card.rarity === rarity).length;
    assert.equal(SET_2.length, 102);
    assert.deepEqual([count('common'), count('uncommon'), count('rare'), count('ultra-rare')], [51, 30, 15, 6]);
    for (const type of Catalog.types) {
        assert.equal(SET_2.filter(card => card.type === type).length, 34, type);
    }
    assert.equal(Catalog.number(SET_2[0].id), `1/${SET_2.length}`);
});

test('before summer, Set 2 is nowhere to be bought', () => {
    const game = invitedGame();
    assert.deepEqual(Store.packsForSale(game).map(each => each.set), ['base']);
    assert.equal(Vending.newSet(game), null);
    act(game, 'store.buyPack', { set: 'backyard' });
    assert.equal(game.state.collection.packs.backyard.normal, 0);
    assert.ok(game.state.store.singles.every(single => Catalog.find(single.cardId).set === 'base'));
});

test('winning locals for the first time gets an invitation to the pre-release', () => {
    const game = gameAtClash();
    game.checkUnlocks();
    assert.equal(game.unlocked('prerelease-invite'), false);
    game.state.tournaments.localsWon = 1;
    game.checkUnlocks();
    assert.ok(game.unlocked('prerelease-invite'));
    assert.equal(newestMessage(game), Lines.tournaments.invited);
    assert.equal(Tournaments.prereleaseSet(game), 'backyard');
});

test('the pre-release kit is four Set 2 packs, opened at the table, and the only cards played', () => {
    const game = invitedGame();
    const cards = game.state.collection.cards.length;
    const before = game.state.wallet.cents;
    act(game, 'tournaments.enterPrerelease');

    assert.equal(game.state.wallet.cents, before - Rules.prereleaseKitPrice);
    const kit = game.state.collection.cards.slice(cards);
    assert.equal(kit.length, Rules.prereleaseKitPacks * 5);
    assert.ok(kit.every(card => Catalog.find(card.cardId).set === 'backyard'));
    assert.ok(game.messages.some(message => message.text === Lines.packs.newChecklist('Backyard Brawl', SET_2.length)), 'a new checklist');

    const current = game.state.tournaments.current;
    assert.equal(current.kind, 'prerelease');
    const kitIds = new Set(kit.map(card => card.id));
    assert.ok(current.deck.length > 0 && current.deck.every(id => kitIds.has(id)), 'only cards from the kit');
    assert.equal(game.encounter().id, 'match');
});

test('everyone at the pre-release gets the promo, and a Set 2 pack for each match won, once', () => {
    const game = invitedGame();
    act(game, 'tournaments.enterPrerelease');
    playOut(game);
    const promo = game.state.collection.cards.filter(card => card.cardId === 'early-bird');
    assert.equal(promo.length, 1);
    assert.equal(game.state.tournaments.prereleaseDay, localDay(game.time));
    assert.equal(game.state.tournaments.localsPlayed, 0, 'not locals');

    const before = game.state.wallet.cents;
    act(game, 'tournaments.enterPrerelease');
    assert.equal(game.state.tournaments.current, null, 'only once');
    assert.equal(game.state.wallet.cents, before);
});

test('pre-release regulars play Set 2 cards too', () => {
    const game = invitedGame();
    act(game, 'tournaments.enterPrerelease');
    act(game, 'encounter.choose', { index: 0 });
    const current = game.state.tournaments.current;
    const round = current.rounds[0] || current.results[0].rounds[0];
    assert.equal(Catalog.find(round.theirs).set, 'backyard');
});

test('summer comes the day after the pre-release', () => {
    const game = invitedGame();
    act(game, 'tournaments.enterPrerelease');
    playOut(game);
    game.tick(game.time + 1000);
    assert.equal(game.state.story.season, 'spring', 'not the same day');
    game.tick(game.time + DAY);
    assert.equal(game.state.story.season, 'summer');
    assert.equal(game.state.story.days, Rules.clashFromDay + 1);
    assert.ok(game.messages.some(message => message.text === Lines.story.summer));

    // Days go by, but without the pre-release it stays spring
    const late = gameAtClash();
    late.tick(late.time + 5 * DAY);
    assert.equal(late.state.story.season, 'spring');
});

test('in summer, Gus sells Set 2 at a big markup, and locals is played with it', () => {
    const game = summerGame();
    assert.deepEqual(Store.packsForSale(game), [{ set: 'base', price: Rules.gusPrices.base }, { set: 'backyard', price: Rules.gusPrices.backyard }]);
    assert.ok(Rules.gusPrices.backyard >= 2 * Rules.prices.normal, 'more than twice the machine\'s price');
    const prizes = game.state.collection.packs.backyard.normal;
    act(game, 'store.buyPack', { set: 'backyard' });
    assert.equal(game.state.collection.packs.backyard.normal, prizes + 1);

    assert.equal(Tournaments.localsEntry(game), Rules.localsEntryPacks * Rules.gusPrices.backyard);
    const packs = game.state.collection.packs.backyard.normal;
    act(game, 'tournaments.enterLocals');
    assert.equal(game.state.collection.packs.backyard.normal, packs + Rules.localsEntryPacks);
    assert.equal(game.state.tournaments.current.set, 'backyard');
});

test('in summer, about half the machine is Set 2, at the same price, and it sells sooner', () => {
    const game = summerGame(5);
    let slots = 0;
    let newSet = 0;
    const soonest = { base: Infinity, backyard: Infinity };
    for (let restocks = 0; restocks < 200; restocks++) {
        restock(game);
        const vending = game.state.vending;
        vending.slots.forEach((kind, index) => {
            if (vending.goneAt[index] - vending.restockedAt > 0 && kind === 'normal') {
                const set = vending.sets[index];
                soonest[set] = Math.min(soonest[set], vending.goneAt[index] - vending.restockedAt);
            }
        });
        // Everything the driver brought, before anyone buys it
        for (const [index, kind] of vending.slots.entries()) {
            if (kind === 'special') {
                assert.equal(vending.sets[index], 'base', 'special packs stay Base Set packs');
            }
        }
        slots += vending.sets.length;
        newSet += vending.sets.filter(set => set === 'backyard').length;
    }
    assert.ok(Math.abs(newSet / slots - Rules.newSetShare) < 0.06, `${newSet / slots}`);
    assert.ok(soonest.backyard < soonest.base, 'the new set goes sooner');
    assert.ok(soonest.backyard <= Rules.soldAfter.normal[0] * 60 * 1000 * Rules.newSetSellsSooner + 1000);
});

test('a Set 2 pack from the machine costs the same, and holds Set 2 cards', (t) => {
    overrideRules(t, { jamChance: 0 });
    const game = summerGame(7);
    game.state.collection.packs.backyard.normal = 0;
    for (let tries = 0; tries < 20 && !game.state.vending.slots.some((kind, index) => kind === 'normal' && game.state.vending.sets[index] === 'backyard'); tries++) {
        restock(game);
    }
    const slot = game.state.vending.slots.findIndex((kind, index) => kind === 'normal' && game.state.vending.sets[index] === 'backyard');
    assert.ok(slot >= 0);
    game.state.wallet.cents = Rules.prices.normal;
    act(game, 'vending.buy', { slot });
    assert.equal(game.state.collection.packs.backyard.normal, 1);
    assert.equal(game.state.wallet.cents, 0);
    assert.match(game.messages.find(message => message.text.startsWith('*thunk*')).text, /Backyard Brawl pack/);

    const cards = game.state.collection.cards.length;
    act(game, 'collection.open', { set: 'backyard', kind: 'normal' });
    assert.ok(game.state.collection.cards.slice(cards).every(card => Catalog.find(card.cardId).set === 'backyard'));
});

test('a Set 2 bundle is three Set 2 packs', (t) => {
    overrideRules(t, { jamChance: 0 });
    const game = summerGame();
    game.state.collection.packs.backyard.normal = 0;
    game.state.vending.slots[0] = 'bundle';
    game.state.vending.sets[0] = 'backyard';
    game.state.vending.goneAt[0] = game.time + DAY;
    game.state.wallet.cents = Rules.prices.bundle;
    act(game, 'vending.buy', { slot: 0 });
    assert.equal(game.state.collection.packs.backyard.normal, 3);
    assert.equal(game.state.collection.packs.base.normal, 0);
});

test('in summer, the scalper comes more often', (t) => {
    overrideRules(t, { scalperChance: 0, summerScalperChance: 1 });
    const game = summerGame();
    game.state.people.pip.encounters = 1;
    game.state.people.flip.encounters = 1;
    game.state.vending.packsBought = Rules.scalperAfterPacks;
    game.state.wallet.cents = 10000;
    restock(game);
    const slot = game.state.vending.slots.findIndex(kind => kind !== null);
    act(game, 'vending.buy', { slot });
    assert.equal(game.encounter()?.id, 'scalper');
});

test('a summer game survives saving and loading', () => {
    const game = summerGame();
    restock(game);
    const loaded = newGame({ save: JSON.parse(JSON.stringify(game.toSaveData())), now: game.time });
    assert.deepEqual(loaded.toSaveData(), game.toSaveData());
    assert.equal(loaded.state.story.season, 'summer');
});
