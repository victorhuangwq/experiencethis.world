import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, act, takeCards, emptyBox, buyFirst, finishOpening, newestMessage, START } from './helpers.js';
import { Rules } from '../js/rules.js';
import { Lines } from '../js/content/text/index.js';
import { Catalog } from '../js/content/catalog.js';
import { Box } from '../js/systems/box.js';
import { Job } from '../js/systems/job.js';
import { HomeScene } from '../js/ui/scenes/home.js';
import { escape } from '../js/ui/html.js';

const MINUTE = 60 * 1000;

function gameAtBox() {
    const game = newGame();
    act(game, 'encounter.choose', { index: 0 });
    return game;
}

/**
 * A game that's found the flyer, spent its money, and has been advertised
 * the SORT-O-MATIC, with the money for it
 */
function gameWithAdvert() {
    const game = gameAtBox();
    takeCards(game, Rules.boxFinds.flyer);
    buyFirst(game);
    for (let email = 0; email < Rules.sorterAfterEmails; email++) {
        act(game, 'job.work', { at: Job.answeredAt(game) });
    }
    game.state.wallet.cents = Rules.sorterPrice;
    return game;
}

test('the box arrives with the dragon on top, and the first card comes out', () => {
    const game = newGame();
    assert.ok(game.encounter().text(game).some(line => line.includes(`${Rules.boxCards} cards under it`)));
    act(game, 'encounter.choose', { index: 0 });
    const card = Catalog.find(game.state.box.top);
    assert.equal(card.rarity, 'common');
    assert.equal(card.set, 'base');
    assert.equal(Box.reveal(game), Lines.box.junk(card.name, Lines.box.quirks[game.state.box.quirk]));
});

test('each click takes one card out and shows what it was', () => {
    const game = gameAtBox();
    takeCards(game, 1);
    assert.equal(game.state.box.sorted, 1);
    assert.equal(Box.left(game), Rules.boxCards - 1);
    const html = HomeScene.render(game, {});
    assert.ok(html.includes(escape(Box.reveal(game))));
    assert.ok(html.includes('box.take'));
});

test('every find has its text, turns up at its own card, and something is always close', () => {
    const places = Object.values(Rules.boxFinds);
    assert.deepEqual(places, [...places].sort((a, b) => a - b), 'in order');
    assert.equal(new Set(places).size, places.length);
    assert.ok(places[places.length - 1] < Rules.boxCards);
    assert.ok(places.includes(Rules.boxStuckAt));
    places.slice(1).forEach((place, index) => {
        assert.ok(place - places[index] <= 5, `a find within 5 cards of card ${places[index]}`);
    });
    assert.deepEqual(Object.keys(Lines.box.finds), Object.keys(Rules.boxFinds));
    for (const find of Object.keys(Rules.boxCardFinds)) {
        assert.ok(find in Rules.boxFinds, find);
    }
});

test('a find shows in the box and in the log', () => {
    const game = gameAtBox();
    takeCards(game, Rules.boxFinds.tag);
    assert.equal(Box.reveal(game), Lines.box.finds.tag);
    assert.equal(newestMessage(game), Lines.box.finds.tag);
});

test('things turn up in order: the money, the machine, then the checklist', () => {
    const game = gameAtBox();
    const { birthday, flyer, checklist } = Rules.boxFinds;
    takeCards(game, birthday - 1);
    assert.equal(game.state.wallet.cents, 0);
    takeCards(game, 1);
    assert.equal(game.state.wallet.cents, Rules.birthdayMoney);

    assert.equal(game.unlocked('mall'), false);
    takeCards(game, flyer - birthday);
    assert.ok(game.unlocked('mall'));
    assert.equal(game.unlocked('work'), false, 'not out of money yet');

    assert.ok(!game.messages.some(message => message.text === Lines.box.finds.checklist));
    takeCards(game, checklist - flyer);
    assert.ok(game.messages.some(message => message.text === Lines.box.finds.checklist));
});

test('the bottom of the box will not come out by hand', () => {
    const game = gameAtBox();
    takeCards(game, Rules.boxCards);
    assert.equal(game.state.box.sorted, Rules.boxStuckAt);
    assert.equal(game.encounter(), null, 'no Benny yet');
    assert.ok(game.messages.some(message => message.text === Lines.box.finds.stuck));
    const html = HomeScene.render(game, {});
    assert.ok(!html.includes('box.take'));
    assert.ok(html.includes(escape(Lines.box.stuckHint)));
});

