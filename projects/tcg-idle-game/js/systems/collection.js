/**
 * Collection: the player's cards, unopened packs, and where they keep it all
 */

import { Rules } from '../rules.js';
import { Catalog } from '../content/catalog.js';
import { Cards } from './cards.js';
import { Lines } from '../content/text/index.js';
import { Wallet } from './wallet.js';

export const Collection = {
    id: 'collection',

    defaults: () => ({
        cards: [],
        nextId: 1,
        // Unopened packs, by set, then by kind
        packs: Object.fromEntries(Catalog.packSets().map(set => [set.id, { normal: 0, special: 0, mega: 0 }])),
        packsOpened: 0,
        cardsOpened: 0,
        // Most cards ever held at once
        mostCards: 0,
        // What the cards are kept in: an id from Rules.storage
        storage: 'shoebox',
        sniffs: 0,
        // Parts of a set's checklist the player has completed, like
        // 'base:common' or 'base'
        completed: [],
        // Ids of cards that came back from grading, sealed in a case
        graded: []
    }),

    load(collection) {
        collection.cards = collection.cards.map(card => Cards.unpack(card)).filter(card => card !== null);
        const highestId = collection.cards.reduce((highest, card) => Math.max(highest, card.id), 0);
        collection.nextId = Math.max(collection.nextId, highestId + 1);
        const ids = new Set(collection.cards.map(card => card.id));
        collection.graded = [...new Set(collection.graded)].filter(id => ids.has(id));

        if (!Rules.storage.some(stage => stage.id === collection.storage)) {
            collection.storage = 'shoebox';
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

    owns(game, cardId) {
        return game.state.collection.cards.some(card => card.cardId === cardId);
    },

    /**
     * How many copies of each card the player has
     * @returns {Map} - Catalogue id to count
     */
    counts(game) {
        const counts = new Map();
        for (const card of game.state.collection.cards) {
            counts.set(card.cardId, (counts.get(card.cardId) || 0) + 1);
        }
        return counts;
    },

    /**
     * Whether the player has the checklist yet. It comes in the first pack.
     */
    hasChecklist(game) {
        return game.state.collection.packsOpened > 0;
    },

    isGraded(game, card) {
        return game.state.collection.graded.includes(card.id);
    },

    /**
     * The cards in hand: not sealed in a grading case, and not away being
     * graded. Only these can be sold, traded, or played.
     */
    loose(game) {
        const locked = new Set([...game.state.collection.graded, ...game.state.store.grading.map(entry => entry.id)]);
        return game.state.collection.cards.filter(card => !locked.has(card.id));
    },

    /**
     * Take cards out of the collection
     * @param {Game} game - Game
     * @param {Array} cards - Cards to remove
     */
    remove(game, cards) {
        const removed = new Set(cards.map(card => card.id));
        const collection = game.state.collection;
        collection.cards = collection.cards.filter(card => !removed.has(card.id));
        collection.graded = collection.graded.filter(id => !removed.has(id));
    },

    /**
     * Find duplicate cards in hand, keeping the copy of each card in the
     * best condition
     * @returns {Array} - Duplicate cards
     */
    duplicates(game) {
        const kept = new Map();
        const duplicates = [];
        for (const card of Collection.loose(game)) {
            const current = kept.get(card.cardId);
            if (!current) {
                kept.set(card.cardId, card);
            } else if (card.condition > current.condition) {
                duplicates.push(current);
                kept.set(card.cardId, card);
            } else {
                duplicates.push(card);
            }
        }
        return duplicates;
    },

    /**
     * Say so when the player completes a rarity on a checklist, or a whole
     * set, the first time
     */
    checkCompleted(game) {
        const collection = game.state.collection;
        const counts = Collection.counts(game);
        for (const set of Catalog.sets.filter(each => each.inPacks)) {
            const cards = Catalog.inSet(set.id);
            const parts = Catalog.rarities
                .filter(rarity => cards.some(card => card.rarity === rarity))
                .map(rarity => ({ key: `${set.id}:${rarity}`, line: Lines.home.completed[rarity], cards: cards.filter(card => card.rarity === rarity) }));
            parts.push({ key: set.id, line: Lines.home.completed.set(set.name, cards.length), cards });

            for (const part of parts) {
                if (!collection.completed.includes(part.key) && part.cards.every(card => counts.has(card.id))) {
                    collection.completed.push(part.key);
                    game.say(part.line, 'good');
                }
            }
        }
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

    /**
     * How many unopened packs the player has, of every set and kind
     */
    unopened(game) {
        return Object.values(game.state.collection.packs)
            .reduce((sum, kinds) => sum + Object.values(kinds).reduce((total, count) => total + count, 0), 0);
    },

    /**
     * Give the player unopened packs
     * @param {Game} game - Game
     * @param {string} set - Set id
     * @param {string} kind - normal, special, or mega
     * @param {number} count - How many
     */
    addPacks(game, set, kind, count = 1) {
        game.state.collection.packs[set][kind] += count;
    },

    /**
     * The first set and kind of pack the player has unopened, if any
     * @returns {Object|null} - { set, kind }
     */
    firstUnopened(game) {
        for (const [set, kinds] of Object.entries(game.state.collection.packs)) {
            const kind = ['normal', 'special', 'mega'].find(each => kinds[each] > 0);
            if (kind) {
                return { set, kind };
            }
        }
        return null;
    },

    /**
     * Open packs and add their cards, marking the ones the player has never
     * had, then show them. Packs opened together are shown together.
     * @param {Game} game - Game
     * @param {string} set - The packs' set
     * @param {string} kind - normal, special, or mega
     * @param {number} count - How many packs
     * @returns {Array} - The cards
     */
    openPacks(game, set, kind, count = 1) {
        const collection = game.state.collection;
        const pulled = Array.from({ length: count }, () => Cards.openPack(game, kind, set)).flat();
        const before = collection.packsOpened;
        const firstOfSet = !collection.cards.some(card => Catalog.find(card.cardId).set === set);

        // Mark cards the player has never had before, once each
        const owned = new Set(collection.cards.map(card => card.cardId));
        const isNew = pulled.map(card => {
            const fresh = !owned.has(card.cardId);
            owned.add(card.cardId);
            return fresh;
        });
        const cards = Collection.add(game, pulled).map((card, index) => ({ ...card, isNew: isNew[index] }));

        collection.packsOpened += count;
        collection.cardsOpened += cards.length;

        if (before === 0) {
            game.say(Lines.packs.first);
            // The checklist is in the first pack
            game.say(Lines.packs.checklist(Catalog.inSet('base').length), 'good');
        } else if (firstOfSet) {
            // So is a new set's
            const newSet = Catalog.findSet(set);
            game.say(Lines.packs.newChecklist(newSet.short, Catalog.inSet(set).length), 'good');
        }
        const reached = threshold => before < threshold && collection.packsOpened >= threshold;
        if (reached(Rules.fastOpeningAfter)) {
            game.say(Lines.packs.faster, 'good');
        }
        if (reached(100)) {
            game.say(Lines.story.developer.hundredPacks);
        }
        Collection.checkCompleted(game);

        game.emit('pack-opened', { cards, kind, set });
        return cards;
    },

    attuned(game) {
        return game.state.collection.sniffs >= Rules.sniffsToAttune;
    },

    actions: {
        open(game, { set = 'base', kind }) {
            const collection = game.state.collection;
            if (!(collection.packs[set]?.[kind] > 0)) {
                return;
            }

            collection.packs[set][kind]--;
            if (collection.packsOpened > 0) {
                game.say({ special: Lines.packs.openSpecial, mega: Lines.packs.openMega }[kind] || Lines.packs.open);
            }
            Collection.openPacks(game, set, kind);
        },

        smell(game) {
            const collection = game.state.collection;
            if (Collection.unopened(game) === 0) {
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
            Collection.remove(game, [...duplicates]);
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
