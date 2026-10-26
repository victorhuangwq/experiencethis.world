/**
 * The back of the mall: the CARD-O-MATIC 3000. Its slots and coin return
 * are buttons on the machine itself.
 */

import { Format } from '../../core/format.js';
import { Rules } from '../../rules.js';
import { Lines } from '../../content/text/index.js';
import { Vending } from '../../systems/vending.js';
import { Wallet } from '../../systems/wallet.js';
import { machineHtml } from '../art/mall.js';
import { escape, button } from '../html.js';

export const MallScene = {
    id: 'mall',
    name: () => Lines.mall.name,
    visible: game => game.unlocked('mall'),
    render: renderMall
};

function renderMall(game) {
    const vending = game.state.vending;
    const usable = Vending.usable(game);

    const controls = {
        slot: (index, text) => {
            const kind = vending.slots[index];
            if (!kind || !usable) {
                return escape(text);
            }
            const price = Rules.prices[kind];
            return button('vending.buy', text, {
                args: { slot: index },
                disabled: !Wallet.canAfford(game, price),
                className: `art-button ${kind}`,
                title: Lines.mall.buttons.slot(Vending.slotLabel(index), Format.money(price))
            });
        },
        coinReturn: text => button('vending.coinReturn', text, {
            className: 'art-button',
            title: Lines.mall.buttons.coinReturn
        })
    };

    const parts = [
        `<pre class="art machine">${machineHtml(game.state, controls)}</pre>`,
        `<p class="muted">${escape(Lines.mall.nextRestock(Format.clock(Vending.nextRestockAt(game))))}</p>`
    ];

    if (vending.jammedSlot !== null) {
        parts.push(`<p>${button('vending.kick', Lines.mall.buttons.kickJammed)} ${button('vending.walkAway', Lines.mall.buttons.walkAway)}</p>`);
        return parts.join('');
    }

    if (Vending.stockLeft(game) === 0) {
        parts.push(`<p>${escape(Lines.mall.empty)}</p>`);
    }
    parts.push(`<p>${button('vending.kick', Lines.mall.buttons.kick)}</p>`);
    return parts.join('');
}
