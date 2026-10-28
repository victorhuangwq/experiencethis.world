/**
 * Browser tests: whole journeys through the real page, as a player clicks
 * through them. Run them with npm run test:e2e after building the site.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { browserTest, reopen, button, place, assertFits, START } from './browser.js';
import { Lines } from '../../js/content/text/index.js';
import { Format } from '../../js/core/format.js';
import { Rules } from '../../js/rules.js';
import { Catalog } from '../../js/content/catalog.js';

const HOUR = 60 * 60 * 1000;

const BASE_SET = /^Critter Clash Base Set/;
const BASE = Catalog.inSet('base');

const slot = (page, label) => button(page, Lines.mall.buttons.slot(label, Lines.mall.names.normal, Format.money(Rules.prices.normal)));
const newestMessage = page => page.locator('#log .message').first();

async function finishOpening(page, choice = 'sell') {
    await button(page, Lines.opening.lookUp).click();
    await button(page, choice === 'sell' ? `${Lines.opening.sell} (${Format.money(Rules.shoeboxOffer)})` : Lines.opening.keep).click();
}

/**
 * Pretend the player switches to another tab, or back
 */
async function setTabHidden(page, hidden) {
    await page.evaluate(value => {
        Object.defineProperty(document, 'hidden', { value, configurable: true });
        document.dispatchEvent(new Event('visibilitychange'));
    }, hidden);
}

browserTest('a new player sells the shoebox, buys a pack, and opens it', {}, async (page) => {
    await assert.doesNotReject(page.getByText(Lines.opening.closet[0]).waitFor());
    assert.equal(await page.locator('#season-tag').textContent(), Lines.story.seasons.spring);

    await finishOpening(page);
    assert.equal(await page.locator('[data-money]').textContent(), Format.money(Rules.shoeboxOffer));
    assert.equal(await page.getByText(BASE_SET).count(), 0, 'no checklist before the first pack');
    await place(page, Lines.mall.name).click();

    await slot(page, 'A1').click();
    assert.equal(await page.locator('[data-money]').textContent(), Format.money(0));
    await page.getByText(Lines.packs.unopened(1)).waitFor();
    assert.ok(await slot(page, 'A2').isDisabled(), 'the next pack is too expensive');

    await button(page, Lines.packs.buttons.open).click();
    assert.equal(await page.locator('#reveal .card').count(), 5);
    assert.match(await page.locator('#reveal').textContent(), /\d new cards? for the checklist/);
    await page.locator('#log').getByText(Lines.packs.checklist(BASE.length)).waitFor();

    // Opened cards stay at the machine; the checklist goes home
    await place(page, Lines.home.name).click();
    assert.equal(await page.locator('#reveal .card').count(), 0);
    await page.getByText(new RegExp(`^Critter Clash Base Set: \\d/${BASE.length}$`)).waitFor();
    const commons = BASE.filter(card => card.rarity === 'common').length;
    assert.equal(await page.locator('.checklist-grid li').count(), commons, 'the commons tab is open');
    assert.ok(await page.locator('.checklist-grid li', { hasText: '???' }).count() >= commons - 5, 'the rest are still to find');
    // The first pack can hold an ultra-rare, so the tab's count may not be 0
    const ultraRares = BASE.filter(card => card.rarity === 'ultra-rare').length;
    await page.getByRole('button', { name: new RegExp(`^${Lines.home.rarities['ultra-rare']} \\d/${ultraRares}$`) }).click();
    assert.equal(await page.locator('.checklist-grid li').count(), ultraRares);
    await page.getByText(Lines.home.others).waitFor();
});

browserTest('opening a pack plays out card by card, and can be skipped', { reducedMotion: 'no-preference' }, async (page) => {
    await finishOpening(page);
    await place(page, Lines.mall.name).click();
    await slot(page, 'A1').click();
    await button(page, Lines.packs.buttons.open).click();

    await page.clock.runFor(1500);
    assert.ok(await button(page, Lines.packs.buttons.skip).isVisible(), 'still opening');
    await button(page, Lines.packs.buttons.skip).click();
    assert.equal(await page.locator('#reveal .card').count(), 5);
    assert.equal(await button(page, Lines.packs.buttons.skip).count(), 0);
});

