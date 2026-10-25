/**
 * Formatting for numbers and times shown to the player
 */

export const Format = {
    // Money is stored as whole cents
    money: cents => '$' + (cents / 100).toFixed(2),
    clock: timestamp => new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
};
