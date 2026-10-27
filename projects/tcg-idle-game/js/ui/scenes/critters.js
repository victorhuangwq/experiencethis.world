/**
 * How the player's cards are shown. Better storage means better
 * organisation: a pile in the shoebox, then nine-pocket binder pages, then
 * separate binders.
 */

import { Lines } from '../../content/text/index.js';
import { Catalog } from '../../content/catalog.js';
import { Collection } from '../../systems/collection.js';
import { pocket, emptyPocket } from '../art/home.js';
import { escape, button, art } from '../html.js';

// How many critters the shoebox list shows before trailing off
const PILE_LINES = 40;

// Pockets on a binder page
const POCKETS = 9;

/**
 * The binders the player has, for each kind of storage. Each one holds
 * the critters that pass its test.
 */
const Binders = {
    'binder': [{ id: 'all', holds: () => true }],
    'two-binders': [
        { id: 'good', holds: entry => entry.rarity !== 'common' },
        { id: 'commons', holds: entry => entry.rarity === 'common' }
    ],
    'bookshelf': byType(),
    'card-room': byType()
};

// A binder for each type, and one for wild cards
function byType() {
    return [...Catalog.types, Catalog.wildType].map(type => ({ id: type, holds: entry => entry.type === type }));
}

/**
 * One entry per card: how many copies the player has, and when the newest
 * one was added
 * @returns {Array} - { name, count, rarity, type, number, newest }
 */
export function critterEntries(game) {
    const entries = new Map();
    for (const card of game.state.collection.cards) {
        const entry = entries.get(card.cardId);
        if (entry) {
            entry.count++;
            entry.newest = Math.max(entry.newest, card.id);
        } else {
            entries.set(card.cardId, {
                name: card.name, count: 1, rarity: card.rarity, type: card.type, number: Catalog.number(card.cardId), newest: card.id
            });
        }
    }
    return [...entries.values()];
}

/**
 * The binders for a kind of storage, or null for the shoebox
 */
export function bindersFor(storage) {
    return Binders[storage] || null;
}

/**
 * Binder order: best rarity first, then by name
 */
export function sortForBinder(entries) {
    return [...entries].sort((a, b) =>
        Catalog.rarities.indexOf(b.rarity) - Catalog.rarities.indexOf(a.rarity) || a.name.localeCompare(b.name));
}

/**
 * One page of a binder
 * @param {Array} entries - Sorted entries in the binder
 * @param {number} page - Page wanted, from 1; kept within the binder
 * @returns {Object} - { page, pages, pockets }, with pockets null when empty
 */
export function binderPage(entries, page) {
    const pages = Math.max(1, Math.ceil(entries.length / POCKETS));
    const shown = Math.min(Math.max(1, Math.floor(page) || 1), pages);
    const pockets = entries.slice((shown - 1) * POCKETS, shown * POCKETS);
    while (pockets.length < POCKETS) {
        pockets.push(null);
    }
    return { page: shown, pages, pockets };
}

/**
 * The player's cards, on Home
 * @param {Game} game - Game
 * @param {Object} view - Which binder and page are open
 */
export function renderCritters(game, view) {
    const entries = critterEntries(game);
    if (entries.length === 0) {
        return '';
    }

    const binders = bindersFor(Collection.storage(game));
    const body = binders ? renderBinders(entries, binders, view) : renderPile(entries);
    return `<h3>${escape(Lines.home.others)}</h3>` + body;
}

/**
 * The shoebox: a list, newest on top
 */
function renderPile(entries) {
    const pile = [...entries].sort((a, b) => b.newest - a.newest);
    const items = pile.slice(0, PILE_LINES).map(entry =>
        `<li class="${entry.rarity}">${escape(entry.name)}${entry.count > 1 ? ' x' + entry.count : ''} <span class="muted">${entry.rarity}</span></li>`);
    const more = pile.length - PILE_LINES;

    return `<p class="muted">${escape(Lines.home.pile)}</p>` +
        `<ul class="checklist">${items.join('')}</ul>` +
        (more > 0 ? `<p class="muted">${escape(Lines.home.pileMore(more))}</p>` : '');
}

/**
 * Binders: tabs for each binder, then one page of pockets
 */
function renderBinders(entries, binders, view) {
    const binder = binders.find(each => each.id === view.binder) || binders[0];
    const { page, pages, pockets } = binderPage(sortForBinder(entries.filter(binder.holds)), Number(view.page));
    const parts = [];

    if (binders.length > 1) {
        const tabs = binders.map(each => {
            const count = entries.filter(each.holds).length;
            return button('view.set', `${Lines.home.binders[each.id]} (${count})`, {
                args: { binder: each.id, page: 1 },
                className: each === binder ? 'current' : ''
            });
        });
        parts.push(`<p>${tabs.join(' ')}</p>`);
    }

    const contents = pockets.map(entry => entry
        ? art(pocket(entry), `pocket ${entry.rarity}`)
        : art(emptyPocket, 'pocket muted'));
    parts.push(`<div class="pockets">${contents.join('')}</div>`);

    if (pages > 1) {
        parts.push('<p class="pages">' +
            button('view.set', '<', { args: { page: page - 1 }, disabled: page === 1, title: Lines.home.previousPage }) +
            ` ${escape(Lines.home.page(page, pages))} ` +
            button('view.set', '>', { args: { page: page + 1 }, disabled: page === pages, title: Lines.home.nextPage }) +
            '</p>');
    }

    // The pockets are art, so list what's on the page for screen readers
    const onPage = pockets.filter(Boolean).map(entry => `${entry.name} (${entry.rarity}${entry.count > 1 ? ', x' + entry.count : ''})`);
    parts.push(`<p class="visually-hidden">${escape(onPage.join(', '))}</p>`);

    return parts.join('');
}
