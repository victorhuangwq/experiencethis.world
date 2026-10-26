/**
 * Strikes. Each strike line gets who the strike was against.
 */

export const Strikes = {
    pip: [
        who => `You keep buying. ${who} watches. ${who} leaves. Dale has stopped eating his pretzel.`,
        () => 'Someone has taped a note to the machine. It says BE NICE.'
    ],

    // The narrator talks to the player directly at the second strike
    warning: 'The narrator would like a word. You have done this twice now. There will not be a third time. Well. There can be. Once.'
};
