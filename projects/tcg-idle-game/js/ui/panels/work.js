/**
 * The day job's button. It's in the office on office days and at home on
 * other days. Emails can be answered as fast as the player can click, for as
 * long as there are any.
 */

import { Lines } from '../../content/text/index.js';
import { escape, button } from '../html.js';

/**
 * @param {Game} game - Game
 * @param {string} at - Where the button is: 'office' or 'home'
 */
export function workButton(game, at) {
    const { inbox } = game.state.job;
    if (inbox <= 0) {
        return `${button('job.work', Lines.job.caughtUp, { args: { at }, disabled: true })} <span class="muted">${escape(Lines.job.inboxZero)}</span>`;
    }
    return button('job.work', Lines.job.answer(inbox), { args: { at } });
}
