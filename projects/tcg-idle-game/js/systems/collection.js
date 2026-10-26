/**
 * Collection: the player's cards, unopened packs, and where they keep it all
 */

import { Rules } from '../rules.js';
import { Cards } from './cards.js';
import { Lines } from '../content/text/index.js';
import { Wallet } from './wallet.js';

export const Collection = {
    id: 'collection',

    defaults: () => ({
        cards: [],
        nextId: 1,
        packs: { normal: 0, special: 0 },
        packsOpened: 0,
        cardsOpened: 0,
        // Most cards ever held at once
        mostCards: 0,
        // What the cards are kept in: an id from Rules.storage
        storage: 'shoebox',
        sniffs: 0
    }),

    load(collection, game) {
        collection.cards = collection.cards.map(card => Cards.unpack(card)).filter(card => card !== null);
        const highestId = collection.cards.reduce((highest, card) => Math.max(highest, card.id), 0);
        collection.nextId = Math.max(collection.nextId, highestId + 1);

        if (!Rules.storage.some(stage => stage.id === collection.storage)) {
            collection.storage = 'shoebox';
        }
        // Storage used to upgrade by itself; players keep what they already got
        for (const stage of Rules.storage) {
            if (game.unlocked('storage-' + stage.id) && storageIndex(stage.id) > storageIndex(collection.storage)) {
                collection.storage = stage.id;
            }
        }
    },

    save(collection) {
        return { ...collection, cards: collection.cards.map(card => Cards.pack(card)) };
    },

    /**
     * Add cards to the collection, giving each one an id
     * @param {Game} game - Game
     * @param {Array} cards - Cards without ids
     * @returns {Array} - The added cards
     */
    add(game, cards) {
        const collection = game.state.collection;
        const added = cards.map(card => ({ ...card, id: collection.nextId++ }));
        collection.cards.push(...added);
        collection.mostCards = Math.max(collection.mostCards, collection.cards.length);
        return added;
    },

    owns(game, fixedId) {
        return game.state.collection.cards.some(card => card.fixedId === fixedId);
    },

    /**
     * Find duplicate cards, keeping the most valuable copy of each name
     * @returns {Array} - Duplicate cards
     */
    duplicates(game) {
        const kept = new Map();
        const duplicates = [];
        for (const card of game.state.collection.cards) {
            const current = kept.get(card.name);
            if (!current) {
                kept.set(card.name, card);
            } else if (card.value > current.value) {
                duplicates.push(current);
                kept.set(card.name, card);
            } else {
                duplicates.push(card);
            }
        }
        return duplicates;
    },

    /**
     * What the player keeps their cards in
     * @returns {string} - Storage id from Rules.storage
     */
    storage(game) {
        return game.state.collection.storage;
    },

    /**
     * The storage after the current one, if the player has outgrown the
     * current one (it is for sale then)
     * @returns {Object|null} - Entry from Rules.storage
     */
    storageForSale(game) {
        const next = Rules.storage[storageIndex(Collection.storage(game)) + 1];
        return next && game.unlocked('outgrew-' + next.id) ? next : null;
    },

    attuned(game) {
        return game.state.collection.sniffs >= Rules.sniffsToAttune;
    },

    actions: {
        open(game, { kind }) {
            const collection = game.state.collection;
            if (!(collection.packs[kind] > 0)) {
                return;
            }

            collection.packs[kind]--;
            const pulled = Cards.openPack(game, kind);

            // Mark fixed cards the player has never had before
            const isNew = pulled.map(card => !!card.fixedId && !Collection.owns(game, card.fixedId));
            const cards = Collection.add(game, pulled).map((card, index) => ({ ...card, isNew: isNew[index] }));

            collection.packsOpened++;
            collection.cardsOpened += cards.length;

            if (collection.packsOpened === 1) {
                game.say(Lines.packs.first);
            } else {
                game.say(kind === 'special' ? Lines.packs.openSpecial : Lines.packs.open);
            }
            if (collection.packsOpened === Rules.fastOpeningAfter) {
                game.say(Lines.packs.faster, 'good');
            }
            if (collection.packsOpened === 100) {
                game.say(Lines.story.developer.hundredPacks);
            }

            game.emit('pack-opened', { cards, kind });
        },

        smell(game) {
            const collection = game.state.collection;
            if (collection.packs.normal + collection.packs.special === 0) {
                return;
            }

            collection.sniffs++;
            const special = Lines.packs.sniffs[collection.sniffs];
            if (special) {
                game.say(special, collection.sniffs === Rules.sniffsToAttune ? 'good' : 'info');
            } else {
                game.say(Collection.attuned(game) ? Lines.packs.sniffAttuned : game.pick(Lines.packs.sniff));
            }
        },

        /**
         * Buy the next storage, once the collection has outgrown this one
         */
        buyStorage(game) {
            const next = Collection.storageForSale(game);
            if (!next || !Wallet.spend(game, next.price)) {
                return;
            }
            game.state.collection.storage = next.id;
            game.say(Lines.home.upgraded[next.id], 'good');

            // The collection may already have outgrown this one too
            const after = Collection.storageForSale(game);
            if (after) {
                game.say(Lines.home.outgrown[after.id], 'warning');
            }
        },

        sellDuplicates(game) {
            if (!game.unlocked('benny-buys')) {
                return;
            }

            const duplicates = new Set(Collection.duplicates(game));
            if (duplicates.size === 0) {
                game.say(Lines.benny.none);
                return;
            }

            const value = [...duplicates].reduce((sum, card) => sum + card.value, 0);
            const paid = Math.floor(value * Rules.bennyShare);
            game.state.collection.cards = game.state.collection.cards.filter(card => !duplicates.has(card));
            Wallet.earn(game, paid);
            game.say(game.pick(Lines.benny.sold)(paid));
        }
    }
};

function storageIndex(id) {
    return Rules.storage.findIndex(stage => stage.id === id);
}

/**
 * What Benny would pay for the current duplicates
 */
export function bennyOffer(game) {
    const duplicates = Collection.duplicates(game);
    const value = duplicates.reduce((sum, card) => sum + card.value, 0);
    return { count: duplicates.length, cents: Math.floor(value * Rules.bennyShare) };
}
