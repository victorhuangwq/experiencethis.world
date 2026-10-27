/**
 * Endings: names, and what each ending screen says
 */

const times = count => count === 1 ? 'once' : count + ' times';

export const Endings = {
    names: {
        collector: 'Greatest Collector',
        champion: 'TCG Champion',
        business: 'TCG Businessperson',
        scalper: 'Bad end: Scalper',
        shame: 'Shame'
    },

    shame: {
        lines: ({ sadKids, shoves, kicks }) => [
            'Dale taps you on the shoulder.',
            '"Okay, pal. We\'ve had complaints."',
            sadKids > 0 ? `"You made a kid sad ${times(sadKids)}."` : null,
            shoves > 0 ? `"You shoved Terry ${times(shoves)}. He had soup."` : null,
            kicks > 0 ? `"Also, you kicked the machine ${times(kicks)}. I counted."` : null,
            '"Please leave the mall."',
            'You leave the mall. You are an adult. You are banned from a mall.'
        ].filter(Boolean),
        note: 'A note from the developer: be nice to kids.'
    },

    screen: {
        theEnd: name => `THE END: ${name}`,
        found: (count, total) => `Endings found: ${count}/${total}`,
        unknown: '???',
        startOver: 'Start over'
    }
};
