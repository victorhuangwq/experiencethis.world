/**
 * The status bar: money, work, and unopened packs
 */

import { Format } from '../../core/format.js';
import { Lines } from '../../content/text/index.js';
import { Wallet } from '../../systems/wallet.js';
import { escape, button } from '../html.js';

export function renderStatus(game, now) {
    const parts = [];

    if (game.unlocked('allowance')) {
        parts.push(`<p>${Lines.money.label} <b data-money></b></p>`);
    }

    if (game.unlocked('work')) {
        const resting = Wallet.workProgress(game, now) < 1;
        const label = resting ? Lines.money.work.resting : Lines.money.work.button;
        parts.push(`<p>${button('wallet.work', label, { disabled: resting, className: 'cooldown' })}</p>`);
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
export function updateStatus(element, game, now) {
    const money = element.querySelector('[data-money]');
    if (money) {
        money.textContent = Format.money(game.state.wallet.cents);
    }
    const work = element.querySelector('[data-action="wallet.work"]');
    if (work) {
        work.style.setProperty('--progress', Math.round(Wallet.workProgress(game, now) * 100) + '%');
    }
}
