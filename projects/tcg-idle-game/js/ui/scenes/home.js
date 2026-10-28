/**
 * Home: the player's collection, in whatever they keep it in, and the day
 * job on home days. The checklists are drawn by checklist.js and the cards
 * themselves by critters.js.
 */

import { Format } from '../../core/format.js';
import { Rules } from '../../rules.js';
import { Lines } from '../../content/text/index.js';
import { Collection, bennyOffer } from '../../systems/collection.js';
import { Wallet } from '../../systems/wallet.js';
import { Job } from '../../systems/job.js';
import { storage } from '../art/home.js';
import { escape, button, art } from '../html.js';
import { renderCritters } from './critters.js';
import { renderChecklists } from './checklist.js';
import { workButton } from '../panels/work.js';

export const HomeScene = {
    id: 'home',
    name: () => Lines.home.name,
    visible: () => true,
    render: renderHome
};

/**
 * Cards back from grading, sealed in hard plastic
 */
function renderGraded(game) {
    const graded = game.state.collection.cards.filter(card => Collection.isGraded(game, card));
    if (graded.length === 0) {
        return '';
    }
    const items = graded.map(card => `<li class="${card.rarity}">${escape(Lines.gus.gradedCard(card.name, card.condition, Lines.gus.grades[card.condition]))}</li>`);
    return `<h3>${escape(Lines.home.graded)}</h3><ul class="checklist">${items.join('')}</ul>`;
}

function renderHome(game, view) {
    const cards = game.state.collection.cards;
    const forSale = Collection.storageForSale(game);
    const parts = [];

    // On home days, work happens at the kitchen table, next to a sticky note
    // for the tab
    if (game.unlocked('work') && Job.workplace(game) === 'home') {
        parts.push(`<p>${escape(Lines.job.kitchenTable(Job.today(game)))} ${workButton(game, 'home')}</p>`);
        if (!game.state.job.stickyNote) {
            const price = Rules.stickyNotePrice;
            parts.push(`<p>${button('job.buyStickyNote', Lines.job.stickyNote.buy(Format.money(price)), { disabled: !Wallet.canAfford(game, price) })}</p>`);
        }
    }

    parts.push(art(storage(Collection.storage(game), game.state.story.shoebox, !!forSale)));

    const different = Collection.counts(game).size;
    parts.push(`<p>${escape(Lines.home.count(Lines.home.names[Collection.storage(game)], cards.length, different))}</p>`);

    if (forSale) {
        const label = `${Lines.home.buy[forSale.id]} (${Format.money(forSale.price)})`;
        parts.push(`<p>${button('collection.buyStorage', label, { disabled: !Wallet.canAfford(game, forSale.price) })}</p>`);
    }

    if (game.unlocked('benny-buys')) {
        const offer = bennyOffer(game);
        parts.push(`<p>${button('collection.sellDuplicates', Lines.benny.sell(offer.count, offer.cents), { disabled: offer.count === 0 })}</p>`);
    }

    parts.push(renderChecklists(game, view));
    parts.push(renderGraded(game));
    parts.push(renderCritters(game, view));

    return parts.join('');
}
