import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameAtMall } from './helpers.js';
import { Collection } from '../js/systems/collection.js';
import { critterEntries, bindersFor, sortForBinder, binderPage, renderCritters } from '../js/ui/scenes/critters.js';
import { pocket, emptyPocket } from '../js/ui/art/home.js';
import { Cards } from '../js/systems/cards.js';
import { Catalog } from '../js/content/catalog.js';

function gameWith(cards) {
    const game = gameAtMall();
    Collection.add(game, cards);
    return game;
}

const copies = (cardId, count = 1) => Array.from({ length: count }, () => Cards.card(cardId, 8));

/**
 * Add made-up cards to the catalogue for one test, for checking how a
 * collection bigger than the catalogue looks
 */
function extraCards(t, count) {
    const extra = Array.from({ length: count }, (_, index) => ({
        id: `test-${index}`, set: 'test', name: `Critter ${String(index).padStart(2, '0')}`, type: 'Fire',
        rarity: index % 2 ? 'common' : 'uncommon', power: 1, value: 10, source: 'pack', flavor: 'A test.'
    }));
    Catalog.cards.push(...extra);
    t.after(() => Catalog.cards.splice(Catalog.cards.length - count, count));
    return extra.map(card => Cards.card(card.id, 8));
}

test('cards are grouped, with how many there are and the newest copy', () => {
    const game = gameWith([...copies('soggy-toad'), ...copies('spicy-gecko'), ...copies('soggy-toad')]);
    const toad = critterEntries(game).find(entry => entry.name === 'Soggy Toad');
    assert.deepEqual(toad, { name: 'Soggy Toad', count: 2, rarity: 'common', type: 'Water', number: Catalog.number('soggy-toad'), newest: 3 });
});

test('every card is shown, promos and shoebox cards too', () => {
    const game = gameWith([...copies('wet-sock-goblin'), ...copies('pips-favourite'), ...copies('wet-sock-gobln')]);
    assert.deepEqual(critterEntries(game).map(entry => entry.number), [Catalog.number('wet-sock-goblin'), 'PROMO 5', '']);
});

test('the shoebox is a pile, newest first, that trails off', (t) => {
    const game = gameWith(extraCards(t, 45));
    assert.equal(Collection.storage(game), 'shoebox', 'until a binder is bought');
    assert.equal(bindersFor(Collection.storage(game)), null);

    const html = renderCritters(game, {});
    assert.ok(html.indexOf('Critter 44') < html.indexOf('Critter 43'), 'newest first');
    assert.ok(!html.includes('Critter 04'), 'the oldest are at the bottom of the box');
    assert.match(html, /and 5 more at the bottom of the box/);
});

test('binders sort the best cards first, then by name', () => {
    const sorted = sortForBinder([
        { name: 'B', rarity: 'common' }, { name: 'A', rarity: 'common' }, { name: 'C', rarity: 'rare' }, { name: 'D', rarity: 'uncommon' }
    ]);
    assert.deepEqual(sorted.map(entry => entry.name), ['C', 'D', 'A', 'B']);
});

test('binder pages hold nine pockets, and the page stays in range', () => {
    const entries = Array.from({ length: 20 }, (_, index) => ({ name: String(index) }));
    assert.deepEqual(binderPage(entries, 1).pockets.map(entry => entry.name), ['0', '1', '2', '3', '4', '5', '6', '7', '8']);
    const last = binderPage(entries, 3);
    assert.equal(last.pages, 3);
    assert.equal(last.pockets.filter(Boolean).length, 2);
    assert.equal(last.pockets.length, 9, 'empty pockets fill the page');
    assert.equal(binderPage(entries, 99).page, 3);
    assert.equal(binderPage(entries, NaN).page, 1);
    assert.equal(binderPage([], 1).pages, 1);
});

test('more storage means more binders', () => {
    assert.equal(bindersFor('shoebox'), null);
    assert.deepEqual(bindersFor('binder').map(binder => binder.id), ['all']);
    assert.deepEqual(bindersFor('two-binders').map(binder => binder.id), ['good', 'commons']);
    assert.deepEqual(bindersFor('bookshelf').map(binder => binder.id), ['Fire', 'Water', 'Nature', 'Wild']);
});

test('the two binders split the good cards from the commons', () => {
    const [good, commons] = bindersFor('two-binders');
    assert.equal(good.holds({ rarity: 'uncommon' }), true);
    assert.equal(good.holds({ rarity: 'common' }), false);
    assert.equal(commons.holds({ rarity: 'common' }), true);
});

test('an unknown binder or page falls back to the first', (t) => {
    const game = gameWith(extraCards(t, 150));
    game.state.collection.storage = 'two-binders';
    const html = renderCritters(game, { binder: 'all', page: 'x' });
    assert.match(html, /class="current"[^>]*>The good ones \(75\)/);
    assert.match(html, /Page 1 of 9/);
});

test('pockets are all the same size, full or empty, for every card', () => {
    const sizes = art => art.split('\n').map(line => line.length);
    for (const card of Catalog.cards) {
        for (const count of [1, 12, 99]) {
            const full = pocket({ name: card.name, rarity: card.rarity, count, number: Catalog.number(card.id) });
            assert.deepEqual(sizes(full), sizes(emptyPocket), `${card.name} x${count}`);
        }
    }
    assert.equal(new Set(sizes(emptyPocket)).size, 1);
    assert.match(pocket({ name: 'Gutter Otter', rarity: 'uncommon', count: 12, number: '21/30' }), /uncommon +x12/);
});

test('every name fits in a pocket without being cut off', () => {
    for (const card of Catalog.cards) {
        const shown = pocket({ name: card.name, rarity: card.rarity, count: 1, number: '' }).replace(/[|\s]+/g, ' ');
        assert.ok(shown.includes(card.name), card.name);
    }
});
