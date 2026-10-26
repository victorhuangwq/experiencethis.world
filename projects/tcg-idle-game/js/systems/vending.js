/**
 * The CARD-O-MATIC 3000: restocks on the real clock every half hour or so,
 * sometimes jams, and hides things in its coin return
 */

import { MINUTE } from '../core/time.js';
import { Format } from '../core/format.js';
import { Rules } from '../rules.js';
import { Lines } from '../content/text/index.js';
import { Wallet } from './wallet.js';
import { Collection } from './collection.js';

export const Vending = {
    id: 'vending',

    defaults: () => ({
        restockedAt: 0,
        // When the delivery driver comes next
        nextRestockAt: 0,
        // One entry per slot: 'normal', 'special', or null when empty
        slots: [],
        // Packs bought since the last restock, and ever
        bought: 0,
        packsBought: 0,
        // Whether the kid in line has had their chance this restock
        pipChecked: false,
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
            return slot === 'normal' || slot === 'special' ? slot : null;
        });
        if (!Number.isInteger(vending.jammedSlot)) {
            vending.jammedSlot = null;
        }
    },

    /**
     * Restock when the delivery driver is due, every half hour or so.
     * The time of each visit is decided (and saved) after the one before.
     */
    tick(game, now) {
        if (!game.unlocked('mall')) {
            return;
        }

        const vending = game.state.vending;

        // The first time the machine is seen, it is full
        if (vending.restockedAt === 0) {
            vending.restockedAt = now;
            vending.nextRestockAt = Vending.driverDue(game, now);
            Vending.fill(game);
            return;
        }

        // If the clock went backwards, don't make the player wait for the old time
        if (vending.nextRestockAt === 0 || vending.nextRestockAt - now > Rules.restockEvery + Rules.restockVariation) {
            vending.nextRestockAt = Vending.driverDue(game, Math.min(vending.restockedAt, now));
        }
        if (now < vending.nextRestockAt) {
            return;
        }

        // After time away, only the latest visit matters
        while (vending.nextRestockAt <= now) {
            vending.restockedAt = vending.nextRestockAt;
            vending.nextRestockAt = Vending.driverDue(game, vending.restockedAt);
        }
        Vending.fill(game);

        const specialChance = Collection.attuned(game) ? Rules.attunedSpecialRestockChance : Rules.specialRestockChance;
        if (game.chance(specialChance)) {
            const slot = game.randomInt(0, Rules.slotCount - 1);
            vending.slots[slot] = 'special';
            game.say(Lines.mall.restockSpecial(Vending.slotLabel(slot)), 'good');
        } else if (!game.awayReport) {
            game.say(Lines.mall.restock);
        }
        game.reportAway(Lines.mall.restockAway);
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
     * Fill every slot with a normal pack
     */
    fill(game) {
        const vending = game.state.vending;
        vending.slots = new Array(Rules.slotCount).fill('normal');
        vending.bought = 0;
        vending.pipChecked = false;
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
        game.state.collection.packs[kind]++;
        game.say(Lines.mall.bought(Vending.slotLabel(index), kind === 'special'));
        game.emit('pack-bought', { index, kind });
    },

    actions: {
        buy(game, { slot }) {
            const vending = game.state.vending;
            const index = Number(slot);
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
        kick(game) {
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
                }
                return;
            }

            const line = Lines.mall.kicks[vending.kicks - 1] || game.pick(Lines.mall.kickMore);
            game.say(line, 'warning');
        },

        walkAway(game) {
            if (game.state.vending.jammedSlot === null) {
                return;
            }
            game.state.vending.jammedSlot = null;
            game.say(Lines.mall.walkAway);
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
