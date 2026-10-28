/**
 * Trades: Marcus at the table by the window at Gus's, on Thursday and
 * Friday evenings and all weekend (Rules.marcusFrom). Each day he's there,
 * he offers a few trades, one card for one of the same rarity: a card the
 * player doesn't have, for a spare copy of one they do.
 */

import { localDay } from '../core/time.js';
import { Rules } from '../rules.js';
import { Catalog } from '../content/catalog.js';
import { Lines } from '../content/text/index.js';
import { Collection } from './collection.js';
import { Cards } from './cards.js';
import { Store } from './store.js';

export const Trades = {
    id: 'trades',

    defaults: () => ({
        // The day Marcus last made his offers (a localDay() number), and
        // the offers, { give, condition, want } (catalogue ids), or null
        // once traded
        day: 0,
        offers: [],
        made: 0
    }),

    load(trades) {
        trades.offers = trades.offers.map(offer =>
            Catalog.find(offer?.give) && Catalog.find(offer.want) && Number.isInteger(offer.condition) ? offer : null);
    },

    tick(game, now) {
        const trades = game.state.trades;
        if (Trades.here(game, now) && trades.day !== localDay(now)) {
            trades.day = localDay(now);
            Trades.makeOffers(game);
        }
    },

    /**
     * Whether Marcus is at Gus's
     */
    here(game, now = game.time) {
        const date = new Date(now);
        const from = Rules.marcusFrom[date.getDay()];
        return Store.isOpen(game) && from !== undefined && date.getHours() >= from;
    },

    /**
     * Marcus looks through the player's spares and his own binder
     */
    makeOffers(game) {
        const owned = new Set(game.state.collection.cards.map(card => card.cardId));
        const sets = Store.packsForSale(game).map(each => each.set);
        const spares = Collection.duplicates(game);
        const offers = [];
        while (offers.length < Rules.marcusOffers && spares.length > 0) {
            const want = game.pick(spares);
            // One offer per spare card
            for (let index = spares.length - 1; index >= 0; index--) {
                if (spares[index].cardId === want.cardId) {
                    spares.splice(index, 1);
                }
            }
            const gives = sets.flatMap(set => Catalog.inSet(set, want.rarity))
                .filter(card => !owned.has(card.id) && !offers.some(offer => offer.give === card.id));
            if (gives.length > 0) {
                const condition = Math.max(1, Cards.packCondition(game) - Rules.marcusWear);
                offers.push({ give: game.pick(gives).id, condition, want: want.cardId });
            }
        }
        game.state.trades.offers = offers;
    },

    /**
     * The player's spare copy of a card, if they have one to trade
     */
    spare(game, cardId) {
        return Collection.duplicates(game).find(card => card.cardId === cardId) || null;
    },

    actions: {
        /**
         * Make one of Marcus's trades
         * @param {Object} args - index: which offer
         */
        trade(game, { index }) {
            const offers = game.state.trades.offers;
            const offer = offers[Number(index)];
            const spare = offer && Trades.spare(game, offer.want);
            if (!Trades.here(game) || !spare) {
                return;
            }
            offers[Number(index)] = null;
            Collection.remove(game, [spare]);
            const [card] = Collection.add(game, [Cards.card(offer.give, offer.condition)]);
            game.state.trades.made++;
            game.say(Lines.marcus.traded(card.name, spare.name), 'good');
            Collection.checkCompleted(game);
        }
    }
};
