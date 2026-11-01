import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, act, sortCards, buyFirst, finishOpening, newestMessage, START } from './helpers.js';
import { Rules } from '../js/rules.js';
import { Lines } from '../js/content/text/index.js';
import { Catalog } from '../js/content/catalog.js';
import { Box } from '../js/systems/box.js';
import { Job } from '../js/systems/job.js';
import { HomeScene } from '../js/ui/scenes/home.js';

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
    sortCards(game, Rules.boxFinds.flyer);
    buyFirst(game);
    for (let email = 0; email < Rules.sorterAfterEmails; email++) {
        act(game, 'job.work', { at: Job.answeredAt(game) });
    }
    game.state.wallet.cents = Rules.sorterPrice;
    return game;
}

test('the box arrives with the dragon on top, and a card is in hand', () => {
    const game = newGame();
    assert.ok(game.encounter().text(game).some(line => line.includes(`${Rules.boxCards} cards under it`)));
    act(game, 'encounter.choose', { index: 0 });
    const card = Catalog.find(game.state.box.top);
    assert.equal(card.rarity, 'common');
    assert.equal(card.set, 'base');
});

test('a card on the right stack is sorted, and the next comes out', () => {
    const game = gameAtBox();
    const { type } = Catalog.find(game.state.box.top);
    sortCards(game, 1);
    assert.equal(game.state.box.sorted, 1);
    assert.equal(game.state.box.stacks[type], 1);
    assert.equal(Box.left(game), Rules.boxCards - 1);
});

test('a card on the wrong stack stays in hand, at no cost', () => {
    const game = gameAtBox();
    const { top } = game.state.box;
    const wrong = Catalog.types.find(type => type !== Catalog.find(top).type);
    act(game, 'box.sort', { type: wrong });
    assert.equal(game.state.box.sorted, 0);
    assert.equal(game.state.box.top, top);
    assert.ok(Lines.box.wrong.includes(newestMessage(game)));
});

test('things turn up in order: the checklist, the money, then the machine', () => {
    const game = gameAtBox();
    const { checklist, birthday, flyer } = Rules.boxFinds;
    sortCards(game, checklist - 1);
    assert.ok(!game.messages.some(message => message.text === Lines.box.finds.checklist));
    sortCards(game, 1);
    assert.ok(game.messages.some(message => message.text === Lines.box.finds.checklist));

    sortCards(game, birthday - checklist - 1);
    assert.equal(game.state.wallet.cents, 0);
    sortCards(game, 1);
    assert.equal(game.state.wallet.cents, Rules.birthdayMoney);

    assert.equal(game.unlocked('mall'), false);
    sortCards(game, flyer - birthday);
    assert.ok(game.unlocked('mall'));
    assert.equal(game.unlocked('work'), false, 'not out of money yet');
});

test('nothing but the box is on offer to begin with', () => {
    const game = gameAtBox();
    const html = HomeScene.render(game, {});
    assert.ok(Catalog.types.every(type => html.includes(`data-type="${type}"`)));
    assert.ok(!html.includes('job.work') && !html.includes('box.buySorter'));
});

test('the machine, then the job, then the SORT-O-MATIC', () => {
    const game = gameAtBox();
    sortCards(game, Rules.boxFinds.flyer);
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
    assert.equal(Object.values(game.state.box.stacks).reduce((sum, count) => sum + count), start + 6);
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

test('sorting the whole box by hand brings Benny too', () => {
    const game = gameAtBox();
    sortCards(game, Rules.boxCards);
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
