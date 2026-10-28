/**
 * The day job's button. It's in the office on office days and at home on
 * home days, and fills back up while the player rests between emails. At
 * home there's a side feature too, once the player has a second monitor,
 * and the tab's title keeps count of it.
 */

import { Format } from '../../core/format.js';
import { Rules } from '../../rules.js';
import { Lines } from '../../content/text/index.js';
import { Job } from '../../systems/job.js';
import { Wallet } from '../../systems/wallet.js';
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
 * The side feature: a second monitor to buy first, then a button to start
 * one, or how the one being worked on is going (filled in by updateWork,
 * as it changes every second)
 */
export function renderFeature(game) {
    const job = game.state.job;
    if (job.featureStartedAt) {
        return '<span data-feature></span>';
    }
    if (!job.monitor) {
        const price = Rules.monitorPrice;
        return button('job.buyMonitor', Lines.job.feature.buyMonitor(Format.money(price)), { disabled: !Wallet.canAfford(game, price) });
    }
    return button('job.startFeature', Lines.job.feature.button);
}

/**
 * The tab's title while a side feature is being worked on, so the player
 * can watch it from another tab
 * @returns {string|null} - The title, or null to use the page's own
 */
export function tabTitle(game, now) {
    if (!game.state.job.featureStartedAt) {
        return null;
    }
    const earned = Format.money(Job.featureEarned(game, now));
    return now < Job.featureShipsAt(game) ? Lines.job.feature.title(earned) : Lines.job.feature.shippedTitle(earned);
}

/**
 * Update how rested the work button looks, and how the side feature is
 * going, without redrawing them, so buttons stay clickable
 * @param {HTMLElement} element - Element the button may be in
 */
export function updateWork(element, game, now) {
    const work = element.querySelector('[data-action="job.work"]');
    if (work) {
        work.style.setProperty('--progress', Math.round(Job.progress(game, now) * 100) + '%');
    }
    const feature = element.querySelector('[data-feature]');
    if (feature) {
        feature.textContent = Lines.job.feature.progress(Format.money(Job.featureEarned(game, now)), Format.clock(Job.featureShipsAt(game)));
    }
}
