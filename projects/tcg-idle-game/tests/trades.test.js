import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameAtGus, newGame, act, START } from './helpers.js';
import { Trades } from '../js/systems/trades.js';
import { Collection } from '../js/systems/collection.js';
import { Cards } from '../js/systems/cards.js';
import { Catalog } from '../js/content/catalog.js';
import { Rules } from '../js/rules.js';
import { Lines } from '../js/content/text/index.js';
import { GusScene } from '../js/ui/scenes/gus.js';

const HOUR = 60 * 60 * 1000;
// START is a Sunday afternoon; gameAtGus is the Monday after
const at = (day, hour) => new Date(2026, 9, 26 + day, hour).getTime();
const days = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 };

/**
 * A game at Gus's with spares of a few cards
 */
function gameWithSpares() {
    const game = gameAtGus();
    const spares = ['lawnmower-lion', 'great-garden-gnome', 'soggy-toad', 'drizzle-frog', 'snorkel-ferret'];
    Collection.add(game, spares.flatMap(id => [Cards.card(id, 9), Cards.card(id, 6)]));
    return game;
}

test('Marcus is at Gus\'s on Thursday and Friday evenings, and all weekend', () => {
    const game = gameAtGus();
    const here = (day, hour) => Trades.here(game, at(days[day], hour));
    assert.equal(here('monday', 19), false);
    assert.equal(here('wednesday', 20), false);
    assert.equal(here('thursday', 17), false, 'not before 6 PM');
    assert.equal(here('thursday', 18), true);
    assert.equal(here('friday', 23), true);
    assert.equal(here('saturday', 9), true);
    assert.equal(here('sunday', 0), true);
});

test('Marcus is not there before the store opens', () => {
    const game = newGame({ now: at(days.saturday, 12) });
    assert.equal(Trades.here(game), false);
});

test('Marcus offers up to three trades: a card the player lacks, for a spare of the same rarity', () => {
    const game = gameWithSpares();
    game.tick(at(days.thursday, 18));
    const offers = game.state.trades.offers;
    assert.equal(offers.length, Rules.marcusOffers);
    const owned = new Set(game.state.collection.cards.map(card => card.cardId));
    const spares = new Set(Collection.duplicates(game).map(card => card.cardId));
    for (const offer of offers) {
        assert.ok(!owned.has(offer.give), 'a card the player does not have');
        assert.ok(spares.has(offer.want), 'for one they have a spare of');
        assert.equal(Catalog.find(offer.give).rarity, Catalog.find(offer.want).rarity, 'same rarity');
        assert.ok(offer.condition <= 9, 'his cards have been traded around a bit');
    }
    assert.equal(new Set(offers.map(offer => offer.want)).size, offers.length, 'one offer per spare');
});

test('without spares, Marcus has nothing to offer', () => {
    const game = gameAtGus();
    Collection.add(game, [Cards.card('lawnmower-lion', 9)]);
    game.tick(at(days.saturday, 10));
    assert.deepEqual(game.state.trades.offers, []);
    assert.ok(GusScene.render(game, {}).includes('Your binder is too good'));
    assert.ok(Lines.marcus.noOffers.includes('Your binder is too good'));
});

test('a trade swaps the spare for Marcus\'s card, keeping the best copy, once', () => {
    const game = gameWithSpares();
    game.tick(at(days.thursday, 18));
    const offer = game.state.trades.offers[0];
    const best = game.state.collection.cards.find(card => card.cardId === offer.want && card.condition === 9);
    act(game, 'trades.trade', { index: 0 });

    const cards = game.state.collection.cards;
    assert.deepEqual(cards.filter(card => card.cardId === offer.want), [best], 'the best copy stays');
    const got = cards.filter(card => card.cardId === offer.give);
    assert.equal(got.length, 1);
    assert.equal(got[0].condition, offer.condition);
    assert.equal(game.state.trades.offers[0], null);
    assert.equal(game.state.trades.made, 1);

    act(game, 'trades.trade', { index: 0 });
    assert.equal(game.state.trades.made, 1, 'only once');
});

test('no trade without a spare to give, or once Marcus has gone home', () => {
    const game = gameWithSpares();
    game.tick(at(days.thursday, 18));
    const offer = game.state.trades.offers[0];
    Collection.remove(game, Collection.duplicates(game).filter(card => card.cardId === offer.want));
    act(game, 'trades.trade', { index: 0 });
    assert.equal(game.state.trades.made, 0, 'the spare is gone');

    game.tick(at(days.friday, 10));
    act(game, 'trades.trade', { index: 1 });
    assert.equal(game.state.trades.made, 0, 'Friday morning: Marcus is at work');
});

test('Marcus makes new offers each day he is there, not each visit', () => {
    const game = gameWithSpares();
    game.tick(at(days.thursday, 18));
    const thursday = structuredClone(game.state.trades.offers);
    game.tick(at(days.thursday, 22));
    assert.deepEqual(game.state.trades.offers, thursday, 'the same evening');
    game.tick(at(days.friday, 19));
    assert.notDeepEqual(game.state.trades.offers, thursday, 'Friday evening');
});

test('Marcus sits at the table when he is in, and someone who met him at work is pretended not to be known', () => {
    const game = gameWithSpares();
    game.tick(at(days.monday, 19));
    assert.ok(!GusScene.render(game, {}).includes('(-_-)'));
    game.tick(at(days.thursday, 19));
    assert.ok(GusScene.render(game, {}).includes('(-_-)'));
    game.state.job.coworker = 2;
    assert.ok(GusScene.render(game, {}).includes('pretends not to know you'));
});

test('Marcus\'s offers survive saving and loading', () => {
    const game = gameWithSpares();
    game.tick(at(days.saturday, 12));
    act(game, 'trades.trade', { index: 1 });
    const loaded = newGame({ save: JSON.parse(JSON.stringify(game.toSaveData())), now: game.time });
    assert.deepEqual(loaded.toSaveData(), game.toSaveData());
});
