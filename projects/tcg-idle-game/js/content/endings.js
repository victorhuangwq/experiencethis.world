/**
 * Endings. Each one that has a screen has art (see ui/art.js) and lines,
 * written from the state at the moment the run ended.
 */

export const Endings = [
    { id: 'collector', name: 'Greatest Collector' },
    { id: 'champion', name: 'TCG Champion' },
    { id: 'business', name: 'TCG Businessperson' },
    { id: 'scalper', name: 'Bad end: Scalper' },
    {
        id: 'shame',
        name: 'Shame',
        art: 'guard',
        lines: game => {
            const kicks = game.state.vending.kicks;
            const sadKids = game.state.kindness.strikes.filter(strike => strike.source === 'pip').length;
            return [
                'Dale taps you on the shoulder.',
                '"Okay, pal. We\'ve had complaints."',
                sadKids > 0 ? `"You made a kid sad ${sadKids === 1 ? 'once' : sadKids + ' times'}."` : null,
                kicks > 0 ? `"Also, you kicked the machine ${kicks === 1 ? 'once' : kicks + ' times'}. I counted."` : null,
                '"Please leave the mall."',
                'You leave the mall. You are an adult. You are banned from a mall.'
            ].filter(Boolean);
        },
        note: 'A note from the developer: be nice to kids.'
    }
];
