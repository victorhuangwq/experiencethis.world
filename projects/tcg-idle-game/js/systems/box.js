/**
 * Box: the massive box of cards from the player's childhood room. The
 * chewed dragon is on top. Cards come out one at a time, most of them junk,
 * and things turn up among them (Rules.boxFinds), some of them cards to put
 * to one side (Rules.boxCardFinds). The bottom of the box is stuck together
 * (Rules.boxStuckAt), and only the SORT-O-MATIC can get through it. It runs
 * on the wall clock and keeps going while the player is away. An empty box
 * brings Benny and his offer.
 *
 * The junk isn't added to the collection. What the player keeps of the box
 * is decided by Benny's offer (shoebox.js).
 */

import { Format } from '../core/format.js';
import { Rules } from '../rules.js';
import { Lines } from '../content/text/index.js';
import { Catalog } from '../content/catalog.js';
import { Wallet } from './wallet.js';

export const Box = {
    id: 'box',

    defaults: () => ({
        // Cards out of the box so far
        sorted: 0,
        // The junk card last out, from the Base Set's commons, and what can
        // be said about it (an index into Lines.box.quirks)
        top: null,
        quirk: 0,
        // The SORT-O-MATIC has gone through the box up to this time; 0 until
        // it's bought
        sorterAt: 0
    }),

    load(box) {
        if (!Catalog.find(box.top)) {
            box.top = null;
        }
    },

    /**
     * Whether the box is still with the player, undecided
     */
    open(game) {
        return game.state.story.shoebox === null;
    },

    left(game) {
        return Rules.boxCards - game.state.box.sorted;
    },

    /**
     * Whether a card can come out by hand
     */
    canTake(game) {
        return Box.open(game) && !game.state.encounter && game.state.box.sorted < Rules.boxStuckAt;
    },

    /**
     * What's come out worth keeping: the finds put to one side, and the dragon
     */
    pile(game) {
        return 1 + Object.keys(Rules.boxCardFinds).filter(find => game.state.box.sorted >= Rules.boxFinds[find]).length;
    },

    /**
     * What the last card out of the box was
     * @returns {string|null} - Text, or null before the first card
     */
    reveal(game) {
        const { sorted, top, quirk } = game.state.box;
        const find = Object.keys(Rules.boxFinds).find(each => Rules.boxFinds[each] === sorted);
        if (find) {
            return Lines.box.finds[find];
        }
        const card = Catalog.find(top);
        return card ? Lines.box.junk(card.name, Lines.box.quirks[quirk]) : null;
    },

    /**
     * The SORT-O-MATIC goes through what it has had time for, and an empty
     * box brings Benny, as soon as nothing else is going on
     */
    tick(game, now) {
        if (!Box.open(game)) {
            return;
        }
        const box = game.state.box;
        if (box.top === null) {
            Box.draw(game);
        }
        if (box.sorterAt > 0) {
            const passes = Math.floor((now - box.sorterAt) / Rules.sorterEvery);
            if (passes > 0) {
                box.sorterAt += passes * Rules.sorterEvery;
                const count = Math.min(passes, Box.left(game));
                if (count > 0) {
                    game.reportAway(Lines.box.sorterAway(count));
                    Box.draw(game);
                    Box.take(game, count);
                }
            } else if (now < box.sorterAt) {
                // The clock went backwards; start again from now
                box.sorterAt = now;
            }
        }
        Box.checkEmpty(game);
    },

    /**
     * The next junk card out of the box
     */
    draw(game) {
        const commons = Catalog.inSet('base').filter(card => card.rarity === 'common');
        game.state.box.top = game.pick(commons).id;
        game.state.box.quirk = game.randomInt(0, Lines.box.quirks.length - 1);
    },

    /**
     * Take cards out of the box, and find whatever was among them
     * @param {Game} game - Game
     * @param {number} count - How many
     */
    take(game, count) {
        const box = game.state.box;
        const before = box.sorted;
        box.sorted += count;

        for (const [find, at] of Object.entries(Rules.boxFinds)) {
            if (before < at && box.sorted >= at) {
                game.say(Lines.box.finds[find], 'good');
                if (find === 'birthday') {
                    Wallet.earn(game, Rules.birthdayMoney);
                }
            }
        }
    },

    checkEmpty(game) {
        if (Box.left(game) <= 0 && !game.state.encounter) {
            game.startEncounter('shoebox-offer');
        }
    },

    actions: {
        /**
         * Take the next card out of the box
         */
        take(game) {
            if (!Box.canTake(game)) {
                return;
            }
            Box.draw(game);
            Box.take(game, 1);
            Box.checkEmpty(game);
        },

        /**
         * Buy the SORT-O-MATIC, which goes through the rest of the box
         */
        buySorter(game, args, now) {
            const box = game.state.box;
            if (!game.unlocked('sorter-ad') || !Box.open(game) || box.sorterAt > 0 || !Wallet.spend(game, Rules.sorterPrice)) {
                return;
            }
            box.sorterAt = now;
            game.say(Lines.box.sorterBought(Format.money(Rules.sorterPrice)), 'good');
        }
    }
};
