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
import { Collection } from '../systems/collection.js';
import { Vending } from '../systems/vending.js';

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
        id: 'work',
        when: game => game.state.wallet.allowanceEarned >= 60,
        run: game => game.say(Lines.money.work.unlocked)
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
    // Bigger storage as the collection grows
    ...Rules.storage.slice(1).map(stage => ({
        id: 'storage-' + stage.id,
        when: game => game.state.collection.mostCards >= stage.cards,
        run: game => game.say(Lines.home.upgraded[stage.id], 'good')
    }))
];
