import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameAtGus, newGame, act, overrideRules, newestMessage } from './helpers.js';
import { Tournaments } from '../js/systems/tournaments.js';
import { Collection } from '../js/systems/collection.js';
import { Cards } from '../js/systems/cards.js';
import { Catalog } from '../js/content/catalog.js';
import { Regulars } from '../js/content/regulars.js';
import { Rules } from '../js/rules.js';
import { Lines } from '../js/content/text/index.js';

const HOUR = 60 * 60 * 1000;

/**
 * Give the player cards, in good condition
 */
function give(game, ...cardIds) {
    return Collection.add(game, cardIds.map(id => Cards.card(id, 8)));
}

/**
 * A game at Gus's with a collection like a player's after a day of packs
 */
function gameWithCards(seed = 1) {
    const game = gameAtGus({ seed });
    for (let pack = 0; pack < 25; pack++) {
        Collection.add(game, Cards.openPack(game, 'normal'));
    }
    return game;
}

/**
 * Enter locals and set who the player meets
 */
function enter(game, opponents) {
    act(game, 'tournaments.enterLocals');
    if (opponents) {
        game.state.tournaments.current.opponents = opponents;
    }
    return game.state.tournaments.current;
}

const play = (game, type) => {
    const index = game.encounter().choices(game).findIndex(choice => choice.label.startsWith(type));
    act(game, 'encounter.choose', { index });
};

test('entering locals is buying two packs from Gus, once a day', () => {
    const game = gameWithCards();
    const before = game.state.wallet.cents;
    const current = enter(game);
    assert.equal(game.state.wallet.cents, before - 2 * Rules.gusPrices.base);
    assert.equal(game.state.collection.packs.base.normal, 2, 'the player keeps the packs');
    assert.equal(game.encounter().id, 'match');
    assert.equal(new Set(current.opponents).size, Rules.tournamentMatches, 'three different regulars');

    game.state.tournaments.current = null;
    game.state.encounter = null;
    act(game, 'tournaments.enterLocals');
    assert.equal(game.state.tournaments.current, null, 'one locals a day');
    game.tick(game.time + 6 * HOUR);
    act(game, 'tournaments.enterLocals');
    assert.equal(game.state.tournaments.current, null, 'not later the same day either');
    game.tick(game.time + 24 * HOUR);
    act(game, 'tournaments.enterLocals');
    assert.ok(game.state.tournaments.current, 'the next day, again');
});

test('no locals without the entry, or without any cards', () => {
    const broke = gameWithCards();
    broke.state.wallet.cents = 2 * Rules.gusPrices.base - 1;
    act(broke, 'tournaments.enterLocals');
    assert.equal(broke.state.tournaments.current, null);
    assert.equal(broke.state.wallet.cents, 2 * Rules.gusPrices.base - 1);

    const empty = gameAtGus();
    act(empty, 'tournaments.enterLocals');
    assert.equal(empty.state.tournaments.current, null);
});

test('the deck is the strongest three cards of each type in hand, never graded ones', () => {
    const game = gameAtGus();
    const [lion, turtle, gnome, pigeon, toad] = give(game, 'lawnmower-lion', 'thousand-year-turtle', 'great-garden-gnome', 'suspicious-pigeon', 'soggy-toad');
    game.state.collection.graded.push(lion.id);
    assert.deepEqual(Tournaments.deckFrom(Collection.loose(game)), [toad.id, turtle.id, gnome.id, pigeon.id]);
});

test('each round plays the strongest card left of the type picked', () => {
    const game = gameAtGus();
    const [, gnome, lion] = give(game, 'suspicious-pigeon', 'great-garden-gnome', 'lawnmower-lion', 'soggy-toad');
    enter(game);
    assert.equal(Tournaments.nextCard(game, 'Nature').id, lion.id);
    play(game, 'Nature');
    const round = game.state.tournaments.current.rounds[0] || game.state.tournaments.current.results[0]?.rounds[0];
    assert.equal(round.copy, lion.id);
    if (game.state.tournaments.current?.results.length === 0) {
        assert.equal(Tournaments.nextCard(game, 'Nature').id, gnome.id);
    }
    assert.equal(Tournaments.nextCard(game, 'Fire'), null);
});

