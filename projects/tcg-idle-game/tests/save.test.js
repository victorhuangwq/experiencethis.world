import { test, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SaveSystem } from '../js/core/save.js';
import { newGame, gameAtMall, act, START, MemoryStorage } from './helpers.js';

beforeEach(() => {
    globalThis.localStorage = new MemoryStorage();
    // The save system logs problems it recovers from; these tests cause them on purpose
    mock.method(console, 'error', () => {});
});

afterEach(() => {
    mock.restoreAll();
});

test('a saved game loads back to the same state', () => {
    const game = gameAtMall();
    act(game, 'vending.buy', { slot: 0 });
    act(game, 'collection.open', { kind: 'normal' });

    assert.equal(SaveSystem.save(game.toSaveData()), true);
    const loaded = newGame({ save: SaveSystem.load(), now: game.time });

    assert.deepEqual(loaded.toSaveData(), game.toSaveData());
    assert.deepEqual(loaded.state.collection.cards, game.state.collection.cards);
});

test('cards are saved compactly and come back whole', () => {
    const game = gameAtMall();
    act(game, 'vending.buy', { slot: 0 });
    act(game, 'collection.open', { kind: 'normal' });

    const saved = game.toSaveData().collection.cards;
    assert.ok(saved.every(card => Array.isArray(card) && card.length === 3), 'only the id, the card, and its condition');

    const loaded = newGame({ save: JSON.parse(JSON.stringify(game.toSaveData())), now: game.time });
    assert.equal(loaded.state.collection.cards.length, 5);
    assert.deepEqual(Object.keys(loaded.state.collection.cards[0]).sort(),
        ['cardId', 'condition', 'id', 'name', 'power', 'rarity', 'type', 'value']);
});

test('an active encounter survives saving and loading', () => {
    const game = newGame();
    assert.equal(game.encounter().id, 'shoebox');
    const loaded = newGame({ save: JSON.parse(JSON.stringify(game.toSaveData())) });
    assert.equal(loaded.encounter().id, 'shoebox');
});

test('an unknown encounter in a save is dropped', () => {
    const data = newGame().toSaveData();
    data.encounter = { id: 'removed-encounter' };
    assert.equal(newGame({ save: data }).encounter(), null);
});

test('reloading cannot reroll: the seed is saved', () => {
    const game = gameAtMall();
    const reloaded = newGame({ save: JSON.parse(JSON.stringify(game.toSaveData())), now: game.time });
    assert.equal(reloaded.random(), game.random());
});

test('a save from the earlier test version is not loaded, and is backed up', () => {
    localStorage.setItem(SaveSystem.key, JSON.stringify({ version: 1, game: {} }));
    assert.equal(SaveSystem.load(), null);
    assert.ok(localStorage.getItem(SaveSystem.key + '-backup'));
});

test('every version after the first has one upgrade step', () => {
    assert.ok(SaveSystem.version >= 3);
    for (let version = 3; version <= SaveSystem.version; version++) {
        assert.equal(typeof SaveSystem.migrations[version], 'function', `no step to version ${version}`);
    }
});

test('an older save is upgraded, and kept as it was first', () => {
    const raw = readFileSync(new URL('./fixtures/save-pr31.json', import.meta.url), 'utf8');
    localStorage.setItem(SaveSystem.key, raw);
    assert.ok(SaveSystem.load());
    assert.equal(localStorage.getItem(`${SaveSystem.key}-v2`), raw);
});

test('a save from this version is not backed up', () => {
    SaveSystem.save(gameAtMall().toSaveData());
    SaveSystem.load();
    const keys = [...localStorage.items.keys()];
    assert.deepEqual(keys, [SaveSystem.key]);
});

test('upgrading the same save twice gives the same result', () => {
    const data = JSON.parse(readFileSync(new URL('./fixtures/save-pr30.json', import.meta.url), 'utf8'));
    const once = SaveSystem.migrate(structuredClone(data));
    const twice = SaveSystem.migrate(structuredClone(data));
    assert.deepEqual(once, twice);
    assert.equal(once.version, SaveSystem.version);
});

test('if an upgrade step fails, the save is kept and a new game starts', (t) => {
    const raw = readFileSync(new URL('./fixtures/save-pr31.json', import.meta.url), 'utf8');
    const step = SaveSystem.migrations[3];
    SaveSystem.migrations[3] = () => {
        throw new Error('A bad release');
    };
    t.after(() => {
        SaveSystem.migrations[3] = step;
    });
    localStorage.setItem(SaveSystem.key, raw);
    assert.equal(SaveSystem.load(), null);
    assert.equal(localStorage.getItem(`${SaveSystem.key}-v2`), raw);
    assert.equal(localStorage.getItem(`${SaveSystem.key}-backup`), raw);
});

test('a save from a newer version is not loaded', () => {
    localStorage.setItem(SaveSystem.key, JSON.stringify({ version: SaveSystem.version + 1, game: {} }));
    assert.equal(SaveSystem.load(), null);
});

test('an unreadable save is backed up instead of lost', () => {
    localStorage.setItem(SaveSystem.key, '{not json');
    assert.equal(SaveSystem.load(), null);
    assert.equal(localStorage.getItem(SaveSystem.key + '-backup'), '{not json');
});

test('endings found are kept separately and survive clearing the save', () => {
    SaveSystem.endings.record('shame');
    SaveSystem.endings.record('shame');
    SaveSystem.clear();
    assert.deepEqual(SaveSystem.endings.found(), ['shame']);
    SaveSystem.endings.clear();
    assert.deepEqual(SaveSystem.endings.found(), []);
});

test('saving reports failure when storage refuses', () => {
    globalThis.localStorage.setItem = () => {
        throw new Error('QuotaExceededError');
    };
    assert.equal(SaveSystem.save(newGame().toSaveData()), false);
});

test('a loaded game catches up on time away', () => {
    const game = gameAtMall();
    const data = JSON.parse(JSON.stringify(game.toSaveData()));
    const later = START + 2 * 60 * 60 * 1000;
    const loaded = newGame({ save: data, now: later });
    assert.equal(loaded.state.wallet.cents, game.state.wallet.cents + 2 * 60 * 60 * 2);
});
