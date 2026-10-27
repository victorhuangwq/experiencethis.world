/**
 * Unlocks: things that happen once, as soon as their condition is met.
 * The game checks these after every tick and action.
 *
 *   id          Saved once unlocked; game.unlocked(id) checks it
 *   when(game)  Condition
 *   run(game)   Optional: what happens when it unlocks
 */

import { Rules } from '../rules.js';
import { Lines } from './text/index.js';
import { Wallet } from '../systems/wallet.js';
import { Job } from '../systems/job.js';
import { Collection } from '../systems/collection.js';
import { Vending } from '../systems/vending.js';
import { Store } from '../systems/store.js';
import { Trades } from '../systems/trades.js';

export const Unlocks = [
    {
        // The shoebox decision is made; home becomes the player's storage
        id: 'shoebox',
        when: game => game.state.story.shoebox !== null
    },
    {
        id: 'allowance',
        when: game => game.unlocked('shoebox'),
        run: game => {
            Wallet.startAllowance(game);
            game.say(Lines.money.allowance);
        }
    },
    {
        // The day job; where it happens depends on the day
        id: 'work',
        when: game => game.state.wallet.allowanceEarned >= 60,
        run: game => game.say(Lines.job.unlocked[Job.workplace(game) || 'off'](Job.today(game)))
    },
    {
        id: 'mall',
        when: game => game.unlocked('allowance') && Wallet.canAfford(game, Rules.prices.normal),
        run: game => {
            game.say(Lines.mall.unlocked, 'good');
            Vending.tick(game, game.time);
        }
    },
    {
        id: 'benny-buys',
        when: game => game.unlocked('shoebox') && Collection.duplicates(game).length > 0,
        run: game => game.say(Lines.benny.arrives, 'good')
    },
    {
        id: 'gus',
        when: game => {
            const opened = game.state.collection.cardsOpened;
            return (game.state.people.pip.mentionedGus && opened >= Rules.gusWithTip) || opened >= Rules.gusWithoutTip;
        },
        run: game => game.say(game.state.people.pip.mentionedGus ? Lines.gus.unlockedWithTip : Lines.gus.unlockedWithoutTip, 'good')
    },
    {
        // The grand opening, on a later day than the first
        id: 'gus-open',
        when: game => game.unlocked('gus') && game.state.story.days >= Rules.gusOpensOnDay,
        run: game => {
            game.say(Lines.gus.opened, 'good');
            // Stock the case, and Marcus may be in already
            Store.tick(game, game.time);
            Trades.tick(game, game.time);
        }
    },
    // When the collection outgrows its storage, the next kind goes on sale
    ...Rules.storage.slice(1).map(stage => ({
        id: 'outgrew-' + stage.id,
        when: game => game.state.collection.cards.length >= stage.cards,
        run: game => {
            if (Collection.storageForSale(game) === stage) {
                game.say(Lines.home.outgrown[stage.id], 'warning');
            }
        }
    }))
];
