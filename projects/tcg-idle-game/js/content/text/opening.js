/**
 * The opening: a shoebox from the player's childhood
 */

export const Opening = {
    arrival: count => [
        'Your parents have moved house. They drop off everything from your childhood room and leave before you can object.',
        'There is a massive box. It says CARDS - DO NOT TOUCH. It is your handwriting. You were seven.',
        'On top is the holo Absolutely Massive Dragon. It would be worth $400. You chewed the corner off. You were seven.',
        `There are ${count} cards under it.`
    ],
    takeOut: 'Take a card out',
    // Once the box is empty
    value: (count, sorter) => [
        sorter ? 'The SORT-O-MATIC stops. The box is empty.' : 'The box is empty.',
        `You look up all ${count} cards online.`,
        'Total value: $0.43.',
        'There is a knock at the window. It is Benny, age 9, from next door.',
        '"Three dollars for the box," says Benny. "Final offer."',
        'It is the first offer.'
    ],
    sell: 'Sell it to Benny',
    keep: 'Keep it',
    sold: sorter => `Benny counts out three dollars in nickels. He flips through the first stack. "Sorted by type," he says. "Nice." He leaves without saying goodbye.${sorter ? ' The SORT-O-MATIC keeps running. It has nothing left to sort. It seems happy.' : ''} You find another box for your cards. This one says SHOES.`,
    kept: count => `You put the lid back on. You sorted ${count} cards. You are not selling them for three dollars. "Your loss," says Benny. It is unclear whose loss it is.`
};
