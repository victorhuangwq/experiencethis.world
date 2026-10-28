/**
 * A match at one of Gus's tournaments, or at lunch with Marcus at the
 * office: one round at a time, the player picks a type to play.
 * Tournaments.start starts it, and each round starts it again until the
 * tournament is over (see js/systems/tournaments.js).
 */

import { Lines } from '../text/index.js';
import { Catalog } from '../catalog.js';
import { Tournaments } from '../../systems/tournaments.js';

/**
 * A match encounter, in a place
 * @param {string} id - Encounter id
 * @param {string} location - Where it's played
 */
function matchAt(id, location) {
    return { id, location, art: 'table', text, choices };
}

export const MatchEncounter = matchAt('match', 'gus');
export const LunchEncounter = matchAt('lunch', 'office');

function text(game) {
    const current = game.state.tournaments.current;
    const regular = Lines.tournaments.regulars[Tournaments.opponent(game).id];
    const header = current.kind === 'lunch' ? Lines.job.coworker.lunchTitle : Lines.tournaments.match(current.results.length + 1, regular.name);
    const lines = [header, regular.tell];

    // The last round played, in this match or the one before
    const previous = current.results.at(-1);
    const last = current.rounds.at(-1) || (previous && previous.rounds.at(-1));
    if (last) {
        const before = current.rounds.length > 0 ? regular.name : Lines.tournaments.regulars[current.opponents[current.results.length - 1]].name;
        lines.push(roundLine(last, before));
    }
    if (current.rounds.length === 0 && previous) {
        const name = Lines.tournaments.regulars[current.opponents[current.results.length - 1]].name;
        lines.push(previous.won ? Lines.tournaments.matchWon(name) : Lines.tournaments.matchLost(name));
    }
    const wins = current.rounds.filter(round => round.won).length;
    lines.push(Lines.tournaments.score(wins, regular.name, current.rounds.length - wins));
    return lines;
}

function choices(game) {
    const types = [...Catalog.types, Catalog.wildType].filter(type =>
        game.state.tournaments.current.deck.some(id => game.state.collection.cards.find(card => card.id === id)?.type === type));
    const offered = types.map(type => {
        const card = Tournaments.nextCard(game, type);
        return {
            label: card ? Lines.tournaments.play(type, card.name, card.power) : Lines.tournaments.noneLeft(type),
            disabled: !card,
            run: game => Tournaments.playRound(game, type)
        };
    });
    // Never stuck: with nothing left to play, the round is lost
    if (offered.every(choice => choice.disabled)) {
        offered.push({ label: Lines.tournaments.nothing, run: game => Tournaments.playRound(game, null) });
    }
    return offered;
}

function roundLine(round, name) {
    const mine = round.mine && Catalog.find(round.mine);
    const theirs = Catalog.find(round.theirs);
    const parts = [mine ? Lines.tournaments.played(mine.name, mine.type, mine.power) : Lines.tournaments.playedNothing,
        Lines.tournaments.theyPlayed(name, theirs.name, theirs.type, theirs.power)];
    const winner = [mine?.type, theirs.type].find(type => Catalog.beats[type] === (type === mine?.type ? theirs.type : mine?.type));
    if (mine && winner) {
        parts.push(Lines.tournaments.typeBeats(winner, winner === mine.type ? theirs.type : mine.type));
    }
    parts.push(round.coin ? Lines.tournaments.coin(round.won) : round.won ? Lines.tournaments.roundWon : Lines.tournaments.roundLost);
    return parts.join(' ');
}
