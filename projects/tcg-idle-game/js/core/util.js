/**
 * Small helpers shared by every part of the game
 */

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;

export const Format = {
    // Money is stored as whole cents
    money: cents => '$' + (cents / 100).toFixed(2),
    clock: timestamp => new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
};

export function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Lay saved data over default data, so fields added in later versions get
 * their defaults and fields with the wrong type are ignored.
 *
 * - Objects are merged key by key. An empty default object accepts any saved
 *   object as-is (for maps keyed by id).
 * - Arrays are taken from the save if it has an array there.
 * - A null default accepts any saved value (for optional fields).
 * - Other values are taken from the save only if the type matches.
 *
 * @param {*} defaults - Default value
 * @param {*} saved - Saved value
 * @returns {*} - Merged value
 */
export function mergeDefaults(defaults, saved) {
    if (isPlainObject(defaults)) {
        if (!isPlainObject(saved)) {
            return defaults;
        }
        if (Object.keys(defaults).length === 0) {
            return saved;
        }
        const merged = {};
        for (const key of Object.keys(defaults)) {
            merged[key] = mergeDefaults(defaults[key], saved[key]);
        }
        return merged;
    }
    if (Array.isArray(defaults)) {
        return Array.isArray(saved) ? saved : defaults;
    }
    if (defaults === null) {
        return saved === undefined ? null : saved;
    }
    if (typeof saved !== typeof defaults || (typeof saved === 'number' && !Number.isFinite(saved))) {
        return defaults;
    }
    return saved;
}

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

/**
 * A repeating window on the real clock, lined up with local time.
 * For example every(15 * MINUTE) starts at :00, :15, :30, and :45, and
 * every(4 * HOUR, { duration: 3 * HOUR }) is open 00:00-03:00, 04:00-07:00, ...
 *
 * @param {number} period - Time between window starts
 * @param {Object} options - duration (default: the whole period), offset from midnight
 * @returns {Object} - Schedule
 */
export function every(period, { duration = period, offset = 0 } = {}) {
    // Shift timestamps so windows line up with the local clock, not UTC
    const localShift = time => new Date(time).getTimezoneOffset() * MINUTE;

    const lastStart = now => {
        const local = now - localShift(now) - offset;
        return Math.floor(local / period) * period + offset + localShift(now);
    };

    return {
        lastStart,
        nextStart: now => lastStart(now) + period,
        isOpen: now => now < lastStart(now) + duration,
        closesAt: now => lastStart(now) + duration
    };
}
