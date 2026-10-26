/**
 * The message log: newest first, with older lines fading out
 */

import { escape } from '../html.js';

const LOG_LINES = 12;

export function renderLog(game) {
    return game.messages.slice(0, LOG_LINES).map((message, index) => {
        const count = message.count > 1 ? ` <span class="muted">(x${message.count})</span>` : '';
        const opacity = Math.max(0.2, 1 - index * 0.08).toFixed(2);
        return `<p class="message ${message.kind}" style="opacity: ${opacity}">${escape(message.text)}${count}</p>`;
    }).join('');
}
