/**
 * The user interface. It draws the game into a few sections and only
 * redraws a section when its content changes, so buttons stay clickable
 * between ticks. One click handler serves every button: buttons name a
 * game action in data-action and pass arguments in other data attributes.
 */

import { Format } from '../core/util.js';
import { Rules } from '../rules.js';
import { Lines } from '../content/lines.js';
import { Endings } from '../content/endings.js';
import { Wallet } from '../systems/wallet.js';
import { Locations } from './locations.js';
import { PackReveal } from './reveal.js';
import { Art } from './art.js';
import { escape, button, art } from './html.js';

// Art for each encounter's art key
const EncounterArt = {
    shoebox: () => Art.shoebox(['CARDS - DO NOT', 'TOUCH']),
    machine: (game, encounter) => Art.machine(game.state, encounter.id === 'pip')
};

// Art for each ending's art key
const EndingArt = {
    guard: () => Art.guard
};

// How many log messages to show; older ones fade out
const LOG_LINES = 6;

export class UI {
    /**
     * @param {Game} game - Game
     * @param {HTMLElement} root - Element to draw into
     * @param {Object} options - devMode, onAction (after each action), onDev(action)
     */
    constructor(game, root, options = {}) {
        this.game = game;
        this.root = root;
        this.options = options;
        this.location = 'home';

        root.innerHTML = `
            <div id="dev-bar"></div>
            <div id="status"></div>
            <nav id="locations" aria-label="Places"></nav>
            <section id="scene"></section>
            <section id="reveal"></section>
            <section id="log" aria-live="polite"></section>
            <footer id="endings-found"></footer>
        `;
        this.parts = {};
        for (const element of root.querySelectorAll('[id]')) {
            this.parts[element.id] = element;
        }

        this.reveal = new PackReveal(this.parts.reveal);
        game.on('pack-opened', ({ cards }) => {
            this.reveal.show(cards, game.state.collection.packsOpened > Rules.fastOpeningAfter);
        });

        root.addEventListener('click', (event) => {
            const target = event.target.closest('[data-action]');
            if (target && !target.disabled) {
                this.handle({ ...target.dataset });
            }
        });
    }

    /**
     * Run a button's action
     * @param {Object} data - The button's data attributes
     */
    handle({ action, ...args }) {
        const now = Date.now();

        if (action === 'reveal.skip') {
            this.reveal.finish();
            return;
        }
        if (action === 'restart') {
            location.reload();
            return;
        }

        if (action === 'go') {
            this.location = args.location;
            this.game.perform('story.visit', args, now);
        } else if (action.startsWith('dev.')) {
            this.options.onDev?.(action);
        } else {
            this.game.perform(action, args, now);
        }

        this.options.onAction?.();
        this.render();
    }

    /**
     * Set an element's HTML only if it changed
     */
    setHTML(element, html) {
        if (element._html !== html) {
            element.innerHTML = html;
            element._html = html;
        }
    }

    /**
     * Redraw everything that changed
     */
    render() {
        const game = this.game;
        if (game.state.meta.ended) {
            this.reveal.stop();
            this.setHTML(this.root, this.endingScreen(game.state.meta.ended));
            return;
        }

        // An encounter pulls the player to where it happens
        const encounter = game.encounter();
        if (encounter) {
            this.location = encounter.location;
        }

        const now = Date.now();
        this.setHTML(this.parts['dev-bar'], this.options.devMode ? this.devBar() : '');
        this.setHTML(this.parts.status, this.status(now));
        this.setHTML(this.parts.locations, this.navigation());
        this.setHTML(this.parts.scene, encounter ? this.encounterScene(encounter) : this.currentLocation().render(game));
        this.setHTML(this.parts.log, this.log());
        this.setHTML(this.parts['endings-found'], this.endingsFound());

        // These change every second, so they are updated without redrawing
        const money = this.parts.status.querySelector('[data-money]');
        if (money) {
            money.textContent = Format.money(game.state.wallet.cents);
        }
        const work = this.parts.status.querySelector('[data-action="wallet.work"]');
        if (work) {
            work.style.setProperty('--progress', Math.round(Wallet.workProgress(game, now) * 100) + '%');
        }
    }

