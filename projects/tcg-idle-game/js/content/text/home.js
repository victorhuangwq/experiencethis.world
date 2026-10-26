/**
 * Home: where the player keeps their cards
 */

export const Home = {
    closet: 'The closet',

    // The location's name, by storage
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

    count: (cards, different) => `${cards} cards. ${different} different.`,
    unknown: '???',
    unknownNote: 'The developer knows where the rest are. The developer is not telling.',
    others: 'Other critters',

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
        Nature: 'Nature'
    },
    page: (page, pages) => `Page ${page} of ${pages}`,
    previousPage: 'Previous page',
    nextPage: 'Next page'
};
