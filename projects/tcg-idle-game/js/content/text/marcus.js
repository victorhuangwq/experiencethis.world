/**
 * Marcus from IT, at the table by the window at Gus's on his evenings and
 * weekends, with his trade binder
 */

export const Marcus = {
    title: 'The table by the window',
    // If the player has met him at the office, or not
    here: metAtWork => metAtWork
        ? 'Marcus from IT is at the table by the window with his trade binder. He pretends not to know you. You pretend back. It is the most you have ever had in common.'
        : 'A man is at the table by the window with a trade binder. His lanyard says MARCUS, IT. "One for one," he says. "Same rarity. I have a system."',
    away: 'The table by the window is empty. A note on it says: BACK THURSDAY, 6 PM. DO NOT SIT HERE. - M',
    offer: (give, rarity, read, want) => `His ${give} (${rarity}). ${read} For your spare ${want}.`,
    trade: 'Trade',
    noOffers: '"Nothing for you today," says Marcus. "Your binder is too good. Or too bad. One of those."',
    traded: (give, want) => `You trade your spare ${want} for Marcus's ${give}. He checks the corners. You check the corners. Nobody says anything. It is perfect.`
};
