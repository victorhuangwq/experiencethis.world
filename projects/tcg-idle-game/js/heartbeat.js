/**
 * A heartbeat for main.js, run as a worker. Browsers slow down timers in a
 * background tab (Chrome to once a minute after five minutes), but not a
 * worker's, so its beats keep the tab's title up to date while the player
 * is in another tab.
 */

setInterval(() => postMessage('beat'), 1000);
