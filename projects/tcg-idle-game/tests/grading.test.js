import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameAtGus, newGame, act, newestMessage } from './helpers.js';
import { Store } from '../js/systems/store.js';
import { Collection } from '../js/systems/collection.js';
import { Cards } from '../js/systems/cards.js';
import { Catalog } from '../js/content/catalog.js';
import { Rules } from '../js/rules.js';
import { Lines } from '../js/content/text/index.js';

const HOUR = 60 * 60 * 1000;

/**
 * Give the player a card in a given condition
 */
function give(game, cardId, condition) {
    return Collection.add(game, [Cards.card(cardId, condition)])[0];
}

test('cards come out of packs in good condition, now and then perfect, at the odds in the rules', () => {
    const game = newGame({ seed: 4 });
    const seen = {};
    const rolls = 20000;
    for (let i = 0; i < rolls; i++) {
        const condition = Cards.packCondition(game);
        seen[condition] = (seen[condition] || 0) + 1;
    }
    for (const [condition, chance] of Object.entries(Rules.packCondition)) {
        assert.ok(Math.abs(seen[condition] / rolls - chance) < 0.015, `${condition}: ${seen[condition] / rolls}`);
    }
    assert.deepEqual(Object.keys(seen).sort(), Object.keys(Rules.packCondition).sort());
});

test('by eye, a 9 and a 10 look the same, and worse cards look worse', () => {
    assert.equal(Lines.gus.read(10), Lines.gus.read(9));
    const reads = [9, 8, 7, 6, 5, 1].map(Lines.gus.read);
    assert.equal(new Set(reads).size, reads.length);
});

test('the glass case holds six singles from the Base Set, at twice their value', () => {
    const game = gameAtGus();
    const singles = game.state.store.singles;
    assert.equal(singles.length, Rules.caseSlots.length);
    const rarities = singles.map(single => Catalog.find(single.cardId).rarity);
    assert.deepEqual(rarities.slice(0, 5), ['common', 'common', 'uncommon', 'uncommon', 'rare']);
    assert.ok(['rare', 'ultra-rare'].includes(rarities[5]));
    for (const single of singles) {
        const card = Catalog.find(single.cardId);
        assert.equal(card.set, 'base');
        assert.equal(Store.singlePrice(card.id), Math.max(Rules.singlesMinPrice, card.value * 2));
    }
});

test('a single bought from the case keeps its condition, and its spot stays empty until the restock', () => {
    const game = gameAtGus();
    const single = game.state.store.singles[4];
    const before = game.state.wallet.cents;
    act(game, 'store.buySingle', { spot: 4 });

    const card = game.state.collection.cards.at(-1);
    assert.equal(card.cardId, single.cardId);
    assert.equal(card.condition, single.condition);
    assert.equal(game.state.wallet.cents, before - Store.singlePrice(single.cardId));
    assert.equal(game.state.store.singles[4], null);

    act(game, 'store.buySingle', { spot: 4 });
    assert.equal(game.state.collection.cards.length, 1, 'it can only be bought once');
});

test('without the money, the single stays in the case', () => {
    const game = gameAtGus();
    game.state.wallet.cents = 0;
    act(game, 'store.buySingle', { spot: 0 });
    assert.ok(game.state.store.singles[0]);
    assert.equal(game.state.collection.cards.length, 0);
});

test('the case is restocked every four hours on the clock, not in between', () => {
    const game = gameAtGus();
    act(game, 'store.buySingle', { spot: 0 });
    const stockedAt = game.state.store.caseStockedAt;
    const clock = new Date(stockedAt);
    assert.ok(clock.getHours() % 4 === 0 && clock.getMinutes() === 0, 'at midnight, 4 AM, 8 AM, ...');

    game.tick(stockedAt + Rules.caseRestockEvery - 1);
    assert.equal(game.state.store.singles[0], null);
    game.tick(stockedAt + Rules.caseRestockEvery);
    assert.ok(game.state.store.singles[0], 'restocked');
    assert.equal(game.state.store.caseStockedAt, stockedAt + Rules.caseRestockEvery);
});

test('a single can finish part of a checklist', () => {
    const game = gameAtGus();
    const single = game.state.store.singles[0];
    const commons = Catalog.inSet('base', 'common').filter(card => card.id !== single.cardId);
    Collection.add(game, commons.map(card => Cards.card(card.id, 8)));
    act(game, 'store.buySingle', { spot: 0 });
    assert.ok(game.state.collection.completed.includes('base:common'));
});

