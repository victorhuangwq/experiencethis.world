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
    upgraded: {
        'binder': 'Your cards no longer fit in the shoebox. You buy a binder. You are a binder person now.',
        'two-binders': 'One binder was not enough. You have two binders. They are friends.',
        'bookshelf': 'You buy a bookshelf for your binders. Visitors will ask about it. Nobody visits.',
        'card-room': 'The guest room is the card room now. Guests can sleep on the couch. There are no guests.'
    },

    count: (cards, different) => `${cards} cards. ${different} different.`,
    unknown: '???',
    unknownNote: 'The developer knows where the rest are. The developer is not telling.',
    others: 'Other critters'
};
