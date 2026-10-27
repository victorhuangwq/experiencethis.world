import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, gameAtMall, gameAtGus as openStore, act, newestMessage, START } from './helpers.js';
import { Store } from '../js/systems/store.js';
import { Catalog } from '../js/content/catalog.js';
import { Rules } from '../js/rules.js';
import { Lines } from '../js/content/text/index.js';
import { GusScene } from '../js/ui/scenes/gus.js';
import { escape } from '../js/ui/html.js';

const HOUR = 60 * 60 * 1000;
// START is 2:07 PM, so this is the same time on the next day
const NEXT_DAY = START + 24 * HOUR;

/**
 * A game that has found Gus's store on its first day
 */
function gameWithGus(options) {
    const game = gameAtMall(options);
    game.state.collection.cardsOpened = Rules.gusWithoutTip;
    game.checkUnlocks();
    assert.ok(game.unlocked('gus'));
    return game;
}

/**
 * A game on the day Gus's store is open, with $20 to spend
 */
function gameAtGus() {
    const game = openStore({ cents: 2000 });
    assert.ok(Store.isOpen(game));
    return game;
}

test('separate days played are counted, not days passed', () => {
    const game = newGame();
    assert.equal(game.state.story.days, 1);
    game.tick(START + 9 * HOUR);
    assert.equal(game.state.story.days, 1, 'still the same day at 11 PM');
    game.tick(START + 10 * HOUR);
    assert.equal(game.state.story.days, 2, 'after midnight, it is the next day');
    game.tick(START + 5 * 24 * HOUR);
    assert.equal(game.state.story.days, 3, 'days away count once');
});

test('a clock that goes back a day does not count as another day', () => {
    const game = newGame({ now: NEXT_DAY });
    game.tick(START);
    game.tick(NEXT_DAY + HOUR);
    assert.equal(game.state.story.days, 1);
});

test('Gus opens tomorrow: the door stays shut on the first day', () => {
    const game = gameWithGus();
    assert.equal(Store.isOpen(game), false);
    act(game, 'people.knock');
    assert.equal(newestMessage(game), Lines.gus.firstKnock);
    game.tick(START + 9 * HOUR);
    act(game, 'store.buyPack', { set: 'base' });
    assert.equal(game.state.collection.packs.base.normal, 0, 'nothing for sale through the door');
    assert.equal(Store.isOpen(game), false);
});

test('Gus\'s store opens on the second day of play, and the door stays open', () => {
    const game = gameWithGus();
    game.tick(NEXT_DAY);
    assert.ok(Store.isOpen(game));
    assert.ok(game.messages.some(message => message.text === Lines.gus.opened));
    const knocks = game.state.people.gus.knocks;
    act(game, 'people.knock');
    assert.equal(game.state.people.gus.knocks, knocks, 'no need to knock');
});

test('a store found on a later day is already open', () => {
    const game = gameAtMall();
    game.tick(NEXT_DAY);
    assert.equal(Store.isOpen(game), false, 'not before it is found');
    game.state.collection.cardsOpened = Rules.gusWithoutTip;
    game.checkUnlocks();
    assert.ok(Store.isOpen(game));
});

test('Gus sells Base Set packs at a markup, and never runs out', () => {
    const game = gameAtGus();
    const price = Rules.gusPrices.base;
    assert.ok(price > Rules.prices.normal, 'more than the machine');
    for (let pack = 1; pack <= 4; pack++) {
        act(game, 'store.buyPack', { set: 'base' });
    }
    assert.equal(game.state.collection.packs.base.normal, 4);
    assert.equal(game.state.wallet.cents, 2000 - 4 * price);
    assert.equal(game.state.store.packsBought, 4);
});

test('without the money, Gus does not do layaway', () => {
    const game = gameAtGus();
    game.state.wallet.cents = Rules.gusPrices.base - 1;
    act(game, 'store.buyPack', { set: 'base' });
    assert.equal(game.state.collection.packs.base.normal, 0);
    assert.equal(game.state.wallet.cents, Rules.gusPrices.base - 1);
    assert.match(newestMessage(game), /layaway/);
});

test('a pack of a set Gus does not sell is not sold', () => {
    const game = gameAtGus();
    act(game, 'store.buyPack', { set: 'promo' });
    act(game, 'store.buyPack', { set: 'nonsense' });
    assert.equal(game.state.wallet.cents, 2000);
});

test('a pack from Gus holds Base Set cards', () => {
    const game = gameAtGus();
    act(game, 'store.buyPack', { set: 'base' });
    act(game, 'collection.open', { set: 'base', kind: 'normal' });
    const base = Catalog.inSet('base').map(card => card.id);
    assert.equal(game.state.collection.cards.length, 5);
    assert.ok(game.state.collection.cards.every(card => base.includes(card.cardId)));
});

test('the store shows one part at a time: whatever the player pressed in the art', () => {
    const game = gameAtGus();
    const render = panel => GusScene.render(game, { panel });
    const pressable = html => [...html.matchAll(/data-action="view\.set" data-panel="([a-z]+)"[^>]*class="art-area[^"]*"(?![^>]*aria-hidden)/g)].map(match => match[1]);

    const look = render();
    assert.ok(look.includes(escape(Lines.gus.inside)));
    assert.ok(!look.includes('store.buyPack'), 'nothing to buy until the shelves are pressed');
    assert.deepEqual(pressable(look).sort(), ['board', 'case', 'gus', 'packs', 'table'], 'one button for screen readers per part');

    assert.ok(render('packs').includes('data-action="store.buyPack"'));
    assert.ok(render('case').includes('data-action="store.buySingle"'));
    assert.ok(render('board').includes('data-action="tournaments.enterLocals"'));
    assert.ok(render('table').includes(escape(Lines.marcus.away)));
    assert.ok(render('nonsense').includes(escape(Lines.gus.inside)));
});

test('Gus asks what it will be, and leads to packs, grading, and his tournaments', () => {
    const game = gameAtGus();
    const menu = GusScene.render(game, { panel: 'gus' });
    assert.ok(menu.includes(escape(Lines.gus.greet)));
    for (const [panel, label] of Object.entries(Lines.gus.ask)) {
        assert.ok(menu.includes(`data-panel="${panel}">${escape(label)}`), panel);
    }
    assert.ok(GusScene.render(game, { panel: 'grading' }).includes(escape(Lines.gus.gradingNote('$5.00'))));
    assert.ok(GusScene.render(game, { panel: 'board' }).includes('data-panel="gus"'), 'and back');
});
