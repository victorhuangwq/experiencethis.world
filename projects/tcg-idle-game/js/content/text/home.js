/**
 * Home: where the player keeps their cards, and works on home days
 */

export const Home = {
    name: 'Home',

    // What the cards are kept in, by storage
    names: {
        'shoebox': 'A shoebox',
        'binder': 'A binder',
        'two-binders': 'Two binders',
        'bookshelf': 'A bookshelf of binders',
        'card-room': 'The card room'
    },
    // The collection has outgrown its storage, and the next one is for sale
    outgrown: {
        'binder': 'The shoebox lid no longer closes. Binders exist. Binders are for serious people.',
        'two-binders': 'The binder will not close. It makes a noise when you try. A second binder would help.',
        'bookshelf': 'The binders are on the floor now. They deserve a bookshelf.',
        'card-room': 'The bookshelf is full. The guest room is right there.'
    },
    buy: {
        'binder': 'Buy a binder',
        'two-binders': 'Buy a second binder',
        'bookshelf': 'Buy a bookshelf',
        'card-room': 'Turn the guest room into a card room'
    },
    upgraded: {
        'binder': 'Your cards no longer fit in the shoebox. You buy a binder. You are a binder person now.',
        'two-binders': 'One binder was not enough. You have two binders. They are friends.',
        'bookshelf': 'You buy a bookshelf for your binders. Visitors will ask about it. Nobody visits.',
        'card-room': 'The guest room is the card room now. Guests can sleep on the couch. There are no guests.'
    },

    count: (storage, cards, different) => `${storage}. ${cards} cards. ${different} different.`,

    // The checklists
    unknown: '???',
    unknownNote: 'The developer knows where the rest are. The developer is not telling.',
    rarities: {
        'common': 'commons',
        'uncommon': 'uncommons',
        'rare': 'rares',
        'ultra-rare': 'ultra-rares',
        'legendary': 'legendaries'
    },
    odds: (rare, ultraRare) => `On the back, in small print: a rare in about 1 pack in ${rare}, and an ultra-rare in about 1 pack in ${ultraRare}.`,
    // Completing part of a checklist, the first time
    completed: {
        'common': 'Every common on the checklist. Nobody will ever know how proud you are. You will tell them anyway.',
        'uncommon': 'Every uncommon on the checklist. You have started using a ruler for the ticks.',
        'rare': 'Every rare on the checklist. You hold it up to the light. It is a piece of paper. It is beautiful.',
        'ultra-rare': 'Every ultra-rare on the checklist. Somewhere, a seven-year-old is very jealous. It is you.',
        set: (name, total) => `The ${name} is complete. All ${total}. You look at the checklist for a long time. Then you buy a frame for it.`
    },

    others: 'Your critters',
    graded: 'In hard plastic',

    // In the shoebox, critters are a pile
    pile: 'In the order you threw them in.',
    pileMore: count => `...and ${count} more at the bottom of the box.`,

    // In binders, critters go in pockets on pages
    binders: {
        all: 'The binder',
        good: 'The good ones',
        commons: 'Commons',
        Fire: 'Fire',
        Water: 'Water',
        Nature: 'Nature',
        Wild: 'Wild'
    },
    page: (page, pages) => `Page ${page} of ${pages}`,
    previousPage: 'Previous page',
    nextPage: 'Next page'
};
