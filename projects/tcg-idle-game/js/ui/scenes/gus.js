/**
 * Gus's Games & Grub: closed until the grand opening on the second day,
 * then the store
 */

import { Format } from '../../core/format.js';
import { Lines } from '../../content/text/index.js';
import { Catalog } from '../../content/catalog.js';
import { Store } from '../../systems/store.js';
import { Wallet } from '../../systems/wallet.js';
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

    const parts = [art(inside()), `<p>${escape(Lines.gus.inside)}</p>`];

    const packs = Store.packsForSale(game).map(({ set, price }) =>
        button('store.buyPack', Lines.gus.buyPack(Catalog.findSet(set).short, Format.money(price)), {
            args: { set },
            disabled: !Wallet.canAfford(game, price)
        }));
    parts.push(`<p>${packs.join(' ')}</p>`);

    return parts.join('');
}
