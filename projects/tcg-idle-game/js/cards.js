/**
 * Critter Clash card data and pack generation
 * Most cards are randomly generated critters. Powerful cards come from a
 * fixed, named list, and each one can only be found in certain places.
 */

const Cards = {
    types: ['Fire', 'Water', 'Nature'],

    // Fixed cards can also have this wildcard type
    wildType: 'Wild',

    rarities: ['common', 'uncommon', 'rare', 'ultra-rare', 'legendary'],

    // Random cards are named "<adjective> <critter>"
    adjectives: ['Grumpy', 'Soggy', 'Tiny', 'Suspicious', 'Sleepy', 'Angry', 'Damp', 'Wobbly', 'Majestic', 'Crunchy'],
    critters: ['Toad', 'Ferret', 'Pigeon', 'Newt', 'Possum', 'Moth', 'Hamster', 'Snail', 'Gecko', 'Raccoon'],

    // Stat ranges for random cards
    randomStats: {
        common: { power: [1, 3], value: [0.05, 0.25] },
        uncommon: { power: [3, 5], value: [0.25, 1.00] },
        rare: { power: [5, 7], value: [1.00, 4.00] }
    },

    // How often each fixed card turns up when a pack rolls a fixed card
    fixedWeights: { common: 30, uncommon: 25, rare: 12, 'ultra-rare': 3 },

    /**
     * Fixed cards. Source is where the card can be found:
     * pack, vending-special, card-show, trade-up, tournament, or gift.
     */
    fixed: [
        { id: 'wet-sock-goblin', set: 1, name: 'Wet Sock Goblin', type: 'Water', rarity: 'common', power: 2, value: 0.50, source: 'pack', flavor: 'Smells like a Tuesday.' },
        { id: 'sir-reginald', set: 1, name: 'Sir Reginald Pigeonsworth', type: 'Nature', rarity: 'uncommon', power: 4, value: 2.00, source: 'pack', flavor: 'Has never once paid for a sandwich.' },
        { id: 'toaster-salamander', set: 1, name: 'Toaster Salamander', type: 'Fire', rarity: 'uncommon', power: 4, value: 2.00, source: 'pack', flavor: 'Ding!' },
        { id: 'damp-mothman', set: 1, name: 'Damp Mothman', type: 'Water', rarity: 'rare', power: 6, value: 8.00, source: 'pack', flavor: 'Just wants the lamp.' },
        { id: 'possum-of-many-faces', set: 1, name: 'Possum of Many Faces', type: 'Nature', rarity: 'rare', power: 6, value: 8.00, source: 'pack', flavor: 'Plays dead in every format.' },
        { id: 'lava-lamp-newt', set: 1, name: 'Lava Lamp Newt', type: 'Fire', rarity: 'rare', power: 6, value: 8.00, source: 'pack', flavor: 'Groovy, and also on fire.' },
        { id: 'mr-whiskers', set: 1, name: "Grandma's Cat, Mr. Whiskers", type: 'Nature', rarity: 'ultra-rare', power: 8, value: 30.00, source: 'pack', flavor: 'Has knocked over more decks than any player alive.' },
        { id: 'thundering-hamster', set: 1, name: 'Thundering Hamster', type: 'Fire', rarity: 'ultra-rare', power: 8, value: 30.00, source: 'pack', flavor: 'The wheel spins. The sky darkens.' },
        { id: 'tidal-raccoon', set: 1, name: 'The Tidal Raccoon', type: 'Water', rarity: 'ultra-rare', power: 8, value: 30.00, source: 'pack', flavor: 'Washes everything. Especially your hopes.' },
        { id: 'card-o-matic-prime', set: 1, name: 'CARD-O-MATIC Prime', type: 'Wild', rarity: 'legendary', power: 10, value: 150.00, source: 'vending-special', flavor: 'It finally dispensed itself.' },
        { id: 'absolutely-massive-dragon', set: 1, name: 'Absolutely Massive Dragon', type: 'Fire', rarity: 'legendary', power: 10, value: 400.00, source: 'card-show', flavor: 'The card is normal-sized. The dragon is not.' },
        { id: 'golden-paperclip-phoenix', set: 1, name: 'Golden Paperclip Phoenix', type: 'Wild', rarity: 'legendary', power: 10, value: 500.00, source: 'trade-up', flavor: 'It started as a paperclip. It always does.' },
        { id: 'champions-crown', set: 1, name: "Champion's Crown", type: 'Wild', rarity: 'legendary', power: 10, value: 300.00, source: 'tournament', flavor: 'Heavy is the head. Heavier is the binder.' },
        { id: 'pips-favourite', set: 1, name: "Pip's Favourite", type: 'Nature', rarity: 'legendary', power: 10, value: 1.00, source: 'gift', flavor: 'Worth one dollar. Worth everything.' }
    ],

    // Where each source can be found, shown for cards the player hasn't found yet
    sourceHints: {
        'pack': 'found in packs',
        'vending-special': 'found in special vending packs',
        'card-show': 'found at a card show',
        'trade-up': 'found at the end of a long chain of trades',
        'tournament': 'won at a tournament',
        'gift': 'given by a friend'
    },

    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    pick: function(list) {
        return list[this.randomInt(0, list.length - 1)];
    },

    /**
     * Find a fixed card definition
     * @param {string} id - Fixed card id
     * @returns {Object|undefined} - Fixed card definition
     */
    findFixed: function(id) {
        return this.fixed.find(card => card.id === id);
    },

    /**
     * Generate a random card
     * @param {string} rarity - common, uncommon, or rare
     * @returns {Object} - Card
     */
    randomCard: function(rarity) {
        const stats = this.randomStats[rarity];
        const [minValue, maxValue] = stats.value;
        return {
            name: this.pick(this.adjectives) + ' ' + this.pick(this.critters),
            type: this.pick(this.types),
            rarity: rarity,
            power: this.randomInt(stats.power[0], stats.power[1]),
            value: this.randomInt(minValue * 100, maxValue * 100) / 100,
            fixedId: null
        };
    },

    /**
     * Create a copy of a fixed card
     * @param {string} id - Fixed card id
     * @returns {Object} - Card
     */
    fixedCard: function(id) {
        const definition = this.findFixed(id);
        return {
            name: definition.name,
            type: definition.type,
            rarity: definition.rarity,
            power: definition.power,
            value: definition.value,
            fixedId: definition.id
        };
    },

    /**
     * Pick a random fixed card that can be found in packs, weighted by rarity
     * @returns {Object} - Card
     */
    randomFixedCard: function() {
        const pool = this.fixed.filter(card => card.source === 'pack');
        const totalWeight = pool.reduce((sum, card) => sum + this.fixedWeights[card.rarity], 0);
        let roll = Math.random() * totalWeight;
        for (const card of pool) {
            roll -= this.fixedWeights[card.rarity];
            if (roll <= 0) {
                return this.fixedCard(card.id);
            }
        }
        return this.fixedCard(pool[pool.length - 1].id);
    },

    /**
     * Roll the card for a pack's hit slot
     * @param {boolean} special - Whether this is a special pack
     * @returns {Object} - Card
     */
    hitCard: function(special) {
        if (special && Math.random() < 0.05) {
            return this.fixedCard('card-o-matic-prime');
        }
        if (Math.random() < (special ? 0.6 : 0.25)) {
            return this.randomFixedCard();
        }
        return this.randomCard(Math.random() < 0.3 ? 'rare' : 'uncommon');
    },

    /**
     * Open a pack of 5 cards. The last card is a hit slot; special packs
     * have two hit slots and better odds.
     * @param {string} kind - normal or special
     * @returns {Array} - Cards
     */
    openPack: function(kind) {
        const special = kind === 'special';
        const cards = [];
        const plainSlots = special ? 3 : 4;

        for (let i = 0; i < plainSlots; i++) {
            cards.push(this.randomCard(Math.random() < 0.8 ? 'common' : 'uncommon'));
        }
        while (cards.length < 5) {
            cards.push(this.hitCard(special));
        }

        return cards;
    },

    // Card fields stored in the save, in order
    saveFields: ['name', 'type', 'rarity', 'power', 'value', 'fixedId'],

    /**
     * Pack a card into a compact array for the save
     * @param {Object} card - Card
     * @returns {Array} - Packed card
     */
    packCard: function(card) {
        return this.saveFields.map(field => card[field]);
    },

    /**
     * Rebuild a card from its packed save form
     * @param {Array} packed - Packed card
     * @returns {Object|null} - Card, or null if the entry is invalid
     */
    unpackCard: function(packed) {
        if (!Array.isArray(packed)) {
            return null;
        }

        const card = {};
        this.saveFields.forEach((field, index) => {
            card[field] = packed[index];
        });

        const knownType = this.types.includes(card.type) || card.type === this.wildType;
        if (typeof card.name !== 'string' || !knownType || !this.rarities.includes(card.rarity)) {
            return null;
        }
        card.power = Number.isFinite(card.power) ? card.power : 1;
        card.value = Number.isFinite(card.value) ? card.value : 0;
        card.fixedId = this.findFixed(card.fixedId) ? card.fixedId : null;

        return card;
    }
};

// Make card data available globally
window.Cards = Cards;
