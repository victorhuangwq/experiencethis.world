/**
 * Small HTML helpers for the UI
 */

export function escape(text) {
    return String(text).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);
}

/**
 * A button that runs a game action when clicked
 * @param {string} action - Action name, e.g. "vending.buy"
 * @param {string} label - Button text
 * @param {Object} options - args (sent with the action), disabled, className,
 *                           title (a description, for buttons whose text is art),
 *                           hidden (for a button that repeats another next to
 *                           it: left out of the tab order and screen readers)
 */
export function button(action, label, { args = {}, disabled = false, className = '', title = '', hidden = false } = {}) {
    const data = Object.entries(args).map(([key, value]) => ` data-${key}="${escape(value)}"`).join('');
    const classes = className ? ` class="${className}"` : '';
    const described = title ? ` title="${escape(title)}"${hidden ? '' : ` aria-label="${escape(title)}"`}` : '';
    const repeated = hidden ? ' tabindex="-1" aria-hidden="true"' : '';
    return `<button data-action="${action}"${data}${classes}${described}${repeated}${disabled ? ' disabled' : ''}>${escape(label)}</button>`;
}

/**
 * ASCII art, hidden from screen readers (the text around it says the same)
 */
export function art(text, className = '') {
    return `<pre class="art ${className}" aria-hidden="true">${escape(text)}</pre>`;
}
