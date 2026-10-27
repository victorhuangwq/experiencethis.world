/**
 * Gus's Games & Grub: closed until the grand opening on the second day,
 * then the store: packs, the glass case of singles, and grading
 */

import { localDay } from '../../core/time.js';
import { Format } from '../../core/format.js';
import { Rules } from '../../rules.js';
import { Lines } from '../../content/text/index.js';
import { Catalog } from '../../content/catalog.js';
import { Store } from '../../systems/store.js';
import { Wallet } from '../../systems/wallet.js';
import { Collection } from '../../systems/collection.js';
import { Trades } from '../../systems/trades.js';
import { Tournaments } from '../../systems/tournaments.js';
import { store, inside } from '../art/gus.js';
import { escape, button, art } from '../html.js';

export const GusScene = {
    id: 'gus',
    name: () => Lines.gus.name,
    visible: game => game.unlocked('gus'),
    render: renderGus
};

function renderGus(game) {
    if (!Store.isOpen(game)) {
        return art(store) +
            `<p>${escape(Lines.gus.look)}</p>` +
            `<p>${button('people.knock', Lines.gus.knock)}</p>`;
    }

    const packs = Store.packsForSale(game).map(({ set, price }) =>
        button('store.buyPack', Lines.gus.buyPack(Catalog.findSet(set).short, Format.money(price)), {
            args: { set },
            disabled: !Wallet.canAfford(game, price)
        }));

    return [
        art(inside({ marcus: Trades.here(game) })),
        `<p>${escape(Lines.gus.inside)}</p>`,
        `<p>${packs.join(' ')}</p>`,
        renderLocals(game),
        renderCase(game),
        renderGrading(game),
        renderMarcus(game)
    ].join('');
}

/**
 * Friday Night Locals, every hour
 */
function renderLocals(game) {
    const parts = [`<h3>${escape(Lines.tournaments.localsTitle)}</h3>`, `<p>${escape(Lines.tournaments.localsNote)}</p>`];
    if (Tournaments.localsOpen(game)) {
        const entry = Tournaments.localsEntry(game);
        parts.push(`<p>${button('tournaments.enterLocals', Lines.tournaments.enterLocals(Format.money(entry)), { disabled: !Wallet.canAfford(game, entry) })}</p>`);
    } else {
        parts.push(`<p class="muted">${escape(Lines.tournaments.nextLocals(Format.clock(Tournaments.nextLocals(game))))}</p>`);
    }
    return parts.join('');
}

/**
 * Marcus at the table by the window, on his evenings and weekends
 */
function renderMarcus(game) {
    const parts = [`<h3>${escape(Lines.marcus.title)}</h3>`];
    if (!Trades.here(game)) {
        parts.push(`<p class="muted">${escape(Lines.marcus.away)}</p>`);
        return parts.join('');
    }
    parts.push(`<p>${escape(Lines.marcus.here(game.state.job.coworker > 0))}</p>`);
    const offers = game.state.trades.offers;
    if (offers.every(offer => offer === null)) {
        parts.push(`<p class="muted">${escape(Lines.marcus.noOffers)}</p>`);
        return parts.join('');
    }
    const items = offers.map((offer, index) => {
        if (!offer) {
            return '';
        }
        const give = Catalog.find(offer.give);
        const text = Lines.marcus.offer(give.name, give.rarity, Lines.gus.read(offer.condition), Catalog.find(offer.want).name);
        return `<li class="${give.rarity}">${escape(text)} ` +
            `${button('trades.trade', Lines.marcus.trade, { args: { index }, disabled: !Trades.spare(game, offer.want) })}</li>`;
    });
    parts.push(`<ul class="checklist">${items.join('')}</ul>`);
    return parts.join('');
}

/**
 * The glass case of singles
 */
function renderCase(game) {
    const items = game.state.store.singles.map((single, spot) => {
        if (!single) {
            return `<li class="muted">${escape(Lines.gus.emptySpot)}</li>`;
        }
        const card = Catalog.find(single.cardId);
        const price = Store.singlePrice(card.id);
        const text = Lines.gus.single(card.name, card.rarity, Lines.gus.read(single.condition), Format.money(price));
        return `<li class="${card.rarity}">${escape(text)} ` +
            `${button('store.buySingle', Lines.gus.buySingle, { args: { spot }, disabled: !Wallet.canAfford(game, price) })}</li>`;
    });
    return `<h3>${escape(Lines.gus.caseTitle)}</h3>` +
        `<ul class="checklist">${items.join('')}</ul>` +
        `<p class="muted">${escape(Lines.gus.caseNote)}</p>`;
}

/**
 * The grading counter: cards worth sending, cards away, and graded cards
 * Gus will buy
 */
function renderGrading(game) {
    const parts = [`<h3>${escape(Lines.gus.gradingTitle)}</h3>`, `<p>${escape(Lines.gus.gradingNote(Format.money(Rules.gradingFee)))}</p>`];

    const canSend = Wallet.canAfford(game, Rules.gradingFee);
    const candidates = Store.gradingCandidates(game).map(card =>
        `<li class="${card.rarity}">${escape(Lines.gus.candidate(card.name, card.rarity, Lines.gus.read(card.condition)))} ` +
        `${button('store.grade', Lines.gus.send(Format.money(Rules.gradingFee)), { args: { id: card.id }, disabled: !canSend })}</li>`);

    const cards = new Map(game.state.collection.cards.map(card => [card.id, card]));
    const away = game.state.store.grading.map(entry => {
        const when = Lines.gus.backAt(Format.clock(entry.backAt), localDay(entry.backAt) > localDay(game.time));
        return `<li class="muted">${escape(Lines.gus.away(cards.get(entry.id).name, when))}</li>`;
    });

    const graded = game.state.collection.cards.filter(card => Collection.isGraded(game, card)).map(card =>
        `<li class="${card.rarity}">${escape(Lines.gus.gradedCard(card.name, card.condition, Lines.gus.grades[card.condition]))} ` +
        `${button('store.sellGraded', Lines.gus.sellGraded(Format.money(Store.gradedOffer(card))), { args: { id: card.id } })}</li>`);

    const list = [...candidates, ...away, ...graded];
    if (list.length > 0) {
        parts.push(`<ul class="checklist">${list.join('')}</ul>`);
    }
    return parts.join('');
}
