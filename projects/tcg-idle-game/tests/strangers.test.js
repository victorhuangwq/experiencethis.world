import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameAtMall, act, overrideRules, restock } from './helpers.js';
import { Rules } from '../js/rules.js';
import { Lines } from '../js/content/text/index.js';
import { Endings } from '../js/content/endings.js';
import { Vending } from '../js/systems/vending.js';
import { Wallet } from '../js/systems/wallet.js';

const SECOND = 1000;

// The scalper

/**
 * A game where the next pack bought brings the scalper
 */
function scalperGame(t, { kid = false, money = 5000 } = {}) {
    overrideRules(t, { scalperKidChance: kid ? 1 : 0 });
    const game = gameAtMall();
    Wallet.earn(game, money - game.state.wallet.cents);
    game.state.vending.packsBought = Rules.scalperAfterPacks;
    game.state.people.pip.encounters = 1;
    act(game, 'vending.buy', { slot: 0 });
    assert.equal(game.state.encounter?.id, 'scalper');
    return game;
}

const choose = (game, label) => {
    const index = game.encounter().choices(game).findIndex(choice => choice.label === label);
    assert.notEqual(index, -1, `no choice "${label}"`);
    act(game, 'encounter.choose', { index });
};

test('the scalper only comes once the player has met Pip', () => {
    const game = gameAtMall();
    Wallet.earn(game, 5000);
    game.state.vending.packsBought = Rules.scalperAfterPacks;
    act(game, 'vending.buy', { slot: 0 });
    assert.equal(game.state.encounter, null);
});

test('the scalper lines up behind a player who buys a lot of packs', (t) => {
    const game = scalperGame(t);
    assert.equal(game.state.people.flip.encounters, 1);
    assert.equal(Vending.usable(game), false, 'the machine waits while he does');
});

test('buying the scalper out is fair, and annoys him', (t) => {
    const game = scalperGame(t);
    choose(game, Lines.flip.buyAll);
    assert.equal(Vending.stockLeft(game), 0);
    assert.equal(game.state.collection.packs.normal, 8);
    assert.equal(game.state.kindness.strikes.length, 0);
    assert.equal(game.state.people.flip.annoyed, 1);
    assert.equal(game.messages[0].text, Lines.flip.annoyed[0]);
});

test('buying everything while a kid waits behind him is a strike', (t) => {
    const game = scalperGame(t, { kid: true });
    choose(game, Lines.flip.buyAll);
    assert.deepEqual(game.state.kindness.strikes.map(strike => strike.source), ['buyout']);
});

test('leaving one pack for the kid is kind, and still annoys him', (t) => {
    const game = scalperGame(t, { kid: true });
    choose(game, Lines.flip.leaveOne);
    assert.equal(Vending.stockLeft(game), 0);
    assert.equal(game.state.collection.packs.normal, 7, 'the kid got one');
    assert.equal(game.state.kindness.strikes.length, 0);
    assert.equal(game.state.people.flip.annoyed, 1);
});

test('a scalper still waiting after a restock is bought out once', (t) => {
    overrideRules(t, { scalperChance: 1 });
    const game = scalperGame(t);
    restock(game);
    assert.equal(game.state.encounter?.id, 'scalper', 'he waits through it');
    choose(game, Lines.flip.buyAll);
    assert.equal(game.state.encounter, null);
    assert.equal(game.state.people.flip.encounters, 1);
});

test('without a kid, there is no pack to leave', (t) => {
    const game = scalperGame(t);
    const labels = game.encounter().choices(game).map(choice => choice.label);
    assert.deepEqual(labels, [Lines.flip.buyAll, Lines.flip.letHim]);
});

test('letting him have the rest empties the machine', (t) => {
    const game = scalperGame(t, { kid: true });
    choose(game, Lines.flip.letHim);
    assert.equal(Vending.stockLeft(game), 0);
    assert.equal(game.state.collection.packs.normal, 1);
    assert.equal(game.state.kindness.strikes.length, 0);
    assert.equal(game.state.people.flip.annoyed, 0);
});

