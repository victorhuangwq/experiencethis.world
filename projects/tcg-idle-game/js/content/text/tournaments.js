/**
 * Tournaments at Gus's, and the regulars who play in them. A regular's
 * tell is how they play, shown, never stated.
 */

export const Tournaments = {
    localsTitle: 'Friday Night Locals',
    localsNote: '"Friday Night Locals," says Gus, tapping the poster. "Every day. Buy two packs and you\'re in. Win, and you go home with more."',
    enterLocals: price => `Sign me up (buy two packs: ${price})`,
    nextLocals: '"You\'ve had your go," says Gus. "Come back tomorrow. It will be Friday Night Locals again."',
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

    // The pre-release, for regulars, before a new set comes out
    invited: 'Gus writes your name on the corkboard, under REGULARS. "Pre-release," says Gus. "Backyard Brawl. Before anyone else. You open the packs here and play with what you get." He taps the side of his nose. Nobody knows why.',
    prereleaseTitle: 'The pre-release',
    prereleaseNote: '"And for regulars," says Gus, quieter, "the pre-release. Backyard Brawl, before anyone else. Four packs, opened at the back table. You play with what you get."',
    enterPrerelease: (packs, price) => `I'm in (a kit of ${packs} Backyard Brawl packs: ${price})`,
    prereleaseOpened: 'Gus hands you the kit and a pair of scissors. "No scissors," says Gus, and takes the scissors back. You open the packs at the back table.',
    prereleaseFinished: wins => `The pre-release is over. Everyone gets a promo, still warm from the printer: The Early Bird. ${wins === 0 ? 'Gus pats you on the shoulder.' : `Gus hands you ${wins === 1 ? 'a Backyard Brawl pack' : `${wins} Backyard Brawl packs`} for your wins.`} "See you in summer," says Gus.`,
    waitingForSummer: '"Backyard Brawl is out in the summer," says Gus. He will not say when summer is. "Soon."',

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
