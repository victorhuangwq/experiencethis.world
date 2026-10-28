/**
 * Gus's Games & Grub: closed until the grand opening on the second day,
 * then the store. The player looks around by pressing parts of the store's
 * art: the shelves (packs), the corkboard (Gus talks about his
 * tournaments), Gus at the counter (he asks what it'll be), the glass case
 * (singles), and the table by the window (Marcus). One part is shown at a
 * time, and the scene's view remembers which.
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
import { Vending } from '../../systems/vending.js';
import { store, insideHtml } from '../art/gus.js';
import { escape, button, art } from '../html.js';

export const GusScene = {
    id: 'gus',
    name: () => Lines.gus.name,
    visible: game => game.unlocked('gus'),
    render: renderGus
};

/**
 * What can be shown below the store: each one's part of the art, and how
 * it's drawn. Gus's menu leads to the packs, grading, and the corkboard.
 */
const PANELS = {
    gus: { area: 'gus', render: renderGusMenu },
    packs: { area: 'shelves', render: renderPacks },
    grading: { area: 'gus', render: renderGrading },
    board: { area: 'board', render: renderBoard },
    case: { area: 'case', render: renderCase },
    table: { area: 'table', render: renderMarcus }
};

// Which panel each part of the art opens
const OPENS = { shelves: 'packs', board: 'board', gus: 'gus', case: 'case', table: 'table' };

/**
 * @param {Game} game - Game
 * @param {Object} view - panel: what is shown below the store
 */
function renderGus(game, view = {}) {
    if (!Store.isOpen(game)) {
        return art(store) +
            `<p>${escape(Lines.gus.look)}</p>` +
            `<p>${button('people.knock', Lines.gus.knock)}</p>`;
    }

    const panel = PANELS[view.panel] ? view.panel : null;
    const looking = panel && PANELS[panel].area;
    const area = (id, text, first) => button('view.set', text, {
        args: { panel: OPENS[id] },
        className: `art-area area-${id}${id === looking ? ' current' : ''}`,
        title: Lines.gus.areas[id],
        hidden: !first
    });
    const hour = new Date(game.time).getHours();
    const poster = Tournaments.clashStarted(game) ? 'clash' : game.unlocked('clash-poster') ? 'soon' : 'notices';
    const options = { marcus: Trades.here(game), newSet: !!Vending.newSet(game), night: hour < 6 || hour >= 20, poster };

    return `<pre class="art store wide">${insideHtml(options, area)}</pre>` +
        (panel ? PANELS[panel].render(game) : `<p>${escape(Lines.gus.inside)}</p>`);
}

/**
 * Something Gus can take the player back to his menu from
 */
function backToGus() {
    return `<p>${button('view.set', Lines.gus.somethingElse, { args: { panel: 'gus' }, className: 'quiet' })}</p>`;
}

/**
 * Gus asks what it'll be
 */
function renderGusMenu() {
    const choices = Object.entries(Lines.gus.ask).map(([panel, label]) => button('view.set', label, { args: { panel } }));
    return `<p>${escape(Lines.gus.greet)}</p><p>${choices.join(' ')}</p>`;
}

/**
 * The shelves: packs of every set that's out
 */
function renderPacks(game) {
    const packs = Store.packsForSale(game).map(({ set, price }) =>
        button('store.buyPack', Lines.gus.buyPack(Catalog.findSet(set).short, Format.money(price)), {
            args: { set },
            disabled: !Wallet.canAfford(game, price)
        }));
    return `<p>${escape(Lines.gus.shelvesSay)}</p><p>${packs.join(' ')}</p>` + backToGus();
}

/**
 * The corkboard: Gus talks about locals, and the pre-release for regulars.
 * Before his tourney, it's just the neighbourhood's notices.
 */
function renderBoard(game) {
    if (!game.unlocked('clash-poster')) {
        return `<p>${escape(Lines.tournaments.notices)}</p>` + backToGus();
    }
    if (!Tournaments.clashStarted(game)) {
        return `<h3>${escape(Lines.tournaments.localsTitle)}</h3><p>${escape(Lines.tournaments.posterSoon)}</p>` + backToGus();
    }
    return renderLocals(game) + renderPrerelease(game) + backToGus();
}

/**
 * The pre-release, for regulars, before a new set comes out
 */
function renderPrerelease(game) {
    const tournaments = game.state.tournaments;
    if (!game.unlocked('prerelease-invite') || !Tournaments.upcomingSet(game)) {
        return '';
    }
    const parts = [`<h3>${escape(Lines.tournaments.prereleaseTitle)}</h3>`];
    if (Tournaments.playedPrerelease(game)) {
        parts.push(`<p class="muted">${escape(Lines.tournaments.waitingForSummer)}</p>`);
    } else {
        parts.push(`<p>${escape(Lines.tournaments.prereleaseNote)}</p>`);
        const label = Lines.tournaments.enterPrerelease(Rules.prereleaseKitPacks, Format.money(Rules.prereleaseKitPrice));
        parts.push(`<p>${button('tournaments.enterPrerelease', label, { disabled: !Wallet.canAfford(game, Rules.prereleaseKitPrice) })}</p>`);
    }
    return parts.join('');
}

/**
 * Friday Night Clash, the local tourney, once a day
 */
function renderLocals(game) {
    const parts = [`<h3>${escape(Lines.tournaments.localsTitle)}</h3>`, `<p>${escape(Lines.tournaments.localsNote)}</p>`];
    if (Tournaments.localsOpen(game)) {
        const entry = Tournaments.localsEntry(game);
        parts.push(`<p>${button('tournaments.enterLocals', Lines.tournaments.enterLocals(Format.money(entry)), { disabled: !Wallet.canAfford(game, entry) })}</p>`);
    } else {
        parts.push(`<p class="muted">${escape(Lines.tournaments.nextLocals)}</p>`);
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
    parts.push(backToGus());
    return parts.join('');
}
