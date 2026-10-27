/**
 * Card logic: copies of catalogue cards, opening packs, and packing cards
 * compactly for the save. Every card is from js/content/catalog.js; each
 * copy has its own id and a hidden condition from 1 to 10, used for grading
 * later. This is a helper used by systems, not a system itself.
 */

import { Rules } from '../rules.js';
import { Catalog } from '../content/catalog.js';

export const Cards = {
    /**
     * A copy of a catalogue card
     * @param {string} cardId - Catalogue id
     * @param {number} condition - Hidden condition from 1 to 10
     * @returns {Object} - Card, without its own id yet
     */
    card(cardId, condition) {
        const { id, name, type, rarity, power, value } = Catalog.find(cardId);
        return { cardId: id, name, type, rarity, power, value, condition };
    },

    /**
     * A random card of a rarity from a set
     * @param {Game} game - Game, for randomness
     * @param {string} rarity - Rarity
     * @param {number} condition - Condition
     * @param {string} set - Set id
     */
    pull(game, rarity, condition, set = 'base') {
        return this.card(game.pick(Catalog.inSet(set, rarity)).id, condition);
    },

    /**
     * Open a pack: one card per slot (Rules.packSlots), with hit slots
     * rolling their rarity (Rules.hitOdds)
     * @param {Game} game - Game, for randomness
     * @param {string} kind - normal, special, or mega
     * @param {string} set - The pack's set
     * @returns {Array} - Cards
     */
    openPack(game, kind, set = 'base') {
        // Cards straight from a pack are in good shape
        const condition = () => game.randomInt(6, 10);
        return Rules.packSlots[kind].map(slot => {
            if (!Rules.hitOdds[slot]) {
                return this.pull(game, slot, condition(), set);
            }
            if (kind === 'special' && game.chance(Rules.primeChance)) {
                return this.card('card-o-matic-prime', condition());
            }
            return this.pull(game, this.hitRarity(game, slot), condition(), set);
        });
    },

    /**
     * Roll the rarity of a hit slot
     * @param {string} hit - Kind of hit: a key of Rules.hitOdds
     */
    hitRarity(game, hit) {
        const odds = Object.entries(Rules.hitOdds[hit]);
        let roll = game.random();
        for (const [rarity, chance] of odds) {
            roll -= chance;
            if (roll < 0) {
                return rarity;
            }
        }
        return odds[odds.length - 1][0];
    },

    /**
     * The cards in the shoebox from the player's childhood
     * @param {Game} game - Game, for randomness
     * @returns {Array} - Cards
     */
    shoeboxCards(game) {
        const cards = [];
        while (cards.length < 6) {
            cards.push(this.pull(game, 'common', game.randomInt(1, 3)));
        }
        cards.push(this.card('wet-sock-gobln', 4));
        cards.push(this.card('chewed-dragon', 1));
        return cards;
    },

    /**
     * A card as stored in the save: [id, catalogue id, condition]. The rest
     * comes from the catalogue when it loads.
     */
    pack(card) {
        return [card.id, card.cardId, card.condition];
    },

    /**
     * Rebuild a card from its packed save form
     * @param {Array} packed - Packed card
     * @returns {Object|null} - Card, or null if the entry is invalid
     */
    unpack(packed) {
        if (!Array.isArray(packed) || packed.length !== 3) {
            return null;
        }
        const [id, cardId, condition] = packed;
        if (!Number.isInteger(id) || !Catalog.find(cardId)) {
            return null;
        }
        return { id, ...this.card(cardId, Number.isInteger(condition) ? condition : 5) };
    }
};
