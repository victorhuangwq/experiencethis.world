/**
 * Card logic: making random and fixed cards, opening packs, and packing
 * cards compactly for the save. Every card has a hidden condition from 1 to
 * 10, used for grading later. The card data is in js/content/catalog.js.
 * This is a helper used by systems, not a system itself.
 */

import { Catalog } from '../content/catalog.js';

export const Cards = {
    /**
     * Generate a random card
     * @param {Game} game - Game, for randomness
     * @param {string} rarity - common, uncommon, or rare
     * @param {number} condition - Hidden condition from 1 to 10
     * @returns {Object} - Card
     */
    randomCard(game, rarity, condition) {
        const stats = Catalog.randomStats[rarity];
        return {
            name: game.pick(Catalog.adjectives) + ' ' + game.pick(Catalog.critters),
            type: game.pick(Catalog.types),
            rarity: rarity,
            power: game.randomInt(stats.power[0], stats.power[1]),
            value: game.randomInt(stats.value[0], stats.value[1]),
            fixedId: null,
            condition: condition
        };
    },

    /**
     * Create a copy of a fixed card
     * @param {string} id - Fixed card id
     * @param {number} condition - Hidden condition from 1 to 10
     * @returns {Object} - Card
     */
    fixedCard(id, condition) {
        const definition = Catalog.findFixed(id);
        return {
            name: definition.name,
            type: definition.type,
            rarity: definition.rarity,
            power: definition.power,
            value: definition.value,
            fixedId: definition.id,
            condition: condition
        };
    },

    /**
     * Pick a random fixed card that can be found in packs, weighted by rarity
     * @param {Game} game - Game, for randomness
     * @param {number} condition - Hidden condition
     * @returns {Object} - Card
     */
    randomFixedCard(game, condition) {
        const pool = Catalog.fixed.filter(card => card.source === 'pack');
        const totalWeight = pool.reduce((sum, card) => sum + Catalog.fixedWeights[card.rarity], 0);
        let roll = game.random() * totalWeight;
        for (const card of pool) {
            roll -= Catalog.fixedWeights[card.rarity];
            if (roll <= 0) {
                return this.fixedCard(card.id, condition);
            }
        }
        return this.fixedCard(pool[pool.length - 1].id, condition);
    },

    /**
     * Open a pack of 5 cards. The last card is a hit slot; special packs
     * have two hit slots and better odds.
     * @param {Game} game - Game, for randomness
     * @param {string} kind - normal or special
     * @returns {Array} - Cards
     */
    openPack(game, kind) {
        const special = kind === 'special';
        // Cards straight from a pack are in good shape
        const condition = () => game.randomInt(6, 10);
        const cards = [];

        while (cards.length < (special ? 3 : 4)) {
            cards.push(this.randomCard(game, game.chance(0.8) ? 'common' : 'uncommon', condition()));
        }
        while (cards.length < 5) {
            if (special && game.chance(0.05)) {
                cards.push(this.fixedCard('card-o-matic-prime', condition()));
            } else if (game.chance(special ? 0.6 : 0.25)) {
                cards.push(this.randomFixedCard(game, condition()));
            } else {
                cards.push(this.randomCard(game, game.chance(0.3) ? 'rare' : 'uncommon', condition()));
            }
        }

        return cards;
    },

    /**
     * The cards in the shoebox from the player's childhood
     * @param {Game} game - Game, for randomness
     * @returns {Array} - Cards
     */
    shoeboxCards(game) {
        const cards = [];
        while (cards.length < 6) {
            cards.push(this.randomCard(game, 'common', game.randomInt(1, 3)));
        }
        cards.push(this.fixedCard('wet-sock-gobln', 4));
        cards.push(this.fixedCard('chewed-dragon', 1));
        return cards;
    },

    // Card fields stored in the save, in order
    saveFields: ['id', 'name', 'type', 'rarity', 'power', 'value', 'fixedId', 'condition'],

    pack(card) {
        return this.saveFields.map(field => card[field]);
    },

    /**
     * Rebuild a card from its packed save form
     * @param {Array} packed - Packed card
     * @returns {Object|null} - Card, or null if the entry is invalid
     */
    unpack(packed) {
        if (!Array.isArray(packed)) {
            return null;
        }

        const card = {};
        this.saveFields.forEach((field, index) => {
            card[field] = packed[index];
        });

        const knownType = Catalog.types.includes(card.type) || card.type === Catalog.wildType;
        if (!Number.isInteger(card.id) || typeof card.name !== 'string' || !knownType || !Catalog.rarities.includes(card.rarity)) {
            return null;
        }
        card.power = Number.isFinite(card.power) ? card.power : 1;
        card.value = Number.isInteger(card.value) ? card.value : 0;
        card.fixedId = Catalog.findFixed(card.fixedId) ? card.fixedId : null;
        card.condition = Number.isInteger(card.condition) ? card.condition : 5;

        return card;
    }
};
