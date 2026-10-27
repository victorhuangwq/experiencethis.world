import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, gameAtMall, act, finishOpening } from './helpers.js';
import { Cards } from '../js/systems/cards.js';
import { Collection } from '../js/systems/collection.js';
import { Catalog } from '../js/content/catalog.js';
import { Rules } from '../js/rules.js';
import { Lines } from '../js/content/text/index.js';

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

test('packs hold three commons, an uncommon, and a hit, like a real pack', () => {
    const game = newGame({ seed: 7 });
    for (let i = 0; i < 200; i++) {
        const rarities = Cards.openPack(game, 'normal').map(card => card.rarity);
        assert.deepEqual(rarities.slice(0, 4), ['common', 'common', 'common', 'uncommon']);
        assert.ok(['uncommon', 'rare', 'ultra-rare'].includes(rarities[4]));
    }
});

test('hits come at the odds in the rules', () => {
    const game = newGame({ seed: 7 });
    const packs = 20000;
    const hits = { normal: {}, special: {} };
    for (let i = 0; i < packs; i++) {
        for (const kind of ['normal', 'special']) {
            const slots = Rules.packSlots[kind];
            Cards.openPack(game, kind).forEach((card, index) => {
                if (slots[index] === 'hit') {
                    const key = card.cardId === 'card-o-matic-prime' ? 'prime' : card.rarity;
                    hits[kind][key] = (hits[kind][key] || 0) + 1;
                }
            });
        }
    }
    for (const [rarity, odds] of Object.entries(Rules.hitOdds.normal)) {
        const seen = hits.normal[rarity] / packs;
        assert.ok(Math.abs(seen - odds) < 0.02, `normal ${rarity}: ${seen}, expected ${odds}`);
    }
    const specialHits = packs * 2;
    for (const [rarity, odds] of Object.entries(Rules.hitOdds.special)) {
        const seen = hits.special[rarity] / specialHits;
        const expected = odds * (1 - Rules.primeChance);
        assert.ok(Math.abs(seen - expected) < 0.02, `special ${rarity}: ${seen}, expected ${expected}`);
    }
    assert.ok(Math.abs(hits.special.prime / specialHits - Rules.primeChance) < 0.01, 'the vending promo');
    assert.equal(hits.normal.prime, undefined, 'never in normal packs');
});

test('packs only hold cards from the set in packs', () => {
    const game = newGame({ seed: 3 });
    const inPacks = Catalog.inPacks().map(card => card.id);
    for (let i = 0; i < 2000; i++) {
        for (const card of Cards.openPack(game, 'normal')) {
            assert.ok(inPacks.includes(card.cardId), card.cardId);
        }
    }
});

test('every card in the Base Set turns up in packs', () => {
    const game = newGame({ seed: 5 });
    const seen = new Set();
    for (let i = 0; i < 3000; i++) {
        Cards.openPack(game, 'normal').forEach(card => seen.add(card.cardId));
    }
    assert.deepEqual([...seen].sort(), Catalog.inSet('base').map(card => card.id).sort());
});

test('the checklist comes in the first pack', () => {
    const game = gameAtMall();
    assert.equal(Collection.hasChecklist(game), false);
    act(game, 'vending.buy', { slot: 0 });
    act(game, 'collection.open', { kind: 'normal' });
    assert.ok(Collection.hasChecklist(game));
    assert.ok(game.messages.some(message => message.text === Lines.packs.checklist(30)));
});

test('a card is new the first time only, even twice in one pack', () => {
    const game = gameAtMall();
    game.state.collection.packs.normal = 3;
    let opened = null;
    game.on('pack-opened', event => {
        opened = event.cards;
    });
    const seen = new Set();
    for (let pack = 0; pack < 3; pack++) {
        act(game, 'collection.open', { kind: 'normal' });
        for (const card of opened) {
            assert.equal(card.isNew, !seen.has(card.cardId), card.name);
            seen.add(card.cardId);
        }
    }
});

test('completing each rarity, and then the set, is noticed once', () => {
    const game = gameAtMall();
    const commons = Catalog.inSet('base').filter(card => card.rarity === 'common');
    Collection.add(game, commons.map(card => Cards.card(card.id, 8)));
    Collection.checkCompleted(game);
    assert.equal(game.messages[0].text, Lines.home.completed.common);
    Collection.checkCompleted(game);
    assert.equal(game.messages.filter(message => message.text === Lines.home.completed.common).length, 1);

    Collection.add(game, Catalog.inSet('base').map(card => Cards.card(card.id, 8)));
    Collection.checkCompleted(game);
    assert.equal(game.messages[0].text, Lines.home.completed.set('Critter Clash Base Set', 30));
    assert.deepEqual(game.state.collection.completed, ['base:common', 'base:uncommon', 'base:rare', 'base:ultra-rare', 'base']);
});

test('Benny buys duplicates for 75% and leaves the best copy', () => {
    const game = newGame();
    finishOpening(game, 'keep');
    game.state.collection.cards = [];
    Collection.add(game, [Cards.card('soggy-toad', 4), Cards.card('soggy-toad', 9), Cards.card('soggy-toad', 6), Cards.card('captain-bathwater', 5)]);
    game.checkUnlocks();
    assert.ok(game.unlocked('benny-buys'));

    const before = game.state.wallet.cents;
    act(game, 'collection.sellDuplicates');
    assert.equal(game.state.wallet.cents - before, Math.floor(2 * Catalog.find('soggy-toad').value * 0.75));
    const kept = game.state.collection.cards.map(card => [card.cardId, card.condition]);
    assert.deepEqual(kept, [['soggy-toad', 9], ['captain-bathwater', 5]], 'the copy in the best condition stays');
});

test('a binder goes on sale once the shoebox is outgrown, and must be bought', () => {
    const game = gameAtMall();
    const filler = count => Array.from({ length: count }, () => Cards.pull(game, 'common', 8));
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
    Collection.add(game, Array.from({ length: 150 }, () => Cards.pull(game, 'common', 8)));
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
    Collection.add(game, Array.from({ length: 40 }, () => Cards.pull(game, 'common', 8)));
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
