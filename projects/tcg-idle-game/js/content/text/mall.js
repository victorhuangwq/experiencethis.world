/**
 * The back of the mall: the CARD-O-MATIC 3000, its coin return, and Dale
 */

export const Mall = {
    name: 'The back of the mall',
    unlocked: 'There is a vending machine at the back of the mall. It sells Critter Clash packs. It has been there since you were seven. It has been waiting.',

    restock: 'A delivery driver restocks the machine. The driver does not make eye contact.',
    restockSpecial: slot => `A delivery driver restocks the machine. Something in slot ${slot} is sparkling.`,
    restockAway: 'the machine was restocked',
    nextRestock: time => `The delivery driver comes every half hour or so. Next: ${time}.`,
    empty: 'The machine is empty. It looks smug about it.',

    cantAfford: price => `You need ${price}. You check your pockets again. Same pockets.`,
    bought: (slot, special) => `*thunk* ${special ? 'A sparkling special pack' : 'A pack'} drops out of ${slot}.`,
    jammed: slot => `The machine swallows your money. The pack in ${slot} wobbles. It stays.`,
    kickFree: 'You kick the machine. The pack falls out. Violence works, sometimes.',
    kickLost: 'You kick the machine. It hums smugly. Your money is gone.',
    walkAway: 'You walk away. The machine wins this round. The machine wins most rounds.',

    // The first kicks, in order, then a random one of kickMore
    kicks: [
        'You kick the machine. Nothing happens. A security guard looks up from his pretzel.',
        'You kick the machine. The guard\'s name tag says DALE. Dale writes something down.'
    ],
    kickMore: [
        'You kick the machine. Dale writes something down.',
        'You kick the machine. The dent gets a little bigger. You did that.',
        'You kick the machine. Dale turns a page in his notebook. It is a new page.'
    ],

    coinNothing: [
        'Nothing.',
        'Nothing. You check again. Still nothing.',
        'There is gum in there. It is not yours. You leave it.',
        'Nothing. The coin return is a metaphor, probably.'
    ],
    coinQuarter: 'A quarter! It is yours now. That is how coin returns work.',
    coinKey: 'There is a small key in the coin return. It says CARD-O-MATIC. You keep it. It does nothing. For now.',

    buttons: {
        slot: (slot, price) => `Buy ${slot} (${price})`,
        kick: 'Kick the machine',
        kickJammed: 'Kick it',
        walkAway: 'Walk away',
        coinReturn: 'Check the coin return'
    }
};
