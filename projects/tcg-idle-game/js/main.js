/**
 * Main entry point for TCG Idle Collector
 * Builds the game from its systems and content, ticks it every second,
 * keeps the tab's title up to date, and handles saving.
 */

import { Game } from './core/game.js';
import { SaveSystem } from './core/save.js';
import { Lines } from './content/text/index.js';
import { Unlocks } from './content/unlocks.js';
import { Encounters } from './content/encounters/index.js';
import { Systems } from './systems/index.js';
import { Wallet } from './systems/wallet.js';
import { Vending } from './systems/vending.js';
import { UI } from './ui/ui.js';
import { tabTitle } from './ui/panels/work.js';

const game = new Game({
    systems: Systems,
    unlocks: Unlocks,
    encounters: Encounters,
    endings: SaveSystem.endings
});

let saveDisabled = false;
let saveWarningShown = false;

function save() {
    if (saveDisabled || game.state.meta.ended) {
        return;
    }
    if (!SaveSystem.save(game.toSaveData()) && !saveWarningShown) {
        game.say(Lines.system.saveFailed, 'danger');
        saveWarningShown = true;
    }
}

// An ending wipes the save; the endings list remembers it
game.on('end', () => {
    saveDisabled = true;
    SaveSystem.clear();
});

game.start(SaveSystem.load(), Date.now());

// Add ?dev to the page URL for testing shortcuts
const devMode = new URLSearchParams(location.search).has('dev');

const ui = new UI(game, document.getElementById('app'), {
    devMode,
    seasonTag: document.getElementById('season-tag'),
    // Save after every action, so reloading can't undo a choice
    onAction: save,
    onDev: (action) => {
        if (!devMode) {
            return;
        }
        if (action === 'dev.money') {
            Wallet.earn(game, 5000);
        } else if (action === 'dev.restock') {
            game.state.vending.nextRestockAt = Date.now();
            Vending.tick(game, Date.now());
        } else if (action === 'dev.soon') {
            game.state.vending.nextRestockAt = Date.now() + 60 * 1000;
        } else if (action === 'dev.pip' && game.unlocked('mall') && !game.state.encounter) {
            game.startEncounter('pip');
        } else if (action === 'dev.day') {
            // Count another day of play, and bring back cards from grading
            game.state.story.days++;
            game.state.store.grading.forEach(entry => {
                entry.backAt = Date.now();
            });
            game.tick(Date.now());
        } else if (action === 'dev.delete' && confirm('Delete the save and the endings found?')) {
            saveDisabled = true;
            SaveSystem.clear();
            SaveSystem.endings.clear();
            location.reload();
        }
    }
});
ui.render();

// While a side feature is being worked on, the tab's title shows what it
// has made, even from a background tab
const pageTitle = document.title;
function updateTitle() {
    document.title = tabTitle(game, Date.now()) ?? pageTitle;
}

setInterval(() => {
    // While the tab is hidden, time builds up for one catch-up on return
    if (!document.hidden) {
        game.tick(Date.now());
        ui.render();
    }
    updateTitle();
}, 1000);

// A background tab's timers slow down, but a worker's don't (heartbeat.js)
try {
    const heartbeat = new Worker(new URL('./heartbeat.js', import.meta.url));
    heartbeat.addEventListener('message', () => {
        if (document.hidden) {
            updateTitle();
        }
    });
} catch (error) {
    // Without a worker the title still updates, just less often
}

setInterval(save, 30000);

// Time spent in a background tab is summarised once, on return
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        save();
    } else {
        game.catchUp(Date.now());
        ui.render();
    }
});
window.addEventListener('pagehide', save);

// If another tab saves the game, stop saving here so the tabs
// don't overwrite each other's progress
window.addEventListener('storage', (event) => {
    if (event.key === SaveSystem.key && !saveDisabled) {
        saveDisabled = true;
        game.say(Lines.system.otherTab, 'danger');
        ui.render();
    }
});
