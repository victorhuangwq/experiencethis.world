import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameAtMall, act, buyFirst, overrideRules, restock, START, newestMessage } from './helpers.js';
import { Vending } from '../js/systems/vending.js';
import { Wallet } from '../js/systems/wallet.js';
import { Lines } from '../js/content/text/index.js';

const MINUTE = 60 * 1000;

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

test('the machine restocks when the driver is due, not before', () => {
    const game = gameAtMall();
    buyFirst(game);
    const due = Vending.nextRestockAt(game);
    game.tick(due - 1);
    assert.equal(Vending.stockLeft(game), 7);
    game.tick(due);
    assert.equal(Vending.stockLeft(game), 8);
    assert.equal(game.state.vending.bought, 0);
});

test('the driver comes every 25 to 35 minutes, on the minute', () => {
    const game = gameAtMall();
    const gaps = new Set();
    for (let visit = 0; visit < 300; visit++) {
        const before = game.state.vending.restockedAt;
        restock(game);
        const after = game.state.vending.restockedAt;
        const minutes = (after - Math.floor(before / MINUTE) * MINUTE) / MINUTE;
        assert.ok(minutes >= 25 && minutes <= 35, `${minutes} minutes`);
        assert.equal(after % MINUTE, 0);
        gaps.add(minutes);
    }
    assert.ok(gaps.size >= 8, 'the gap varies');
});

test('the next restock time is saved, so reloading cannot change it', () => {
    const game = gameAtMall();
    const saved = JSON.parse(JSON.stringify(game.toSaveData()));
    assert.equal(saved.vending.nextRestockAt, Vending.nextRestockAt(game));
});

test('after a long time away, the machine is full and the driver is due soon', () => {
    const game = gameAtMall();
    buyFirst(game);
    const later = START + 3 * 24 * 60 * MINUTE;
    game.catchUp(later);
    assert.equal(Vending.stockLeft(game), 8);
    assert.ok(Vending.nextRestockAt(game) > later);
    assert.ok(Vending.nextRestockAt(game) <= later + 35 * MINUTE);
});

test('if the clock goes backwards, the driver is not hours away', () => {
    const game = gameAtMall();
    const earlier = START - 5 * 60 * MINUTE;
    game.tick(earlier);
    assert.ok(Vending.nextRestockAt(game) <= earlier + 35 * MINUTE);
});

test('a restock can include a special pack', (t) => {
    overrideRules(t, { specialRestockChance: 1 });
    const game = gameAtMall();
    restock(game);
    assert.equal(game.state.vending.slots.filter(kind => kind === 'special').length, 1);
});

test('smelling 50 packs makes special packs more likely', (t) => {
    overrideRules(t, { specialRestockChance: 0, attunedSpecialRestockChance: 1 });
    const game = gameAtMall();
    buyFirst(game);
    for (let i = 0; i < 49; i++) {
        act(game, 'collection.smell');
    }
    restock(game);
    assert.ok(!game.state.vending.slots.includes('special'));
    act(game, 'collection.smell');
    assert.equal(newestMessage(game), Lines.packs.sniffs[50]);
    restock(game);
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
    restock(game);
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
