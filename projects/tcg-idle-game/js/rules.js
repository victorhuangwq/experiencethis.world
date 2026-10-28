/**
 * Tuning values. See story/story.md (Pacing) for the targets behind them.
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
    // The chance an email is rarer than common, like a card; the rest are
    // common
    emailOdds: { 'ultra-rare': 0.02, rare: 0.08, uncommon: 0.25 },
    // The sticky note for the browser tab, which shows the player's money in
    // the tab's title. It's sold at the kitchen table on home days.
    stickyNotePrice: 2000,
    // Chance the boss walks past while a pack is opened at the desk
    bossWalkByChance: 0.25,
    // Lunches with Marcus before he starts bringing the player a special
    // pack each office day
    lunchesBeforePacks: 2,

    // CARD-O-MATIC 3000
    // The delivery driver comes every 25 to 35 minutes
    restockEvery: 30 * MINUTE,
    restockVariation: 5 * MINUTE,
    slotCount: 8,
    // A bundle is 3 normal packs; a mega pack is one big pack
    prices: { normal: 300, special: 600, bundle: 800, mega: 1000 },
    // The chance the driver puts each kind in a slot; the rest are normal.
    // Smelling 50 packs makes special packs turn up more.
    restockOdds: { mega: 0.02, special: 0.03, bundle: 0.06 },
    attunedRestockOdds: { mega: 0.02, special: 0.06, bundle: 0.06 },
    // Other people buy what's in the machine: each pack goes this many
    // minutes after the restock (between the two), the rarer ones first.
    // About half the normal packs are left when the driver comes back.
    soldAfter: { mega: [2, 8], special: [3, 10], bundle: [5, 15], normal: [10, 60] },
    jamChance: 0.04,
    coinReturnChance: 0.3,
    coinReturnCents: 25,
    keyAfterChecks: 8,
    keyChance: 0.06,
    keyGuaranteedAt: 40,

    // Packs, like the odds printed on a real pack. Each slot holds a card of
    // that rarity from the set in packs, or is a hit, which rolls its rarity
    // with the odds in hitOdds.
    packSlots: {
        normal: ['common', 'common', 'common', 'uncommon', 'hit'],
        special: ['common', 'common', 'uncommon', 'bigHit', 'bigHit'],
        mega: [...Array(9).fill('common'), 'uncommon', 'uncommon', 'uncommon', 'hit', 'hit', 'rareHit']
    },
    hitOdds: {
        hit: { 'ultra-rare': 0.05, rare: 0.3, uncommon: 0.65 },
        bigHit: { 'ultra-rare': 0.15, rare: 0.55, uncommon: 0.3 },
        rareHit: { 'ultra-rare': 0.15, rare: 0.85 }
    },
    // Chance each hit in a special pack is the vending machine's own promo
    primeChance: 0.05,
    // A copy's condition, from 1 to 10, is decided when it comes out of a
    // pack, with these odds
    packCondition: { 10: 0.1, 9: 0.3, 8: 0.3, 7: 0.2, 6: 0.1 },
    sniffsToAttune: 50,
    fastOpeningAfter: 20,

    // Pip turns up once the player has been playing for a while (so not
    // before the first restock), and has bought a few packs since it
    pipNotBefore: 20 * MINUTE,
    pipAfterPacks: 3,
    pipChance: 0.35,
    pipGiftChance: 0.3,

    // The scalper lines up behind the player once they've met Pip and bought
    // this many packs ever, then sometimes. Sometimes a kid is waiting
    // behind him.
    scalperAfterPacks: 8,
    scalperChance: 0.25,
    scalperKidChance: 0.4,

    // Terry waits for the drop in the minute before it, if the player is at
    // the machine too: always the first time, then sometimes
    camperWindow: MINUTE,
    camperChance: 0.4,

    // Kindness code
    maxStrikes: 3,

    // Cards opened before Gus's store appears, with and without Pip's tip
    gusWithTip: 40,
    gusWithoutTip: 60,
    // Gus's store opens on this day of play (counting separate days)
    gusOpensOnDay: 2,
    // Gus's price for a pack of each set, once it's out: a markup on the
    // machine's, and a big one on the new set
    gusPrices: { base: 450, backyard: 750 },
    // Friday Night Clash: Gus puts the poster up on this day of play, and
    // the first one is on this day. Summer, and Set 2, come the day after
    // the player plays the pre-release.
    posterOnDay: 3,
    clashFromDay: 4,
    // In summer, about this share of the machine's slots hold the new set
    // (special packs stay Base Set packs). It is cheap for how many people
    // want it, so other people buy it this many times sooner, and the
    // scalper comes more often.
    newSetShare: 0.5,
    newSetSellsSooner: 0.4,
    summerScalperChance: 0.4,
    // Gus's glass case of singles: what each spot holds (a rarity, or a hit
    // from hitOdds), restocked every few hours, at a multiple of each
    // card's value
    caseSlots: ['common', 'common', 'uncommon', 'uncommon', 'rare', 'rareHit'],
    caseRestockEvery: 4 * HOUR,
    singlesMarkup: 2,
    singlesMinPrice: 25,
    // Gus sends cards off to be graded. A grade multiplies a card's value
    // (grades below 6 count as 6), and Gus buys graded cards for a share
    // of it.
    gradingFee: 500,
    gradingTime: 24 * HOUR,
    gradeValue: { 10: 10, 9: 3, 8: 1.5, 7: 1, 6: 0.8 },
    gusBuysGraded: 0.5,

    // Marcus is at Gus's on these days of the week (from Sunday), from this
    // hour, and offers this many trades each day: one card for one, of the
    // same rarity. His cards have been traded around a bit.
    marcusFrom: { 0: 0, 4: 18, 5: 18, 6: 0 },
    marcusOffers: 3,
    marcusWear: 1,

    // Tournaments: three matches, each the best of three rounds. Each round
    // both players play a card; the one whose type beats the other's gets
    // this much extra power. A deck is the strongest few cards of each type.
    tournamentMatches: 3,
    typeBonus: 3,
    deckPerType: 3,
    // How often a regular plays the type they favour
    tellChance: 0.8,
    // How strong the regulars' cards are, by tournament
    opponentRarity: {
        locals: { uncommon: 0.3, rare: 0.5, 'ultra-rare': 0.2 },
        // Sealed: everyone plays with what they opened
        prerelease: { common: 0.35, uncommon: 0.4, rare: 0.2, 'ultra-rare': 0.05 },
        // Lunch with Marcus at the office: friendly
        lunch: { uncommon: 0.4, rare: 0.45, 'ultra-rare': 0.15 }
    },
    // Locals: once a day. Entry is buying this many packs from Gus, and the
    // prize is packs, by matches won.
    localsEntryPacks: 2,
    localsPrizes: { 3: 3, 2: 1 },
    // The pre-release: a kit of new-set packs, opened at the table, for
    // this much. Everyone gets the promo; each match won earns a pack.
    prereleaseKitPacks: 4,
    prereleaseKitPrice: 3000,

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
