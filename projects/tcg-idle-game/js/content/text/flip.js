/**
 * Flip Resellington, the scalper. In Act 1 he only wants whatever is left in
 * the vending machine. He gets more annoyed each time he doesn't get it.
 */

const capital = text => text[0].toUpperCase() + text.slice(1);

export const Flip = {
    arrive: [
        'Someone is standing very close behind you.',
        'Sunglasses, indoors. An empty duffel bag. A phone open to a selling app.',
        '"You done?" he says. "I\'ll take the rest. All of it." He hands you a business card. It says FLIP RESELLINGTON. ENTREPRENEUR.'
    ],
    arriveAgain: [
        'Flip Resellington is behind you again. The duffel bag is empty again.',
        '"Take your time," he says. He does not mean it.'
    ],
    kidBehind: name => `Behind him, ${name} is counting coins. There are exactly enough for one pack.`,

    buyAll: 'Buy them all',
    leaveOne: 'Buy them all, but leave one for the kid',
    letHim: 'Let him have the rest',

    takesTheRest: 'Flip buys whatever you could not afford. The duffel bag is a little less empty.',
    tookItAll: 'Flip buys every pack in the machine. He photographs each one. They are online before he reaches the exit, at four times the price.',
    tookItAllKid: name => `Flip buys every pack in the machine. ${capital(name)} watches him do it, then goes home.`,
    kidGetsOne: name => `You leave one pack. ${capital(name)} buys it and holds it up like a trophy. Flip has to wait for the next restock. Flip hates that.`,

    // Each time the player buys him out, in order. The last one repeats.
    annoyed: [
        'Flip looks at the empty machine. He takes off his sunglasses. He puts them back on. "Okay," he says. "Okay."',
        '"You again," says Flip. He writes something in a small notebook.',
        'Flip looks at you for a long time. "You and me," he says, "should talk business some time." He leaves. The notebook stays open.',
        'Flip sighs. He has started bringing a second duffel bag. It is also empty.'
    ]
};
