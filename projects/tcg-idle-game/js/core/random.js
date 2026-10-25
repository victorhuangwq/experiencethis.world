/**
 * Seeded randomness. The game saves the seed, so reloading the page
 * can't reroll a result.
 */

/**
 * Advance a seeded random generator (mulberry32)
 * @param {number} seed - Current seed
 * @returns {Array} - [random number from 0 to 1, next seed]
 */
export function nextRandom(seed) {
    const next = (seed + 0x6D2B79F5) >>> 0;
    let t = next;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return [((t ^ (t >>> 14)) >>> 0) / 4294967296, next];
}
