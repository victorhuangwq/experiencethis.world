/**
 * Browser tests for Act 2: journeys through Gus's Games & Grub
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { browserTest, button, place, assertFits } from './browser.js';
import { Lines } from '../../js/content/text/index.js';
import { Format } from '../../js/core/format.js';
import { Rules } from '../../js/rules.js';
import { SaveSystem } from '../../js/core/save.js';

const HOUR = 60 * 60 * 1000;

// A save from before Act 2 that has found Gus's store, saved on a Thursday evening
const foundGus = readFileSync(new URL('../fixtures/save-save-upgrades.json', import.meta.url), 'utf8');
const savedAt = JSON.parse(foundGus).savedAt;

// The same save, upgraded, after the player has won locals: a regular
const regular = (() => {
    const { game } = SaveSystem.migrate(JSON.parse(foundGus));
    game.tournaments = { localsWon: 1, localsPlayed: 1 };
    game.wallet.cents = 10000;
    return JSON.stringify({ version: SaveSystem.version, savedAt, game });
})();

const money = async page => page.locator('[data-money]').textContent();
const literally = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

    // Gus asks what it'll be; the packs are on the shelves
    await button(page, Lines.gus.areas.gus).click();
    await page.getByText(Lines.gus.greet).waitFor();
    await button(page, Lines.gus.ask.packs).click();
    await page.getByText(Lines.gus.shelvesSay).waitFor();
    const before = await money(page);
    await button(page, Lines.gus.buyPack('Base Set', Format.money(Rules.gusPrices.base))).click();
    const cents = text => Math.round(Number(text.replace(/[^0-9.]/g, '')) * 100);
    assert.equal(cents(await money(page)), cents(before) - Rules.gusPrices.base);

    await page.setViewportSize({ width: 360, height: 740 });
    await assertFits(page, 'Gus\'s store on a phone');
});

browserTest('a card sent to grading comes back the next day, and Gus will buy it', {
    save: foundGus,
    time: savedAt + 24 * HOUR
}, async (page) => {
    await place(page, Lines.gus.name).click();
    await button(page, Lines.gus.areas.case).click();
    await page.getByText(Lines.gus.caseTitle).waitFor();
    assert.equal(await page.locator('#scene li', { has: button(page, Lines.gus.buySingle) }).count(), Rules.caseSlots.length, 'a full case');

    await button(page, Lines.gus.areas.gus).click();
    await button(page, Lines.gus.ask.grading).click();
    const send = button(page, Lines.gus.send(Format.money(Rules.gradingFee)));
    const candidate = page.locator('#scene li', { has: send }).first();
    const name = literally((await candidate.textContent()).split(' (')[0]);
    await send.first().click();
    await page.getByText(new RegExp(`^${name}: at Mint Condition Co\\. Back tomorrow at`)).waitFor();

    await page.clock.fastForward(24 * HOUR);
    await page.locator('#log').getByText(new RegExp(`^${name} is back from Mint Condition Co\\.`)).waitFor();
    await button(page, new RegExp('^Sell it to Gus')).waitFor();
    await place(page, Lines.home.name).click();
    await page.getByRole('heading', { name: Lines.home.graded }).waitFor();
});

browserTest('a Friday evening at Gus\'s: locals, a round at a time, and a trade with Marcus', {
    save: foundGus,
    // The Friday evening after the save
    time: savedAt + 24 * HOUR
}, async (page) => {
    await place(page, Lines.gus.name).click();
    await button(page, Lines.gus.areas.table).click();
    await page.getByRole('heading', { name: Lines.marcus.title }).waitFor();
    assert.match(await page.locator('#scene pre.art').first().textContent(), /\(-_-\)/, 'Marcus is at his table');

    const trade = button(page, Lines.marcus.trade);
    const offers = await trade.count();
    assert.ok(offers > 0, 'Marcus has offers');
    await trade.first().click();
    await page.locator('#log').getByText(/^You trade your spare/).waitFor();
    assert.equal(await trade.count(), offers - 1);

    await button(page, Lines.gus.areas.board).click();
    await page.getByText(Lines.tournaments.localsNote).waitFor();
    await button(page, Lines.tournaments.enterLocals(Format.money(2 * Rules.gusPrices.base))).click();
    await page.getByText(/^Match 1 of 3: /).waitFor();
    const choice = page.locator('[data-action="encounter.choose"]:not([disabled])');
    for (let round = 0; round < 9 && await choice.count() > 0; round++) {
        await choice.first().click();
    }
    assert.equal(await choice.count(), 0, 'the tournament is over');
    await page.locator('#log').getByText(/^(You win every match|Two wins|One win|No wins)/).waitFor();
    await page.getByText(/^"You've had your go," says Gus\. "Next one's at /).waitFor();
    await assertFits(page, 'Gus\'s store after locals');
});

browserTest('a regular plays the pre-release, and summer brings Set 2 the next day', {
    save: regular,
    time: savedAt + 24 * HOUR
}, async (page) => {
    await place(page, Lines.gus.name).click();
    await button(page, Lines.gus.areas.board).click();
    await page.getByRole('heading', { name: Lines.tournaments.prereleaseTitle }).waitFor();
    await button(page, Lines.tournaments.enterPrerelease(Rules.prereleaseKitPacks, Format.money(Rules.prereleaseKitPrice))).click();
    await page.locator('#log').getByText(Lines.packs.newChecklist('Backyard Brawl', 102)).waitFor();

    const choice = page.locator('[data-action="encounter.choose"]:not([disabled])');
    for (let round = 0; round < 9 && await choice.count() > 0; round++) {
        await choice.first().click();
    }
    await page.locator('#log').getByText(/^The pre-release is over\./).waitFor();
    await page.getByText(Lines.tournaments.waitingForSummer).waitFor();
    assert.equal(await page.locator('#season-tag').textContent(), Lines.story.seasons.spring);

    await page.clock.fastForward(24 * HOUR);
    await page.locator('#log').getByText(Lines.story.summer).waitFor();
    assert.equal(await page.locator('#season-tag').textContent(), Lines.story.seasons.summer);
    await button(page, Lines.gus.areas.shelves).click();
    await button(page, Lines.gus.buyPack('Backyard Brawl', Format.money(Rules.gusPrices.backyard))).click();
    await page.locator('#status').getByText(/^Backyard Brawl packs: \d+/).waitFor();

    await place(page, Lines.home.name).click();
    await page.getByText(/^Critter Clash: Backyard Brawl: \d+\/102$/).waitFor();
});
