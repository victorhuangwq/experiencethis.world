import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, act, finishOpening, overrideRules, newestMessage, gameAtGus } from './helpers.js';
import { Collection } from '../js/systems/collection.js';
import { Cards } from '../js/systems/cards.js';
import { Catalog } from '../js/content/catalog.js';
import { GusScene } from '../js/ui/scenes/gus.js';
import { Job } from '../js/systems/job.js';
import { Rules } from '../js/rules.js';
import { Lines } from '../js/content/text/index.js';
import { desk } from '../js/ui/art/office.js';
import { calendar } from '../js/ui/scenes/office.js';

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
    assert.equal(Job.desk(game), 1, 'a card taped to the terminal');
    game.state.collection.storage = 'binder';
    assert.equal(Job.desk(game), 2, 'a binder');
    game.state.collection.storage = 'two-binders';
    assert.equal(Job.desk(game), 3, 'another, and a playmat');
    game.state.progress.unlocked.push('clash-poster');
    assert.equal(Job.desk(game), 4, 'the Friday Night Clash flyer');
    game.state.store.gradedBack = 1;
    assert.equal(Job.desk(game), 5, 'a graded card on a stand');
    game.state.story.season = 'summer';
    assert.equal(Job.desk(game), 6, 'buried in cards');
});

test('every stage of the cubicle is drawn the same size, and each one adds something', () => {
    const calendar = { month: 'OCT', day: 'TUE', date: '27', time: '10:42AM' };
    const drawn = [0, 1, 2, 3, 4, 5, 6].map(stage => desk(stage, { inbox: 412, calendar }));
    for (const art of drawn) {
        assert.deepEqual(new Set(art.split('\n').slice(1).map(line => line.length)), new Set([48]), art);
    }
    for (let stage = 1; stage < drawn.length; stage++) {
        assert.notEqual(drawn[stage], drawn[stage - 1], `stage ${stage} changes the desk`);
    }
    assert.ok(drawn[0].includes('QUARTERLY') && drawn[0].includes('MEMO'), 'corporate to begin with');
    assert.ok(drawn[6].includes('BACKYARD') && drawn[6].includes('CLASH') && drawn[6].includes('BULK'));
    assert.ok(desk(0, { inbox: 413, calendar }).includes('(413)'), 'answering emails only makes more');
    assert.ok(desk(0, { inbox: 412, calendar, marcus: true }).split('\n')[0].includes('(o_o)'), 'Marcus over the partition');
});

