/**
 * Job: the day job. It's hybrid, by the real weekday: some days at the
 * office, some days at home, and weekends off (Rules.workplaces). At the
 * office there is a boss, a coworker who collects, and a desk that fills up
 * as the hobby takes over.
 */

import { Format } from '../core/format.js';
import { Rules } from '../rules.js';
import { Lines } from '../content/text/index.js';
import { Wallet } from './wallet.js';
import { Collection } from './collection.js';

export const Job = {
    id: 'job',

    defaults: () => ({
        // When the player can answer another email
        readyAt: 0,
        emailsAnswered: 0,
        packsOpenedAtDesk: 0,
        bossWalkBys: 0,
        // The coworker who collects: 0 not met, 1 has seen the desk,
        // 2 has asked the player to lunch (with the binder)
        coworker: 0
    }),

    load(job, game, now) {
        job.readyAt = Math.min(job.readyAt, now + Rules.workRest);
    },

    /**
     * Where the player works today
     * @returns {string|null} - 'office', 'home', or null on a day off
     */
    workplace(game, now = game.time) {
        return Rules.workplaces[new Date(now).getDay()];
    },

    /**
     * Today's name, by the player's clock
     */
    today(game, now = game.time) {
        return Lines.job.days[new Date(now).getDay()];
    },

    /**
     * How rested the player is after an email, from 0 (just answered) to 1 (ready)
     */
    progress(game, now) {
        const remaining = game.state.job.readyAt - now;
        return remaining <= 0 ? 1 : 1 - remaining / Rules.workRest;
    },

    /**
     * What has piled up on the office desk, from 0 (nothing) to 3
     */
    desk(game) {
        const storage = Rules.storage.findIndex(stage => stage.id === Collection.storage(game));
        if (storage >= 2) {
            return 3;
        }
        if (storage >= 1) {
            return 2;
        }
        return game.state.collection.packsOpened > 0 ? 1 : 0;
    },

    actions: {
        /**
         * Answer an email, at home or at the office
         * @param {Object} args - at: where the player is answering it from
         */
        work(game, { at }, now) {
            if (!game.unlocked('work') || Job.progress(game, now) < 1) {
                return;
            }
            const workplace = Job.workplace(game, now);
            if (at !== workplace) {
                // A button left open from another day
                game.say(Lines.job.wrongPlace[workplace || 'off'](Job.today(game, now)));
                return;
            }

            const job = game.state.job;
            Wallet.earn(game, Rules.workPay);
            job.readyAt = now + Rules.workRest;
            job.emailsAnswered++;
            game.say(game.pick(Lines.job.emails) + ' +' + Format.money(Rules.workPay));

            // The coworker notices what is on the desk
            if (at === 'office' && job.coworker === 0 && Job.desk(game) > 0) {
                job.coworker = 1;
                game.say(Lines.job.coworker.notices, 'good');
            }
        },

        /**
         * Open a pack under the office desk
         */
        openAtDesk(game, args, now) {
            const packs = game.state.collection.packs;
            const kind = packs.normal > 0 ? 'normal' : 'special';
            if (!game.unlocked('work') || Job.workplace(game, now) !== 'office' || packs[kind] === 0) {
                return;
            }

            const job = game.state.job;
            Collection.actions.open(game, { kind });
            job.packsOpenedAtDesk++;

            if (job.coworker === 1) {
                job.coworker = 2;
                game.say(Lines.job.coworker.lunch, 'good');
            } else if (game.chance(Rules.bossWalkByChance)) {
                job.bossWalkBys++;
                game.say(Lines.job.boss.walkBys[Math.min(job.bossWalkBys, Lines.job.boss.walkBys.length) - 1]);
            }
        }
    }
};
