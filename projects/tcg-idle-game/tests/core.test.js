import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeDefaults } from '../js/core/merge.js';
import { nextRandom } from '../js/core/random.js';
import { every, MINUTE, HOUR } from '../js/core/time.js';
import { Format } from '../js/core/format.js';

test('mergeDefaults keeps saved values of the right type', () => {
    const defaults = { money: 0, name: '', flags: { a: false }, list: [] };
    const saved = { money: 5, name: 'x', flags: { a: true }, list: [1, 2] };
    assert.deepEqual(mergeDefaults(defaults, saved), saved);
});

test('mergeDefaults fills in fields the save does not have', () => {
    const merged = mergeDefaults({ money: 0, added: { count: 3 } }, { money: 5 });
    assert.deepEqual(merged, { money: 5, added: { count: 3 } });
});

test('mergeDefaults ignores values with the wrong type and drops unknown fields', () => {
    const merged = mergeDefaults({ money: 0, list: [] }, { money: 'lots', list: 'nope', removed: true });
    assert.deepEqual(merged, { money: 0, list: [] });
    assert.equal(mergeDefaults(0, NaN), 0);
    assert.equal(mergeDefaults(0, Infinity), 0);
});

test('mergeDefaults takes any object for an empty default, and anything for null', () => {
    assert.deepEqual(mergeDefaults({}, { anyKey: 1 }), { anyKey: 1 });
    assert.deepEqual(mergeDefaults(null, { id: 'pip' }), { id: 'pip' });
    assert.equal(mergeDefaults(null, undefined), null);
});

test('nextRandom is repeatable and stays between 0 and 1', () => {
    let seed = 42;
    const first = [];
    for (let i = 0; i < 1000; i++) {
        const [value, next] = nextRandom(seed);
        assert.ok(value >= 0 && value < 1);
        first.push(value);
        seed = next;
    }
    assert.equal(nextRandom(42)[0], first[0]);
    assert.ok(new Set(first).size > 990);
});

test('every() lines quarter hours up with the local clock', () => {
    const quarterHours = every(15 * MINUTE);
    const now = new Date(2026, 9, 25, 14, 7, 30).getTime();
    assert.equal(quarterHours.lastStart(now), new Date(2026, 9, 25, 14, 0).getTime());
    assert.equal(quarterHours.nextStart(now), new Date(2026, 9, 25, 14, 15).getTime());
});

test('every() handles windows shorter than their period', () => {
    // Open for 3 hours in every 4: 12:00-15:00, 16:00-19:00, ...
    const shows = every(4 * HOUR, { duration: 3 * HOUR });
    const at = (hour, minute = 0) => new Date(2026, 9, 25, hour, minute).getTime();
    assert.equal(shows.lastStart(at(14, 7)), at(12));
    assert.equal(shows.isOpen(at(14, 59)), true);
    assert.equal(shows.isOpen(at(15, 30)), false);
    assert.equal(shows.closesAt(at(14)), at(15));
    assert.equal(shows.nextStart(at(15, 30)), at(16));
});

test('every() follows the local clock in a time zone with a half-hour offset', (t) => {
    const original = process.env.TZ;
    process.env.TZ = 'Asia/Kolkata';
    t.after(() => {
        process.env.TZ = original;
    });
    const quarterHours = every(15 * MINUTE);
    const hourly = every(HOUR);
    const now = new Date(2026, 9, 25, 14, 7).getTime();
    assert.equal(new Date(quarterHours.lastStart(now)).getMinutes(), 0);
    assert.equal(new Date(hourly.lastStart(now)).getHours(), 14);
    assert.equal(new Date(hourly.lastStart(now)).getMinutes(), 0);
});

test('Format.money shows cents as dollars', () => {
    assert.equal(Format.money(0), '$0.00');
    assert.equal(Format.money(305), '$3.05');
    assert.equal(Format.money(57600), '$576.00');
});
