/**
 * Terry, who waits at the vending machine for the drop with a folding chair
 * and a thermos of soup
 */

export const Terry = {
    arrive: [
        'Someone is already at the machine: a man in a folding chair, with a thermos.',
        '"Driver\'s due in a minute," he says, without looking at you. "Been here since the last one. Name\'s Terry."'
    ],
    arriveAgain: [
        'Terry is at the machine again, in his folding chair. The thermos looks fuller.',
        '"Driver\'s due in a minute," he says.'
    ],
    arriveFriend: [
        'Terry is at the machine. He has brought a second folding chair. It is for you.',
        '"Driver\'s due in a minute," he says. "Same as last time?"'
    ],

    persuade: 'Ask Terry to split the drop',
    splitAgain: 'Split the drop',
    letHimFirst: 'Let him go first',
    shove: 'Shove him aside',

    agreed: 'Terry thinks about it for a long time. "Fine. You take row A. I take row B." He offers you some of the thermos. It is soup.',
    agreedAgain: '"Row A\'s yours," says Terry. He pours you some soup.',
    waiting: 'You wait behind Terry. Terry appreciates it. Terry does not say so.',

    // At the drop
    shared: 'The driver comes. Terry takes row B, as agreed, folds up his chair, and nods at you.',
    wentFirst: kind => `The driver comes. Terry goes first and takes ${kind}. He folds up his chair and leaves.`,

    // A friend texts when a mega pack turns up and the player isn't there
    tip: slot => `Your phone buzzes. It is Terry: "MEGA PACK. ${slot}. You did not hear it from me."`
};
