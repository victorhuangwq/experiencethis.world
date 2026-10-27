/**
 * Gus's Games & Grub: the grand opening, and Gus behind the counter
 */

export const Gus = {
    name: 'Gus\'s Games & Grub',
    unlockedWithTip: 'Your collection is getting serious. You remember what Pip said. Gus\'s Games & Grub appears on your map. You did not know you had a map.',
    unlockedWithoutTip: 'Benny mentions a store called Gus\'s Games & Grub. "They don\'t let me in anymore," says Benny. Gus\'s Games & Grub appears on your map. You did not know you had a map.',

    // Before the grand opening
    look: 'The lights are off. You can see shelves of packs inside. More packs than the machine has ever held. More packs than you have ever held.',
    knock: 'Knock',
    firstKnock: 'The door opens a crack. "We open tomorrow," says Gus. "Grand opening. There will be balloons." The door closes.',
    knocks: [
        '"Tomorrow," says Gus, through the door.',
        '"T. O. M. O. R. R. O. W.," says Gus.',
        'You knock. Somewhere inside, Gus blows up a balloon, slowly, at you.'
    ],

    // The grand opening, on the second day of play
    opened: 'Gus\'s Games & Grub is open. There are balloons. Two of them. One has already popped.',
    inside: 'Shelves of packs. A glass case. A table by the window. A corkboard. Gus, behind the counter, eating a sandwich over the cards. He has never dropped a crumb.',

    buyPack: (set, price) => `Buy a ${set} pack (${price})`,
    bought: [
        'Gus hands you a pack. "No bag," says Gus. "Bags are for tourists."',
        'Gus hands you a pack. He watches you smell it. He nods.',
        'Gus hands you a pack and goes back to his sandwich.',
        '"Good choice," says Gus. He says it to everyone. He means it every time.'
    ],
    cantAfford: price => `"${price}," says Gus. Gus does not do layaway.`,

    // The glass case of singles
    caseTitle: 'The glass case',
    caseNote: 'Gus restocks the case every four hours. He polishes the glass every four minutes.',
    single: (name, rarity, read, price) => `${name} (${rarity}). ${read} ${price}.`,
    buySingle: 'Buy',
    emptySpot: 'An empty spot. A fingerprint. Gus is already polishing it.',
    boughtSingle: name => `Gus takes ${name} out of the case with two fingers, like a jeweller. "Don't bend it," says Gus.`,

    // How a card looks by eye. A 9 and a 10 look the same.
    read: condition => condition >= 9 ? 'Looks perfect.'
        : { 8: 'A little off-centre.', 7: 'A soft corner.', 6: 'A scuff on the back.', 5: 'Has seen better days.' }[condition]
        || 'Has been through something.',

    // Grading, at Mint Condition Co.
    gradingTitle: 'Grading',
    gradingNote: fee => `Gus sends cards to Mint Condition Co. ${fee} a card. Back tomorrow. "They grade by hand," says Gus. "Very clean hands."`,
    candidate: (name, rarity, read) => `${name} (${rarity}). ${read}`,
    send: fee => `Send it (${fee})`,
    sent: (name, read) => `Gus holds ${name} up to the light. "${read}" He puts it in an envelope and licks it shut. Back tomorrow.`,
    away: (name, when) => `${name}: at Mint Condition Co. Back ${when}.`,
    backAt: (time, tomorrow) => tomorrow ? `tomorrow at ${time}` : `at ${time}`,
    grades: {
        10: 'GEM MINT',
        9: 'MINT',
        8: 'NEAR MINT',
        7: 'EXCELLENT',
        6: 'VERY GOOD',
        5: 'GOOD',
        4: 'FAIR',
        3: 'WORN',
        2: 'VERY WORN',
        1: 'CHEWED'
    },
    graded: (name, grade, label) => `${name} is back from Mint Condition Co., sealed in hard plastic. ${grade}: ${label}.`,
    gradedAway: (name, grade, label) => `${name} came back from grading (${grade}: ${label})`,
    gradedCard: (name, grade, label) => `${name}: ${grade} ${label}`,
    sellGraded: price => `Sell it to Gus (${price})`,
    soldGraded: (name, price) => `Gus buys ${name} for ${price}. He puts it in the case with a price tag of twice that. "Rent," says Gus.`
};
