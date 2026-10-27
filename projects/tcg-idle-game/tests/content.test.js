/**
 * Checks that the content fits together: every encounter, ending, unlock,
 * card, storage stage, and button points at something that exists. These
 * catch the mistakes that are easy to make when adding content.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { gameAtMall, newGame, act, finishOpening, START } from './helpers.js';
import { Rules } from '../js/rules.js';
import { Systems } from '../js/systems/index.js';
import { Unlocks } from '../js/content/unlocks.js';
import { Encounters } from '../js/content/encounters/index.js';
import { Endings } from '../js/content/endings.js';
import { Catalog } from '../js/content/catalog.js';
import { Lines } from '../js/content/text/index.js';
import { Locations } from '../js/ui/scenes/index.js';
import { ArtByKey } from '../js/ui/art/index.js';
import { bindersFor } from '../js/ui/scenes/critters.js';
import { renderEncounter } from '../js/ui/panels/encounter.js';
import { renderEnding } from '../js/ui/panels/ending.js';
import { Collection } from '../js/systems/collection.js';
import { Cards } from '../js/systems/cards.js';

// Actions the UI handles itself instead of passing to the game
const UI_ACTIONS = ['go', 'view.set', 'log.toggle', 'reveal.skip', 'restart'];

// Every JavaScript file of the game, with its source
const SOURCES = readdirSync(new URL('../js/', import.meta.url), { recursive: true })
    .filter(file => file.endsWith('.js'))
    .map(file => ({ file, source: readFileSync(new URL('../js/' + file, import.meta.url), 'utf8') }));

/**
 * Every first argument of calls like name('...') in the game's source
 */
function calls(name) {
    const pattern = new RegExp(`\\b${name}\\('([^']+)'`, 'g');
    return SOURCES.flatMap(({ file, source }) => [...source.matchAll(pattern)].map(match => ({ file, value: match[1] })));
}

const unique = list => new Set(list).size === list.length;

test('ids are unique', () => {
    assert.ok(unique(Systems.map(system => system.id)), 'systems');
    assert.ok(unique(Unlocks.map(unlock => unlock.id)), 'unlocks');
    assert.ok(unique(Encounters.map(encounter => encounter.id)), 'encounters');
    assert.ok(unique(Endings.map(ending => ending.id)), 'endings');
    assert.ok(unique(Locations.map(place => place.id)), 'locations');
    assert.ok(unique(Catalog.cards.map(card => card.id)), 'cards');
});

test('encounters happen in a real place, with art that exists', () => {
    const places = Locations.map(place => place.id);
    for (const encounter of Encounters) {
        assert.ok(places.includes(encounter.location), `${encounter.id}: location ${encounter.location}`);
        assert.equal(typeof ArtByKey[encounter.art], 'function', `${encounter.id}: art ${encounter.art}`);
        assert.equal(typeof encounter.text, 'function', encounter.id);
        assert.equal(typeof encounter.choices, 'function', encounter.id);
        if (encounter.on) {
            assert.equal(typeof encounter.check, 'function', `${encounter.id} needs a check`);
        }
    }
});

test('encounters listen for events that the game sends', () => {
    const sent = ['start', 'action', 'end', ...calls('emit').map(call => call.value)];
    for (const encounter of Encounters.filter(each => each.on)) {
        assert.ok(sent.includes(encounter.on), `${encounter.id} waits for "${encounter.on}", which nothing sends`);
    }
});

test('encounters started by id exist', () => {
    const ids = Encounters.map(encounter => encounter.id);
    for (const call of calls('startEncounter')) {
        assert.ok(ids.includes(call.value), `${call.file} starts "${call.value}"`);
    }
});

test('every ending the code can reach has a screen', () => {
    const reachable = calls('end').map(call => call.value);
    assert.ok(reachable.length > 0);
    for (const id of reachable) {
        const ending = Endings.find(each => each.id === id);
        assert.ok(ending, `no ending "${id}"`);
        assert.equal(typeof ArtByKey[ending.art], 'function', `${id}: art`);
        assert.equal(typeof ending.lines, 'function', `${id}: lines`);
        assert.ok(ending.note, `${id}: note`);
    }
});

