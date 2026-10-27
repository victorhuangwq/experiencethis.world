/**
 * The status bar: money and unopened packs. Work is in the office or at
 * home (panels/work.js).
 */

import { Format } from '../../core/format.js';
import { Lines } from '../../content/text/index.js';
import { Catalog } from '../../content/catalog.js';
import { escape, button } from '../html.js';

export function renderStatus(game) {
    const parts = [];

    if (game.unlocked('allowance')) {
        parts.push(`<p>${Lines.money.label} <b data-money></b></p>`);
    }

    const packs = game.state.collection.packs.base;
    if (packs.normal > 0) {
        parts.push(`<p>${escape(Lines.packs.unopened(packs.normal))} ` +
            `${button('collection.open', Lines.packs.buttons.open, { args: { set: 'base', kind: 'normal' } })} ` +
            `${button('collection.smell', Lines.packs.buttons.smell)}</p>`);
    }
    if (packs.special > 0) {
        parts.push(`<p>${escape(Lines.packs.unopenedSpecial(packs.special))} ` +
            `${button('collection.open', Lines.packs.buttons.open, { args: { set: 'base', kind: 'special' } })}</p>`);
    }
    if (packs.mega > 0) {
        parts.push(`<p>${escape(Lines.packs.unopenedMega(packs.mega))} ` +
            `${button('collection.open', Lines.packs.buttons.open, { args: { set: 'base', kind: 'mega' } })}</p>`);
    }

    // Packs of later sets
    for (const set of Catalog.packSets().slice(1)) {
        const kinds = game.state.collection.packs[set.id];
        for (const [kind, line] of [['normal', Lines.packs.unopenedOf], ['mega', Lines.packs.unopenedMegaOf]]) {
            if (kinds[kind] > 0) {
                parts.push(`<p>${escape(line(set.short, kinds[kind]))} ` +
                    `${button('collection.open', Lines.packs.buttons.open, { args: { set: set.id, kind } })}</p>`);
            }
        }
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
