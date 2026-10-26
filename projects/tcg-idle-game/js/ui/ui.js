/**
 * The user interface shell. It lays out the page, routes button clicks to
 * the game, and redraws each section only when its content changes, so
 * buttons stay clickable between ticks. Buttons name a game action in
 * data-action and pass arguments in other data attributes.
 *
 * What each section shows lives elsewhere: scenes/ for places, panels/ for
 * everything around them, art/ for ASCII art, and reveal.js for packs.
 */

import { Rules } from '../rules.js';
import { Lines } from '../content/text/index.js';
import { Locations } from './scenes/index.js';
import { renderStatus, updateStatus } from './panels/status.js';
import { renderNavigation } from './panels/navigation.js';
import { renderEncounter } from './panels/encounter.js';
import { renderLog } from './panels/log.js';
import { renderEnding, renderEndingsFound } from './panels/ending.js';
import { renderDevBar } from './panels/dev.js';
import { PackReveal } from './reveal.js';

export class UI {
    /**
     * @param {Game} game - Game
     * @param {HTMLElement} root - Element to draw into
     * @param {Object} options - devMode, onAction (after each action), onDev(action),
     *                           seasonTag (element beside the title for the season)
     */
    constructor(game, root, options = {}) {
        this.game = game;
        this.root = root;
        this.options = options;
        this.location = 'home';

        // The game on the left and the log on the right. On a phone the log
        // becomes a strip at the top showing the newest line (see style.css).
        root.innerHTML = `
            <div id="dev-bar"></div>
            <div class="layout">
                <div class="game-column">
                    <div id="status"></div>
                    <nav id="locations" aria-label="Places"></nav>
                    <section id="scene"></section>
                    <section id="reveal"></section>
                    <footer id="endings-found"></footer>
                </div>
                <aside id="log-column" aria-label="Messages">
                    <section id="log" aria-live="polite"></section>
                    <button id="log-toggle" data-action="log.toggle" aria-expanded="false" aria-controls="log">${Lines.system.log.more}</button>
                </aside>
            </div>
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
        if (action === 'log.toggle') {
            this.toggleLog();
            return;
        }
        if (action === 'restart') {
            location.reload();
            return;
        }

        if (action === 'go') {
            this.goTo(args.location);
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
     * Show the whole log, or only the newest line (on phones)
     */
    toggleLog() {
        const expanded = this.parts['log-column'].classList.toggle('expanded');
        const toggle = this.parts['log-toggle'];
        toggle.setAttribute('aria-expanded', String(expanded));
        toggle.textContent = expanded ? Lines.system.log.less : Lines.system.log.more;
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
            this.setHTML(this.root, renderEnding(game, game.state.meta.ended));
            return;
        }

        // An encounter pulls the player to where it happens
        const encounter = game.encounter();
        if (encounter) {
            this.goTo(encounter.location);
        }
        const location = this.currentLocation();

        const now = Date.now();
        if (this.options.seasonTag) {
            this.setHTML(this.options.seasonTag, Lines.story.seasons[game.state.story.season]);
        }
        this.setHTML(this.parts['dev-bar'], this.options.devMode ? renderDevBar() : '');
        this.setHTML(this.parts.status, renderStatus(game, now));
        this.setHTML(this.parts.locations, renderNavigation(game, location.id));
        this.setHTML(this.parts.scene, encounter ? renderEncounter(game, encounter) : location.render(game));
        this.setHTML(this.parts.log, renderLog(game));
        this.setHTML(this.parts['endings-found'], renderEndingsFound(game));
        updateStatus(this.parts.status, game, now);
    }

    /**
     * Show another place. Opened cards stay with the place they were opened in.
     */
    goTo(location) {
        if (location !== this.location) {
            this.location = location;
            this.reveal.clear();
        }
    }

    /**
     * The place being shown, falling back to home if it isn't open
     */
    currentLocation() {
        return Locations.find(place => place.id === this.location && place.visible(this.game)) || Locations[0];
    }
}
