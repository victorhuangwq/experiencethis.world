/**
 * Pack opening: the pack tears open, then the cards flip one at a time,
 * with a pause before the last (hit) card. It owns its own element and
 * timers, so the once-a-second redraw never interrupts it.
 */

import { card, cardBack, packTear } from './art/cards.js';
import { escape, button, art } from './html.js';
import { Lines } from '../content/text/index.js';
import { Catalog } from '../content/catalog.js';

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

    /**
     * Put the cards away, for when the player leaves the place they opened them
     */
    clear() {
        this.stop();
        this.cards = [];
        this.frame = null;
        this.render();
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

        const skip = this.playing ? `<p>${button('reveal.skip', Lines.packs.buttons.skip)}</p>` : '';

        if (this.frame !== null) {
            this.element.innerHTML = art(packTear[this.frame]) + skip;
            return;
        }

        const cards = this.cards.map((pulled, index) => {
            if (index >= this.shown) {
                return art(cardBack, 'card');
            }
            const shiny = SHINY.includes(pulled.rarity) ? ' shiny' : '';
            return art(card(pulled), `card ${pulled.rarity}${shiny}`);
        }).join('');

        this.element.innerHTML = `<div class="cards">${cards}</div>` + (this.playing ? skip : this.summary());
    }

    /**
     * Text after the pack is open: a line for a good pull, what's new for
     * the checklist (with each new card's flavour text), and the cards as
     * text for screen readers
     */
    summary() {
        const best = Math.max(...this.cards.map(pulled => Catalog.rarities.indexOf(pulled.rarity)));
        const line = best >= 4 ? Lines.packs.legendary : best >= 2 ? Lines.packs.rare : '';
        const fresh = this.cards.filter(pulled => pulled.isNew);
        const list = this.cards.map(pulled => `${pulled.name} (${pulled.rarity})`).join(', ');

        const parts = [line ? `<p class="good">${escape(line)}</p>` : ''];
        if (fresh.length > 0) {
            parts.push(`<p class="good">${escape(Lines.packs.newCards(fresh.length))}</p>`);
            parts.push(...fresh.map(pulled => `<p class="new-card"><b class="${pulled.rarity}">${escape(pulled.name)}</b> ` +
                `<span class="muted">${escape(Catalog.number(pulled.cardId))} ${escape(Catalog.find(pulled.cardId).flavor)}</span></p>`));
        }
        parts.push(`<p class="visually-hidden">${escape(list)}</p>`);
        return parts.join('');
    }
}
