/**
 * The day job's button. It's in the office on office days and at home on
 * home days, and fills back up while the player rests between emails.
 */

import { Lines } from '../../content/text/index.js';
import { Job } from '../../systems/job.js';
import { button } from '../html.js';

/**
 * @param {Game} game - Game
 * @param {string} at - Where the button is: 'office' or 'home'
 */
export function workButton(game, at) {
    const resting = Job.progress(game, game.time) < 1;
    const label = resting ? Lines.job.resting : Lines.job.answer;
    return button('job.work', label, { args: { at }, disabled: resting, className: 'cooldown' });
}

/**
 * Update how rested the work button looks without redrawing it, so it
 * stays clickable
 * @param {HTMLElement} element - Element the button may be in
 */
export function updateWork(element, game, now) {
    const work = element.querySelector('[data-action="job.work"]');
    if (work) {
        work.style.setProperty('--progress', Math.round(Job.progress(game, now) * 100) + '%');
    }
}
