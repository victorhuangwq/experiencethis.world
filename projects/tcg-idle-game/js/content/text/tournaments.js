/**
 * Tournaments at Gus's, and the regulars who play in them. A regular's
 * tell is how they play, shown, never stated.
 */

export const Tournaments = {
    localsTitle: 'Friday Night Locals',
    localsNote: 'Gus runs a tournament every hour. He calls every one of them Friday Night Locals.',
    enterLocals: price => `Play in this hour's locals (buy two packs: ${price})`,
    nextLocals: time => `You played this hour's locals. Next one: ${time}.`,
    entered: day => day === 'Friday'
        ? 'Gus writes your name on the bracket. "Friday Night Locals," says Gus. It is actually Friday. Gus looks uneasy about it.'
        : `Gus writes your name on the bracket. "Friday Night Locals," says Gus. It is ${day}.`,

    match: (number, name) => `Match ${number} of 3: ${name}.`,
    score: (mine, name, theirs) => `Rounds: you ${mine}, ${name} ${theirs}. Best of three.`,
    play: (type, name, power) => `${type}: ${name} (${power})`,
    noneLeft: type => `${type}: none left`,
    nothing: 'Play nothing (you are out of cards)',

    played: (name, type, power) => `You play ${name} (${type}, ${power}).`,
    playedNothing: 'You play nothing. You have nothing.',
    theyPlayed: (who, name, type, power) => `${who} plays ${name} (${type}, ${power}).`,
    typeBeats: (winner, loser) => `${winner} beats ${loser}.`,
    roundWon: 'Your round.',
    roundLost: 'Their round.',
    coin: won => `A tie. Gus flips a coin. ${won ? 'Heads. Your round.' : 'Tails. Their round.'}`,
    matchWon: name => `You beat ${name}. You shake hands. Good game.`,
    matchLost: name => `${name} wins the match. "Good game," says ${name}. It was.`,

    finished: (wins, packs) => ({
        3: `You win every match. Gus hands you ${packs} packs and writes your name on the corkboard. In pen.`,
        2: 'Two wins out of three. Gus hands you a pack. "Next time," says Gus.',
        1: 'One win. Gus gives you a sticker that says I PLAYED. You did.',
        0: 'No wins. Gus gives you a sticker that says I PLAYED. You did, technically.'
    })[wins],

    regulars: {
        brenda: {
            name: 'Brenda',
            tell: 'Brenda\'s deck box has a wave on it. So does her T-shirt. So does her tattoo.'
        },
        joe: {
            name: 'Grandpa Joe',
            tell: 'Grandpa Joe says Nature is the only real type. He has been saying it since before you got here. He is still saying it.'
        },
        hank: {
            name: 'Hank',
            tell: 'Hank smells of hot sauce. His card sleeves have little flames on them. So do his actual sleeves.'
        },
        dev: {
            name: 'Dev, age 11',
            tell: 'Dev, age 11, watches what you play very closely. He copies everything. He copied the way you sat down.'
        },
        kayla: {
            name: 'Kayla',
            tell: 'Kayla has read every card ever printed. She waits to see what you play, then plays what beats it.'
        },
        marcus: {
            name: 'Marcus',
            tell: 'Marcus never plays the same type twice in a row. He says it is a system. It is a superstition.'
        }
    }
};