browserTest('progress survives reloading the page, and so does the log', {}, async (page) => {
    await finishOpening(page);
    await place(page, Lines.mall.name).click();
    await slot(page, 'A1').click();
    const said = await page.locator('#log .message').allTextContents();

    await page.reload();
    await page.getByText(Lines.packs.unopened(1)).waitFor();
    assert.equal(await page.getByText(Lines.opening.closet[0]).count(), 0, 'the opening is over');
    assert.equal(await page.locator('[data-money]').textContent(), Format.money(0));
    await place(page, Lines.mall.name).waitFor();
    assert.deepEqual(await page.locator('#log .message').allTextContents(), said.slice(0, 10), 'the newest messages are still there');
});

browserTest('the third strike ends the run, and the ending is remembered', { query: '?dev' }, async (page) => {
    await finishOpening(page);
    await button(page, '+$50').click();
    await place(page, Lines.mall.name).click();

    for (let strike = 1; strike <= Rules.maxStrikes; strike++) {
        await button(page, 'Kid in line').click();
        await button(page, Lines.pip.keepBuying).click();
    }

    await page.getByText(Lines.endings.screen.theEnd(Lines.endings.names.shame)).waitFor();
    await page.getByText(Lines.endings.screen.found(1, 5)).waitFor();

    await button(page, Lines.endings.screen.startOver).click();
    await page.getByText(Lines.opening.closet[0]).waitFor();
    await page.locator('#endings-found').getByText(Lines.endings.screen.found(1, 5)).waitFor();
});

const oldSave = readFileSync(new URL('../fixtures/save-pr31.json', import.meta.url), 'utf8');

browserTest('an old save loads, and a full shoebox can be traded up for a binder', {
    save: oldSave,
    time: JSON.parse(oldSave).savedAt + HOUR
}, async (page) => {
    // The save was made with Pip waiting in line
    await button(page, Lines.pip.stepAside).click();

    await place(page, Lines.home.name).click();
    await page.getByText(/^A shoebox\. \d+ cards\./).waitFor();
    await button(page, `${Lines.home.buy.binder} (${Format.money(Rules.storage[1].price)})`).click();
    assert.equal(await newestMessage(page).textContent(), Lines.home.upgraded.binder);
    await page.getByText(/^A binder\. \d+ cards\./).waitFor();
    assert.equal(await page.locator('.pockets .pocket').count(), 9);

    await button(page, Lines.home.nextPage).click();
    assert.match(await page.locator('.pages').textContent(), /Page 2 of \d+/);
});

browserTest('on a phone, the log shows one line until expanded, and every place fits the screen', {
    viewport: { width: 390, height: 844 }
}, async (page) => {
    await finishOpening(page);
    const messages = page.locator('#log .message');
    assert.ok(await messages.count() > 1);
    assert.ok(await messages.nth(0).isVisible());
    assert.ok(!await messages.nth(1).isVisible(), 'older lines are hidden');

    await button(page, Lines.system.log.more).click();
    assert.ok(await messages.nth(1).isVisible());
    assert.equal(await button(page, Lines.system.log.less).getAttribute('aria-expanded'), 'true');

    await page.clock.runFor(30 * 1000);
    for (const name of [Lines.mall.name, Lines.job.name, Lines.home.name]) {
        await place(page, name).click();
        await assertFits(page, name);
    }
});

browserTest('on a phone, a page of the binder fits the screen', {
    viewport: { width: 390, height: 844 },
    save: oldSave,
    time: JSON.parse(oldSave).savedAt + HOUR
}, async (page) => {
    await button(page, Lines.pip.stepAside).click();
    await place(page, Lines.home.name).click();
    await button(page, `${Lines.home.buy.binder} (${Format.money(Rules.storage[1].price)})`).click();
    assert.equal(await page.locator('.pockets .pocket').count(), 9);
    await assertFits(page, 'the binder');
});

browserTest('time in a background tab is summed up once, on return', {}, async (page) => {
    await finishOpening(page);
    await place(page, Lines.mall.name).click();

    await setTabHidden(page, true);
    await page.clock.fastForward(2 * HOUR);
    await setTabHidden(page, false);
    await page.clock.runFor(3000);

    const away = page.locator('#log .message', { hasText: 'While you were away' });
    assert.equal(await away.count(), 1);
    const text = await away.textContent();
    assert.ok(text.includes(Lines.mall.restockAway), text);
    assert.ok(text.includes('allowance'), text);
});

browserTest('coming back later in a new tab catches up on the time away', {}, async (page, context) => {
    await finishOpening(page);
    await page.close();
    await context.clock.fastForward(5 * HOUR);

    const later = await reopen(context);
    const text = await newestMessage(later).textContent();
    assert.match(text, /^While you were away, your allowance paid you \$/);
    const money = Number((await later.locator('[data-money]').textContent()).replace(/[$,]/g, ''));
    assert.ok(money >= 5 * 60 * 60 * Rules.allowanceCentsPerSecond / 100, `paid for the time away: $${money}`);
});

