import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, act, finishOpening, sortCards, buyFirst, START, newestMessage } from './helpers.js';
import { Rules } from '../js/rules.js';
import { Lines } from '../js/content/text/index.js';
import { HOUR } from '../js/core/time.js';

test('a new game opens on the shoebox, with nothing else unlocked', () => {
    const game = newGame();
    assert.equal(game.encounter().id, 'shoebox');
    assert.equal(game.state.progress.unlocked.length, 0);
    assert.equal(game.state.wallet.cents, 0);
});

test('selling the box to Benny pays for exactly one pack', () => {
    const game = newGame();
    finishOpening(game, 'sell');
    assert.equal(game.state.story.shoebox, 'sold');
    assert.equal(game.state.wallet.cents, 300);
    assert.equal(game.state.collection.cards.length, 0);
    assert.ok(game.unlocked('mall'));
    assert.deepEqual(game.state.vending.slots, new Array(8).fill('normal'));
    assert.equal(game.encounter(), null);
});

test('keeping the shoebox keeps the misprint and the chewed dragon', () => {
    const game = newGame();
    finishOpening(game, 'keep');
    const cards = game.state.collection.cards;
    assert.equal(game.state.story.shoebox, 'kept');
    assert.equal(cards.length, 8);
    assert.ok(cards.some(card => card.cardId === 'wet-sock-gobln'));
    assert.ok(cards.some(card => card.cardId === 'chewed-dragon'));
    assert.ok(cards.every(card => card.condition <= 4), 'old cards are in poor condition');
});

test('the job and the allowance come once the player is out of money', () => {
    const game = newGame();
    act(game, 'encounter.choose', { index: 0 });
    sortCards(game, Rules.boxFinds.flyer);
    assert.equal(game.unlocked('work'), false, 'there is still a pack in the wallet');
    assert.equal(game.unlocked('allowance'), false);
    buyFirst(game);
    assert.ok(game.unlocked('work'));
    assert.ok(game.unlocked('allowance'));
    assert.equal(game.state.job.inbox, Rules.inboxStart, 'a backlog');
});

test('the allowance pays $1.20 a minute', () => {
    const game = newGame();
    finishOpening(game, 'keep');
    game.tick(START + 60 * 1000);
    assert.equal(game.state.wallet.cents, 120);
});

test('time away is summarised once, and the piggy bank holds 8 hours', () => {
    const game = newGame();
    finishOpening(game, 'sell');
    buyFirst(game);
    game.catchUp(START + 10 * HOUR);
    assert.equal(game.state.wallet.cents, 8 * 60 * 60 * 2);
    const summary = newestMessage(game);
    assert.match(summary, /^While you were away, /);
    assert.match(summary, /only holds 8 hours/);
    assert.match(summary, /the machine was restocked/);
    assert.match(summary, new RegExp(Lines.job.inboxAway(Rules.inboxCap)));
});

test('a normal tick never adds an away summary', () => {
    const game = newGame();
    finishOpening(game, 'keep');
    game.tick(START + 2 * HOUR);
    assert.ok(game.messages.every(message => !message.text.startsWith('While you were away')));
});

test('the narrator notices idling, but only while the player is watching', () => {
    const idleLine = game => game.messages.some(message => message.text === Lines.story.idle[0]);

    const away = newGame();
    finishOpening(away, 'keep');
    away.catchUp(START + HOUR);
    assert.equal(idleLine(away), false, 'coming back after time away is not idling');

    const watching = newGame();
    finishOpening(watching, 'keep');
    for (let second = 1; second <= 181; second++) {
        watching.tick(START + second * 1000);
    }
    assert.equal(idleLine(watching), true);
});