test('every ending has a name', () => {
    for (const ending of Endings) {
        assert.equal(typeof ending.name, 'string', ending.id);
        assert.ok(ending.name.length > 0, ending.id);
    }
});

test('every encounter and ending screen renders', () => {
    const game = gameAtMall();
    for (const encounter of Encounters) {
        const html = renderEncounter(game, encounter);
        assert.ok(html.includes('data-action="encounter.choose"'), encounter.id);
        assert.ok(!html.includes('undefined'), encounter.id);
    }
    for (const ending of Endings.filter(each => each.art)) {
        const html = renderEnding(game, ending.id);
        assert.ok(html.includes(ending.name), ending.id);
        assert.ok(!html.includes('undefined'), ending.id);
    }
});

test('every card is complete and in a set', () => {
    const types = [...Catalog.types, Catalog.wildType];
    for (const card of Catalog.cards) {
        assert.ok(Catalog.findSet(card.set), `${card.id}: set ${card.set}`);
        assert.ok(types.includes(card.type), `${card.id}: type ${card.type}`);
        assert.ok(Catalog.rarities.includes(card.rarity), `${card.id}: rarity ${card.rarity}`);
        assert.ok(Number.isInteger(card.power) && card.power > 0, `${card.id}: power`);
        assert.ok(Number.isInteger(card.value) && card.value > 0, `${card.id}: value in whole cents`);
        assert.ok(card.name && card.flavor && card.source, card.id);
    }
});

test('names are unique, and every set has a numbered checklist', () => {
    assert.ok(unique(Catalog.cards.map(card => card.name)), 'card names');
    assert.ok(unique(Catalog.sets.map(set => set.id)), 'sets');
    for (const set of Catalog.sets.filter(each => !each.secret)) {
        const numbers = Catalog.inSet(set.id).map(card => Catalog.number(card.id));
        assert.ok(numbers.length > 0 && unique(numbers), set.id);
    }
    assert.equal(Catalog.number('wet-sock-goblin'), `1/${Catalog.inSet('base').length}`);
});

test('every rarity a pack can hold has cards, and the odds add up', () => {
    for (const [hit, odds] of Object.entries(Rules.hitOdds)) {
        assert.ok(Math.abs(Object.values(odds).reduce((sum, chance) => sum + chance, 0) - 1) < 1e-9, `${hit} odds add up to 1`);
    }
    for (const [kind, slots] of Object.entries(Rules.packSlots)) {
        const rarities = slots.flatMap(slot => Rules.hitOdds[slot] ? Object.keys(Rules.hitOdds[slot]) : [slot]);
        for (const rarity of rarities) {
            assert.ok(Catalog.inPacks(rarity).length > 0, `${kind}: no ${rarity} cards in packs`);
        }
    }
    assert.ok(Catalog.inPacks().every(card => card.source === 'pack'));
});

test('every card survives the save', () => {
    for (const card of Catalog.cards) {
        const copy = { id: 1, ...Cards.card(card.id, 5) };
        assert.deepEqual(Cards.unpack(Cards.pack(copy)), copy, card.id);
    }
});

test('the checklists have text for every rarity they hold', () => {
    for (const card of Catalog.cards) {
        assert.ok(Lines.home.rarities[card.rarity], card.rarity);
    }
    for (const card of Catalog.inPacks()) {
        assert.ok(Lines.home.completed[card.rarity], `Lines.home.completed['${card.rarity}']`);
    }
});

test('storage gets bigger and costs more, and every stage has its text and binders', () => {
    const [first, ...rest] = Rules.storage;
    assert.equal(first.price, 0, 'the first one is free');
    rest.forEach((stage, index) => {
        const before = Rules.storage[index];
        assert.ok(stage.cards > before.cards, `${stage.id} holds more`);
        assert.ok(stage.price > before.price, `${stage.id} costs more`);
        assert.ok(Number.isInteger(stage.price), `${stage.id}: whole cents`);
        for (const topic of ['outgrown', 'buy', 'upgraded']) {
            assert.ok(Lines.home[topic][stage.id], `Lines.home.${topic}['${stage.id}']`);
        }
        const binders = bindersFor(stage.id);
        assert.ok(binders?.length > 0, `${stage.id} has binders`);
        for (const binder of binders) {
            assert.ok(Lines.home.binders[binder.id], `Lines.home.binders['${binder.id}']`);
        }
    });
    for (const stage of Rules.storage) {
        assert.ok(Lines.home.names[stage.id], `Lines.home.names['${stage.id}']`);
    }
});