test('a type that beats the other is worth more than raw power', (t) => {
    overrideRules(t, { tellChance: 1, opponentRarity: { locals: { common: 1 } } });
    const game = gameAtGus();
    give(game, 'soggy-toad', 'lukewarm-newt', 'damp-towel-weasel');
    // Hank plays Fire commons (power 1 to 3); a power 1 Water card beats them
    enter(game, ['hank', 'joe', 'brenda']);
    play(game, 'Water');
    play(game, 'Water');
    const current = game.state.tournaments.current;
    assert.equal(current.results.length, 1);
    assert.ok(current.results[0].won, 'two rounds won with power 1 cards');
    assert.ok(current.results[0].rounds.every(round => Catalog.find(round.theirs).type === 'Fire'));
});

test('a match is the best of three rounds, and locals is three matches with packs for prizes', (t) => {
    overrideRules(t, { tellChance: 1, opponentRarity: { locals: { common: 1 } } });
    const game = gameAtGus();
    // Strong cards of every type, so every round is won
    give(game, ...Catalog.inSet('base', 'ultra-rare').map(card => card.id), ...Catalog.inSet('base', 'rare').map(card => card.id));
    enter(game, ['brenda', 'joe', 'hank']);
    const counter = { brenda: 'Nature', joe: 'Fire', hank: 'Water' };
    for (const opponent of ['brenda', 'joe', 'hank']) {
        play(game, counter[opponent]);
        play(game, counter[opponent]);
    }
    assert.equal(game.state.tournaments.current, null, 'over after three matches');
    assert.equal(game.state.encounter, null);
    assert.equal(game.state.tournaments.localsWon, 1);
    assert.equal(game.state.tournaments.localsPlayed, 1);
    assert.equal(game.state.collection.packs.base.normal, 2 + Rules.localsPrizes[3], 'entry packs and prize packs');
    assert.equal(game.messages[1].text, Lines.tournaments.finished(3, Rules.localsPrizes[3]));
    assert.equal(newestMessage(game), Lines.tournaments.invited, 'a regular now');
});

test('losing every match wins nothing but a sticker', (t) => {
    overrideRules(t, { tellChance: 1, opponentRarity: { locals: { 'ultra-rare': 1 } } });
    const game = gameAtGus();
    give(game, 'soggy-toad', 'lukewarm-newt', 'damp-towel-weasel');
    enter(game, ['brenda', 'joe', 'hank']);
    while (game.state.tournaments.current) {
        act(game, 'encounter.choose', { index: 0 });
    }
    assert.equal(game.state.tournaments.localsWon, 0);
    assert.equal(game.state.collection.packs.base.normal, 2, 'only the entry packs');
    assert.equal(newestMessage(game), Lines.tournaments.finished(0, 0));
});

test('a player out of cards can always play nothing, and the tournament ends', () => {
    const game = gameAtGus();
    give(game, 'soggy-toad');
    enter(game);
    let rounds = 0;
    while (game.state.tournaments.current && rounds++ < 20) {
        const choices = game.encounter().choices(game);
        assert.ok(choices.some(choice => !choice.disabled), 'something to press');
        act(game, 'encounter.choose', { index: choices.findIndex(choice => !choice.disabled) });
    }
    assert.equal(game.state.tournaments.current, null);
});

