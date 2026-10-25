/**
 * Gus's Games & Grub, closed until summer
 */

import { Lines } from '../../content/text/index.js';
import { store } from '../art/gus.js';
import { escape, button, art } from '../html.js';

export const GusScene = {
    id: 'gus',
    name: () => Lines.gus.name,
    visible: game => game.unlocked('gus'),
    render: renderGus
};

function renderGus() {
    return art(store) +
        `<p>${escape(Lines.gus.look)}</p>` +
        `<p>${button('people.knock', Lines.gus.knock)}</p>`;
}
