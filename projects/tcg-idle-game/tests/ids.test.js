/**
 * The register of ids (tests/fixtures/ids.json): every id a save can hold.
 * Once released, an id is permanent. It can't be renamed or removed unless
 * a migration retires it, listed under "retired" with the migration's
 * version. A new id has to be added to the register, so adding one is
 * deliberate.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { newGame, MemoryStorage } from './helpers.js';
import { SaveSystem } from '../js/core/save.js';
import { Catalog } from '../js/content/catalog.js';
import { Encounters } from '../js/content/encounters/index.js';
import { Unlocks } from '../js/content/unlocks.js';
import { Endings } from '../js/content/endings.js';
import { Releases } from '../js/content/releases.js';
import { Lines } from '../js/content/text/index.js';
import { Locations } from '../js/ui/scenes/index.js';
import { Rules } from '../js/rules.js';
import { Vending } from '../js/systems/vending.js';
import { Regulars } from '../js/content/regulars.js';

const FIXTURES = new URL('./fixtures/', import.meta.url);
const register = JSON.parse(readFileSync(new URL('ids.json', FIXTURES), 'utf8'));
const retired = register.retired;

// Every kind of id a save can hold, as the game has them now
const current = {
    cards: Catalog.cards.map(card => card.id),
    encounters: Encounters.map(encounter => encounter.id),
    unlocks: Unlocks.map(unlock => unlock.id),
    endings: Endings.map(ending => ending.id),
    places: Locations.map(place => place.id),
    storage: Rules.storage.map(stage => stage.id),
    packs: Vending.kinds,
    sets: Catalog.sets.map(set => set.id),
    regulars: Regulars.map(regular => regular.id),
    strikes: Object.keys(Lines.strikes).filter(key => key !== 'warning'),
    releases: Releases.map(release => release.id)
};

beforeEach(() => {
    globalThis.localStorage = new MemoryStorage();
});

test('the register covers every kind of id', () => {
    assert.deepEqual(Object.keys(register).filter(kind => kind !== 'retired').sort(), Object.keys(current).sort());
});

test('every id in the game is registered', () => {
    for (const [kind, ids] of Object.entries(current)) {
        const missing = ids.filter(id => !register[kind].includes(id));
        assert.deepEqual(missing, [], `new ${kind} ids: add them to tests/fixtures/ids.json. Once released, they are permanent.`);
    }
});

test('no released id is gone, unless a migration retired it', () => {
    for (const [kind, ids] of Object.entries(current)) {
        const gone = register[kind].filter(id => !ids.includes(id) && !retired[kind]?.[id]);
        assert.deepEqual(gone, [], `${kind} ids were removed or renamed: saves hold them. Put them back, or retire them with a migration.`);
    }
});

test('every retired id was retired by a migration that exists, and is gone', () => {
    for (const [kind, ids] of Object.entries(retired)) {
        for (const [id, version] of Object.entries(ids)) {
            assert.equal(typeof SaveSystem.migrations[version], 'function', `${kind} ${id}: no migration ${version}`);
            assert.ok(!current[kind].includes(id), `${kind} ${id} is retired but still in the game`);
        }
    }
});

test('once loaded, every old save holds only ids the game knows', () => {
    const fixtures = readdirSync(FIXTURES).filter(file => file.startsWith('save-'));
    assert.ok(fixtures.length > 0);
    for (const file of fixtures) {
        const raw = readFileSync(new URL(file, FIXTURES), 'utf8');
        localStorage.setItem(SaveSystem.key, raw);
        const { state } = newGame({ save: SaveSystem.load(), now: JSON.parse(raw).savedAt });

        const held = {
            cards: state.collection.cards.map(card => card.cardId),
            encounters: state.encounter ? [state.encounter.id] : [],
            unlocks: state.progress.unlocked,
            endings: state.meta.ended ? [state.meta.ended] : [],
            places: state.story.visited,
            storage: [state.collection.storage],
            packs: [...state.vending.slots.filter(Boolean), ...Object.values(state.collection.packs).flatMap(Object.keys)],
            sets: Object.keys(state.collection.packs),
            regulars: state.tournaments.current?.opponents || [],
            strikes: state.kindness.strikes.map(strike => strike.source),
            releases: [state.story.release]
        };
        for (const [kind, ids] of Object.entries(held)) {
            const unknown = ids.filter(id => !current[kind].includes(id));
            assert.deepEqual(unknown, [], `${file}: ${kind}`);
        }
    }
});
