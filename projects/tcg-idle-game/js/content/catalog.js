/**
 * The Critter Clash card catalogue
 * Most cards are randomly generated critters. Powerful cards come from a
 * fixed, named list, and each one can only be found in certain places.
 * Values are in cents. Card logic is in js/systems/cards.js.
 */

export const Catalog = {
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
    }
};
