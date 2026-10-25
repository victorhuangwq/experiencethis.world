/**
 * Pack opening: the pack tears open, then the cards flip one at a time,
 * with a pause before the last (hit) card. It owns its own element and
 * timers, so the once-a-second redraw never interrupts it.
 */

import { Art } from './art.js';
import { escape, button, art } from './html.js';
import { Lines } from '../content/lines.js';
import { Cards } from '../content/cards.js';

const SHINY = ['rare', 'ultra-rare', 'legendary'];

export class PackReveal {
    constructor(element) {
        this.element = element;
        this.cards = [];
        this.shown = 0;
        // Index of the tear animation frame, or null once the pack is open
        this.frame = null;
        this.timers = [];
        this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Open a pack on screen
     * @param {Array} cards - The pack's cards
     * @param {boolean} fast - Whether the player has opened enough packs to go faster
     */
    show(cards, fast) {
        this.stop();
        this.cards = cards;
        this.shown = 0;

        if (this.reducedMotion) {
            this.finish();
            return;
        }

        const step = fast ? 200 : 450;
        const pauseBeforeLast = fast ? 500 : 1100;
        let time = 0;

        this.frame = 0;
        this.render();
        this.after(time += step, () => this.setFrame(1));
        this.after(time += step, () => this.setFrame(null));
        cards.forEach((card, index) => {
            time += index === cards.length - 1 ? pauseBeforeLast : step;
            this.after(time, () => {
                this.shown = index + 1;
                this.render();
            });
        });
    }

    finish() {
        this.stop();
        this.frame = null;
        this.shown = this.cards.length;
        this.render();
    }

    get playing() {
        return this.frame !== null || this.shown < this.cards.length;
    }

    after(delay, callback) {
        this.timers.push(setTimeout(callback, delay));
    }

    stop() {
        this.timers.forEach(clearTimeout);
        this.timers = [];
    }

    setFrame(frame) {
        this.frame = frame;
        this.render();
    }

    render() {
        if (this.cards.length === 0) {
            this.element.innerHTML = '';
            return;
        }

        const skip = this.playing ? `<p>${button('reveal.skip', Lines.reveal.skip)}</p>` : '';

        if (this.frame !== null) {
            this.element.innerHTML = art(Art.packTear[this.frame]) + skip;
            return;
        }

        const cards = this.cards.map((card, index) => {
            if (index >= this.shown) {
                return art(Art.cardBack, 'card');
            }
            const shiny = SHINY.includes(card.rarity) ? ' shiny' : '';
            return art(Art.card(card), `card ${card.rarity}${shiny}`);
        }).join('');

        this.element.innerHTML = `<div class="cards">${cards}</div>` + (this.playing ? skip : this.summary());
    }

    /**
     * Text after the pack is open: a line for a good pull, and the cards as
     * text for screen readers
     */
    summary() {
        const best = Math.max(...this.cards.map(card => Cards.rarities.indexOf(card.rarity)));
        const line = best >= 4 ? Lines.packs.legendary : best >= 2 ? Lines.packs.rare : '';
        const list = this.cards.map(card => `${card.name} (${card.rarity})`).join(', ');
        return (line ? `<p class="good">${escape(line)}</p>` : '') +
            `<p class="visually-hidden">${escape(list)}</p>`;
    }
}
