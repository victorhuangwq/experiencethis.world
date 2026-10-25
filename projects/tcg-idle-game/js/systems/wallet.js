/**
 * Wallet: money (in whole cents), the self-given allowance, and work
 */

import { MINUTE, Format } from '../core/util.js';
import { Rules } from '../rules.js';
import { Lines } from '../content/lines.js';

export const Wallet = {
    id: 'wallet',

    defaults: () => ({
        cents: 0,
        // Allowance has been paid up to this time
        paidUntil: 0,
        // Total allowance ever paid
        allowanceEarned: 0,
        workReadyAt: 0
    }),

    load(wallet, game, now) {
        wallet.paidUntil = Math.min(wallet.paidUntil, now);
        wallet.workReadyAt = Math.min(wallet.workReadyAt, now + Rules.workRest);
    },

    /**
     * Pay the allowance for the time since it was last paid, including time
     * away, up to the piggy bank's limit
     */
    tick(game, now) {
        if (!game.unlocked('allowance')) {
            return;
        }

        const wallet = game.state.wallet;
        const elapsed = now - wallet.paidUntil;
        if (elapsed < 0) {
            // The clock went backwards; start again from now
            wallet.paidUntil = now;
            return;
        }

        const capped = elapsed > Rules.offlineCap;
        const msPerCent = 1000 / Rules.allowanceCentsPerSecond;
        const cents = Math.floor(Math.min(elapsed, Rules.offlineCap) / msPerCent);
        if (cents === 0) {
            return;
        }

        wallet.cents += cents;
        wallet.allowanceEarned += cents;
        wallet.paidUntil = capped ? now : wallet.paidUntil + cents * msPerCent;

        if (elapsed > MINUTE) {
            game.reportAway(Lines.allowanceAway(cents, capped));
        }
    },

    startAllowance(game) {
        game.state.wallet.paidUntil = game.time;
    },

    canAfford(game, cents) {
        return game.state.wallet.cents >= cents;
    },

    /**
     * Spend money if there is enough
     * @returns {boolean} - Whether the money was spent
     */
    spend(game, cents) {
        if (!Wallet.canAfford(game, cents)) {
            return false;
        }
        game.state.wallet.cents -= cents;
        return true;
    },

    earn(game, cents) {
        game.state.wallet.cents += cents;
    },

    /**
     * How rested the player is after work, from 0 (just worked) to 1 (ready)
     */
    workProgress(game, now) {
        const remaining = game.state.wallet.workReadyAt - now;
        return remaining <= 0 ? 1 : 1 - remaining / Rules.workRest;
    },

    actions: {
        work(game, args, now) {
            if (!game.unlocked('work') || Wallet.workProgress(game, now) < 1) {
                return;
            }
            Wallet.earn(game, Rules.workPay);
            game.state.wallet.workReadyAt = now + Rules.workRest;
            game.say(game.pick(Lines.work.done) + ' +' + Format.money(Rules.workPay));
        }
    }
};
