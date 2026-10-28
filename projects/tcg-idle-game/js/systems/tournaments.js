/**
 * Tournaments at Gus's. Locals run once a day: entry is buying packs from
 * Gus, and the prize is more packs. The pre-release, once, for regulars
 * before a new set comes out: the player opens a kit of the new set's packs
 * at the table and plays with only those cards; everyone gets the promo,
 * and each match won earns a pack.
 *
 * A tournament is a few matches against Gus's regulars (content/regulars.js),
 * each the best of three rounds. Each round the player picks a type and
 * plays their strongest card of it they haven't played this match; the
 * regular plays a type their way. A type that beats the other's gets
 * extra power, then the higher power wins, and a tie is settled with a
 * coin. The player's deck is the strongest few cards of each type they
 * have in hand. The match encounter (content/encounters/match.js) shows it.
 */

import { localDay } from '../core/time.js';
import { Format } from '../core/format.js';
import { Rules } from '../rules.js';
import { Catalog } from '../content/catalog.js';
import { Regulars } from '../content/regulars.js';
import { Lines } from '../content/text/index.js';
import { Wallet } from './wallet.js';
import { Collection } from './collection.js';
import { Store } from './store.js';
import { Story } from './story.js';
import { Cards } from './cards.js';

const KINDS = ['locals', 'prerelease'];

