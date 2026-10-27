import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, act, finishOpening, overrideRules, newestMessage } from './helpers.js';
import { Job } from '../js/systems/job.js';
import { Rules } from '../js/rules.js';
import { Lines } from '../js/content/text/index.js';
import { desk } from '../js/ui/art/office.js';

const SECOND = 1000;

// A week in October 2026, at 10 AM local time
const days = {
    Monday: new Date(2026, 9, 26, 10).getTime(),
    Tuesday: new Date(2026, 9, 27, 10).getTime(),
    Wednesday: new Date(2026, 9, 28, 10).getTime(),
    Thursday: new Date(2026, 9, 29, 10).getTime(),
    Friday: new Date(2026, 9, 30, 10).getTime(),
    Saturday: new Date(2026, 9, 31, 10).getTime(),
    Sunday: new Date(2026, 10, 1, 10).getTime()
};

/**
 * A game on a given day, with work unlocked
 */
function gameOn(day) {
    const game = newGame({ now: days[day] });
    finishOpening(game, 'keep');
    game.tick(days[day] + 30 * SECOND);
    assert.ok(game.unlocked('work'));
    return game;
}

test('the job is hybrid: the office Tuesday to Thursday, home Monday and Friday, weekends off', () => {
    const where = Object.fromEntries(Object.keys(days).map(day => [day, Job.workplace(newGame({ now: days[day] }))]));
    assert.deepEqual(where, {
        Monday: 'home', Tuesday: 'office', Wednesday: 'office', Thursday: 'office', Friday: 'home', Saturday: null, Sunday: null
    });
});

test('work turns up after 30 seconds of allowance, saying where it happens today', () => {
    for (const [day, place] of [['Tuesday', 'office'], ['Monday', 'home'], ['Saturday', 'off']]) {
        const game = newGame({ now: days[day] });
        finishOpening(game, 'keep');
        game.tick(days[day] + 29 * SECOND);
        assert.equal(game.unlocked('work'), false);
        game.tick(days[day] + 30 * SECOND);
        assert.equal(newestMessage(game), Lines.job.unlocked[place](day), day);
    }
});

test('on an office day, emails are answered at the office, then need a rest', () => {
    const game = gameOn('Tuesday');
    const before = game.state.wallet.cents;
    act(game, 'job.work', { at: 'office' });
    act(game, 'job.work', { at: 'office' });
    assert.equal(game.state.wallet.cents, before + Rules.workPay, 'the second click is ignored while resting');
    assert.equal(game.state.job.emailsAnswered, 1);

    game.tick(game.time + Rules.workRest);
    act(game, 'job.work', { at: 'office' });
    assert.equal(game.state.job.emailsAnswered, 2);
});

test('on a home day, emails are answered at home', () => {
    const game = gameOn('Friday');
    act(game, 'job.work', { at: 'home' });
    assert.equal(game.state.job.emailsAnswered, 1);
});

test('nobody works from the wrong place, or on a day off', () => {
    for (const [day, at, today] of [['Wednesday', 'home', 'office'], ['Monday', 'office', 'home'], ['Sunday', 'home', 'off']]) {
        const game = gameOn(day);
        const cents = game.state.wallet.cents;
        act(game, 'job.work', { at });
        assert.equal(game.state.wallet.cents, cents, day);
        assert.equal(newestMessage(game), Lines.job.wrongPlace[today](day));
    }
});

test('the desk fills up as the hobby takes over', () => {
    const game = gameOn('Tuesday');
    assert.equal(Job.desk(game), 0);
    game.state.collection.packs.base.normal = 1;
    act(game, 'collection.open', { kind: 'normal' });
    assert.equal(Job.desk(game), 1, 'a card under the monitor');
    game.state.collection.storage = 'binder';
    assert.equal(Job.desk(game), 2, 'a binder');
    game.state.collection.storage = 'two-binders';
    assert.equal(Job.desk(game), 3, 'a playmat for a mousepad');

    const drawn = [0, 1, 2, 3].map(stage => desk(stage, 412).split('\n'));
    assert.ok(drawn[1].join('\n').includes('[#]'));
    assert.ok(drawn[2].join('\n').includes('|o'));
    assert.ok(drawn[3].join('\n').includes('~~~~~~'));
    for (const lines of drawn) {
        assert.deepEqual(lines.slice(-3).map(line => line.length), drawn[0].slice(-3).map(line => line.length), 'the desk keeps its shape');
    }
    assert.ok(desk(0, 413).includes('Inbox (  413)'), 'answering emails only makes more');
});

test('Marcus from IT notices the desk, then asks the player to lunch', () => {
    const game = gameOn('Thursday');
    game.state.collection.packs.base.normal = 2;
    act(game, 'job.work', { at: 'office' });
    assert.equal(game.state.job.coworker, 0, 'nothing on the desk to notice');

    act(game, 'collection.open', { kind: 'normal' });
    game.tick(game.time + Rules.workRest);
    act(game, 'job.work', { at: 'office' });
    assert.equal(game.state.job.coworker, 1);
    assert.equal(newestMessage(game), Lines.job.coworker.notices);

    act(game, 'job.openAtDesk');
    assert.equal(game.state.job.coworker, 2);
    assert.ok(game.messages.some(message => message.text === Lines.job.coworker.lunch));
});

test('Linda walks past when packs are opened at the desk, and it is never a strike', (t) => {
    overrideRules(t, { bossWalkByChance: 1 });
    const game = gameOn('Wednesday');
    game.state.job.coworker = 2;
    game.state.collection.packs.base.normal = 6;

    const said = [];
    for (let pack = 0; pack < 6; pack++) {
        act(game, 'job.openAtDesk');
        said.push(game.messages.find(message => message.text.startsWith('Linda')).text);
    }
    const walkBys = Lines.job.boss.walkBys;
    assert.deepEqual(said, [...walkBys, walkBys[walkBys.length - 1], walkBys[walkBys.length - 1]]);
    assert.equal(game.state.job.packsOpenedAtDesk, 6);
    assert.equal(game.state.collection.packsOpened, 6);
    assert.equal(game.state.kindness.strikes.length, 0);
});

test('packs are only opened at the desk on office days', () => {
    const game = gameOn('Monday');
    game.state.collection.packs.base.normal = 1;
    act(game, 'job.openAtDesk');
    assert.equal(game.state.collection.packs.base.normal, 1);
});

test('a rest saved from a clock that ran ahead is cut short on load', () => {
    const game = gameOn('Tuesday');
    game.state.job.readyAt = game.time + 10 * 60 * SECOND;
    const loaded = newGame({ save: JSON.parse(JSON.stringify(game.toSaveData())), now: game.time });
    assert.ok(loaded.state.job.readyAt <= game.time + Rules.workRest);
});