test('the calendar on the wall shows the real date and time', () => {
    assert.deepEqual(calendar(new Date(2026, 9, 27, 10, 42).getTime()), { month: 'OCT', day: 'TUE', date: '27', time: '10:42AM' });
    assert.deepEqual(calendar(new Date(2026, 0, 4, 0, 5).getTime()), { month: 'JAN', day: 'SUN', date: '4', time: '12:05AM' });
    assert.deepEqual(calendar(new Date(2026, 6, 31, 23, 59).getTime()), { month: 'JUL', day: 'FRI', date: '31', time: '11:59PM' });
    const art = desk(0, { inbox: 412, calendar: calendar(new Date(2026, 9, 27, 10, 42).getTime()) });
    assert.ok(art.includes('|  OCT  |') && art.includes('|TUE 27 |') && art.includes('|10:42AM|'));
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

/**
 * A game at the office, with cards to play with, that Marcus has asked to
 * lunch
 */
function invitedToLunch(day = 'Tuesday') {
    const game = gameOn(day);
    Collection.add(game, Catalog.inSet('base').map(card => Cards.card(card.id, 8)));
    game.state.job.coworker = 2;
    return game;
}

/**
 * Play out the game on, choosing the first type each time
 */
function playOut(game) {
    while (game.state.tournaments.current) {
        const choices = game.encounter().choices(game);
        act(game, 'encounter.choose', { index: choices.findIndex(choice => !choice.disabled) });
    }
}

test('Marcus asks the player to lunch once he sees a binder on the desk, too', () => {
    const game = gameOn('Wednesday');
    game.state.collection.packsOpened = 1;
    game.state.job.coworker = 1;
    game.state.collection.storage = 'binder';
    act(game, 'job.work', { at: 'office' });
    assert.equal(game.state.job.coworker, 2);
    assert.equal(newestMessage(game), Lines.job.coworker.binder);
});

test('lunch with Marcus is one game at the office, once an office day', () => {
    const game = invitedToLunch();
    assert.ok(Job.marcusAround(game), 'he looks over the partition');
    act(game, 'job.lunch');
    const current = game.state.tournaments.current;
    assert.equal(current.kind, 'lunch');
    assert.deepEqual(current.opponents, ['marcus']);
    assert.equal(game.encounter().id, 'lunch');
    assert.equal(game.encounter().location, 'office');

    playOut(game);
    assert.equal(game.state.job.lunches, 1);
    assert.equal(game.state.tournaments.localsPlayed, 0, 'lunch is not a tourney');
    assert.ok([Lines.job.coworker.lunchWon, Lines.job.coworker.lunchLost].includes(newestMessage(game)));

    act(game, 'job.lunch');
    assert.equal(game.state.tournaments.current, null, 'once a day');
    assert.equal(Job.marcusAround(game), false);
});

test('no lunch on a home day, or before Marcus asks', () => {
    const home = invitedToLunch('Monday');
    act(home, 'job.lunch');
    assert.equal(home.state.tournaments.current, null);

    const early = invitedToLunch();
    early.state.job.coworker = 1;
    act(early, 'job.lunch');
    assert.equal(early.state.tournaments.current, null);
});

test('after two lunches, Marcus brings a special pack each office day, at the machine\'s price', () => {
    const game = invitedToLunch('Tuesday');
    act(game, 'job.buyPack');
    assert.equal(game.state.collection.packs.base.special, 0, 'not yet');

    act(game, 'job.lunch');
    playOut(game);
    game.tick(days.Wednesday);
    act(game, 'job.lunch');
    playOut(game);
    assert.ok(game.messages.some(message => message.text === Lines.job.coworker.offersPacks));

    const before = game.state.wallet.cents = 2000;
    act(game, 'job.buyPack');
    assert.equal(game.state.collection.packs.base.special, 1);
    assert.equal(game.state.wallet.cents, before - Rules.prices.special);
    act(game, 'job.buyPack');
    assert.equal(game.state.collection.packs.base.special, 1, 'one a day');

    game.tick(days.Friday);
    act(game, 'job.buyPack');
    assert.equal(game.state.collection.packs.base.special, 1, 'not on a home day');
    game.tick(days.Tuesday + 7 * 24 * 60 * 60 * 1000);
    game.state.wallet.cents = Rules.prices.special - 1;
    act(game, 'job.buyPack');
    assert.equal(game.state.collection.packs.base.special, 1, 'not without the money');
    game.state.wallet.cents = Rules.prices.special;
    act(game, 'job.buyPack');
    assert.equal(game.state.collection.packs.base.special, 2, 'the next office day');
});

test('lunch survives saving and loading mid-game', () => {
    const game = invitedToLunch();
    act(game, 'job.lunch');
    act(game, 'encounter.choose', { index: 0 });
    const loaded = newGame({ save: JSON.parse(JSON.stringify(game.toSaveData())), now: game.time });
    assert.deepEqual(loaded.toSaveData(), game.toSaveData());
    assert.equal(loaded.encounter()?.id, game.encounter()?.id);
});

test('the player runs into Marcus at Gus\'s, once; knowing him from work, they pretend this is normal', () => {
    for (const coworker of [0, 2]) {
        const game = gameAtGus();
        game.state.job.coworker = coworker;
        // A Saturday afternoon: Marcus is at the table by the window
        game.tick(new Date(2026, 9, 31, 14).getTime());
        act(game, 'story.visit', { location: 'gus' });
        assert.equal(game.encounter()?.id, 'marcus-at-gus');
        assert.deepEqual(game.encounter().text(game), Lines.marcus.bump(coworker > 0));
        act(game, 'encounter.choose', { index: 0 });
        assert.ok(game.state.people.marcus.metAtGus);
        assert.equal(newestMessage(game), Lines.marcus.bumped(coworker > 0));

        act(game, 'story.visit', { location: 'home' });
        act(game, 'story.visit', { location: 'gus' });
        assert.equal(game.encounter(), null, 'only the first time');
    }
});

test('Marcus is not run into when he is not there', () => {
    const game = gameAtGus();
    act(game, 'story.visit', { location: 'gus' });
    assert.equal(game.encounter(), null, 'a Monday afternoon');
    assert.ok(GusScene.render(game, { panel: 'table' }).includes('BACK THURSDAY'));
});