test('what the player cannot afford, the scalper takes', (t) => {
    const game = scalperGame(t, { money: 900 });
    choose(game, Lines.flip.buyAll);
    assert.equal(game.state.collection.packs.normal, 3);
    assert.equal(Vending.stockLeft(game), 0);
    assert.equal(game.state.people.flip.annoyed, 0, 'he still got some');
    assert.equal(game.messages[0].text, Lines.flip.takesTheRest);
});

// Terry, waiting for the drop

/**
 * A game at the machine, a given time before the next drop
 */
function beforeDrop(before, { here = 'mall' } = {}) {
    const game = gameAtMall();
    act(game, 'story.visit', { location: here });
    game.tick(Vending.nextRestockAt(game) - before);
    return game;
}

test('Terry is at the machine in the minute before a drop', () => {
    const game = beforeDrop(30 * SECOND);
    assert.equal(game.state.encounter?.id, 'camper');
});

test('Terry is only seen by a player who is at the machine', () => {
    assert.equal(beforeDrop(30 * SECOND, { here: 'home' }).state.encounter, null);
});

test('Terry is not there earlier than a minute before', () => {
    assert.equal(beforeDrop(61 * SECOND).state.encounter, null);
});

test('coming back just before a drop does not count as being there', () => {
    const game = gameAtMall();
    act(game, 'story.visit', { location: 'mall' });
    game.catchUp(Vending.nextRestockAt(game) - 30 * SECOND);
    assert.equal(game.state.encounter, null);
});

test('persuading Terry makes a friend, and he takes row B at the drop', () => {
    const game = beforeDrop(30 * SECOND);
    choose(game, Lines.terry.persuade);
    assert.equal(game.state.people.terry.friend, true);
    restock(game);
    const { slots } = game.state.vending;
    assert.deepEqual(slots.slice(4), [null, null, null, null]);
    assert.ok(slots.slice(0, 4).every(Boolean), 'row A is the player\'s');
    assert.ok(game.messages.some(message => message.text === Lines.terry.shared));
});

test('letting Terry go first means he takes the best pack', () => {
    const game = beforeDrop(30 * SECOND);
    choose(game, Lines.terry.letHimFirst);
    restock(game);
    const { slots } = game.state.vending;
    assert.equal(slots.filter(kind => kind === null).length, 1);
    const taken = Vending.kinds.find(kind => game.messages.some(message => message.text === Lines.terry.wentFirst(Lines.mall.kinds[kind])));
    assert.ok(taken, 'he says what he took');
    assert.ok(slots.every(kind => !kind || Vending.kinds.indexOf(kind) <= Vending.kinds.indexOf(taken)));
});

test('shoving Terry aside is a strike, and ends the friendship', () => {
    const game = beforeDrop(30 * SECOND);
    game.state.people.terry.friend = true;
    assert.equal(game.encounter().choices(game)[0].label, Lines.terry.splitAgain, 'a friend just splits it');
    choose(game, Lines.terry.shove);
    assert.deepEqual(game.state.kindness.strikes.map(strike => strike.source), ['camper']);
    assert.equal(game.state.people.terry.friend, false);
    assert.equal(game.state.vending.dropDeal, null);
});

test('Dale counts the shoves too', () => {
    const game = gameAtMall();
    for (let shove = 0; shove < Rules.maxStrikes; shove++) {
        game.startEncounter('camper');
        choose(game, Lines.terry.shove);
    }
    assert.equal(game.state.meta.ended, 'shame');
    const lines = Endings.find(ending => ending.id === 'shame').lines(game);
    assert.ok(lines.includes('"You shoved Terry 3 times. He had soup."'));
});

test('a friend texts about a mega pack when the player is not there', (t) => {
    overrideRules(t, { restockOdds: { mega: 1 } });
    const game = gameAtMall();
    game.state.people.terry.friend = true;
    act(game, 'story.visit', { location: 'home' });
    restock(game);
    assert.ok(game.messages.some(message => message.text === Lines.terry.tip('A1')));
});
