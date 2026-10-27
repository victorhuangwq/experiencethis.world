/**
 * The checklists on Home: every card in each set, numbered, with the ones
 * the player hasn't found yet as ???. A set in packs is long, so it shows
 * one rarity at a time, with a tab for each. The Base Set's checklist comes
 * in the first pack; promos only show once one is found.
 */

import { Rules } from '../../rules.js';
import { Lines } from '../../content/text/index.js';
import { Catalog } from '../../content/catalog.js';
import { Collection } from '../../systems/collection.js';
import { escape, button } from '../html.js';

/**
 * @param {Game} game - Game
 * @param {Object} view - checklist: the rarity whose tab is open
 */
export function renderChecklists(game, view = {}) {
    if (!Collection.hasChecklist(game)) {
        return '';
    }
    const counts = Collection.counts(game);
    return Catalog.sets.map(set => renderSet(set, counts, view)).join('');
}

function renderSet(set, counts, view) {
    const cards = Catalog.inSet(set.id);
    const owned = cards.filter(card => counts.has(card.id));
    if ((set.hidden || set.secret) && owned.length === 0) {
        return '';
    }

    // Cards that aren't on any checklist are only listed once found
    if (set.secret) {
        const items = owned.map(card => `<li class="${card.rarity}"><b>${escape(card.name)}</b>${copies(counts, card)} ` +
            `<span class="muted">${escape(card.flavor)}</span></li>`);
        return `<h3>${escape(set.name)}</h3><ul class="checklist">${items.join('')}</ul>`;
    }

    const parts = [`<h3>${escape(set.name)}: ${owned.length}/${cards.length}</h3>`];
    let shown = cards;
    if (set.inPacks) {
        // A tab for each rarity, showing how many of it have been found
        const rarities = Catalog.rarities.filter(rarity => cards.some(card => card.rarity === rarity));
        const open = rarities.includes(view.checklist) ? view.checklist : rarities[0];
        const tabs = rarities.map(rarity => {
            const tier = cards.filter(card => card.rarity === rarity);
            const label = `${Lines.home.rarities[rarity]} ${tier.filter(card => counts.has(card.id)).length}/${tier.length}`;
            return button('view.set', label, { args: { checklist: rarity }, className: rarity === open ? 'current' : '' });
        });
        parts.push(`<p>${tabs.join(' ')}</p>`);
        shown = cards.filter(card => card.rarity === open);
    }

    // Numbers are each card's place in the whole set
    const items = shown.map(card => {
        const number = cards.indexOf(card) + 1;
        return counts.has(card.id)
            ? `<li class="${card.rarity}" title="${escape(card.name + '. ' + card.flavor)}">${number}. ${escape(card.name)}${copies(counts, card)}</li>`
            : `<li class="muted">${number}. ${Lines.home.unknown}</li>`;
    });
    parts.push(`<ol class="checklist checklist-grid">${items.join('')}</ol>`);

    if (set.inPacks) {
        const odds = Rules.hitOdds.hit;
        parts.push(`<p class="muted">${escape(Lines.home.odds(Math.round(1 / (odds.rare + odds['ultra-rare'])), Math.round(1 / odds['ultra-rare'])))}</p>`);
    } else if (owned.length < cards.length) {
        parts.push(`<p class="muted">${escape(Lines.home.unknownNote)}</p>`);
    }
    return parts.join('');
}

function copies(counts, card) {
    const count = counts.get(card.id);
    return count > 1 ? ' x' + count : '';
}
