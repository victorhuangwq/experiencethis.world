/**
 * Main entry point for Critter Clash
 * Starts the game, ticks it every second, and handles saving.
 */

document.addEventListener('DOMContentLoaded', function() {
    const game = new Game();
    let saveDisabled = false;
    let saveWarningShown = false;

    const save = () => {
        if (saveDisabled || game.state.ended) {
            return;
        }
        if (!SaveSystem.save(game.toSaveData()) && !saveWarningShown) {
            game.say('Warning: your progress could not be saved. Local storage may be full or disabled.', 'danger');
            saveWarningShown = true;
        }
    };

    // An ending wipes the save but is remembered in the endings list
    game.onEnd = (id) => {
        saveDisabled = true;
        SaveSystem.recordEnding(id);
        SaveSystem.clear();
    };

    game.start(SaveSystem.load(), Date.now());

    // Add ?dev to the page URL for testing shortcuts
    const devMode = new URLSearchParams(location.search).has('dev');
    const ui = new UI(game, document.getElementById('app'), {
        devMode: devMode,
        // Save after every action, so reloading can't undo a choice
        onAction: save,
        onDev: (action) => {
            if (!devMode) {
                return;
            }
            if (action === 'dev-money') {
                game.state.money += 50;
            } else if (action === 'dev-restock') {
                game.state.vending.restockedAt = 1;
                game.checkRestock(Date.now());
            } else if (action === 'dev-pip') {
                game.state.pip.inLine = true;
                game.state.pip.encounters++;
            } else if (action === 'dev-delete' && confirm('Delete the save and the endings found?')) {
                saveDisabled = true;
                SaveSystem.clear();
                localStorage.removeItem(SaveSystem.endingsKey);
                location.reload();
            }
        }
    });
    ui.render();

    setInterval(() => {
        game.tick(Date.now());
        ui.render();
    }, 1000);
    setInterval(save, 30000);
    window.addEventListener('pagehide', save);

    // If another tab saves the game, stop saving here so the tabs
    // don't overwrite each other's progress
    window.addEventListener('storage', (event) => {
        if (event.key === SaveSystem.key && !saveDisabled) {
            saveDisabled = true;
            game.say('The game was saved from another tab. Progress in this tab will no longer be saved; reload to continue here.', 'danger');
            ui.render();
        }
    });
});
