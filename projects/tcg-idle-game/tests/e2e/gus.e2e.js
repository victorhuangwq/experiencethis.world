/**
 * Browser tests for Act 2: journeys through Gus's Games & Grub
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { browserTest, button, place, assertFits } from './browser.js';
import { Lines } from '../../js/content/text/index.js';
import { Format } from '../../js/core/format.js';
import { Rules } from '../../js/rules.js';

const HOUR = 60 * 60 * 1000;

// A save from before Act 2 that has found Gus's store, saved on a Thursday evening
const foundGus = readFileSync(new URL('../fixtures/save-save-upgrades.json', import.meta.url), 'utf8');
const savedAt = JSON.parse(foundGus).savedAt;

const money = async page => page.locator('[data-money]').textContent();

browserTest('Gus opens the day after the store is found, and sells packs at a markup', {
    save: foundGus,
    time: savedAt + 60 * 1000
}, async (page) => {
    await place(page, Lines.gus.name).click();
    await page.getByText(Lines.gus.look).waitFor();
    assert.match(await page.locator('#scene pre.art').textContent(), /TOMORROW/);

    await page.clock.fastForward(24 * HOUR);
    await page.getByText(Lines.gus.inside).waitFor();
    await page.locator('#log').getByText(Lines.gus.opened).waitFor();
    assert.equal(await button(page, Lines.gus.knock).count(), 0, 'the door is open');

    const before = await money(page);
    await button(page, Lines.gus.buyPack('Base Set', Format.money(Rules.gusPrices.base))).click();
    const cents = text => Math.round(Number(text.replace(/[^0-9.]/g, '')) * 100);
    assert.equal(cents(await money(page)), cents(before) - Rules.gusPrices.base);

    await page.setViewportSize({ width: 360, height: 740 });
    await assertFits(page, 'Gus\'s store on a phone');
});
