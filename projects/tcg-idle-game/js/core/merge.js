/**
 * Laying a save over the default state
 */

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
