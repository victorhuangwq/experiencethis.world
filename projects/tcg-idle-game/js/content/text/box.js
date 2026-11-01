/**
 * The box from the player's childhood room, and the SORT-O-MATIC
 */

export const Box = {
    // A card with nothing special about it, and how the box stands
    junk: (name, quirk) => `${name}. ${quirk}`,
    left: count => `${count} left in the box.`,
    pile: count => `${count} ${count === 1 ? 'card' : 'cards'} in the pile you would like to keep.`,

    // What can be said about any old card
    quirks: [
        'Someone has drawn a moustache on it.',
        'It has a bite out of it. You know whose.',
        'Slightly sticky.',
        'Very sticky.',
        'It smells of 1998.',
        'Worth nothing. You check twice.',
        'You named this one Steve.',
        'Bent. Like all of us.',
        'You once cried over this card. You cannot remember why.',
        'It has been laminated, badly, with tape.',
        'You remember wanting this so much.',
        'You had a strategy for this card. It was to show it to people.',
        'The back says MINE.',
        'The back says MINE, twice.',
        'Not a single memory comes to mind.',
        'You almost keep it. Junk pile.',
        'A trade you lost. You can tell.',
        'There is a crayon price on it. It is five million dollars.'
    ],

    // What turns up in the box, in order. Rules.boxCardFinds says which are
    // cards for the pile.
    finds: {
        tag: 'A price tag, in crayon, stuck to a card: $1,000,000. You were not open to offers.',
        iou: 'A Bathtub Snail. On the back, in crayon: BENNY OWES ME. It does not say what. You put it to one side.',
        tooth: 'A baby tooth, taped to a Dishwater Goldfish. You have questions for your seven-year-old self. They are seven.',
        cereal: 'A business card, cut out of a cereal box. "BENNY. I BUY CARDS." The phone number has five digits.',
        contract: 'A contract, in crayon. "I WILL TRADE 1 DRAGON FOR 2 SNACKS." You signed it. Nobody else did. You look at the dragon. You look at the corner.',
        bag: 'A Lawn Crab in a sandwich bag, labelled VALUABLE. It is not. You kept it safe for years. You put it to one side.',
        note: 'A note, in your handwriting: "DO NOT TELL BENNY ABOUT THE OTHER BOX."',
        map: 'A map of your old street, in crayon. There is an X on it. There is no key. There is a warning: "NOT YOU BENNY."',
        birthday: 'A birthday card from your grandmother. There is still $5 in it. You were seven. You did not read cards that were not cards.',
        rare: 'A Puddle Kraken with barely a scratch on it. An actual rare. You chewed nothing. You must have been full. You put it to one side.',
        flyer: 'A flyer: "CARD-O-MATIC 3000. BACK OF THE MALL." It is older than you are. It says the machine is always open.',
        checklist: 'A checklist, in crayon. You got as far as number 12. You put it on the fridge. It looks like something to finish.',
        photo: 'A photo of your seventh birthday. At the back, a boy is counting nickels. You do not remember inviting him. He looks about nine.',
        sleeve: 'Squirrels in a Trench Coat, in a plastic sleeve. On the sleeve: DO NOT SELL. Crossed out. Then written again. You put it to one side.',
        receipt: 'A receipt, in crayon. "SOLD TO BENNY: 1 CARD. 5 CENTS." It does not say which card. It is signed with a very steady hand.',
        goblin: 'A Wet Sock Goblin. Something about it bothers you. You look at it for a while. You cannot say what. You put it to one side.',
        letter: 'A letter. "DEAR OLD ME. IF YOU ARE READING THIS DID YOU FIX THE DRAGON. DID YOU GET THE OTHER BOX BACK."',
        stuck: 'The rest of the box will not come out. It is one solid brick of cards, held together by apple juice from 1998. You pull. The brick does not care.',
        library: 'The SORT-O-MATIC stops at a library card. It is overdue. It starts again.',
        sticker: 'The SORT-O-MATIC puts a holo in the junk pile. You take it back out. It is a sticker of a horse. The SORT-O-MATIC was right.',
        corner: 'The SORT-O-MATIC spits out a small triangle of card. It is the corner of the dragon. It has tooth marks. You put the two of them next to each other. It does not help.',
        captain: 'The SORT-O-MATIC puts a Captain Bathwater in the junk pile, very gently. You take it back. It hums at you. You put it to one side.',
        knows: 'A note, stuck to the brick: "BENNY KNOWS." It does not say what. It is underlined so hard it has gone through the paper.',
        mole: 'The SORT-O-MATIC stops at a Moist Mole for a long time. It has seen things. You put it to one side.',
        three: 'The last of the brick comes apart. Under it, on the bottom of the box, in crayon: "HE WILL OFFER THREE DOLLARS." That is all it says.'
    },

    // While the rest of the box is stuck together
    stuckHint: 'You are not getting through that by hand. The mall is always open, apparently.',

    // The SORT-O-MATIC
    ad: price => `An email gets past the spam filter. "SORT-O-MATIC. It sorts. Even the sticky ones. ${price}." It is the first email today that has offered you anything.`,
    buySorter: price => `Buy the SORT-O-MATIC (${price})`,
    sorterBought: price => `The SORT-O-MATIC arrives. It cost ${price}. It is a toaster with a slot in it. It starts on the box without being asked.`,
    sorterRunning: 'The SORT-O-MATIC hums. It goes through the box one card at a time. It does not need you. You can go.',
    sorterAway: count => `the SORT-O-MATIC went through ${count} cards`
};
