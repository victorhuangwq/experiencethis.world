/**
 * Packs: opening, smelling, and the reveal
 */

export const Packs = {
    first: 'You open your first pack in years. Your hands remember how.',
    // The checklist comes in the first pack
    checklist: total => `A checklist falls out of the pack. Every card in the Base Set, numbered 1 to ${total}. You take it home and put it on the fridge. You have not put anything on the fridge since 1998.`,
    newCards: count => count === 1 ? '1 new card for the checklist.' : `${count} new cards for the checklist.`,
    open: 'You open a pack.',
    openSpecial: 'You open the special pack. It smells like a new car.',
    openMega: 'You open the mega pack. It takes a while. Fifteen cards. You count them twice.',
    faster: 'You have opened 20 packs. You are faster at it now. This is called progress.',
    legendary: 'A legendary card. Your hands are shaking. That is normal.',
    rare: 'A good one.',

    unopened: count => `Unopened packs: ${count}`,
    unopenedSpecial: count => `Special packs: ${count}`,
    unopenedMega: count => `Mega packs: ${count}`,

    // Lines for particular sniff counts; otherwise a random one of sniff
    sniffs: {
        1: 'You smell the pack. It smells like 1998.',
        2: 'Still 1998.',
        5: 'A stranger watches you smell the pack. You smell it again, for them.',
        10: 'You have smelled 10 packs. Benny would charge for this.',
        25: 'You can tell the print run by smell now. Probably.',
        49: 'Almost.',
        50: 'You smell the pack, and somehow every pack in the mall. Special packs will find you more often now.'
    },
    sniff: [
        'You smell the pack.',
        'You smell the pack. Cardboard and hope.',
        'You smell the pack. Something is building.'
    ],
    sniffAttuned: 'You smell the pack. You are one with the packs.',

    buttons: {
        open: 'Open one',
        smell: 'Smell it',
        skip: 'Skip'
    }
};