export const Tournaments = {
    id: 'tournaments',

    defaults: () => ({
        // The day of the last locals the player entered (a localDay()
        // number)
        localsDay: 0,
        localsPlayed: 0,
        // Locals where the player won every match
        localsWon: 0,
        // Whether the player has played the pre-release
        prerelease: false,
        // The tournament being played, or null:
        //   kind      'locals' or 'prerelease'
        //   set       The set its packs are from
        //   opponents Regular ids, one per match
        //   deck      Ids of the player's cards they play with
        //   results   Matches played: { won, rounds }
        //   rounds    This match's rounds: { copy (the player's card's id),
        //             mine, theirs (catalogue ids), won, coin }
        current: null
    }),

    load(tournaments, game) {
        const current = tournaments.current;
        if (current && !isTournament(current)) {
            tournaments.current = null;
        }
        if (!tournaments.current && game.state.encounter?.id === 'match') {
            game.state.encounter = null;
        }
    },

    /**
     * The set locals are played with, and its packs bought: the newest one
     * Gus sells
     */
    localsSet(game) {
        return Store.packsForSale(game).at(-1);
    },

    localsEntry(game) {
        return Rules.localsEntryPacks * Tournaments.localsSet(game).price;
    },

    /**
     * Whether today's locals is still to play
     */
    localsOpen(game, now = game.time) {
        return game.state.tournaments.localsDay !== localDay(now);
    },

    /**
     * The next set to come out, if there is one
     * @returns {string|null} - Set id
     */
    upcomingSet(game) {
        return Catalog.packSets().find(set => !Story.isOut(game, set))?.id ?? null;
    },

    /**
     * The set the pre-release is for, if the player is invited and hasn't
     * played it yet
     * @returns {string|null} - Set id
     */
    prereleaseSet(game) {
        if (!game.unlocked('prerelease-invite') || game.state.tournaments.prerelease) {
            return null;
        }
        return Tournaments.upcomingSet(game);
    },

    /**
     * The player's deck: the strongest few cards of each type in hand
     * @param {Array} cards - Cards to choose from
     * @returns {Array} - Card ids
     */
    deckFrom(cards) {
        const deck = [];
        for (const type of [...Catalog.types, Catalog.wildType]) {
            const strongest = cards.filter(card => card.type === type)
                .sort((a, b) => b.power - a.power || b.value - a.value || a.id - b.id)
                .slice(0, Rules.deckPerType);
            deck.push(...strongest.map(card => card.id));
        }
        return deck;
    },

    /**
     * The card the player would play of a type this round, if they have one
     * left in their deck
     */
    nextCard(game, type) {
        const current = game.state.tournaments.current;
        const played = new Set(current.rounds.map(round => round.copy));
        const deck = new Set(current.deck);
        return Collection.loose(game)
            .filter(card => deck.has(card.id) && !played.has(card.id) && card.type === type)
            .sort((a, b) => b.power - a.power || b.value - a.value || a.id - b.id)[0] || null;
    },

    /**
     * The regular the player is playing now
     */
    opponent(game) {
        const current = game.state.tournaments.current;
        return Regulars.find(regular => regular.id === current.opponents[current.results.length]);
    },

    /**
     * Start a tournament
     * @param {Game} game - Game
     * @param {string} kind - Kind of tournament
     * @param {string} set - The set its packs are from
     * @param {Array} cards - The cards the player picks their deck from
     */
    start(game, kind, set, cards) {
        const available = Regulars.filter(regular => !regular.only || regular.only(game));
        const opponents = [];
        while (opponents.length < Rules.tournamentMatches) {
            const regular = game.pick(available.filter(each => !opponents.includes(each.id)));
            opponents.push(regular.id);
        }
        game.state.tournaments.current = { kind, set, opponents, deck: Tournaments.deckFrom(cards), results: [], rounds: [] };
        game.startEncounter('match');
    },

    /**
     * Play a round
     * @param {Game} game - Game
     * @param {string|null} type - The type the player plays, or null if
     *                             they have nothing left to play
     */
    playRound(game, type) {
        const current = game.state.tournaments.current;
        const card = type && Tournaments.nextCard(game, type);
        const regular = Tournaments.opponent(game);
        const history = current.rounds.map(round => ({ mine: Catalog.find(round.mine)?.type, theirs: Catalog.find(round.theirs).type }));
        const theirs = Tournaments.opponentCard(game, regular.plays(game, history), current);

        const mine = card ? card.power + bonus(card.type, theirs.type) : 0;
        const against = theirs.power + (card ? bonus(theirs.type, card.type) : 0);
        const coin = card !== null && mine === against;
        const won = coin ? game.chance(0.5) : mine > against;
        current.rounds.push({ copy: card?.id ?? 0, mine: card?.cardId ?? null, theirs: theirs.id, won, coin });

        const wins = current.rounds.filter(round => round.won).length;
        if (wins === 2 || current.rounds.length - wins === 2) {
            current.results.push({ won: wins === 2, rounds: current.rounds });
            current.rounds = [];
            const name = Lines.tournaments.regulars[regular.id].name;
            game.say(wins === 2 ? Lines.tournaments.matchWon(name) : Lines.tournaments.matchLost(name), wins === 2 ? 'good' : 'info');
            if (current.results.length === Rules.tournamentMatches) {
                Tournaments.finish(game);
                return;
            }
        }
        game.startEncounter('match');
    },

    /**
     * A regular's card of a type, from the tournament's set
     */
    opponentCard(game, type, current) {
        const odds = Object.entries(Rules.opponentRarity[current.kind]);
        let roll = game.random();
        const [rarity] = odds.find(([, chance]) => (roll -= chance) < 0) || odds[odds.length - 1];
        const cards = Catalog.inSet(current.set, rarity).filter(card => card.type === type);
        return game.pick(cards.length > 0 ? cards : Catalog.inSet(current.set).filter(card => card.type === type));
    },

    /**
     * The tournament is over: hand out the prizes
     */
    finish(game) {
        const tournaments = game.state.tournaments;
        const current = tournaments.current;
        const wins = current.results.filter(result => result.won).length;
        tournaments.current = null;

        if (current.kind === 'prerelease') {
            // Everyone gets the promo; each match won earns a pack
            tournaments.prerelease = true;
            Collection.addPacks(game, current.set, 'normal', wins);
            Collection.add(game, [Cards.card('early-bird', Cards.packCondition(game))]);
            game.say(Lines.tournaments.prereleaseFinished(wins), 'good');
            Collection.checkCompleted(game);
            return;
        }

        const prize = Rules.localsPrizes[wins] || 0;
        Collection.addPacks(game, current.set, 'normal', prize);
        tournaments.localsPlayed++;
        if (wins === Rules.tournamentMatches) {
            tournaments.localsWon++;
        }
        game.say(Lines.tournaments.finished(wins, prize), wins > 0 ? 'good' : 'info');
    },

    actions: {
        /**
         * Enter today's locals: buy the entry packs from Gus, and play
         */
        enterLocals(game, args, now) {
            const tournaments = game.state.tournaments;
            const deck = Tournaments.deckFrom(Collection.loose(game));
            if (!Store.isOpen(game) || tournaments.current || game.state.encounter || !Tournaments.localsOpen(game, now) || deck.length === 0) {
                return;
            }
            const { set } = Tournaments.localsSet(game);
            const entry = Tournaments.localsEntry(game);
            if (!Wallet.spend(game, entry)) {
                game.say(Lines.gus.cantAfford(Format.money(entry)));
                return;
            }
            tournaments.localsDay = localDay(now);
            Collection.addPacks(game, set, 'normal', Rules.localsEntryPacks);
            game.say(Lines.tournaments.entered(Lines.job.days[new Date(now).getDay()]));
            Tournaments.start(game, 'locals', set, Collection.loose(game));
        },

        /**
         * Play the pre-release: buy the kit, open it at the table, and play
         * with only what was in it
         */
        enterPrerelease(game) {
            const set = Tournaments.prereleaseSet(game);
            if (!Store.isOpen(game) || !set || game.state.tournaments.current || game.state.encounter) {
                return;
            }
            if (!Wallet.spend(game, Rules.prereleaseKitPrice)) {
                game.say(Lines.gus.cantAfford(Format.money(Rules.prereleaseKitPrice)));
                return;
            }
            game.say(Lines.tournaments.prereleaseOpened);
            const kit = Collection.openPacks(game, set, 'normal', Rules.prereleaseKitPacks);
            Tournaments.start(game, 'prerelease', set, kit);
        }
    }
};

// Extra power for a type that beats the other
function bonus(type, other) {
    return Catalog.beats[type] === other ? Rules.typeBonus : 0;
}

function isTournament(current) {
    return KINDS.includes(current.kind) && Catalog.findSet(current.set) &&
        Array.isArray(current.opponents) && current.opponents.length === Rules.tournamentMatches &&
        current.opponents.every(id => Regulars.some(regular => regular.id === id)) &&
        Array.isArray(current.deck) && Array.isArray(current.results) && Array.isArray(current.rounds) &&
        current.results.length < Rules.tournamentMatches;
}
