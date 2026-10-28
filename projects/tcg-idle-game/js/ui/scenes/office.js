/**
 * The office: the player's cubicle. They work here on office days; on
 * other days it's just their desk, waiting. Marcus looks over the partition
 * when he has a game or a pack for them.
 */

import { Format } from '../../core/format.js';
import { Rules } from '../../rules.js';
import { Lines } from '../../content/text/index.js';
import { Job } from '../../systems/job.js';
import { Collection } from '../../systems/collection.js';
import { Wallet } from '../../systems/wallet.js';
import { desk } from '../art/office.js';
import { escape, button, art } from '../html.js';
import { workButton } from '../panels/work.js';

// Emails in the inbox before the player answered any. Answering them only
// makes more.
const INBOX = 412;

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export const OfficeScene = {
    id: 'office',
    name: () => Lines.job.name,
    visible: game => game.unlocked('work'),
    render: renderOffice
};

/**
 * The calendar on the cubicle wall: today's date and the time, by the
 * player's clock
 */
export function calendar(time) {
    const now = new Date(time);
    const hour = now.getHours() % 12 || 12;
    return {
        month: MONTHS[now.getMonth()],
        day: Lines.job.days[now.getDay()].slice(0, 3).toUpperCase(),
        date: String(now.getDate()),
        time: `${hour}:${String(now.getMinutes()).padStart(2, '0')}${now.getHours() < 12 ? 'AM' : 'PM'}`
    };
}

function renderOffice(game) {
    const workplace = Job.workplace(game);
    const marcus = Job.marcusAround(game);
    const parts = [
        art(desk(Job.desk(game), { inbox: INBOX + game.state.job.emailsAnswered, calendar: calendar(game.time), marcus }), 'wide'),
        `<p>${escape(Lines.job.today[workplace || 'off'](Job.today(game)))}</p>`
    ];

    if (workplace === 'office') {
        parts.push(`<p>${workButton(game, 'office')}</p>`);
        if (Collection.unopened(game) > 0) {
            parts.push(`<p>${button('job.openAtDesk', Lines.job.openAtDesk)}</p>`);
        }
    }

    // Marcus, over the partition
    if (marcus) {
        const choices = [];
        if (Job.lunchOpen(game)) {
            choices.push(button('job.lunch', Lines.job.coworker.lunchButton));
        }
        if (Job.packOpen(game)) {
            const price = Rules.prices.special;
            choices.push(button('job.buyPack', Lines.job.coworker.packButton(Format.money(price)), { disabled: !Wallet.canAfford(game, price) }));
        }
        parts.push(`<p>${escape(Lines.job.coworker.around)}</p><p>${choices.join(' ')}</p>`);
    }
    return parts.join('');
}
