/**
 * The status bar: money and unopened packs. Work is in the office or at
 * home (panels/work.js).
 */

import { Format } from '../../core/format.js';
import { Lines } from '../../content/text/index.js';
import { escape, button } from '../html.js';

export function renderStatus(game) {
    const parts = [];

    if (game.unlocked('allowance')) {
        parts.push(`<p>${Lines.money.label} <b data-money></b></p>`);
    }

    const packs = game.state.collection.packs;
    if (packs.normal > 0) {
        parts.push(`<p>${escape(Lines.packs.unopened(packs.normal))} ` +
            `${button('collection.open', Lines.packs.buttons.open, { args: { kind: 'normal' } })} ` +
            `${button('collection.smell', Lines.packs.buttons.smell)}</p>`);
    }
    if (packs.special > 0) {
        parts.push(`<p>${escape(Lines.packs.unopenedSpecial(packs.special))} ` +
            `${button('collection.open', Lines.packs.buttons.open, { args: { kind: 'special' } })}</p>`);
    }

    return parts.join('');
}

/**
 * Update the parts that change every second without redrawing the bar,
 * so its buttons stay clickable
 * @param {HTMLElement} element - The status bar
 */
export function updateStatus(element, game) {
    const money = element.querySelector('[data-money]');
    if (money) {
        money.textContent = Format.money(game.state.wallet.cents);
    }
}