browserTest('on an office day, work means going to the office', { time: Date.UTC(2026, 9, 27, 10) }, async (page) => {
    await finishOpening(page);
    await page.clock.runFor(30 * 1000);
    await place(page, Lines.job.name).click();
    await page.getByText(Lines.job.today.office('Tuesday')).waitFor();

    const money = async () => (await page.locator('[data-money]').textContent());
    const before = await money();
    await button(page, Lines.job.answer).click();
    assert.equal(await money(), Format.money(Math.round(Number(before.slice(1)) * 100) + Rules.workPay));
    assert.ok(await button(page, Lines.job.resting).isDisabled(), 'resting between emails');

    await place(page, Lines.mall.name).click();
    await slot(page, 'A1').click();
    await place(page, Lines.job.name).click();
    await button(page, Lines.job.openAtDesk).click();
    assert.equal(await page.locator('#reveal .card').count(), 5, 'opened under the desk');
    assert.match(await page.locator('#scene pre').first().textContent(), /\[#\]/, 'a card under the monitor now');
});

browserTest('on a home day, work is at the kitchen table, and the office is empty', { time: Date.UTC(2026, 9, 26, 10) }, async (page) => {
    await finishOpening(page);
    await page.clock.runFor(30 * 1000);
    await page.getByText(Lines.job.kitchenTable('Monday')).waitFor();
    await button(page, Lines.job.answer).click();
    await button(page, Lines.job.resting).waitFor();

    await place(page, Lines.job.name).click();
    await page.getByText(Lines.job.today.home('Monday')).waitFor();
    assert.equal(await button(page, Lines.job.answer).count(), 0);
});

browserTest('working from home, a sticky note puts the money in the tab title, even from a background tab', {
    time: Date.UTC(2026, 9, 26, 10),
    query: '?dev'
}, async (page) => {
    const pageTitle = await page.title();
    const icon = await page.locator('link[rel="icon"]').getAttribute('href');
    assert.equal((await page.request.get(new URL(icon, page.url()).href)).status(), 200, 'the favicon is there');

    await finishOpening(page);
    await page.clock.runFor(30 * 1000);
    const stickyNote = button(page, Lines.job.stickyNote.buy(Format.money(Rules.stickyNotePrice)));
    assert.ok(await stickyNote.isDisabled(), 'a sticky note costs money');
    await button(page, '+$50').click();
    await stickyNote.click();
    await newestMessage(page).getByText(Lines.job.stickyNote.bought(Format.money(Rules.stickyNotePrice))).waitFor();
    assert.equal(await stickyNote.count(), 0, 'one is enough');

    const money = async () => Math.round(Number((await page.locator('[data-money]').textContent()).slice(1)) * 100);
    await page.clock.runFor(2000);
    assert.equal(await page.title(), Lines.job.stickyNote.title(Format.money(await money()), pageTitle));

    // From another tab, the title counts the allowance that will be paid on
    // coming back
    const before = await money();
    await setTabHidden(page, true);
    await page.clock.runFor(10 * 60 * 1000);
    const owed = 10 * 60 * Rules.allowanceCentsPerSecond;
    assert.equal(await page.title(), Lines.job.stickyNote.title(Format.money(before + owed), pageTitle));
    assert.equal(await money(), before, 'the page itself waits for the player to come back');

    await setTabHidden(page, false);
    await page.clock.runFor(1000);
    assert.ok(await money() >= before + owed);
    assert.equal(await page.title(), Lines.job.stickyNote.title(Format.money(await money()), pageTitle));
});

browserTest('Terry waits for the drop, and splits it with a player who asks', { query: '?dev' }, async (page) => {
    await finishOpening(page);
    await place(page, Lines.mall.name).click();
    await button(page, 'Driver in a minute').click();
    await page.clock.runFor(2000);
    await page.getByText(Lines.terry.arrive[0]).waitFor();

    // Once they've agreed, the driver comes, and row B goes to Terry
    await button(page, Lines.terry.persuade).click();
    await page.locator('#log').getByText(Lines.terry.agreed).waitFor();
    await page.locator('#log').getByText(Lines.terry.shared).waitFor();
    const keys = await page.locator('.machine [data-action="vending.buy"]').count();
    assert.ok(keys <= Rules.slotCount / 2, `row B went to Terry: ${keys} packs left`);
});
