/**
 * Gus's Games & Grub, the hobby store. It opens on the second day of play
 * (Rules.gusOpensOnDay) and is always open after that, because Gus lives in
 * the back. Gus sells packs at a markup: they cost more than the machine's,
 * but he never runs out.
 */

import { Format } from '../core/format.js';
import { Rules } from '../rules.js';
import { Lines } from '../content/text/index.js';
import { Wallet } from './wallet.js';
import { Collection } from './collection.js';

export const Store = {
    id: 'store',

    defaults: () => ({
        packsBought: 0
    }),

    isOpen(game) {
        return game.unlocked('gus-open');
    },

    /**
     * The sets Gus has packs of, with their price
     * @returns {Array} - { set, price }
     */
    packsForSale(game) {
        return Object.entries(Rules.gusPrices).map(([set, price]) => ({ set, price }));
    },

    actions: {
        buyPack(game, { set }) {
            const forSale = Store.packsForSale(game).find(each => each.set === set);
            if (!Store.isOpen(game) || !forSale) {
                return;
            }
            if (!Wallet.spend(game, forSale.price)) {
                game.say(Lines.gus.cantAfford(Format.money(forSale.price)));
                return;
            }
            Collection.addPacks(game, set, 'normal');
            game.state.store.packsBought++;
            game.say(game.pick(Lines.gus.bought));
        }
    }
};
