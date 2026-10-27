/**
 * Gus's Games & Grub, the hobby store. It opens on the second day of play
 * (Rules.gusOpensOnDay) and is always open after that, because Gus lives in
 * the back.
 *
 * - Packs at a markup: they cost more than the machine's, but Gus never
 *   runs out.
 * - Singles in the glass case, restocked every few hours on the clock.
 * - Grading: Gus sends a card to Mint Condition Co., and it comes back a
 *   day later with a grade. The grade is the condition the card has had
 *   since it came out of its pack; grading reveals it and never rolls it.
 *   Gus buys graded cards.
 */

import { every } from '../core/time.js';
import { Format } from '../core/format.js';
import { Rules } from '../rules.js';
import { Catalog } from '../content/catalog.js';
import { Lines } from '../content/text/index.js';
import { Wallet } from './wallet.js';
import { Collection } from './collection.js';
import { Cards } from './cards.js';

const caseRestocks = every(Rules.caseRestockEvery);

export const Store = {
    id: 'store',

    defaults: () => ({
        packsBought: 0,
        // The glass case: the restock it was last stocked for, and a single
        // in each spot, { cardId, condition }, or null once bought
        caseStockedAt: 0,
        singles: [],
        // Cards away at Mint Condition Co.: { id, backAt }
        grading: []
    }),

    load(store, game) {
        store.singles = store.singles.map(single => isSingle(single) ? single : null);
        const ids = new Set(game.state.collection.cards.map(card => card.id));
        store.grading = store.grading.filter(entry => ids.has(entry?.id) && Number.isFinite(entry.backAt) && !game.state.collection.graded.includes(entry.id));
    },

    /**
     * Restock the glass case when it's due, and bring back cards from
     * grading whose day is up
     */
    tick(game, now) {
        if (!Store.isOpen(game)) {
            return;
        }
        const store = game.state.store;

        const restock = caseRestocks.lastStart(now);
        if (store.caseStockedAt !== restock) {
            store.caseStockedAt = restock;
            Store.stockCase(game);
        }

        for (const entry of store.grading.filter(each => each.backAt <= now)) {
            store.grading.splice(store.grading.indexOf(entry), 1);
            const card = game.state.collection.cards.find(each => each.id === entry.id);
            if (!card) {
                continue;
            }
            game.state.collection.graded.push(card.id);
            const grade = Lines.gus.grades[card.condition];
            if (game.awayReport) {
                game.reportAway(Lines.gus.gradedAway(card.name, card.condition, grade));
            } else {
                game.say(Lines.gus.graded(card.name, card.condition, grade), 'good');
            }
        }
    },

    isOpen(game) {
        return game.unlocked('gus-open');
    },

    /**
     * The sets Gus has packs of, with their price
     * @returns {Array} - { set, price }
     */
    packsForSale(game) {
        return Object.entries(Rules.gusPrices).map(([set, price]) => ({ set, price }));
    },

    /**
     * Fill every spot in the glass case with a single, from the sets Gus
     * sells packs of
     */
    stockCase(game) {
        const sets = Store.packsForSale(game).map(each => each.set);
        game.state.store.singles = Rules.caseSlots.map(slot => {
            const rarity = Rules.hitOdds[slot] ? Cards.hitRarity(game, slot) : slot;
            const card = game.pick(sets.flatMap(set => Catalog.inSet(set, rarity)));
            return { cardId: card.id, condition: Cards.packCondition(game) };
        });
    },

    /**
     * What a single in the case costs
     * @param {string} cardId - Catalogue id
     */
    singlePrice(cardId) {
        return Math.max(Rules.singlesMinPrice, Catalog.find(cardId).value * Rules.singlesMarkup);
    },

    /**
     * What a graded card is worth: its value, multiplied by its grade
     */
    gradedValue(card) {
        return Math.round(card.value * Rules.gradeValue[Math.max(6, card.condition)]);
    },

    /**
     * What Gus pays for a graded card
     */
    gradedOffer(card) {
        return Math.floor(Store.gradedValue(card) * Rules.gusBuysGraded);
    },

    /**
     * The cards Gus would send off, best first: the most valuable, one
     * copy of each, the best-looking copy
     * @param {Game} game - Game
     * @param {number} count - How many
     */
    gradingCandidates(game, count = 6) {
        const best = new Map();
        for (const card of Collection.loose(game)) {
            const kept = best.get(card.cardId);
            if (!kept || looks(card) > looks(kept)) {
                best.set(card.cardId, card);
            }
        }
        return [...best.values()]
            .sort((a, b) => b.value - a.value || looks(b) - looks(a) || a.id - b.id)
            .slice(0, count);
    },

    actions: {
        buyPack(game, { set }) {
            const forSale = Store.packsForSale(game).find(each => each.set === set);
            if (!Store.isOpen(game) || !forSale) {
                return;
            }
            if (!Wallet.spend(game, forSale.price)) {
                game.say(Lines.gus.cantAfford(Format.money(forSale.price)));
                return;
            }
            Collection.addPacks(game, set, 'normal');
            game.state.store.packsBought++;
            game.say(game.pick(Lines.gus.bought));
        },

        /**
         * Buy a single from the glass case
         * @param {Object} args - spot: its place in the case
         */
        buySingle(game, { spot }) {
            const singles = game.state.store.singles;
            const index = Number(spot);
            const single = singles[index];
            if (!Store.isOpen(game) || !single) {
                return;
            }
            const price = Store.singlePrice(single.cardId);
            if (!Wallet.spend(game, price)) {
                game.say(Lines.gus.cantAfford(Format.money(price)));
                return;
            }
            singles[index] = null;
            const [card] = Collection.add(game, [Cards.card(single.cardId, single.condition)]);
            game.say(Lines.gus.boughtSingle(card.name));
            Collection.checkCompleted(game);
        },

        /**
         * Send a card off to be graded
         * @param {Object} args - id: the card's own id
         */
        grade(game, { id }, now) {
            const card = Collection.loose(game).find(each => each.id === Number(id));
            if (!Store.isOpen(game) || !card) {
                return;
            }
            if (!Wallet.spend(game, Rules.gradingFee)) {
                game.say(Lines.gus.cantAfford(Format.money(Rules.gradingFee)));
                return;
            }
            game.state.store.grading.push({ id: card.id, backAt: now + Rules.gradingTime });
            game.say(Lines.gus.sent(card.name, Lines.gus.read(card.condition)));
        },

        /**
         * Sell a graded card to Gus
         * @param {Object} args - id: the card's own id
         */
        sellGraded(game, { id }) {
            const card = game.state.collection.cards.find(each => each.id === Number(id));
            if (!Store.isOpen(game) || !card || !Collection.isGraded(game, card)) {
                return;
            }
            const offer = Store.gradedOffer(card);
            Collection.remove(game, [card]);
            Wallet.earn(game, offer);
            game.say(Lines.gus.soldGraded(card.name, Format.money(offer)));
        }
    }
};

// How good a card looks by eye: a 9 and a 10 look the same
function looks(card) {
    return Math.min(card.condition, 9);
}

function isSingle(single) {
    return !!Catalog.find(single?.cardId) && Number.isInteger(single.condition) && single.condition >= 1 && single.condition <= 10;
}