test('the pile counts what has been put to one side, and the dragon', () => {
    const game = gameAtBox();
    assert.equal(Box.pile(game), 1);
    takeCards(game, Rules.boxFinds.iou);
    assert.equal(Box.pile(game), 2);
    const kept = gameAtBox();
    emptyBox(kept);
    assert.equal(Box.pile(kept), Object.keys(Rules.boxCardFinds).length + 1);
});

test('nothing but the box is on offer to begin with', () => {
    const game = gameAtBox();
    const html = HomeScene.render(game, {});
    assert.ok(html.includes('box.take'));
    assert.ok(!html.includes('job.work') && !html.includes('box.buySorter'));
});

test('the machine, then the job, then the SORT-O-MATIC', () => {
    const game = gameAtBox();
    takeCards(game, Rules.boxFinds.flyer);
    buyFirst(game);
    assert.ok(game.unlocked('work'), 'the first pack leaves too little for a second');
    assert.equal(game.unlocked('sorter-ad'), false);
    assert.equal(gameWithAdvert().unlocked('sorter-ad'), true);
});

test('the SORT-O-MATIC costs money and sorts the box over time, even away', () => {
    const game = gameWithAdvert();
    const start = game.state.box.sorted;
    act(game, 'box.buySorter');
    assert.equal(game.state.wallet.cents, 0);
    assert.ok(game.state.box.sorterAt > 0);

    game.tick(game.time + Rules.sorterEvery - 1);
    assert.equal(game.state.box.sorted, start);
    game.tick(game.time + 1);
    assert.equal(game.state.box.sorted, start + 1);

    game.catchUp(game.time + 5 * Rules.sorterEvery);
    assert.equal(game.state.box.sorted, start + 6);
    assert.match(newestMessage(game), new RegExp(Lines.box.sorterAway(5)));
});

test('an empty box brings Benny, away or not, once nothing else is going on', () => {
    const game = gameWithAdvert();
    act(game, 'box.buySorter');
    game.state.encounter = { id: 'pip' };
    game.tick(game.time + Rules.boxCards * Rules.sorterEvery);
    assert.equal(game.state.encounter.id, 'pip', 'he waits his turn');
    game.state.encounter = null;
    game.tick(game.time);
    assert.equal(game.encounter().id, 'shoebox-offer');
    assert.equal(game.state.people.benny.met, true);
    assert.equal(game.state.box.sorted, Rules.boxCards);
    assert.ok(game.encounter().text(game).some(line => line.includes('SORT-O-MATIC')));
    assert.ok(game.encounter().text(game).some(line => line.includes('$0.43')));
});

test('a save that has taken every card out brings Benny, even with no SORT-O-MATIC', () => {
    const game = gameAtBox();
    game.state.box.sorted = Rules.boxCards;
    game.tick(game.time);
    assert.equal(game.encounter().id, 'shoebox-offer');
    assert.ok(!game.encounter().text(game).some(line => line.includes('SORT-O-MATIC')));
});

test('the box does not count towards the collection, whatever happens to it', () => {
    for (const choice of ['sell', 'keep']) {
        const game = newGame();
        finishOpening(game, choice);
        assert.equal(game.state.collection.cardsOpened, 0, choice);
        assert.equal(game.unlocked('outgrew-binder'), false, choice);
    }
});

test('a save from before the box skips it', () => {
    const game = newGame({ now: START });
    finishOpening(game, 'keep');
    const save = JSON.parse(JSON.stringify(game.toSaveData()));
    delete save.box;
    const loaded = newGame({ save, now: game.time + MINUTE });
    assert.equal(Box.open(loaded), false);
    assert.equal(loaded.encounter(), null);
});

test('deciding on the box with money left still leaves emails to answer, wherever today is', () => {
    const days = { Sunday: 0, Monday: 1, Tuesday: 2 };
    for (const [day, offset] of Object.entries(days)) {
        for (const index of [0, 1]) {
            const game = newGame({ now: START + offset * 24 * 60 * 60 * 1000 });
            act(game, 'encounter.choose', { index: 0 });
            emptyBox(game);
            act(game, 'encounter.choose', { index });

            assert.ok(game.unlocked('work'), day);
            assert.equal(game.state.job.inbox, Rules.inboxStart, day);
            assert.ok(game.messages.some(message => message.text === Lines.mall.stillWaiting), day);
            act(game, 'job.work', { at: Job.answeredAt(game) });
            assert.equal(game.state.job.inbox, Rules.inboxStart - 1, day);
        }
    }
});
