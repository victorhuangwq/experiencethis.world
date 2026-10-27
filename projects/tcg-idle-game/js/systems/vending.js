/**
 * The CARD-O-MATIC 3000: restocks on the real clock every half hour or so
 * with a mix of packs, which other people buy up before the next restock,
 * the rarer ones first. It sometimes jams, and hides things in its coin
 * return.
 *
 * Everything runs on the wall clock: when the driver restocks, each pack is
 * given the time someone else will buy it, and the machine at any moment is
 * whatever hasn't been bought yet. Every restock the player missed is
 * played out when they come back, so the machine is the same whether they
 * watched or not.
 */

import { MINUTE } from '../core/time.js';
import { Format } from '../core/format.js';
import { Rules } from '../rules.js';
import { Lines } from '../content/text/index.js';
import { Wallet } from './wallet.js';
import { Collection } from './collection.js';

// Kinds of pack, from the least to the most special
const KINDS = ['normal', 'bundle', 'special', 'mega'];

export const Vending = {
    id: 'vending',

    kinds: KINDS,

    defaults: () => ({
        restockedAt: 0,
        // When the delivery driver comes next
        nextRestockAt: 0,
        // One entry per slot: a kind of pack, or null when empty
        slots: new Array(Rules.slotCount).fill(null),
        // When someone else buys each slot's pack
        goneAt: new Array(Rules.slotCount).fill(0),
        // Packs bought since the last restock, and ever
        bought: 0,
        packsBought: 0,
        // Whether the kid, the scalper, and Terry have had their chance
        // this restock
        pipChecked: false,
        scalperChecked: false,
        camperChecked: false,
        // Whether a kid is waiting behind the scalper
        kidBehind: false,
        // What the player agreed with Terry for the next drop: 'share',
        // 'first' (he goes first), or null
        dropDeal: null,
        jammedSlot: null,
        kicks: 0,
        coinChecks: 0,
        // The restock when the coin return was last checked
        coinCheckedAt: 0,
        hasKey: false
    }),

    load(vending) {
        vending.slots = Array.from({ length: Rules.slotCount }, (_, index) => {
            const slot = vending.slots[index];
            return KINDS.includes(slot) ? slot : null;
        });
        vending.goneAt = vending.slots.map((slot, index) => Number.isFinite(vending.goneAt[index]) ? vending.goneAt[index] : 0);
        if (!Number.isInteger(vending.jammedSlot)) {
            vending.jammedSlot = null;
        }
        if (!['share', 'first'].includes(vending.dropDeal)) {
            vending.dropDeal = null;
        }
    },

    /**
     * Restock when the delivery driver is due, every half hour or so, and
     * take away what other people have bought since
     */
    tick(game, now) {
        if (!game.unlocked('mall')) {
            return;
        }

        const vending = game.state.vending;

        // The first time the machine is seen, it is full of normal packs,
        // and nobody else buys them before the next restock
        if (vending.restockedAt === 0) {
            vending.restockedAt = now;
            vending.nextRestockAt = Vending.driverDue(game, now);
            vending.slots = new Array(Rules.slotCount).fill('normal');
            vending.goneAt = new Array(Rules.slotCount).fill(vending.nextRestockAt);
            return;
        }

        // If the clock went backwards, don't make the player wait for the old time
        if (vending.nextRestockAt === 0 || vending.nextRestockAt - now > Rules.restockEvery + Rules.restockVariation) {
            vending.nextRestockAt = Vending.driverDue(game, Math.min(vending.restockedAt, now));
        }

        if (now >= vending.nextRestockAt) {
            // Every visit the driver made happens, even unwatched
            while (vending.nextRestockAt <= now) {
                vending.restockedAt = vending.nextRestockAt;
                vending.nextRestockAt = Vending.driverDue(game, vending.restockedAt);
                Vending.restock(game);
            }
            Vending.sellOut(game, now);
            Vending.announceRestock(game);
        } else {
            Vending.sellOut(game, now);
            Vending.checkCamper(game, now);
        }
    },

    /**
     * When the driver comes after a visit: half an hour or so, on the minute
     * @param {Game} game - Game, for randomness
     * @param {number} after - Time of the visit before
     */
    driverDue(game, after) {
        const minutes = Math.round((Rules.restockEvery + game.randomInt(-Rules.restockVariation, Rules.restockVariation)) / MINUTE);
        return Math.floor(after / MINUTE) * MINUTE + minutes * MINUTE;
    },

    /**
     * The driver fills every slot. Most are normal packs; some are bundles,
     * special packs, or mega packs. Each one gets the time someone else
     * will buy it. A deal made with Terry happens now.
     */
    restock(game) {
        const vending = game.state.vending;
        const odds = Collection.attuned(game) ? Rules.attunedRestockOdds : Rules.restockOdds;
        vending.slots = [];
        vending.goneAt = [];
        for (let index = 0; index < Rules.slotCount; index++) {
            let roll = game.random();
            const kind = Object.keys(odds).find(each => (roll -= odds[each]) < 0) || 'normal';
            const [soonest, latest] = Rules.soldAfter[kind];
            vending.slots.push(kind);
            vending.goneAt.push(vending.restockedAt + game.randomInt(soonest * 60, latest * 60) * 1000);
        }

        vending.bought = 0;
        vending.pipChecked = false;
        vending.scalperChecked = false;
        vending.camperChecked = false;

        // The driver opens the machine, which unsticks a jam
        if (vending.jammedSlot !== null) {
            vending.jammedSlot = null;
            game.say(Lines.mall.driverUnjams);
        }

        // Terry takes his share of the drop: row B, or the best pack
        const deal = vending.dropDeal;
        vending.dropDeal = null;
        if (deal === 'share') {
            vending.slots.fill(null, Rules.slotCount / 2);
            game.say(Lines.terry.shared);
        } else if (deal === 'first') {
            const best = Vending.bestSlot(game);
            game.say(Lines.terry.wentFirst(Lines.mall.kinds[vending.slots[best]]));
            vending.slots[best] = null;
        }
    },

    /**
     * Take away the packs other people have bought by now, mentioning the
     * good ones if the player is there to see them go
     */
    sellOut(game, now) {
        const vending = game.state.vending;
        const watching = !game.awayReport && game.state.story.here === 'mall';
        vending.slots.forEach((kind, index) => {
            // A pack stuck in a jam can't be bought by anyone
            if (kind && vending.goneAt[index] <= now && index !== vending.jammedSlot) {
                vending.slots[index] = null;
                if (watching && kind !== 'normal') {
                    game.say(Lines.mall.someoneBought(Lines.mall.kinds[kind], Vending.slotLabel(index)));
                }
            }
        });
    },

    /**
     * Tell the player about the latest restock, or add it to the summary
     * of time away
     */
    announceRestock(game) {
        if (game.awayReport) {
            game.reportAway(Lines.mall.restockAway);
            return;
        }
        const best = Vending.bestSlot(game);
        const kind = best === -1 ? null : game.state.vending.slots[best];
        if (kind && kind !== 'normal') {
            game.say(Lines.mall.restockWith(Lines.mall.kinds[kind], Vending.slotLabel(best)), 'good');
        } else {
            game.say(Lines.mall.restock);
        }
        // A friend texts about a mega pack when the player isn't there
        if (kind === 'mega' && game.state.people.terry.friend && game.state.story.here !== 'mall') {
            game.say(Lines.terry.tip(Vending.slotLabel(best)), 'good');
        }
    },

    /**
     * In the minute before a drop, Terry may be waiting at the machine,
     * if the player is there to see him
     */
    checkCamper(game, now) {
        const vending = game.state.vending;
        const inWindow = now >= vending.nextRestockAt - Rules.camperWindow;
        if (!inWindow || vending.camperChecked || game.awayReport || game.state.encounter || game.state.story.here !== 'mall') {
            return;
        }
        vending.camperChecked = true;
        if (game.state.people.terry.encounters === 0 || game.chance(Rules.camperChance)) {
            game.startEncounter('camper');
        }
    },

    /**
     * The slot with the most special pack in it, or -1 if the machine is empty
     */
    bestSlot(game) {
        const slots = game.state.vending.slots;
        let best = -1;
        slots.forEach((kind, index) => {
            if (kind && (best === -1 || KINDS.indexOf(kind) > KINDS.indexOf(slots[best]))) {
                best = index;
            }
        });
        return best;
    },

    nextRestockAt(game) {
        return game.state.vending.nextRestockAt;
    },

    slotLabel(index) {
        return 'AB'[Math.floor(index / 4)] + (index % 4 + 1);
    },

    stockLeft(game) {
        return game.state.vending.slots.filter(slot => slot !== null).length;
    },

    /**
     * Whether the player can buy right now (no jam, nobody waiting)
     */
    usable(game) {
        return game.state.vending.jammedSlot === null && !game.state.encounter;
    },

    /**
     * Drop the pack from a slot into the player's hands
     * @param {Game} game - Game
     * @param {number} index - Slot index
     */
    dispense(game, index) {
        const vending = game.state.vending;
        const kind = vending.slots[index];
        vending.slots[index] = null;
        vending.bought++;
        vending.packsBought++;
        // A bundle is three normal packs
        if (kind === 'bundle') {
            Collection.addPacks(game, 'base', 'normal', 3);
        } else {
            Collection.addPacks(game, 'base', kind);
        }
        game.say(Lines.mall.bought(Vending.slotLabel(index), Lines.mall.kinds[kind]));
        game.emit('pack-bought', { index, kind });
    },

    actions: {
        buy(game, { slot }, now) {
            const vending = game.state.vending;
            const index = Number(slot);
            // Someone may have bought it since the machine was last looked at
            Vending.sellOut(game, now);
            const kind = vending.slots[index];
            if (!kind || !Vending.usable(game)) {
                return;
            }

            const price = Rules.prices[kind];
            if (!Wallet.spend(game, price)) {
                game.say(Lines.mall.cantAfford(Format.money(price)));
                return;
            }

            // Sometimes the machine takes the money and keeps the pack
            if (vending.packsBought >= 2 && game.chance(Rules.jamChance)) {
                vending.jammedSlot = index;
                game.say(Lines.mall.jammed(Vending.slotLabel(index)), 'warning');
                return;
            }

            Vending.dispense(game, index);
        },

        /**
         * Kick the machine. Frees a jammed pack half the time. Dale counts
         * every kick.
         */
        kick(game, args, now) {
            const vending = game.state.vending;
            vending.kicks++;

            if (vending.jammedSlot !== null) {
                const slot = vending.jammedSlot;
                vending.jammedSlot = null;
                if (game.chance(0.5)) {
                    game.say(Lines.mall.kickFree);
                    Vending.dispense(game, slot);
                } else {
                    game.say(Lines.mall.kickLost, 'warning');
                    // The pack is unstuck now, so someone else may have bought it
                    Vending.sellOut(game, now);
                }
                return;
            }

            const line = Lines.mall.kicks[vending.kicks - 1] || game.pick(Lines.mall.kickMore);
            game.say(line, 'warning');
        },

        walkAway(game, args, now) {
            if (game.state.vending.jammedSlot === null) {
                return;
            }
            game.state.vending.jammedSlot = null;
            game.say(Lines.mall.walkAway);
            Vending.sellOut(game, now);
        },

        /**
         * Check the coin return: usually nothing, sometimes a quarter (once
         * per restock at most), and once, the machine's key
         */
        coinReturn(game) {
            const vending = game.state.vending;
            vending.coinChecks++;

            const keyTime = vending.coinChecks >= Rules.keyAfterChecks &&
                (game.chance(Rules.keyChance) || vending.coinChecks >= Rules.keyGuaranteedAt);
            if (!vending.hasKey && keyTime) {
                vending.hasKey = true;
                game.say(Lines.mall.coinKey, 'good');
                return;
            }

            if (vending.coinCheckedAt !== vending.restockedAt) {
                vending.coinCheckedAt = vending.restockedAt;
                if (game.chance(Rules.coinReturnChance)) {
                    Wallet.earn(game, Rules.coinReturnCents);
                    game.say(Lines.mall.coinQuarter, 'good');
                    return;
                }
            }

            game.say(game.pick(Lines.mall.coinNothing));
        }
    }
};
