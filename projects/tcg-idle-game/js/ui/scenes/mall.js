/**
 * The back of the mall: the CARD-O-MATIC 3000
 */

import { Format } from '../../core/format.js';
import { Rules } from '../../rules.js';
import { Lines } from '../../content/text/index.js';
import { Vending } from '../../systems/vending.js';
import { Wallet } from '../../systems/wallet.js';
import { machine } from '../art/mall.js';
import { escape, button, art } from '../html.js';

export const MallScene = {
    id: 'mall',
    name: () => Lines.mall.name,
    visible: game => game.unlocked('mall'),
    render: renderMall
};

function renderMall(game) {
    const vending = game.state.vending;
    const parts = [
        art(machine(game.state, false)),
        `<p class="muted">${escape(Lines.mall.nextRestock(Format.clock(Vending.nextRestockAt(game))))}</p>`
    ];

    if (vending.jammedSlot !== null) {
        parts.push(`<p>${button('vending.kick', Lines.mall.buttons.kickJammed)} ${button('vending.walkAway', Lines.mall.buttons.walkAway)}</p>`);
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
        parts.push(`<p>${escape(Lines.mall.buttons.buy)} ${slots.filter(Boolean).join(' ')}</p>`);
    }

    parts.push(`<p>${button('vending.coinReturn', Lines.mall.buttons.coinReturn)} ${button('vending.kick', Lines.mall.buttons.kick)}</p>`);
    return parts.join('');
}
