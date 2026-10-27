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
     * A random card of a rarity, from the set in packs
     */
    pull(game, rarity, condition) {
        return this.card(game.pick(Catalog.inPacks(rarity)).id, condition);
    },

    /**
     * Open a pack: one card per slot (Rules.packSlots), with hit slots
     * rolling their rarity (Rules.hitOdds)
     * @param {Game} game - Game, for randomness
     * @param {string} kind - normal or special
     * @returns {Array} - Cards
     */
    openPack(game, kind) {
        // Cards straight from a pack are in good shape
        const condition = () => game.randomInt(6, 10);
        return Rules.packSlots[kind].map(slot => {
            if (slot !== 'hit') {
                return this.pull(game, slot, condition());
            }
            if (kind === 'special' && game.chance(Rules.primeChance)) {
                return this.card('card-o-matic-prime', condition());
            }
            return this.pull(game, this.hitRarity(game, kind), condition());
        });
    },

    /**
     * Roll the rarity of a hit slot
     */
    hitRarity(game, kind) {
        const odds = Object.entries(Rules.hitOdds[kind]);
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
        if (!Array.isArray(packed) || !Number.isInteger(packed[0])) {
            return null;
        }
        const [id, cardId, condition] = packed.length === 3 ? packed : fromFirstRelease(packed);
        if (!Catalog.find(cardId)) {
            return null;
        }
        return { id, ...this.card(cardId, Number.isInteger(condition) ? condition : 5) };
    }
};

/**
 * Cards saved by the first release: [id, name, type, rarity, power, value,
 * fixed card id, condition]. Its critters were made up at random; each one
 * becomes a Base Set card of the same rarity, and the same name always
 * becomes the same card, so duplicates stay duplicates.
 * @returns {Array} - [id, catalogue id, condition]
 */
function fromFirstRelease([id, name, , rarity, , , fixedId, condition]) {
    if (Catalog.find(fixedId)) {
        return [id, fixedId, condition];
    }
    const pool = Catalog.inPacks(rarity).length > 0 ? Catalog.inPacks(rarity) : Catalog.inPacks('common');
    let hash = 0;
    for (const char of String(name)) {
        hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }
    return [id, pool[hash % pool.length].id, condition];
}
