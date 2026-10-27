/**
 * Strikes. Each strike line gets who the strike was against.
 */

export const Strikes = {
    pip: [
        who => `You keep buying. ${who} watches. ${who} leaves. Dale has stopped eating his pretzel.`,
        () => 'Someone has taped a note to the machine. It says BE NICE.'
    ],
    // Buying the scalper out while a kid waited behind him
    buyout: [
        who => `You buy every pack in the machine. ${who} watches the last one go, and puts the coins away. Dale has stopped eating his pretzel.`,
        () => 'Someone has taped a note to the machine. It says BE NICE.'
    ],
    // Shoving Terry aside before a drop
    camper: [
        who => `You shove ${who} aside. His thermos rolls under the machine. Dale writes something down. Dale underlines it.`,
        () => 'Someone has taped a note to the machine. It says BE NICE.'
    ],

    // The narrator talks to the player directly at the second strike
    warning: 'The narrator would like a word. You have done this twice now. There will not be a third time. Well. There can be. Once.'
};
