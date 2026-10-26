import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameAtMall, act, buyFirst, overrideRules, START, newestMessage } from './helpers.js';
import { Vending } from '../js/systems/vending.js';
import { Wallet } from '../js/systems/wallet.js';
import { Lines } from '../js/content/text/index.js';

const at = (hour, minute) => new Date(2026, 9, 25, hour, minute).getTime();

test('buying a pack costs $3 and empties the slot', () => {
    const game = gameAtMall();
    act(game, 'vending.buy', { slot: 2 });
    assert.equal(game.state.wallet.cents, 0);
    assert.equal(game.state.collection.packs.normal, 1);
    assert.equal(game.state.vending.slots[2], null);
});

test('without enough money, nothing is bought', () => {
    const game = gameAtMall();
    act(game, 'vending.buy', { slot: 0 });
    act(game, 'vending.buy', { slot: 1 });
    assert.equal(game.state.collection.packs.normal, 1);
    assert.equal(game.state.vending.slots[1], 'normal');
    assert.match(newestMessage(game), /You need \$3\.00/);
});

test('the machine restocks at the next quarter hour of the clock', () => {
    const game = gameAtMall();
    assert.equal(Vending.nextRestockAt(game), at(14, 15));
    buyFirst(game);
    game.tick(at(14, 14));
    assert.equal(Vending.stockLeft(game), 7);
    game.tick(at(14, 15));
    assert.equal(Vending.stockLeft(game), 8);
    assert.equal(game.state.vending.bought, 0);
});

test('a restock can include a special pack', (t) => {
    overrideRules(t, { specialRestockChance: 1 });
    const game = gameAtMall();
    game.tick(at(14, 15));
    assert.equal(game.state.vending.slots.filter(kind => kind === 'special').length, 1);
});

test('smelling 50 packs makes special packs more likely', (t) => {
    overrideRules(t, { specialRestockChance: 0, attunedSpecialRestockChance: 1 });
    const game = gameAtMall();
    buyFirst(game);
    for (let i = 0; i < 49; i++) {
        act(game, 'collection.smell');
    }
    game.tick(at(14, 15));
    assert.ok(!game.state.vending.slots.includes('special'));
    act(game, 'collection.smell');
    assert.equal(newestMessage(game), Lines.packs.sniffs[50]);
    game.tick(at(14, 30));
    assert.ok(game.state.vending.slots.includes('special'));
});

test('the machine can jam, and kicking it settles it either way', (t) => {
    overrideRules(t, { jamChance: 1, pipAfterPacks: 99 });
    const game = gameAtMall();
    Wallet.earn(game, 900);
    buyFirst(game);
    buyFirst(game);
    assert.equal(game.state.vending.jammedSlot, null, 'the first two packs never jam');

    buyFirst(game);
    assert.notEqual(game.state.vending.jammedSlot, null);
    assert.equal(game.state.collection.packs.normal, 2);
    assert.equal(game.state.wallet.cents, 300);

    act(game, 'vending.kick');
    assert.equal(game.state.vending.jammedSlot, null);
    assert.ok([2, 3].includes(game.state.collection.packs.normal));
    assert.equal(game.state.vending.kicks, 1);
});

test('Dale counts every kick', () => {
    const game = gameAtMall();
    for (let i = 0; i < 6; i++) {
        act(game, 'vending.kick');
    }
    assert.equal(game.state.vending.kicks, 6);
    assert.equal(game.messages.some(message => message.text === Lines.mall.kicks[1]), true);
});

test('the coin return pays a quarter at most once per restock', (t) => {
    overrideRules(t, { coinReturnChance: 1, keyAfterChecks: 999 });
    const game = gameAtMall();
    const paidBy = (action) => {
        const before = game.state.wallet.cents;
        action();
        return game.state.wallet.cents - before;
    };
    assert.equal(paidBy(() => act(game, 'vending.coinReturn')), 25);
    assert.equal(paidBy(() => act(game, 'vending.coinReturn')), 0);
    game.tick(at(14, 15));
    assert.equal(paidBy(() => act(game, 'vending.coinReturn')), 25);
});

test('the coin return gives up the key by the 40th check, and only once', () => {
    const game = gameAtMall();
    for (let i = 0; i < 40; i++) {
        act(game, 'vending.coinReturn');
    }
    assert.equal(game.state.vending.hasKey, true);
    const keyMessages = game.messages.filter(message => message.text === Lines.mall.coinKey);
    assert.equal(keyMessages.length, 1);
});

test('restocks use the real clock even when nobody is watching', () => {
    const game = gameAtMall();
    buyFirst(game);
    game.catchUp(START + 6 * 60 * 60 * 1000);
    assert.equal(Vending.stockLeft(game), 8);
});
