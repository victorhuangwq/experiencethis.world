/**
 * Tuning values. See STORY.md (Pacing) for the targets behind them.
 * Money is in cents.
 */

import { SECOND, MINUTE, HOUR } from './core/time.js';

export const Rules = {
    // Money
    allowanceCentsPerSecond: 2,
    offlineCap: 8 * HOUR,
    workPay: 50,
    workRest: 20 * SECOND,
    shoeboxOffer: 300,
    bennyShare: 0.75,

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

    // Collection storage, by the most cards ever held at once
    storage: [
        { id: 'shoebox', cards: 0 },
        { id: 'binder', cards: 40 },
        { id: 'two-binders', cards: 150 },
        { id: 'bookshelf', cards: 400 },
        { id: 'card-room', cards: 1000 }
    ],

    // When the narrator comments on the player not doing anything
    idleJokesAt: [3 * MINUTE, 10 * MINUTE, 30 * MINUTE]
};
