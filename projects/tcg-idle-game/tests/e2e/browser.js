/**
 * Browser test setup: serves the built site (_site, from bundle exec jekyll
 * build), opens the game in Chromium with a paused clock, fails the test if
 * the page logs an error, and keeps a screenshot of any failure in
 * test-results/.
 */

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const SITE = process.env.SITE_DIR || fileURLToPath(new URL('../../../../_site/', import.meta.url));
const RESULTS = fileURLToPath(new URL('../../test-results/', import.meta.url));
const GAME = '/tcg-idle-game/';

// Saturday 25 October 2026, 2:07 PM, in the browser's time zone (UTC)
export const START = Date.UTC(2026, 9, 25, 14, 7);

const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
};

let server;
let browser;
let origin;

before(async () => {
    if (!existsSync(join(SITE, GAME, 'index.html'))) {
        throw new Error(`No built game in ${SITE}. Build the site first: bundle exec jekyll build`);
    }

    server = createServer(async (request, response) => {
        const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        // An empty page on the same origin, for setting up local storage
        if (path === '/__blank') {
            response.writeHead(200, { 'Content-Type': TYPES['.html'] });
            response.end('<!DOCTYPE html><title>blank</title>');
            return;
        }
        const file = join(SITE, normalize(path.endsWith('/') ? path + 'index.html' : path));
        try {
            if (!file.startsWith(SITE)) {
                throw new Error('Outside the site');
            }
            const body = await readFile(file);
            response.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
            response.end(body);
        } catch {
            response.writeHead(404);
            response.end('Not found');
        }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch();
});

after(async () => {
    await browser?.close();
    await new Promise(resolve => server ? server.close(resolve) : resolve());
});

/**
 * A browser test. It gets a page with the game open and the clock paused,
 * so time only moves when the test moves it (page.clock.runFor and
 * fastForward).
 * @param {string} name - Test name
 * @param {Object} options - query (added to the URL, like '?dev'), time (the
 *                           clock's start), save (local storage save to load),
 *                           viewport, reducedMotion ('reduce' by default, so
 *                           packs open at once)
 * @param {Function} body - async (page, context)
 */
export function browserTest(name, options, body) {
    test(name, async () => {
        const { query = '', time = START, save = null, viewport = { width: 1100, height: 900 }, reducedMotion = 'reduce' } = options;
        const context = await browser.newContext({ viewport, reducedMotion, timezoneId: 'UTC' });
        await context.clock.install({ time });
        await context.clock.pauseAt(time);

        // Fail fast: nothing in the game takes long to appear
        context.setDefaultTimeout(5000);

        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => message.type() === 'error' && errors.push(message.text()));

        try {
            if (save) {
                await page.goto(origin + '/__blank');
                await page.evaluate(raw => localStorage.setItem('critterClashSave', raw), save);
            }
            await page.goto(origin + GAME + query);
            await body(page, context);
            assert.deepEqual(errors, [], 'the page logged no errors');
        } catch (error) {
            await mkdir(RESULTS, { recursive: true });
            const file = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.png';
            await page.screenshot({ path: join(RESULTS, file), fullPage: true }).catch(() => {});
            throw error;
        } finally {
            await context.close();
        }
    });
}

/**
 * Open a second page on the game, like coming back later in a new tab
 */
export async function reopen(context) {
    const page = await context.newPage();
    await page.goto(origin + GAME);
    return page;
}
