/**
 * The office. The player works here on office days; on other days it's
 * just their desk, waiting.
 */

import { Lines } from '../../content/text/index.js';
import { Job } from '../../systems/job.js';
import { Collection } from '../../systems/collection.js';
import { desk } from '../art/office.js';
import { escape, button, art } from '../html.js';
import { workButton } from '../panels/work.js';

// Emails in the inbox before the player answered any. Answering them only
// makes more.
const INBOX = 412;

export const OfficeScene = {
    id: 'office',
    name: () => Lines.job.name,
    visible: game => game.unlocked('work'),
    render: renderOffice
};

function renderOffice(game) {
    const workplace = Job.workplace(game);
    const parts = [
        art(desk(Job.desk(game), INBOX + game.state.job.emailsAnswered)),
        `<p>${escape(Lines.job.today[workplace || 'off'](Job.today(game)))}</p>`
    ];

    if (workplace === 'office') {
        parts.push(`<p>${workButton(game, 'office')}</p>`);
        if (Collection.unopened(game) > 0) {
            parts.push(`<p>${button('job.openAtDesk', Lines.job.openAtDesk)}</p>`);
        }
    }
    return parts.join('');
}
