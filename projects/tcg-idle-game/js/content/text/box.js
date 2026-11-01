/**
 * The box from the player's childhood room, and the SORT-O-MATIC
 */

export const Box = {
    // The card in hand, and how the box stands
    inHand: (name, type) => `${name}. ${type}.`,
    left: count => `${count} left in the box.`,
    stack: (type, count, bar) => `${type.padEnd(6)} ${String(count).padStart(3)} ${bar}`,

    // Putting a card on the wrong stack
    wrong: [
        'You put it on the wrong stack. You were seven once. You move it back.',
        'That is not its stack. It knows. You know.',
        'Wrong stack. Nobody saw. The card saw.'
    ],

    // What turns up in the box
    finds: {
        checklist: 'A checklist, in crayon. You got as far as number 12. You put it on the fridge. It looks like something to finish.',
        rare: 'A rare with barely a scratch on it. You chewed nothing. You must have been full.',
        note: 'A note, in your handwriting: "DO NOT TELL BENNY ABOUT THE OTHER BOX."',
        birthday: 'A birthday card from your grandmother. There is still $5 in it. You were seven. You did not read cards that were not cards.',
        flyer: 'A flyer: "CARD-O-MATIC 3000. BACK OF THE MALL." It is older than you are. It says the machine is always open.',
        library: 'The SORT-O-MATIC stops at a library card. It is overdue. It starts again.',
        goblin: 'The SORT-O-MATIC stops at a Wet Sock Goblin for a long time. It has seen things.'
    },

    // The SORT-O-MATIC
    ad: price => `An email gets past the spam filter. "SORT-O-MATIC. It sorts. ${price}." It is the first email today that has offered you anything.`,
    buySorter: price => `Buy the SORT-O-MATIC (${price})`,
    sorterBought: price => `The SORT-O-MATIC arrives. It cost ${price}. It is a toaster with a slot in it. It starts on the box without being asked.`,
    sorterRunning: 'The SORT-O-MATIC hums. It does not need you. You can keep sorting, or you can go.',
    sorterAway: count => `the SORT-O-MATIC sorted ${count} cards`
};
