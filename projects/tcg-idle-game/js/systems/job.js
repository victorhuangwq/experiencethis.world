/**
 * Job: the day job. It's hybrid, by the real weekday: some days at the
 * office, some days at home, and weekends off (Rules.workplaces). At the
 * office there is a boss, a desk that fills up as the hobby takes over, and
 * Marcus from IT, who collects: he notices the cards on the desk, asks the
 * player to lunch (a game, once an office day), and after a couple of
 * lunches brings them a special pack each office day, at the machine's
 * price.
 */

import { localDay } from '../core/time.js';
import { Format } from '../core/format.js';
import { Rules } from '../rules.js';
import { Lines } from '../content/text/index.js';
import { Wallet } from './wallet.js';
import { Collection } from './collection.js';
import { Tournaments } from './tournaments.js';

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
        coworker: 0,
        // Lunches played with Marcus, and the day of the last one (a
        // localDay() number)
        lunches: 0,
        lunchDay: 0,
        // The day the player last bought Marcus's special pack
        packDay: 0
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
     * How far the hobby has taken over the desk, from 0 (a clean desk) to 6
     * (buried in cards): the furthest of these the player has got to
     */
    desk(game) {
        const storage = Rules.storage.findIndex(stage => stage.id === Collection.storage(game));
        const reached = [
            game.state.collection.packsOpened > 0,
            storage >= 1,
            storage >= 2,
            game.unlocked('clash-poster'),
            game.state.store.gradedBack > 0,
            game.state.story.season === 'summer'
        ];
        return reached.lastIndexOf(true) + 1;
    },

    /**
     * Whether the player can have lunch with Marcus now: on an office day,
     * once he has asked, once a day
     */
    lunchOpen(game, now = game.time) {
        const job = game.state.job;
        return Job.workplace(game, now) === 'office' && job.coworker >= 2 && job.lunchDay !== localDay(now);
    },

    /**
     * Whether Marcus has a special pack for the player today
     */
    packOpen(game, now = game.time) {
        const job = game.state.job;
        return Job.workplace(game, now) === 'office' && job.lunches >= Rules.lunchesBeforePacks && job.packDay !== localDay(now);
    },

    /**
     * Whether Marcus is looking over the partition: when he has a game or
     * a pack for the player
     */
    marcusAround(game, now = game.time) {
        return Job.lunchOpen(game, now) || Job.packOpen(game, now);
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

            // The coworker notices what is on the desk, then the binder
            if (at === 'office' && job.coworker === 0 && Job.desk(game) > 0) {
                job.coworker = 1;
                game.say(Lines.job.coworker.notices, 'good');
            } else if (at === 'office' && job.coworker === 1 && Job.desk(game) >= 2) {
                job.coworker = 2;
                game.say(Lines.job.coworker.binder, 'good');
            }
        },

        /**
         * Open a pack under the office desk
         */
        openAtDesk(game, args, now) {
            const pack = Collection.firstUnopened(game);
            if (!game.unlocked('work') || Job.workplace(game, now) !== 'office' || !pack) {
                return;
            }

            const job = game.state.job;
            Collection.actions.open(game, pack);
            job.packsOpenedAtDesk++;

            if (job.coworker === 1) {
                job.coworker = 2;
                game.say(Lines.job.coworker.lunch, 'good');
            } else if (game.chance(Rules.bossWalkByChance)) {
                job.bossWalkBys++;
                game.say(Lines.job.boss.walkBys[Math.min(job.bossWalkBys, Lines.job.boss.walkBys.length) - 1]);
            }
        },

        /**
         * Have lunch with Marcus: a game in the break room, with the
         * player's own cards
         */
        lunch(game, args, now) {
            const cards = Collection.loose(game);
            if (!Job.lunchOpen(game, now) || game.state.encounter || Tournaments.deckFrom(cards).length === 0) {
                return;
            }
            game.state.job.lunchDay = localDay(now);
            Tournaments.start(game, 'lunch', Tournaments.localsSet(game).set, cards, ['marcus']);
        },

        /**
         * Buy the special pack Marcus picked up on his way in, at the
         * machine's price
         */
        buyPack(game, args, now) {
            if (!Job.packOpen(game, now)) {
                return;
            }
            const price = Rules.prices.special;
            if (!Wallet.spend(game, price)) {
                game.say(Lines.job.coworker.cantAfford(Format.money(price)));
                return;
            }
            game.state.job.packDay = localDay(now);
            Collection.addPacks(game, 'base', 'special');
            game.say(Lines.job.coworker.boughtPack, 'good');
        }
    }
};
