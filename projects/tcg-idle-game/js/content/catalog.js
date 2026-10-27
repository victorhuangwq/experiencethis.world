/**
 * The Critter Clash card catalogue. Every card in the game is on this list,
 * in a set, like a real card game. Packs hold cards from the set that is in
 * packs, by rarity (the odds are in js/rules.js). Values are in cents.
 * Card logic is in js/systems/cards.js.
 */

export const Catalog = {
    types: ['Fire', 'Water', 'Nature'],

    // Promos can also have this wildcard type
    wildType: 'Wild',

    rarities: ['common', 'uncommon', 'rare', 'ultra-rare', 'legendary'],

    /**
     * Sets, in the order their checklists are shown
     *   inPacks   Packs hold cards from this set
     *   hidden    The checklist only shows once a card from it is found
     *   secret    Not a real set: no numbers, and no count of what is missing
     */
    sets: [
        { id: 'base', name: 'Critter Clash Base Set', inPacks: true },
        { id: 'promo', name: 'Promos', hidden: true },
        { id: 'secret', name: 'Not on any checklist', secret: true }
    ],

    /**
     * Every card. A card's number is its place among its set's cards in
     * this list, so a set's checklist reads in this order. Ids are saved;
     * never change one. Source is where a card can be found: pack,
     * vending-special, card-show, trade-up, tournament, gift, or shoebox.
     */
    cards: [
        // Base Set commons
        { id: 'wet-sock-goblin', set: 'base', name: 'Wet Sock Goblin', type: 'Water', rarity: 'common', power: 2, value: 15, source: 'pack', flavor: 'Smells like a Tuesday.' },
        { id: 'soggy-toad', set: 'base', name: 'Soggy Toad', type: 'Water', rarity: 'common', power: 1, value: 5, source: 'pack', flavor: 'Was not asked to be soggy. Is soggy anyway.' },
        { id: 'drizzle-frog', set: 'base', name: 'Drizzle Frog', type: 'Water', rarity: 'common', power: 2, value: 8, source: 'pack', flavor: 'Brings its own weather. The weather is drizzle.' },
        { id: 'bathtub-snail', set: 'base', name: 'Bathtub Snail', type: 'Water', rarity: 'common', power: 1, value: 6, source: 'pack', flavor: 'Has seen things in the bathtub. Will not say what.' },
        { id: 'snorkel-ferret', set: 'base', name: 'Snorkel Ferret', type: 'Water', rarity: 'common', power: 3, value: 12, source: 'pack', flavor: 'The snorkel has a hole in it. The ferret has a plan.' },
        { id: 'sleepy-ember-toad', set: 'base', name: 'Sleepy Ember Toad', type: 'Fire', rarity: 'common', power: 2, value: 8, source: 'pack', flavor: 'Has been "just resting its eyes" since 2003.' },
        { id: 'spicy-gecko', set: 'base', name: 'Spicy Gecko', type: 'Fire', rarity: 'common', power: 3, value: 10, source: 'pack', flavor: 'Ate a pepper once. Never got over it.' },
        { id: 'matchstick-mouse', set: 'base', name: 'Matchstick Mouse', type: 'Fire', rarity: 'common', power: 2, value: 7, source: 'pack', flavor: 'Lights up. Does not cheer up.' },
        { id: 'one-fire-ant', set: 'base', name: 'One Fire Ant', type: 'Fire', rarity: 'common', power: 1, value: 5, source: 'pack', flavor: 'It is just the one. It is very committed.' },
        { id: 'birthday-candle-moth', set: 'base', name: 'Birthday Candle Moth', type: 'Fire', rarity: 'common', power: 2, value: 9, source: 'pack', flavor: 'Makes a wish every time it flies into something.' },
        { id: 'suspicious-pigeon', set: 'base', name: 'Suspicious Pigeon', type: 'Nature', rarity: 'common', power: 2, value: 8, source: 'pack', flavor: 'Watching. Always watching. Mostly for bread.' },
        { id: 'lawn-gnome-hedgehog', set: 'base', name: 'Lawn Gnome Hedgehog', type: 'Nature', rarity: 'common', power: 1, value: 6, source: 'pack', flavor: 'Has stood in the garden for 30 years. Nobody has seen it blink.' },
        { id: 'squirrels-in-a-trench-coat', set: 'base', name: 'Squirrels in a Trench Coat', type: 'Nature', rarity: 'common', power: 3, value: 14, source: 'pack', flavor: 'Three squirrels. One coat. One dream.' },
        { id: 'grumpy-turnip-beetle', set: 'base', name: 'Grumpy Turnip Beetle', type: 'Nature', rarity: 'common', power: 2, value: 7, source: 'pack', flavor: 'Dislikes everything. Especially you. Especially Tuesdays.' },
        { id: 'lawn-crab', set: 'base', name: 'Lawn Crab', type: 'Nature', rarity: 'common', power: 1, value: 10, source: 'pack', flavor: 'It is a crab. It lives on your lawn. Nobody knows how it got there.' },

        // Base Set uncommons
        { id: 'sir-reginald', set: 'base', name: 'Sir Reginald Pigeonsworth', type: 'Nature', rarity: 'uncommon', power: 4, value: 50, source: 'pack', flavor: 'Has never once paid for a sandwich.' },
        { id: 'toaster-salamander', set: 'base', name: 'Toaster Salamander', type: 'Fire', rarity: 'uncommon', power: 4, value: 50, source: 'pack', flavor: 'Ding!' },
        { id: 'smoke-alarm-owl', set: 'base', name: 'Smoke Alarm Owl', type: 'Fire', rarity: 'uncommon', power: 4, value: 40, source: 'pack', flavor: 'Goes off whenever anyone makes toast. Lives next to Toaster Salamander. It is a whole thing.' },
        { id: 'barbecue-badger', set: 'base', name: 'Barbecue Badger', type: 'Fire', rarity: 'uncommon', power: 3, value: 35, source: 'pack', flavor: 'Owns one apron. It says KISS THE BADGER. Nobody has.' },
        { id: 'captain-bathwater', set: 'base', name: 'Captain Bathwater', type: 'Water', rarity: 'uncommon', power: 4, value: 45, source: 'pack', flavor: 'A rubber duck. Has never lost a bath.' },
        { id: 'gutter-otter', set: 'base', name: 'Gutter Otter', type: 'Water', rarity: 'uncommon', power: 3, value: 30, source: 'pack', flavor: 'Lives in the gutter. Thinks it is a river. Let it believe.' },
        { id: 'mildly-haunted-tortoise', set: 'base', name: 'Mildly Haunted Tortoise', type: 'Nature', rarity: 'uncommon', power: 4, value: 40, source: 'pack', flavor: 'The ghost is also a tortoise. Neither of them is in a hurry.' },
        { id: 'tax-season-mole', set: 'base', name: 'Tax Season Mole', type: 'Nature', rarity: 'uncommon', power: 3, value: 35, source: 'pack', flavor: 'Does your taxes. Charges in worms. Very reasonable.' },

        // Base Set rares
        { id: 'damp-mothman', set: 'base', name: 'Damp Mothman', type: 'Water', rarity: 'rare', power: 6, value: 300, source: 'pack', flavor: 'Just wants the lamp.' },
        { id: 'possum-of-many-faces', set: 'base', name: 'Possum of Many Faces', type: 'Nature', rarity: 'rare', power: 6, value: 300, source: 'pack', flavor: 'Plays dead in every format.' },
        { id: 'lava-lamp-newt', set: 'base', name: 'Lava Lamp Newt', type: 'Fire', rarity: 'rare', power: 6, value: 300, source: 'pack', flavor: 'Groovy, and also on fire.' },
        { id: 'puddle-kraken', set: 'base', name: 'Puddle Kraken', type: 'Water', rarity: 'rare', power: 7, value: 400, source: 'pack', flavor: 'Lives in a puddle. The puddle is much deeper than it looks.' },

        // Base Set ultra-rares
        { id: 'mr-whiskers', set: 'base', name: "Grandma's Cat, Mr. Whiskers", type: 'Nature', rarity: 'ultra-rare', power: 8, value: 3000, source: 'pack', flavor: 'Has knocked over more decks than any player alive.' },
        { id: 'thundering-hamster', set: 'base', name: 'Thundering Hamster', type: 'Fire', rarity: 'ultra-rare', power: 8, value: 3000, source: 'pack', flavor: 'The wheel spins. The sky darkens.' },
        { id: 'tidal-raccoon', set: 'base', name: 'The Tidal Raccoon', type: 'Water', rarity: 'ultra-rare', power: 8, value: 3000, source: 'pack', flavor: 'Washes everything. Especially your hopes.' },

        // Promos: never in packs; each comes from one place
        { id: 'card-o-matic-prime', set: 'promo', name: 'CARD-O-MATIC Prime', type: 'Wild', rarity: 'legendary', power: 10, value: 15000, source: 'vending-special', flavor: 'It finally dispensed itself.' },
        { id: 'absolutely-massive-dragon', set: 'promo', name: 'Absolutely Massive Dragon', type: 'Fire', rarity: 'legendary', power: 10, value: 40000, source: 'card-show', flavor: 'The card is normal-sized. The dragon is not.' },
        { id: 'golden-paperclip-phoenix', set: 'promo', name: 'Golden Paperclip Phoenix', type: 'Wild', rarity: 'legendary', power: 10, value: 50000, source: 'trade-up', flavor: 'It started as a paperclip. It always does.' },
        { id: 'champions-crown', set: 'promo', name: "Champion's Crown", type: 'Wild', rarity: 'legendary', power: 10, value: 30000, source: 'tournament', flavor: 'Heavy is the head. Heavier is the binder.' },
        { id: 'pips-favourite', set: 'promo', name: "Pip's Favourite", type: 'Nature', rarity: 'legendary', power: 10, value: 100, source: 'gift', flavor: 'Worth one dollar. Worth everything.' },

        // From the childhood shoebox
        { id: 'wet-sock-gobln', set: 'secret', name: 'Wet Sock Gobln', type: 'Water', rarity: 'common', power: 2, value: 5, source: 'shoebox', flavor: 'A misprint. The i is missing. Nobody knows where it went.' },
        { id: 'chewed-dragon', set: 'secret', name: 'Absolutely Massive Dragon (chewed)', type: 'Fire', rarity: 'legendary', power: 4, value: 11, source: 'shoebox', flavor: 'You did this. You were seven.' }
    ],

    find(id) {
        return this.cards.find(card => card.id === id);
    },

    findSet(id) {
        return this.sets.find(set => set.id === id);
    },

    /**
     * A set's cards, in checklist order
     */
    inSet(setId) {
        return this.cards.filter(card => card.set === setId);
    },

    /**
     * The cards packs can hold
     * @param {string} rarity - Only cards of this rarity, if given
     */
    inPacks(rarity) {
        const sets = this.sets.filter(set => set.inPacks).map(set => set.id);
        return this.cards.filter(card => sets.includes(card.set) && (!rarity || card.rarity === rarity));
    },

    /**
     * A card's number in its set, as printed on it: "7/30", "PROMO 2",
     * or '' for cards on no checklist
     */
    number(id) {
        const card = this.find(id);
        const set = card && this.findSet(card.set);
        if (!set || set.secret) {
            return '';
        }
        const cards = this.inSet(set.id);
        const position = cards.indexOf(card) + 1;
        return set.inPacks ? `${position}/${cards.length}` : `PROMO ${position}`;
    }
};