    currentLocation() {
        const location = Locations.find(place => place.id === this.location && place.visible(this.game));
        return location || Locations[0];
    }

    status(now) {
        const game = this.game;
        const parts = [`<p class="season">~ ${Lines.seasons[game.state.story.season]} ~</p>`];

        if (game.unlocked('allowance')) {
            parts.push(`<p>${Lines.status.money} <b data-money></b></p>`);
        }

        if (game.unlocked('work')) {
            const resting = Wallet.workProgress(game, now) < 1;
            parts.push(`<p>${button('wallet.work', resting ? Lines.work.resting : Lines.work.button, { disabled: resting, className: 'cooldown' })}</p>`);
        }

        const packs = game.state.collection.packs;
        if (packs.normal > 0) {
            parts.push(`<p>${escape(Lines.status.packs(packs.normal))} ` +
                `${button('collection.open', Lines.status.open, { args: { kind: 'normal' } })} ` +
                `${button('collection.smell', Lines.status.smell)}</p>`);
        }
        if (packs.special > 0) {
            parts.push(`<p>${escape(Lines.status.specialPacks(packs.special))} ` +
                `${button('collection.open', Lines.status.openSpecial, { args: { kind: 'special' } })}</p>`);
        }

        return parts.join('');
    }

    navigation() {
        const game = this.game;
        const places = Locations.filter(place => place.visible(game));
        if (places.length < 2) {
            return '';
        }
        return places.map(place => {
            const isNew = !game.state.story.visited.includes(place.id);
            const current = place.id === this.currentLocation().id;
            return `<button data-action="go" data-location="${place.id}"${current ? ' class="current"' : ''}>` +
                `${escape(place.name(game))}${isNew ? ' <span class="new">new</span>' : ''}</button>`;
        }).join(' ');
    }

    encounterScene(encounter) {
        const game = this.game;
        const choices = encounter.choices(game).map((choice, index) =>
            button('encounter.choose', choice.label, { args: { index }, disabled: choice.disabled }));
        return art(EncounterArt[encounter.art](game, encounter)) +
            `<div class="encounter">${encounter.text(game).map(line => `<p>${escape(line)}</p>`).join('')}</div>` +
            `<p>${choices.join(' ')}</p>`;
    }

    log() {
        return this.game.messages.slice(0, LOG_LINES).map((message, index) => {
            const count = message.count > 1 ? ` <span class="muted">(x${message.count})</span>` : '';
            return `<p class="message ${message.kind} age-${index}">${escape(message.text)}${count}</p>`;
        }).join('');
    }

    endingsFound() {
        const found = this.game.endings.found();
        return found.length > 0 ? `<p class="muted">Endings found: ${found.length}/${Endings.length}</p>` : '';
    }

    endingScreen(id) {
        const game = this.game;
        const ending = Endings.find(item => item.id === id);
        const found = game.endings.found();
        const list = Endings.map(item => `<li>${found.includes(item.id) ? escape(item.name) : '???'}</li>`).join('');

        return `
            <section class="ending">
                ${art(EndingArt[ending.art]())}
                ${ending.lines(game).map(line => `<p>${escape(line)}</p>`).join('')}
                <h2>THE END: ${escape(ending.name)}</h2>
                <p>Endings found: ${found.length}/${Endings.length}</p>
                <ul>${list}</ul>
                <p class="muted">${escape(ending.note)}</p>
                <p>${button('restart', 'Start over')}</p>
            </section>
        `;
    }

    devBar() {
        return '<p class="dev">Dev: ' +
            button('dev.money', '+$50') + ' ' +
            button('dev.restock', 'Restock now') + ' ' +
            button('dev.pip', 'Kid in line') + ' ' +
            button('dev.delete', 'Delete save and endings') + '</p>';
    }
}
