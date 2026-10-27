import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameAtMall, act, buyFirst, overrideRules, restock, newestMessage } from './helpers.js';
import { Wallet } from '../js/systems/wallet.js';
import { Vending } from '../js/systems/vending.js';
import { Endings } from '../js/content/endings.js';
import { Lines } from '../js/content/text/index.js';

const at = (hour, minute) => new Date(2026, 9, 25, hour, minute).getTime();

/**
 * A game at the mall with money to spare and no jams
 */
function richGame(t) {
    overrideRules(t, { jamChance: 0 });
    const game = gameAtMall();
    Wallet.earn(game, 10000);
    return game;
}

function keepBuying(game) {
    act(game, 'encounter.choose', { index: 1 });
}

function stepAside(game) {
    act(game, 'encounter.choose', { index: 0 });
}

test('the kid always appears the first time, after the third pack', (t) => {
    const game = richGame(t);
    buyFirst(game);
    buyFirst(game);
    assert.equal(game.encounter(), null);
    buyFirst(game);
    assert.equal(game.encounter().id, 'pip');
    assert.deepEqual(game.encounter().text(game), Lines.pip.arrive);
});

test('while the kid waits, the machine cannot be used', (t) => {
    const game = richGame(t);
    buyFirst(game);
    buyFirst(game);
    buyFirst(game);
    const stock = Vending.stockLeft(game);
    buyFirst(game);
    assert.equal(Vending.stockLeft(game), stock);
});

test('stepping aside lets the kid buy a pack and introduces Pip', (t) => {
    const game = richGame(t);
    buyFirst(game);
    buyFirst(game);
    buyFirst(game);
    stepAside(game);
    assert.equal(game.encounter(), null);
    assert.equal(Vending.stockLeft(game), 4);
    assert.equal(game.state.people.pip.kindness, 1);
    assert.equal(game.state.people.pip.mentionedGus, true);
    assert.equal(game.state.kindness.strikes.length, 0);
    assert.equal(newestMessage(game), Lines.pip.firstKindness);
});

test('the kid has only one chance per restock, and later visits are not guaranteed', (t) => {
    const game = richGame(t);
    overrideRules(t, { pipChance: 0 });
    buyFirst(game);
    buyFirst(game);
    buyFirst(game);
    stepAside(game);
    buyFirst(game);
    assert.equal(game.encounter(), null, 'no second visit in the same restock');

    restock(game);
    buyFirst(game);
    buyFirst(game);
    buyFirst(game);
    assert.equal(game.encounter(), null, 'a later visit is down to chance');
});

test('keeping buying is a strike; the second adds the BE NICE note and a warning', (t) => {
    const game = richGame(t);
    game.startEncounter('pip');
    keepBuying(game);
    assert.equal(game.state.kindness.strikes.length, 1);
    assert.equal(game.state.kindness.note, false);
    assert.match(newestMessage(game), /The kid watches\. The kid leaves\./);

    game.startEncounter('pip');
    keepBuying(game);
    assert.equal(game.state.kindness.strikes.length, 2);
    assert.equal(game.state.kindness.note, true);
    assert.equal(newestMessage(game), Lines.strikes.warning);
});

test('a strike against a friend names Pip', (t) => {
    const game = richGame(t);
    game.startEncounter('pip');
    stepAside(game);
    game.startEncounter('pip');
    keepBuying(game);
    assert.match(game.messages[0].text, /Pip watches\. Pip leaves\./);
});

test('keeping buying is not possible without money', (t) => {
    const game = gameAtMall();
    act(game, 'vending.buy', { slot: 0 });
    game.startEncounter('pip');
    assert.equal(game.encounter().choices(game)[1].disabled, true);
    keepBuying(game);
    assert.equal(game.encounter().id, 'pip', 'the disabled choice does nothing');
});

test('the third strike ends the run with Shame, and Dale has the numbers', (t) => {
    const game = richGame(t);
    act(game, 'vending.kick');
    act(game, 'vending.kick');
    for (let strike = 0; strike < 3; strike++) {
        game.startEncounter('pip');
        keepBuying(game);
    }
    assert.equal(game.state.meta.ended, 'shame');
    assert.deepEqual(game.endings.found(), ['shame']);
    assert.equal(game.encounter(), null);

    const lines = Endings.find(ending => ending.id === 'shame').lines(game);
    assert.ok(lines.includes('"You made a kid sad 3 times."'));
    assert.ok(lines.includes('"Also, you kicked the machine 2 times. I counted."'));
});

test('nothing can be done after the run ends', (t) => {
    const game = richGame(t);
    for (let strike = 0; strike < 3; strike++) {
        game.startEncounter('pip');
        keepBuying(game);
    }
    const cents = game.state.wallet.cents;
    act(game, 'job.work', { at: 'home' });
    buyFirst(game);
    game.tick(at(15, 0));
    assert.equal(game.state.wallet.cents, cents);
});
