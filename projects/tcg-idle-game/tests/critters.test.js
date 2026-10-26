import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameAtMall } from './helpers.js';
import { Collection } from '../js/systems/collection.js';
import { critterEntries, bindersFor, sortForBinder, binderPage, renderCritters } from '../js/ui/scenes/critters.js';
import { pocket, emptyPocket } from '../js/ui/art/home.js';

const card = (name, rarity = 'common', type = 'Fire') =>
    ({ name, type, rarity, power: 1, value: 10, fixedId: null, condition: 8 });

function gameWith(cards) {
    const game = gameAtMall();
    Collection.add(game, cards);
    return game;
}

test('critters are grouped by name, with their best rarity and newest copy', () => {
    const game = gameWith([card('Soggy Toad'), card('Tiny Moth'), card('Soggy Toad', 'rare', 'Water')]);
    const toad = critterEntries(game).find(entry => entry.name === 'Soggy Toad');
    assert.deepEqual(toad, { name: 'Soggy Toad', count: 2, rarity: 'rare', type: 'Water', newest: 3 });
});

test('cards on a checklist are not counted as other critters', () => {
    const game = gameWith([{ ...card('Wet Sock Goblin'), fixedId: 'wet-sock-goblin' }]);
    assert.deepEqual(critterEntries(game), []);
});

test('the shoebox is a pile, newest first, that trails off', () => {
    const names = Array.from({ length: 45 }, (_, index) => `Critter ${String(index).padStart(2, '0')}`);
    const game = gameWith(names.map(name => card(name)));
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
    assert.deepEqual(bindersFor('bookshelf').map(binder => binder.id), ['Fire', 'Water', 'Nature']);
});

test('the two binders split the good cards from the commons', () => {
    const [good, commons] = bindersFor('two-binders');
    assert.equal(good.holds({ rarity: 'uncommon' }), true);
    assert.equal(good.holds({ rarity: 'common' }), false);
    assert.equal(commons.holds({ rarity: 'common' }), true);
});

test('an unknown binder or page falls back to the first', () => {
    const game = gameWith(Array.from({ length: 150 }, (_, index) => card(`Critter ${index}`, index % 2 ? 'common' : 'uncommon')));
    game.state.collection.storage = 'two-binders';
    const html = renderCritters(game, { binder: 'all', page: 'x' });
    assert.match(html, /class="current"[^>]*>The good ones \(75\)/);
    assert.match(html, /Page 1 of 9/);
});

test('pockets are all the same size, full or empty', () => {
    const sizes = art => art.split('\n').map(line => line.length);
    const full = pocket({ name: 'Suspicious Raccoon', rarity: 'uncommon', count: 12 });
    assert.deepEqual(sizes(full), sizes(emptyPocket));
    assert.equal(new Set(sizes(full)).size, 1);
    assert.match(full, /uncommon x12/);
});