test('a card sent to grading costs $5 and comes back a day later, graded with the condition it always had', () => {
    const game = gameAtGus();
    const card = give(game, 'lawnmower-lion', 10);
    const before = game.state.wallet.cents;
    act(game, 'store.grade', { id: card.id });
    assert.equal(game.state.wallet.cents, before - Rules.gradingFee);
    assert.equal(newestMessage(game), Lines.gus.sent(card.name, Lines.gus.read(10)));
    assert.equal(game.state.store.grading.length, 1);

    game.tick(game.time + Rules.gradingTime - 1);
    assert.equal(Collection.isGraded(game, card), false, 'not back yet');
    game.tick(game.time + 1);
    assert.ok(Collection.isGraded(game, card));
    assert.equal(game.state.store.grading.length, 0);
    assert.equal(newestMessage(game), Lines.gus.graded(card.name, 10, 'GEM MINT'));
});

test('grading comes back while the player is away, and is in the summary', () => {
    const game = gameAtGus();
    const card = give(game, 'lawnmower-lion', 9);
    act(game, 'store.grade', { id: card.id });
    game.catchUp(game.time + 2 * Rules.gradingTime);
    assert.ok(Collection.isGraded(game, card));
    assert.match(game.messages[0].text, /came back from grading \(9: MINT\)/);
});

test('a card away at grading, or graded, cannot be sent again, sold to Benny, or traded', () => {
    const game = gameAtGus();
    const card = give(game, 'lawnmower-lion', 8);
    const spare = give(game, 'lawnmower-lion', 7);
    act(game, 'store.grade', { id: card.id });
    act(game, 'store.grade', { id: card.id });
    assert.equal(game.state.store.grading.length, 1, 'sent once');
    assert.deepEqual(Collection.loose(game), [spare]);
    assert.deepEqual(Collection.duplicates(game), [], 'the copy left in hand is not a duplicate');

    game.tick(game.time + Rules.gradingTime);
    act(game, 'store.grade', { id: card.id });
    assert.equal(game.state.store.grading.length, 0, 'a graded card stays sealed');
    act(game, 'collection.sellDuplicates');
    assert.equal(game.state.collection.cards.length, 2, 'Benny buys neither');
});

test('a grade multiplies a card\'s value, and Gus buys graded cards for half', () => {
    const game = gameAtGus();
    const lion = Catalog.find('lawnmower-lion');
    const expected = { 10: 10, 9: 3, 8: 1.5, 7: 1, 6: 0.8, 3: 0.8 };
    for (const [grade, multiplier] of Object.entries(expected)) {
        assert.equal(Store.gradedValue(Cards.card(lion.id, Number(grade))), Math.round(lion.value * multiplier), `grade ${grade}`);
    }

    const card = give(game, lion.id, 10);
    act(game, 'store.grade', { id: card.id });
    game.tick(game.time + Rules.gradingTime);
    const before = game.state.wallet.cents;
    act(game, 'store.sellGraded', { id: card.id });
    assert.equal(game.state.wallet.cents, before + Math.floor(lion.value * 10 / 2));
    assert.equal(game.state.collection.cards.length, 0);
    assert.deepEqual(game.state.collection.graded, []);
});

test('Gus only buys graded cards', () => {
    const game = gameAtGus();
    const card = give(game, 'lawnmower-lion', 10);
    act(game, 'store.sellGraded', { id: card.id });
    assert.equal(game.state.collection.cards.length, 1);
});

test('Gus suggests the most valuable cards to grade, one copy each, the best-looking first', () => {
    const game = gameAtGus();
    give(game, 'soggy-toad', 10);
    const worn = give(game, 'lawnmower-lion', 6);
    const better = give(game, 'lawnmower-lion', 9);
    const dragon = give(game, 'chewed-dragon', 1);
    const candidates = Store.gradingCandidates(game);
    assert.equal(candidates[0], better);
    assert.ok(!candidates.includes(worn));
    assert.ok(candidates.indexOf(dragon) < candidates.findIndex(card => card.cardId === 'soggy-toad'), 'by value');
});

test('a 9 and a 10 that look the same are not told apart by the order they are suggested in', () => {
    const game = gameAtGus();
    const ten = give(game, 'lawnmower-lion', 10);
    const nine = give(game, 'lawnmower-lion', 9);
    assert.equal(Store.gradingCandidates(game)[0], ten, 'the first one found');
    Collection.remove(game, [ten]);
    give(game, 'lawnmower-lion', 10);
    assert.equal(Store.gradingCandidates(game)[0], nine);
});

test('grading and the case survive saving and loading', () => {
    const game = gameAtGus();
    const card = give(game, 'lawnmower-lion', 9);
    act(game, 'store.grade', { id: card.id });
    act(game, 'store.buySingle', { spot: 1 });
    const loaded = newGame({ save: JSON.parse(JSON.stringify(game.toSaveData())), now: game.time });
    assert.deepEqual(loaded.toSaveData(), game.toSaveData());
    loaded.tick(game.time + Rules.gradingTime);
    assert.ok(Collection.isGraded(loaded, loaded.state.collection.cards.find(each => each.id === card.id)));
});
