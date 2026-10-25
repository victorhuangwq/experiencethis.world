/**
 * Locations: the places the player can go. Each one has:
 *
 *   id              Location id (encounters use it too)
 *   name(game)      Name in the navigation; it can change as the game goes on
 *   visible(game)   Whether the player can go there yet
 *   render(game)    HTML for the scene
 */

import { Format } from '../core/util.js';
import { Rules } from '../rules.js';
import { Lines } from '../content/lines.js';
import { Cards } from '../content/cards.js';
import { Collection, bennyOffer } from '../systems/collection.js';
import { Vending } from '../systems/vending.js';
import { Wallet } from '../systems/wallet.js';
import { Art } from './art.js';
import { escape, button, art } from './html.js';

export const Locations = [
    {
        id: 'home',
        name: game => game.unlocked('shoebox') ? Lines.storage.names[Collection.storage(game)] : Lines.storage.closet,
        visible: () => true,
        render: renderHome
    },
    {
        id: 'mall',
        name: () => Lines.mall.name,
        visible: game => game.unlocked('mall'),
        render: renderMall
    },
    {
        id: 'gus',
        name: () => Lines.gus.name,
        visible: game => game.unlocked('gus'),
        render: renderGus
    }
];

/**
 * Home: the player's collection, in whatever they keep it in
 */
function renderHome(game) {
    const cards = game.state.collection.cards;
    const parts = [art(Art.storage(Collection.storage(game), game.state.story.shoebox))];

    const counts = new Map();
    for (const card of cards) {
        counts.set(card.name, (counts.get(card.name) || 0) + 1);
    }
    parts.push(`<p>${escape(Lines.storage.count(cards.length, counts.size))}</p>`);

    if (game.unlocked('benny-buys')) {
        const offer = bennyOffer(game);
        parts.push(`<p>${button('collection.sellDuplicates', Lines.benny.sell(offer.count, offer.cents), { disabled: offer.count === 0 })}</p>`);
    }

    // Checklists of fixed cards, showing only what has been found
    for (const [setId, set] of Object.entries(Cards.sets)) {
        const owned = Cards.fixed.filter(card => card.set === Number(setId) && Collection.owns(game, card.id));
        const total = Cards.fixed.filter(card => card.set === Number(setId)).length;
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
            items.push(`<li class="muted">${Lines.storage.unknown} x${total - owned.length}</li>`);
        }
        parts.push(`<h3>${escape(heading)}</h3><ul class="checklist">${items.join('')}</ul>`);
        if (!set.secret && owned.length < total) {
            parts.push(`<p class="muted">${escape(Lines.storage.unknownNote)}</p>`);
        }
    }

    // Everything else, best first
    const others = [...counts.keys()]
        .map(name => cards.find(card => card.name === name))
        .filter(card => !card.fixedId)
        .sort((a, b) => Cards.rarities.indexOf(b.rarity) - Cards.rarities.indexOf(a.rarity) || a.name.localeCompare(b.name));
    if (others.length > 0) {
        const items = others.map(card => {
            const count = counts.get(card.name);
            return `<li class="${card.rarity}">${escape(card.name)}${count > 1 ? ' x' + count : ''} <span class="muted">${card.rarity}</span></li>`;
        });
        parts.push(`<h3>${escape(Lines.storage.others)}</h3><ul class="checklist">${items.join('')}</ul>`);
    }

    return parts.join('');
}

/**
 * The back of the mall: the CARD-O-MATIC 3000
 */
function renderMall(game) {
    const vending = game.state.vending;
    const parts = [
        art(Art.machine(game.state, false)),
        `<p class="muted">${escape(Lines.mall.nextRestock(Format.clock(Vending.nextRestockAt(game))))}</p>`
    ];

    if (vending.jammedSlot !== null) {
        parts.push(`<p>${button('vending.kick', Lines.machine.kickJammed)} ${button('vending.walkAway', Lines.machine.walkAway)}</p>`);
        return parts.join('');
    }

    if (Vending.stockLeft(game) === 0) {
        parts.push(`<p>${escape(Lines.mall.empty)}</p>`);
    } else {
        const slots = vending.slots.map((kind, index) => {
            if (!kind) {
                return '';
            }
            const price = Rules.prices[kind];
            const label = `${Vending.slotLabel(index)}${kind === 'special' ? ' [**]' : ''} ${Format.money(price)}`;
            return button('vending.buy', label, { args: { slot: index }, disabled: !Wallet.canAfford(game, price) });
        });
        parts.push(`<p>${escape(Lines.machine.buy)} ${slots.filter(Boolean).join(' ')}</p>`);
    }

    parts.push(`<p>${button('vending.coinReturn', Lines.machine.coinReturn)} ${button('vending.kick', Lines.machine.kick)}</p>`);
    return parts.join('');
}

/**
 * Gus's Games & Grub, closed until summer
 */
function renderGus() {
    return art(Art.store) +
        `<p>${escape(Lines.gus.look)}</p>` +
        `<p>${button('people.knock', Lines.gus.knock)}</p>`;
}
