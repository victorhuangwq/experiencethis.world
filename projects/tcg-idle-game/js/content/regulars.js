/**
 * Gus's regulars: the people the player meets at his tournaments. Each one
 * plays in a way the player can learn to read, and the way they're
 * described gives it away (their lines are in text/tournaments.js).
 *
 *   id               Saved while a tournament is on
 *   face             Their face at the table
 *   plays(game, rounds)  The type they play next, given the rounds of this
 *                    match so far: [{ mine, theirs }], as types
 *   only(game)       Optional: whether they can be at this tournament
 */

import { Rules } from '../rules.js';
import { Catalog } from './catalog.js';
import { Trades } from '../systems/trades.js';

// Plays one type, nearly always
const favours = type => (game) => game.chance(Rules.tellChance) ? type : game.pick(Catalog.types);

// The type that beats a type
const beaten = type => Catalog.types.find(each => Catalog.beats[each] === type);

export const Regulars = [
    { id: 'brenda', face: '(~_~)', plays: favours('Water') },
    { id: 'joe', face: '(-.-)', plays: favours('Nature') },
    { id: 'hank', face: '(>_<)', plays: favours('Fire') },
    {
        // Copies whatever the player played last
        id: 'dev',
        face: '(o_o)',
        plays: (game, rounds) => rounds.length > 0 && Catalog.types.includes(rounds.at(-1).mine) ? rounds.at(-1).mine : game.pick(Catalog.types)
    },
    {
        // Plays whatever beats what the player played last
        id: 'kayla',
        face: '(^_^)',
        plays: (game, rounds) => rounds.length > 0 && Catalog.types.includes(rounds.at(-1).mine) ? beaten(rounds.at(-1).mine) : game.pick(Catalog.types)
    },
    {
        // Never plays the same type twice in a row. Only there when he's at
        // Gus's anyway.
        id: 'marcus',
        face: '(-_-)',
        plays: (game, rounds) => game.pick(Catalog.types.filter(type => type !== rounds.at(-1)?.theirs)),
        only: game => Trades.here(game)
    }
];