test('the regulars play as they are described', () => {
    const game = newGame({ seed: 8 });
    const regular = id => Regulars.find(each => each.id === id);
    const count = (id, rounds, type) => {
        let seen = 0;
        for (let i = 0; i < 2000; i++) {
            seen += regular(id).plays(game, rounds) === type ? 1 : 0;
        }
        return seen / 2000;
    };
    assert.ok(Math.abs(count('brenda', [], 'Water') - (Rules.tellChance + (1 - Rules.tellChance) / 3)) < 0.03);
    assert.ok(Math.abs(count('joe', [], 'Nature') - (Rules.tellChance + (1 - Rules.tellChance) / 3)) < 0.03);
    assert.ok(Math.abs(count('hank', [], 'Fire') - (Rules.tellChance + (1 - Rules.tellChance) / 3)) < 0.03);
    assert.equal(count('dev', [{ mine: 'Fire', theirs: 'Water' }], 'Fire'), 1, 'Dev copies');
    assert.equal(count('kayla', [{ mine: 'Fire', theirs: 'Water' }], 'Water'), 1, 'Kayla plays what beats it');
    assert.equal(count('marcus', [{ mine: 'Fire', theirs: 'Water' }], 'Water'), 0, 'Marcus never repeats');
});

test('reading the regulars wins locals far more often than guessing', () => {
    // What each regular will play, as a player who has read them would guess
    const predict = (id, rounds) => ({
        brenda: 'Water', joe: 'Nature', hank: 'Fire',
        dev: rounds.at(-1)?.mine,
        kayla: Catalog.types.find(type => Catalog.beats[type] === rounds.at(-1)?.mine)
    })[id];
    const beats = type => Catalog.types.find(each => Catalog.beats[each] === type);

    const rate = reader => {
        let won = 0;
        const tournaments = 200;
        for (let seed = 1; seed <= tournaments; seed++) {
            const game = gameWithCards(seed);
            enter(game);
            while (game.state.tournaments.current) {
                const current = game.state.tournaments.current;
                const id = current.opponents[current.results.length];
                const rounds = current.rounds.map(round => ({ mine: Catalog.find(round.mine)?.type }));
                const guess = reader && predict(id, rounds);
                const choices = game.encounter().choices(game);
                const open = choices.filter(choice => !choice.disabled);
                const counter = open.find(choice => guess && choice.label.startsWith(beats(guess) + ':'));
                const pick = counter || open[Math.floor(game.random() * open.length)];
                act(game, 'encounter.choose', { index: choices.indexOf(pick) });
            }
            won += game.state.tournaments.localsWon;
        }
        return won / tournaments;
    };
    const reading = rate(true);
    const guessing = rate(false);
    assert.ok(reading >= 0.6, `a good read wins locals often: ${reading}`);
    assert.ok(reading >= guessing * 2, `reading ${reading}, guessing ${guessing}`);
});

test('a tournament survives saving and loading mid-match', () => {
    const game = gameWithCards();
    enter(game);
    act(game, 'encounter.choose', { index: 0 });
    const loaded = newGame({ save: JSON.parse(JSON.stringify(game.toSaveData())), now: game.time });
    assert.deepEqual(loaded.toSaveData(), game.toSaveData());
    assert.equal(loaded.encounter().id, 'match');
});

test('a broken tournament in a save is dropped, with its match', () => {
    const game = gameWithCards();
    enter(game);
    const data = JSON.parse(JSON.stringify(game.toSaveData()));
    data.tournaments.current.opponents = ['nobody', 'nobody', 'nobody'];
    const loaded = newGame({ save: data, now: game.time });
    assert.equal(loaded.state.tournaments.current, null);
    assert.equal(loaded.encounter(), null);
});

test('Marcus only plays at locals when he is at Gus\'s', () => {
    const game = gameWithCards();
    const opponents = () => {
        const seen = new Set();
        for (let tries = 0; tries < 30; tries++) {
            game.state.tournaments.localsDay = 0;
            enter(game).opponents.forEach(id => seen.add(id));
            game.state.tournaments.current = null;
            game.state.encounter = null;
        }
        return seen;
    };
    assert.ok(!opponents().has('marcus'), 'not on a Monday');
    game.tick(new Date(2026, 9, 31, 12).getTime());
    assert.ok(opponents().has('marcus'), 'on a Saturday');
});
