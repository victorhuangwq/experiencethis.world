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
    cantAfford: price => `"${price}," says Gus. Gus does not do layaway.`
};
