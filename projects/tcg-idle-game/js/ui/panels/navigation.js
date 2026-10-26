/**
 * Navigation between places. Places the player hasn't opened yet are
 * marked as new.
 */

import { Locations } from '../scenes/index.js';
import { escape } from '../html.js';

export function renderNavigation(game, currentId) {
    const places = Locations.filter(place => place.visible(game));
    if (places.length < 2) {
        return '';
    }
    return places.map(place => {
        const isNew = !game.state.story.visited.includes(place.id);
        const current = place.id === currentId ? ' class="current"' : '';
        return `<button data-action="go" data-location="${place.id}"${current}>` +
            `${escape(place.name(game))}${isNew ? ' <span class="new">new</span>' : ''}</button>`;
    }).join(' ');
}
