/**
 * Testing shortcuts, shown with ?dev in the page URL
 */

import { button } from '../html.js';

export function renderDevBar() {
    return '<p class="dev">Dev: ' +
        button('dev.money', '+$50') + ' ' +
        button('dev.restock', 'Restock now') + ' ' +
        button('dev.pip', 'Kid in line') + ' ' +
        button('dev.delete', 'Delete save and endings') + '</p>';
}
