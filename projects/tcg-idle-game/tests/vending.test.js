import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameAtMall, act, buyFirst, overrideRules, restock, START, newestMessage } from './helpers.js';
import { Vending } from '../js/systems/vending.js';
import { Wallet } from '../js/systems/wallet.js';
import { Rules } from '../js/rules.js';
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

test('after a long time away, the machine is from the latest visit and the driver is due soon', () => {
    const game = gameAtMall();
    buyFirst(game);
    const later = START + 3 * 24 * 60 * MINUTE;
    game.catchUp(later);
    const vending = game.state.vending;
    assert.ok(later - vending.restockedAt <= 35 * MINUTE, 'restocked at the latest visit');
    assert.ok(vending.slots.every((kind, index) => !kind || vending.goneAt[index] > later), 'only packs nobody has bought yet');
    assert.ok(Vending.nextRestockAt(game) > later);
    assert.ok(Vending.nextRestockAt(game) <= later + 35 * MINUTE);
});

test('if the clock goes backwards, the driver is not hours away', () => {
    const game = gameAtMall();
    const earlier = START - 5 * 60 * MINUTE;
    game.tick(earlier);
    assert.ok(Vending.nextRestockAt(game) <= earlier + 35 * MINUTE);
});

test('the first stock is all normal packs, and they last until the next restock', () => {
    const game = gameAtMall();
    assert.deepEqual(game.state.vending.slots, new Array(8).fill('normal'));
    game.tick(Vending.nextRestockAt(game) - 1000);
    assert.equal(Vending.stockLeft(game), 8);
});

test('what the driver brings varies, with the rarer kinds less often', () => {
    const game = gameAtMall();
    const counts = { normal: 0, bundle: 0, special: 0, mega: 0 };
    const restocks = 2000;
    for (let i = 0; i < restocks; i++) {
        restock(game);
        game.state.vending.slots.forEach(kind => counts[kind]++);
    }
    const slots = restocks * Rules.slotCount;
    for (const [kind, chance] of Object.entries(Rules.restockOdds)) {
        assert.ok(Math.abs(counts[kind] / slots - chance) < 0.01, `${kind}: ${counts[kind] / slots}`);
    }
    assert.ok(counts.normal > counts.bundle && counts.bundle > counts.special && counts.special > counts.mega);
});

test('other people buy the packs between restocks, the rarer ones first', () => {
    const game = gameAtMall();
    const waits = { normal: [], bundle: [], special: [], mega: [] };
    let leftAtNextRestock = 0;
    let normals = 0;
    for (let i = 0; i < 2000; i++) {
        restock(game);
        const { slots, goneAt, restockedAt, nextRestockAt } = game.state.vending;
        slots.forEach((kind, index) => {
            const [soonest, latest] = Rules.soldAfter[kind];
            const wait = (goneAt[index] - restockedAt) / MINUTE;
            assert.ok(wait >= soonest && wait <= latest, `${kind} goes ${wait} minutes in`);
            waits[kind].push(wait);
            if (kind === 'normal') {
                normals++;
                leftAtNextRestock += goneAt[index] > nextRestockAt ? 1 : 0;
            }
        });
    }
    const average = list => list.reduce((sum, wait) => sum + wait, 0) / list.length;
    assert.ok(average(waits.mega) < average(waits.special));
    assert.ok(average(waits.special) < average(waits.bundle));
    assert.ok(average(waits.bundle) < average(waits.normal));
    const share = leftAtNextRestock / normals;
    assert.ok(share > 0.4 && share < 0.7, `about half the normal packs are left: ${share}`);
});

test('the machine is the same whether the player watched or came back later', () => {
    const watched = gameAtMall({ seed: 21 });
    const away = gameAtMall({ seed: 21 });
    const later = START + 5 * 60 * MINUTE;
    for (let now = START; now <= later; now += 10 * 1000) {
        watched.tick(now);
    }
    away.catchUp(later);
    const machine = game => {
        const { slots, goneAt, restockedAt, nextRestockAt } = game.state.vending;
        return { slots, goneAt, restockedAt, nextRestockAt };
    };
    assert.deepEqual(machine(away), machine(watched));
});

test('a pack someone else has bought cannot be bought', () => {
    const game = gameAtMall();
    game.state.vending.goneAt[0] = game.time;
    act(game, 'vending.buy', { slot: 0 });
    assert.equal(game.state.collection.packs.normal, 0);
    assert.equal(game.state.wallet.cents, 300);
    assert.equal(game.state.vending.slots[0], null);
});

test('a bundle is three packs, and a mega pack is one big one', () => {
    const game = gameAtMall();
    Wallet.earn(game, 2000);
    game.state.vending.slots[0] = 'bundle';
    game.state.vending.slots[1] = 'mega';
    act(game, 'vending.buy', { slot: 0 });
    act(game, 'vending.buy', { slot: 1 });
    assert.equal(game.state.collection.packs.normal, 3);
    assert.equal(game.state.collection.packs.mega, 1);
    assert.equal(game.state.wallet.cents, 2300 - Rules.prices.bundle - Rules.prices.mega);
});

test('the driver unsticks a jam', (t) => {
    overrideRules(t, { jamChance: 1, pipAfterPacks: 99 });
    const game = gameAtMall();
    Wallet.earn(game, 900);
    buyFirst(game);
    buyFirst(game);
    buyFirst(game);
    assert.notEqual(game.state.vending.jammedSlot, null);
    restock(game);
    assert.equal(game.state.vending.jammedSlot, null);
    assert.equal(newestMessage(game) === Lines.mall.driverUnjams || game.messages.some(message => message.text === Lines.mall.driverUnjams), true);
});

test('smelling 50 packs makes special packs more likely', (t) => {
    overrideRules(t, { restockOdds: { special: 0 }, attunedRestockOdds: { special: 1 } });
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
    assert.deepEqual(game.state.vending.slots, new Array(8).fill('special'));
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
    const first = game.state.vending.restockedAt;
    game.catchUp(START + 6 * 60 * 60 * 1000);
    assert.ok(game.state.vending.restockedAt > first + 5 * 60 * 60 * 1000);
});
