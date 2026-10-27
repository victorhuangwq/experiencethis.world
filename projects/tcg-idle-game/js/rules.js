/**
 * Tuning values. See STORY.md (Pacing) for the targets behind them.
 * Money is in cents.
 */

import { SECOND, MINUTE, HOUR } from './core/time.js';

export const Rules = {
    // Money
    allowanceCentsPerSecond: 2,
    offlineCap: 8 * HOUR,
    shoeboxOffer: 300,
    bennyShare: 0.75,

    // The day job. Where the player works on each day of the week by their
    // own clock, from Sunday: the office, home, or null for a day off.
    workplaces: [null, 'home', 'office', 'office', 'office', 'home', null],
    workPay: 50,
    workRest: 20 * SECOND,
    // Chance the boss walks past while a pack is opened at the desk
    bossWalkByChance: 0.25,

    // CARD-O-MATIC 3000
    // The delivery driver comes every 25 to 35 minutes
    restockEvery: 30 * MINUTE,
    restockVariation: 5 * MINUTE,
    slotCount: 8,
    prices: { normal: 300, special: 600 },
    specialRestockChance: 0.1,
    attunedSpecialRestockChance: 0.2,
    jamChance: 0.04,
    coinReturnChance: 0.3,
    coinReturnCents: 25,
    keyAfterChecks: 8,
    keyChance: 0.06,
    keyGuaranteedAt: 40,

    // Packs
    sniffsToAttune: 50,
    fastOpeningAfter: 20,

    // Pip
    pipAfterPacks: 3,
    pipChance: 0.35,
    pipGiftChance: 0.3,

    // Kindness code
    maxStrikes: 3,

    // Cards opened before Gus's store appears, with and without Pip's tip
    gusWithTip: 40,
    gusWithoutTip: 60,

    // Collection storage, in order. Each one goes on sale once the player
    // has this many cards, and costs this much (in cents).
    storage: [
        { id: 'shoebox', cards: 0, price: 0 },
        { id: 'binder', cards: 40, price: 1000 },
        { id: 'two-binders', cards: 150, price: 2500 },
        { id: 'bookshelf', cards: 400, price: 6000 },
        { id: 'card-room', cards: 1000, price: 20000 }
    ],

    // When the narrator comments on the player not doing anything
    idleJokesAt: [3 * MINUTE, 10 * MINUTE, 30 * MINUTE]
};
