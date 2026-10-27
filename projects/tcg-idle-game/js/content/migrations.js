/**
 * Save migrations. Each step upgrades a save's game data from the version
 * before it to its own version; js/core/save.js runs every step a save
 * needs, in order, and keeps the save as it was first.
 *
 * - Add a step when saved data changes shape: renamed, moved,
 *   restructured, or an id retired. New fields don't need one; the game
 *   fills them in from its defaults.
 * - A step is never changed once released. It must turn the same old save
 *   into the same result forever, so it may only use content that never
 *   changes: ids are permanent, and sets only grow at the end.
 * - Before releasing a new step, add a save from the current release to
 *   tests/fixtures/, and list any id it retires in tests/fixtures/ids.json.
 * - A step gets the save's game data as it was stored and should cope with
 *   missing parts. It may change the data in place, and returns it.
 */

import { Catalog } from './catalog.js';

const MINUTE = 60 * 1000;

export const Migrations = {
    /**
     * Version 3: what the first releases (Act 1, up to the checklists)
     * saved differently
     */
    3: game => {
        const collection = game.collection ||= {};
        const vending = game.vending;

        // Saves weren't stamped with their release yet. Releases before the
        // checklists saved whole cards and had no sell-out times.
        const beforeChecklists = !Array.isArray(vending?.goneAt) ||
            (collection.cards || []).some(card => Array.isArray(card) && card.length === 8);
        const story = game.story ||= {};
        story.release = beforeChecklists ? 'act-1' : 'checklists';

        // Cards were saved whole, and critters were made up at random
        if (Array.isArray(collection.cards)) {
            collection.cards = collection.cards.map(card => Array.isArray(card) && card.length === 8 ? fromFirstRelease(card) : card);
        }

        // Storage used to upgrade by itself, marked by storage-<id> unlocks
        const unlocked = game.progress?.unlocked;
        if (Array.isArray(unlocked)) {
            const earned = STORAGE_THEN.filter(id => unlocked.includes('storage-' + id));
            const best = earned[earned.length - 1];
            if (best && STORAGE_THEN.indexOf(best) > STORAGE_THEN.indexOf(collection.storage ?? 'shoebox')) {
                collection.storage = best;
            }
            game.progress.unlocked = unlocked.filter(id => !String(id).startsWith('storage-'));
        }

        // The machine's packs didn't sell out over time; they last until the
        // next restock
        if (vending && Array.isArray(vending.slots) && !Array.isArray(vending.goneAt)) {
            const untilRestock = Math.max(vending.nextRestockAt || 0, (vending.restockedAt || 0) + 35 * MINUTE);
            vending.goneAt = vending.slots.map(slot => slot ? untilRestock : 0);
        }

        return game;
    }
};

// Storage stages as they were when version 3 was made
const STORAGE_THEN = ['shoebox', 'binder', 'two-binders', 'bookshelf', 'card-room'];

// How many Base Set cards of each rarity there were when version 3 was made
const BASE_SET_THEN = { common: 60, uncommon: 36, rare: 18 };

/**
 * A card saved by the first releases: [id, name, type, rarity, power,
 * value, fixed card id, condition]. A named card stays itself. A critter
 * becomes a Base Set card of the same rarity, picked by its name, so copies
 * stay copies.
 * @returns {Array} - [id, catalogue id, condition]
 */
function fromFirstRelease([id, name, , rarity, , , fixedId, condition]) {
    if (Catalog.find(fixedId)) {
        return [id, fixedId, condition];
    }
    const kept = BASE_SET_THEN[rarity] ? rarity : 'common';
    const pool = Catalog.inSet('base').filter(card => card.rarity === kept).slice(0, BASE_SET_THEN[kept]);
    let hash = 0;
    for (const char of String(name)) {
        hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }
    return [id, pool[hash % pool.length].id, condition];
}
