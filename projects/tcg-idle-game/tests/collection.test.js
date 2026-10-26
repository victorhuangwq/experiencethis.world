import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, gameAtMall, act, finishOpening } from './helpers.js';
import { Cards } from '../js/systems/cards.js';
import { Collection } from '../js/systems/collection.js';

test('opening a pack adds five numbered cards in good condition', () => {
    const game = gameAtMall();
    act(game, 'vending.buy', { slot: 0 });
    let opened = null;
    game.on('pack-opened', event => {
        opened = event;
    });
    act(game, 'collection.open', { kind: 'normal' });

    const cards = game.state.collection.cards;
    assert.equal(cards.length, 5);
    assert.deepEqual(cards.map(card => card.id), [1, 2, 3, 4, 5]);
    assert.ok(cards.every(card => card.condition >= 6 && card.condition <= 10));
    assert.equal(game.state.collection.packs.normal, 0);
    assert.equal(opened.cards.length, 5);
});

test('opening without a pack does nothing', () => {
    const game = gameAtMall();
    act(game, 'collection.open', { kind: 'normal' });
    assert.equal(game.state.collection.cards.length, 0);
});

test('the same seed opens the same pack', () => {
    const first = newGame({ seed: 99 });
    const second = newGame({ seed: 99 });
    assert.deepEqual(Cards.openPack(first, 'normal'), Cards.openPack(second, 'normal'));
});

test('pack odds: about one fixed card in four normal packs, more in special packs', () => {
    const game = newGame({ seed: 7 });
    const packs = 4000;
    let fixedInNormal = 0;
    let fixedInSpecial = 0;
    let prime = 0;
    for (let i = 0; i < packs; i++) {
        fixedInNormal += Cards.openPack(game, 'normal').filter(card => card.fixedId).length;
        const special = Cards.openPack(game, 'special');
        fixedInSpecial += special.filter(card => card.fixedId).length;
        prime += special.filter(card => card.fixedId === 'card-o-matic-prime').length;
    }
    assert.ok(fixedInNormal / packs > 0.2 && fixedInNormal / packs < 0.3, `normal: ${fixedInNormal / packs}`);
    assert.ok(fixedInSpecial / packs > 1.1 && fixedInSpecial / packs < 1.4, `special: ${fixedInSpecial / packs}`);
    assert.ok(prime / packs > 0.06 && prime / packs < 0.14, `prime: ${prime / packs}`);
});

test('only cards found in packs come out of normal packs', () => {
    const game = newGame({ seed: 3 });
    for (let i = 0; i < 2000; i++) {
        for (const card of Cards.openPack(game, 'normal')) {
            assert.ok(!['card-o-matic-prime', 'absolutely-massive-dragon', 'pips-favourite', 'wet-sock-gobln'].includes(card.fixedId));
        }
    }
});

test('Benny buys duplicates for 75% and leaves the best copy', () => {
    const game = newGame();
    finishOpening(game, 'keep');
    game.state.collection.cards = [];
    const card = (name, value) => ({ name, type: 'Fire', rarity: 'common', power: 1, value, fixedId: null, condition: 8 });
    Collection.add(game, [card('Soggy Toad', 10), card('Soggy Toad', 20), card('Soggy Toad', 30), card('Tiny Moth', 5)]);
    game.checkUnlocks();
    assert.ok(game.unlocked('benny-buys'));

    const before = game.state.wallet.cents;
    act(game, 'collection.sellDuplicates');
    assert.equal(game.state.wallet.cents - before, Math.floor((10 + 20) * 0.75));
    assert.deepEqual(game.state.collection.cards.map(c => c.value).sort((a, b) => a - b), [5, 30]);
});

test('a binder goes on sale once the shoebox is outgrown, and must be bought', () => {
    const game = gameAtMall();
    const filler = count => Array.from({ length: count }, () => Cards.randomCard(game, 'common', 8));
    Collection.add(game, filler(39));
    game.checkUnlocks();
    assert.equal(Collection.storageForSale(game), null);

    Collection.add(game, filler(1));
    game.checkUnlocks();
    assert.equal(Collection.storageForSale(game).id, 'binder');
    assert.equal(Collection.storage(game), 'shoebox', 'it does not upgrade by itself');
    assert.match(game.messages[0].text, /lid no longer closes/);

    game.state.wallet.cents = 999;
    act(game, 'collection.buyStorage');
    assert.equal(Collection.storage(game), 'shoebox', 'a binder costs $10');

    game.state.wallet.cents = 1000;
    act(game, 'collection.buyStorage');
    assert.equal(Collection.storage(game), 'binder');
    assert.equal(game.state.wallet.cents, 0);
    assert.equal(Collection.storageForSale(game), null);
});

test('storage is bought in order, and anything already outgrown goes on sale next', () => {
    const game = gameAtMall();
    Collection.add(game, Array.from({ length: 150 }, () => Cards.randomCard(game, 'common', 8)));
    game.checkUnlocks();
    assert.equal(Collection.storageForSale(game).id, 'binder', 'the binder comes first');

    game.state.wallet.cents = 10000;
    act(game, 'collection.buyStorage');
    assert.equal(Collection.storageForSale(game).id, 'two-binders');
    assert.match(game.messages[0].text, /second binder would help/);
    act(game, 'collection.buyStorage');
    assert.equal(Collection.storage(game), 'two-binders');
});

test('selling cards never takes storage away', () => {
    const game = gameAtMall();
    Collection.add(game, Array.from({ length: 40 }, () => Cards.randomCard(game, 'common', 8)));
    game.checkUnlocks();
    game.state.wallet.cents = 1000;
    act(game, 'collection.buyStorage');
    game.state.collection.cards = [];
    assert.equal(Collection.storage(game), 'binder');
});

test('players whose storage upgraded by itself in an older version keep it', () => {
    const game = gameAtMall();
    const data = JSON.parse(JSON.stringify(game.toSaveData()));
    delete data.collection.storage;
    data.progress.unlocked.push('storage-binder', 'storage-two-binders');
    assert.equal(Collection.storage(newGame({ save: data, now: game.time })), 'two-binders');
});

test("Gus's store appears after 40 cards opened with Pip's tip, or 60 without", () => {
    const withTip = gameAtMall();
    withTip.state.people.pip.mentionedGus = true;
    withTip.state.collection.cardsOpened = 39;
    withTip.checkUnlocks();
    assert.equal(withTip.unlocked('gus'), false);
    withTip.state.collection.cardsOpened = 40;
    withTip.checkUnlocks();
    assert.ok(withTip.unlocked('gus'));

    const withoutTip = gameAtMall();
    withoutTip.state.collection.cardsOpened = 59;
    withoutTip.checkUnlocks();
    assert.equal(withoutTip.unlocked('gus'), false);
    withoutTip.state.collection.cardsOpened = 60;
    withoutTip.checkUnlocks();
    assert.ok(withoutTip.unlocked('gus'));
});

test('knocking at Gus\'s: come back in summer', () => {
    const game = gameAtMall();
    act(game, 'people.knock');
    assert.equal(game.state.people.gus.knocks, 0, 'the store is not on the map yet');
    game.state.collection.cardsOpened = 60;
    game.checkUnlocks();
    act(game, 'people.knock');
    assert.match(game.messages[0].text, /Come back in summer/);
});

test('a repeated message is counted instead of added again', () => {
    const game = gameAtMall();
    const messages = game.messages.length;
    game.say('You open a pack.');
    game.say('You open a pack.');
    assert.equal(game.messages.length, messages + 1);
    assert.equal(game.messages[0].count, 2);
});
