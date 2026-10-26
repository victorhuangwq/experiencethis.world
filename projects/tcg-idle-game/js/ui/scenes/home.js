/**
 * Home: the player's collection, in whatever they keep it in. The other
 * critters are shown by critters.js.
 */

import { Lines } from '../../content/text/index.js';
import { Catalog } from '../../content/catalog.js';
import { Collection, bennyOffer } from '../../systems/collection.js';
import { storage } from '../art/home.js';
import { escape, button, art } from '../html.js';
import { renderCritters } from './critters.js';

export const HomeScene = {
    id: 'home',
    name: game => game.unlocked('shoebox') ? Lines.home.names[Collection.storage(game)] : Lines.home.closet,
    visible: () => true,
    render: renderHome
};

function renderHome(game, view) {
    const cards = game.state.collection.cards;
    const parts = [art(storage(Collection.storage(game), game.state.story.shoebox))];

    const counts = new Map();
    for (const card of cards) {
        counts.set(card.name, (counts.get(card.name) || 0) + 1);
    }
    parts.push(`<p>${escape(Lines.home.count(cards.length, counts.size))}</p>`);

    if (game.unlocked('benny-buys')) {
        const offer = bennyOffer(game);
        parts.push(`<p>${button('collection.sellDuplicates', Lines.benny.sell(offer.count, offer.cents), { disabled: offer.count === 0 })}</p>`);
    }

    // Checklists of fixed cards, showing only what has been found
    for (const [setId, set] of Object.entries(Catalog.sets)) {
        const owned = Catalog.fixed.filter(card => card.set === Number(setId) && Collection.owns(game, card.id));
        const total = Catalog.fixed.filter(card => card.set === Number(setId)).length;
        if (set.secret && owned.length === 0) {
            continue;
        }

        const heading = set.secret ? set.name : `${set.name}: ${owned.length}/${total}`;
        const items = owned.map(card => {
            const count = cards.filter(owner => owner.fixedId === card.id).length;
            return `<li class="${card.rarity}"><b>${escape(card.name)}</b>${count > 1 ? ' x' + count : ''} ` +
                `<span class="muted">${card.rarity}, ${card.type}. ${escape(card.flavor)}</span></li>`;
        });
        if (!set.secret && owned.length < total) {
            items.push(`<li class="muted">${Lines.home.unknown} x${total - owned.length}</li>`);
        }
        parts.push(`<h3>${escape(heading)}</h3><ul class="checklist">${items.join('')}</ul>`);
        if (!set.secret && owned.length < total) {
            parts.push(`<p class="muted">${escape(Lines.home.unknownNote)}</p>`);
        }
    }

    parts.push(renderCritters(game, view));

    return parts.join('');
}
