/**
 * Box: the massive box of cards from the player's childhood room. The
 * chewed dragon is on top; the rest are sorted into a stack for each type,
 * one at a time, by hand or by the SORT-O-MATIC, which runs on the wall clock
 * and keeps going while the player is away. Things turn up along the way
 * (Rules.boxFinds), and an empty box brings Benny and his offer.
 *
 * The box's cards are bulk: they aren't added to the collection. What the
 * player keeps of it is decided by Benny's offer (shoebox.js).
 */

import { Format } from '../core/format.js';
import { Rules } from '../rules.js';
import { Lines } from '../content/text/index.js';
import { Catalog } from '../content/catalog.js';
import { Wallet } from './wallet.js';

export const Box = {
    id: 'box',

    defaults: () => ({
        // Cards sorted so far, and how many are in each type's stack
        sorted: 0,
        stacks: { Fire: 0, Water: 0, Nature: 0 },
        // The card in the player's hand, from the Base Set's commons
        top: null,
        // The SORT-O-MATIC has sorted up to this time; 0 until it's bought
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
     * The SORT-O-MATIC sorts what it has had time for, and an empty box
     * brings Benny, as soon as nothing else is going on
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
                    Box.sort(game, Array.from({ length: count }, () => game.pick(Catalog.types)));
                }
            } else if (now < box.sorterAt) {
                // The clock went backwards; start again from now
                box.sorterAt = now;
            }
        }
        Box.checkEmpty(game);
    },

    /**
     * Put a new card in the player's hand
     */
    draw(game) {
        const commons = Catalog.inSet('base').filter(card => card.rarity === 'common');
        game.state.box.top = game.pick(commons).id;
    },

    /**
     * Add cards to their stacks, and find whatever was among them
     * @param {Game} game - Game
     * @param {Array} types - The type of each card
     */
    sort(game, types) {
        const box = game.state.box;
        const before = box.sorted;
        for (const type of types) {
            box.stacks[type]++;
        }
        box.sorted += types.length;

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
         * Put the card in hand on a type's stack. The wrong stack is not
         * the end of the world, only of the card's trip there.
         * @param {Object} args - type: the stack
         */
        sort(game, { type }) {
            const box = game.state.box;
            if (!Box.open(game) || game.state.encounter || Box.left(game) <= 0 || !box.top) {
                return;
            }
            if (type !== Catalog.find(box.top).type) {
                game.say(game.pick(Lines.box.wrong));
                return;
            }
            Box.sort(game, [type]);
            Box.draw(game);
            Box.checkEmpty(game);
        },

        /**
         * Buy the SORT-O-MATIC, which sorts the rest of the box
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
