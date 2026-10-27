/**
 * The checklists on Home: every card in each set, numbered, with the ones
 * the player hasn't found yet as ???. The Base Set's checklist comes in the
 * first pack; promos only show once one is found.
 */

import { Rules } from '../../rules.js';
import { Lines } from '../../content/text/index.js';
import { Catalog } from '../../content/catalog.js';
import { Collection } from '../../systems/collection.js';
import { escape } from '../html.js';

export function renderChecklists(game) {
    if (!Collection.hasChecklist(game)) {
        return '';
    }
    const counts = Collection.counts(game);
    return Catalog.sets.map(set => renderSet(set, counts)).join('');
}

function renderSet(set, counts) {
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
    if (set.inPacks) {
        const rarities = Catalog.rarities.filter(rarity => cards.some(card => card.rarity === rarity)).map(rarity => {
            const tier = cards.filter(card => card.rarity === rarity);
            return `${tier.filter(card => counts.has(card.id)).length}/${tier.length} ${Lines.home.rarities[rarity]}`;
        });
        parts.push(`<p class="muted">${rarities.join(' · ')}</p>`);
    }

    const items = cards.map((card, index) => counts.has(card.id)
        ? `<li class="${card.rarity}" title="${escape(card.flavor)}">${index + 1}. ${escape(card.name)}${copies(counts, card)}</li>`
        : `<li class="muted">${index + 1}. ${Lines.home.unknown}</li>`);
    parts.push(`<ol class="checklist checklist-grid">${items.join('')}</ol>`);

    if (set.inPacks) {
        const odds = Rules.hitOdds.normal;
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
