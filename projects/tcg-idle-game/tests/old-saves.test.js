/**
 * Saves from released versions of the game must keep loading. Each file in
 * tests/fixtures/ is a save as a released version left it in local storage,
 * part way through a run. When a release changes what the game saves, add a
 * save from the version before it.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { SaveSystem } from '../js/core/save.js';
import { Rules } from '../js/rules.js';
import { Collection } from '../js/systems/collection.js';
import { Vending } from '../js/systems/vending.js';
import { newGame, act, MemoryStorage } from './helpers.js';

const HOUR = 60 * 60 * 1000;
const FIXTURES = new URL('./fixtures/', import.meta.url);

const saves = readdirSync(FIXTURES)
    .filter(file => file.endsWith('.json'))
    .map(file => ({ file, raw: readFileSync(new URL(file, FIXTURES), 'utf8') }));

beforeEach(() => {
    globalThis.localStorage = new MemoryStorage();
});

/**
 * Load a save the way the page does, some time after it was saved
 */
function loadSave(raw, later = 2 * HOUR) {
    localStorage.setItem(SaveSystem.key, raw);
    const data = SaveSystem.load();
    assert.ok(data, 'the save loads');
    return newGame({ save: data, now: JSON.parse(raw).savedAt + later });
}

test('there are old saves to check', () => {
    assert.ok(saves.length > 0);
});

for (const { file, raw } of saves) {
    const saved = JSON.parse(raw).game;

    test(`${file}: progress carries over`, () => {
        const game = loadSave(raw);
        const state = game.state;

        assert.equal(state.collection.cards.length, saved.collection.cards.length, 'every card');
        assert.deepEqual(state.collection.packs, saved.collection.packs);
        assert.equal(state.collection.cardsOpened, saved.collection.cardsOpened);
        assert.equal(state.kindness.strikes.length, saved.kindness.strikes.length, 'strikes stick');
        assert.deepEqual(state.people, saved.people);
        assert.equal(state.vending.kicks, saved.vending.kicks);
        assert.equal(state.story.shoebox, saved.story.shoebox);
        assert.deepEqual(state.encounter, saved.encounter, 'an encounter in progress is still there');
        for (const id of saved.progress.unlocked) {
            assert.ok(state.progress.unlocked.includes(id), `still unlocked: ${id}`);
        }
        assert.ok(state.wallet.cents > saved.wallet.cents, 'allowance was paid for the time away');
        assert.equal(state.meta.ended, null);
    });

    test(`${file}: the machine restocks on time`, () => {
        const game = loadSave(raw);
        assert.equal(Vending.stockLeft(game), Rules.slotCount, 'restocked while away');
        const due = Vending.nextRestockAt(game);
        assert.ok(due > game.time && due <= game.time + Rules.restockEvery + Rules.restockVariation, 'the driver is due soon');

        const soon = loadSave(raw, 60 * 1000);
        const dueSoon = Vending.nextRestockAt(soon);
        assert.ok(dueSoon > soon.time && dueSoon <= soon.time + Rules.restockEvery + Rules.restockVariation);
    });

    test(`${file}: the game carries on`, () => {
        const game = loadSave(raw);
        const cards = game.state.collection.cards.length;

        if (game.state.encounter) {
            act(game, 'encounter.choose', { index: 0 });
            assert.equal(game.state.encounter, null);
        }
        const slot = game.state.vending.slots.findIndex(kind => kind === 'normal');
        act(game, 'vending.buy', { slot });
        act(game, 'collection.open', { kind: 'normal' });
        act(game, 'collection.sellDuplicates');
        act(game, 'wallet.work');
        act(game, 'people.knock');

        assert.ok(game.state.collection.packsOpened > saved.collection.packsOpened);
        assert.ok(game.state.collection.cards.length > 0 && game.state.collection.cards.length !== cards);
        assert.ok(Number.isInteger(game.state.wallet.cents) && game.state.wallet.cents >= 0);
        assert.equal(game.state.meta.ended, null);
    });

    test(`${file}: saving it again loses nothing`, () => {
        const game = loadSave(raw);
        SaveSystem.save(game.toSaveData());
        const again = newGame({ save: SaveSystem.load(), now: game.time });
        assert.deepEqual(again.toSaveData(), game.toSaveData());
    });
}

test('players who got a binder for free in the first release keep it', () => {
    const { raw } = saves.find(each => each.file === 'save-pr30.json');
    const game = loadSave(raw);
    assert.equal(Collection.storage(game), 'binder');
    assert.equal(Collection.storageForSale(game), null, 'the next one is not for sale yet');
});

test('players who outgrew the shoebox can buy a binder', () => {
    const { raw } = saves.find(each => each.file === 'save-pr31.json');
    const game = loadSave(raw);
    assert.equal(Collection.storage(game), 'shoebox');
    assert.equal(Collection.storageForSale(game)?.id, 'binder');
    act(game, 'collection.buyStorage');
    assert.equal(Collection.storage(game), 'binder');
});