test('text covers every strike, season, and idle comment', () => {
    for (const [source, lines] of Object.entries(Lines.strikes).filter(([key]) => key !== 'warning')) {
        assert.equal(lines.length, Rules.maxStrikes - 1, `a line for each strike before the last: ${source}`);
    }
    const game = newGame();
    assert.ok(Lines.story.seasons[game.state.story.season], 'the starting season has a tag');
    assert.ok(Lines.story.idle.length >= Rules.idleJokesAt.length);
    assert.ok(Lines.packs.sniffs[Rules.sniffsToAttune], 'a line for becoming attuned');
});

test('the job works in real places, with lines for every kind of day', () => {
    const places = Locations.map(place => place.id);
    assert.equal(Rules.workplaces.length, 7, 'one for each day of the week');
    for (const workplace of Rules.workplaces) {
        assert.ok(workplace === null || places.includes(workplace), `workplace ${workplace}`);
        for (const topic of ['unlocked', 'today', 'wrongPlace']) {
            assert.equal(typeof Lines.job[topic][workplace || 'off'], 'function', `Lines.job.${topic}.${workplace || 'off'}`);
        }
    }
    assert.equal(Lines.job.days.length, 7);
});

test('no text is empty', () => {
    const check = (value, path) => {
        if (typeof value === 'string') {
            assert.ok(value.trim().length > 0, path);
        } else if (Array.isArray(value)) {
            assert.ok(value.length > 0, path);
            value.forEach((item, index) => check(item, `${path}[${index}]`));
        } else if (value && typeof value === 'object') {
            for (const [key, item] of Object.entries(value)) {
                check(item, `${path}.${key}`);
            }
        } else {
            assert.equal(typeof value, 'function', `${path} is ${typeof value}`);
        }
    };
    check(Lines, 'Lines');
});

test('every button runs an action that exists', () => {
    const actions = new Set(UI_ACTIONS);
    actions.add('encounter.choose');
    for (const system of Systems) {
        for (const name of Object.keys(system.actions || {})) {
            actions.add(`${system.id}.${name}`);
        }
    }

    const used = [
        ...calls('button'),
        ...calls('perform'),
        ...SOURCES.flatMap(({ file, source }) =>
            [...source.matchAll(/data-action="([^"$]+)"/g)].map(match => ({ file, value: match[1] })))
    ];
    assert.ok(used.length > 10, 'found the buttons');
    for (const { file, value } of used) {
        assert.ok(actions.has(value) || value.startsWith('dev.'), `${file}: "${value}" is not an action`);
    }
});

test('every place renders at every stage of the game', () => {
    const fresh = newGame();
    const kept = newGame();
    finishOpening(kept, 'keep');
    const busy = gameAtMall();
    act(busy, 'vending.buy', { slot: 0 });
    act(busy, 'collection.open', { kind: 'normal' });
    const big = gameAtMall();
    Collection.add(big, Array.from({ length: 500 }, (_, index) => Cards.pull(big, 'common', 5 + index % 5)));
    big.checkUnlocks();
    // A Tuesday, at work, with packs to open at the desk
    const tuesday = START + 2 * 24 * 60 * 60 * 1000;
    const office = gameAtMall({ now: tuesday });
    office.tick(tuesday + 60 * 1000);
    office.state.collection.packs.base.normal = 2;

    for (const [name, game] of Object.entries({ fresh, kept, busy, big, office })) {
        for (const place of Locations) {
            for (const view of [{}, { binder: 'Water', page: 2 }, { page: 'nonsense' }]) {
                const html = place.render(game, view);
                assert.equal(typeof html, 'string', `${place.id} (${name})`);
                assert.ok(!html.includes('undefined') && !html.includes('NaN'), `${place.id} (${name}): ${html}`);
            }
            assert.ok(place.name(game), `${place.id} has a name (${name})`);
        }
    }
});
