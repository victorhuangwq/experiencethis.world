/**
 * Wallet: money (in whole cents) and the self-given allowance. The day job
 * is in job.js.
 */

import { MINUTE } from '../core/time.js';
import { Rules } from '../rules.js';
import { Lines } from '../content/text/index.js';

export const Wallet = {
    id: 'wallet',

    defaults: () => ({
        cents: 0,
        // Allowance has been paid up to this time
        paidUntil: 0,
        // Total allowance ever paid
        allowanceEarned: 0
    }),

    load(wallet, game, now) {
        wallet.paidUntil = Math.min(wallet.paidUntil, now);
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
        const cents = Wallet.owed(game, now);
        if (cents === 0) {
            return;
        }

        wallet.cents += cents;
        wallet.allowanceEarned += cents;
        wallet.paidUntil = capped ? now : wallet.paidUntil + cents * msPerCent;

        if (elapsed > MINUTE) {
            game.reportAway(Lines.money.allowanceAway(cents, capped));
        }
    },

    /**
     * The allowance owed for the time since it was last paid, up to the
     * piggy bank's limit. While the tab is hidden it builds up, to be paid
     * on coming back.
     */
    owed(game, now) {
        const elapsed = now - game.state.wallet.paidUntil;
        if (!game.unlocked('allowance') || elapsed < 0) {
            return 0;
        }
        return Math.floor(Math.min(elapsed, Rules.offlineCap) / (1000 / Rules.allowanceCentsPerSecond));
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
    }
};
