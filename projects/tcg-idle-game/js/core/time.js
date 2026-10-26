/**
 * Time constants, and repeating windows on the real clock
 */

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;

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
