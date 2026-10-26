/**
 * Ending screens, and the count of endings found across every run
 */

import { Lines } from '../../content/text/index.js';
import { Endings } from '../../content/endings.js';
import { ArtByKey } from '../art/index.js';
import { escape, button, art } from '../html.js';

export function renderEndingsFound(game) {
    const found = game.endings.found();
    return found.length > 0 ? `<p class="muted">${Lines.endings.screen.found(found.length, Endings.length)}</p>` : '';
}

export function renderEnding(game, id) {
    const screen = Lines.endings.screen;
    const ending = Endings.find(item => item.id === id);
    const found = game.endings.found();
    const list = Endings.map(item => `<li>${found.includes(item.id) ? escape(item.name) : screen.unknown}</li>`).join('');

    return `
        <section class="ending">
            ${art(ArtByKey[ending.art]())}
            ${ending.lines(game).map(line => `<p>${escape(line)}</p>`).join('')}
            <h2>${escape(screen.theEnd(ending.name))}</h2>
            <p>${screen.found(found.length, Endings.length)}</p>
            <ul>${list}</ul>
            <p class="muted">${escape(ending.note)}</p>
            <p>${button('restart', screen.startOver)}</p>
        </section>
    `;
}
