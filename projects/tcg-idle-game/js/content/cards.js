/**
 * Critter Clash card data and pack generation
 * Most cards are randomly generated critters. Powerful cards come from a
 * fixed, named list, and each one can only be found in certain places.
 * Values are in cents. Every card has a hidden condition from 1 to 10,
 * used for grading later.
 */

export const Cards = {
    types: ['Fire', 'Water', 'Nature'],

    // Fixed cards can also have this wildcard type
    wildType: 'Wild',

    rarities: ['common', 'uncommon', 'rare', 'ultra-rare', 'legendary'],

    // Random cards are named "<adjective> <critter>"
    adjectives: ['Grumpy', 'Soggy', 'Tiny', 'Suspicious', 'Sleepy', 'Angry', 'Damp', 'Wobbly', 'Majestic', 'Crunchy'],
    critters: ['Toad', 'Ferret', 'Pigeon', 'Newt', 'Possum', 'Moth', 'Hamster', 'Snail', 'Gecko', 'Raccoon'],

    // Stat ranges for random cards
    randomStats: {
        common: { power: [1, 3], value: [5, 25] },
        uncommon: { power: [3, 5], value: [25, 100] },
        rare: { power: [5, 7], value: [100, 400] }
    },

    // How often each fixed card turns up when a pack rolls a fixed card
    fixedWeights: { common: 30, uncommon: 25, rare: 12, 'ultra-rare': 3 },

    sets: {
        0: { name: 'Not on any checklist', secret: true },
        1: { name: 'Critter Clash Base Set' }
    },

    /**
     * Fixed cards. Source is where the card can be found:
     * pack, vending-special, card-show, trade-up, tournament, gift, or shoebox.
     * Set 0 holds secret cards that aren't on any checklist.
     */
    fixed: [
        { id: 'wet-sock-goblin', set: 1, name: 'Wet Sock Goblin', type: 'Water', rarity: 'common', power: 2, value: 50, source: 'pack', flavor: 'Smells like a Tuesday.' },
        { id: 'sir-reginald', set: 1, name: 'Sir Reginald Pigeonsworth', type: 'Nature', rarity: 'uncommon', power: 4, value: 200, source: 'pack', flavor: 'Has never once paid for a sandwich.' },
        { id: 'toaster-salamander', set: 1, name: 'Toaster Salamander', type: 'Fire', rarity: 'uncommon', power: 4, value: 200, source: 'pack', flavor: 'Ding!' },
        { id: 'damp-mothman', set: 1, name: 'Damp Mothman', type: 'Water', rarity: 'rare', power: 6, value: 800, source: 'pack', flavor: 'Just wants the lamp.' },
        { id: 'possum-of-many-faces', set: 1, name: 'Possum of Many Faces', type: 'Nature', rarity: 'rare', power: 6, value: 800, source: 'pack', flavor: 'Plays dead in every format.' },
        { id: 'lava-lamp-newt', set: 1, name: 'Lava Lamp Newt', type: 'Fire', rarity: 'rare', power: 6, value: 800, source: 'pack', flavor: 'Groovy, and also on fire.' },
        { id: 'mr-whiskers', set: 1, name: "Grandma's Cat, Mr. Whiskers", type: 'Nature', rarity: 'ultra-rare', power: 8, value: 3000, source: 'pack', flavor: 'Has knocked over more decks than any player alive.' },
        { id: 'thundering-hamster', set: 1, name: 'Thundering Hamster', type: 'Fire', rarity: 'ultra-rare', power: 8, value: 3000, source: 'pack', flavor: 'The wheel spins. The sky darkens.' },
        { id: 'tidal-raccoon', set: 1, name: 'The Tidal Raccoon', type: 'Water', rarity: 'ultra-rare', power: 8, value: 3000, source: 'pack', flavor: 'Washes everything. Especially your hopes.' },
        { id: 'card-o-matic-prime', set: 1, name: 'CARD-O-MATIC Prime', type: 'Wild', rarity: 'legendary', power: 10, value: 15000, source: 'vending-special', flavor: 'It finally dispensed itself.' },
        { id: 'absolutely-massive-dragon', set: 1, name: 'Absolutely Massive Dragon', type: 'Fire', rarity: 'legendary', power: 10, value: 40000, source: 'card-show', flavor: 'The card is normal-sized. The dragon is not.' },
        { id: 'golden-paperclip-phoenix', set: 1, name: 'Golden Paperclip Phoenix', type: 'Wild', rarity: 'legendary', power: 10, value: 50000, source: 'trade-up', flavor: 'It started as a paperclip. It always does.' },
        { id: 'champions-crown', set: 1, name: "Champion's Crown", type: 'Wild', rarity: 'legendary', power: 10, value: 30000, source: 'tournament', flavor: 'Heavy is the head. Heavier is the binder.' },
        { id: 'pips-favourite', set: 1, name: "Pip's Favourite", type: 'Nature', rarity: 'legendary', power: 10, value: 100, source: 'gift', flavor: 'Worth one dollar. Worth everything.' },
        { id: 'wet-sock-gobln', set: 0, name: 'Wet Sock Gobln', type: 'Water', rarity: 'common', power: 2, value: 5, source: 'shoebox', flavor: 'A misprint. The i is missing. Nobody knows where it went.' },
        { id: 'chewed-dragon', set: 0, name: 'Absolutely Massive Dragon (chewed)', type: 'Fire', rarity: 'legendary', power: 4, value: 11, source: 'shoebox', flavor: 'You did this. You were seven.' }
    ],

    findFixed(id) {
        return this.fixed.find(card => card.id === id);
    },

    /**
     * Generate a random card
     * @param {Game} game - Game, for randomness
     * @param {string} rarity - common, uncommon, or rare
     * @param {number} condition - Hidden condition from 1 to 10
     * @returns {Object} - Card
     */
    randomCard(game, rarity, condition) {
        const stats = this.randomStats[rarity];
        return {
            name: game.pick(this.adjectives) + ' ' + game.pick(this.critters),
            type: game.pick(this.types),
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
        const definition = this.findFixed(id);
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
        const pool = this.fixed.filter(card => card.source === 'pack');
        const totalWeight = pool.reduce((sum, card) => sum + this.fixedWeights[card.rarity], 0);
        let roll = game.random() * totalWeight;
        for (const card of pool) {
            roll -= this.fixedWeights[card.rarity];
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

        const knownType = this.types.includes(card.type) || card.type === this.wildType;
        if (!Number.isInteger(card.id) || typeof card.name !== 'string' || !knownType || !this.rarities.includes(card.rarity)) {
            return null;
        }
        card.power = Number.isFinite(card.power) ? card.power : 1;
        card.value = Number.isInteger(card.value) ? card.value : 0;
        card.fixedId = this.findFixed(card.fixedId) ? card.fixedId : null;
        card.condition = Number.isInteger(card.condition) ? card.condition : 5;

        return card;
    }
};
