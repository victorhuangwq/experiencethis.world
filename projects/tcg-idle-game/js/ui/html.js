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
 *                           title (a description, for buttons whose text is art)
 */
export function button(action, label, { args = {}, disabled = false, className = '', title = '' } = {}) {
    const data = Object.entries(args).map(([key, value]) => ` data-${key}="${escape(value)}"`).join('');
    const classes = className ? ` class="${className}"` : '';
    const described = title ? ` title="${escape(title)}" aria-label="${escape(title)}"` : '';
    return `<button data-action="${action}"${data}${classes}${described}${disabled ? ' disabled' : ''}>${escape(label)}</button>`;
}

/**
 * ASCII art, hidden from screen readers (the text around it says the same)
 */
export function art(text, className = '') {
    return `<pre class="art ${className}" aria-hidden="true">${escape(text)}</pre>`;
}
