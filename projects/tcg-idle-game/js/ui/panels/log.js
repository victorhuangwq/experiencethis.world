/**
 * The message log: a few lines, newest first, older ones fading out
 */

import { escape } from '../html.js';

const LOG_LINES = 6;

export function renderLog(game) {
    return game.messages.slice(0, LOG_LINES).map((message, index) => {
        const count = message.count > 1 ? ` <span class="muted">(x${message.count})</span>` : '';
        return `<p class="message ${message.kind} age-${index}">${escape(message.text)}${count}</p>`;
    }).join('');
}
