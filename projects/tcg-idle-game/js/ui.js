/**
 * TCG Idle Collector user interface
 * Renders the game as text and ASCII scenes. Each part is only redrawn when
 * its content changes, so buttons stay clickable between ticks.
 */

const Art = {
    /**
     * Draw the vending machine, with the kid in line if they are waiting
     * @param {Game} game - Game
     * @returns {string} - ASCII art
     */
    vendingMachine(game) {
        const { slots, jammedSlot } = game.state.vending;
        const cell = kind => kind === 'special' ? '[**]' : kind ? '[##]' : '[  ]';
        const row = start => slots.slice(start, start + 4).map(cell).join('  ');
        const line = inner => ' |' + inner.padEnd(26) + '|';
        const tray = jammedSlot === null ? '[    ]' : '[ ?? ]';

        const machine = [
            ' .--------------------------.',
            line('    CARD-O-MATIC 3000'),
            ' |--------------------------|',
            line('  ' + row(0)),
            line('   A1    A2    A3    A4'),
            line('  ' + row(4)),
            line('   B1    B2    B3    B4'),
            ' |--------------------------|',
            line(`  [##] ${Format.money(Rules.prices.normal)}   [**] ${Format.money(Rules.prices.special)}`),
            line('  .--------------------.'),
            line('  |  PUSH      ' + tray + '  |'),
            line('  \'--------------------\''),
            ' \'--------------------------\''
        ];

        if (!game.state.pip.inLine) {
            return machine.join('\n');
        }

        // Stand the kid next to the bottom of the machine
        const kid = ['  (;_;)', '  /| |\\', '   / \\', game.state.pip.kindness > 0 ? '   PIP' : '   kid'];
        const offset = machine.length - kid.length;
        return machine.map((text, index) => text + (index >= offset ? '   ' + kid[index - offset] : '')).join('\n');
    },

    /**
     * Draw a card
     * @param {Object} card - Card
     * @returns {string} - ASCII art
     */
    card(card) {
        const width = 15;
        const edge = { common: '-', uncommon: '=', rare: '*', 'ultra-rare': '#', legendary: '$' }[card.rarity];
        const nameLines = Art.wrap(card.name, width);
        while (nameLines.length < 3) {
            nameLines.push('');
        }
        const power = 'P' + card.power;

        return [
            '.' + edge.repeat(width) + '.',
            ...nameLines.map(text => '|' + text.padEnd(width) + '|'),
            '|' + card.type.toUpperCase().padEnd(width - power.length) + power + '|',
            '|' + (card.isNew ? card.rarity + ' NEW!' : card.rarity).padEnd(width) + '|',
            '\'' + edge.repeat(width) + '\''
        ].join('\n');
    },

    /**
     * Wrap text to a width, breaking at spaces
     * @param {string} text - Text
     * @param {number} width - Line width
     * @returns {Array} - Lines
     */
    wrap(text, width) {
        const lines = [];
        let current = '';
        for (const word of text.split(' ')) {
            const next = current ? current + ' ' + word : word;
            if (next.length <= width) {
                current = next;
            } else {
                if (current) {
                    lines.push(current);
                }
                current = word.slice(0, width);
            }
        }
        if (current) {
            lines.push(current);
        }
        return lines;
    },

    hobbyStore: [
        '  _______________________________',
        ' |      GUS\'S GAMES & GRUB       |',
        ' |_______________________________|',
        ' |  ____   ____   .-----------.  |',
        ' | |[##]| |[##]|  | CLOSED FOR|  |',
        ' | |____| |____|  | INVENTORY.|  |',
        ' |                | BACK SOON!|  |',
        ' |   ________     |     - GUS |  |',
        ' |  |        |    \'-----------\'  |',
        ' |  |      o |                   |',
        ' |__|________|___________________|'
    ].join('\n'),

    securityGuard: [
        '      _____',
        '     |_____|     MALL',
        '      (o_o)      SECURITY',
        '     --|#|--',
        '       / \\'
    ].join('\n')
};

// Text for each ending screen
const EndingScreens = {
    shame: {
        art: Art.securityGuard,
        lines: [
            'Officer Dale taps you on the shoulder.',
            '"We\'ve had complaints. A kid cried. More than once. You need to move along."',
            'You walk out past the food court. Everyone is looking.',
            'You never open another pack again.'
        ]
    }
};

class UI {
    /**
     * @param {Game} game - Game
     * @param {HTMLElement} root - Element to render into
     * @param {Object} options - devMode, onAction (after each action), onDev (dev actions)
     */
    constructor(game, root, options = {}) {
        this.game = game;
        this.root = root;
        this.options = options;
        this.location = 'machine';

        root.innerHTML = `
            <div id="dev-bar"></div>
            <div id="status"></div>
            <nav id="locations"></nav>
            <section id="scene"></section>
            <section id="reveal"></section>
            <section id="log"></section>
            <footer id="endings-found"></footer>
        `;
        this.parts = {};
        for (const id of ['dev-bar', 'status', 'locations', 'scene', 'reveal', 'log', 'endings-found']) {
            this.parts[id] = root.querySelector('#' + id);
        }

        // One click handler for every button, so redrawing never loses listeners
        root.addEventListener('click', (event) => {
            const button = event.target.closest('[data-action]');
            if (!button || button.disabled) {
                return;
            }
            this.handle(button.dataset);
            this.options.onAction?.();
            this.render();
        });
    }

    /**
     * Run a button's action
     * @param {Object} data - The button's data attributes
     */
    handle(data) {
        const game = this.game;
        const now = Date.now();
        switch (data.action) {
            case 'buy': game.buy(Number(data.slot)); break;
            case 'kick': game.kickMachine(); break;
            case 'walk-away': game.walkAwayFromJam(); break;
            case 'step-aside': game.stepAside(); break;
            case 'keep-buying': game.keepBuying(); break;
            case 'chores': game.doChores(now); break;
            case 'open': game.openPack(data.kind); break;
            case 'sell-duplicates': game.sellDuplicates(); break;
            case 'go': this.location = data.location; break;
            case 'restart': location.reload(); break;
            default: this.options.onDev?.(data.action);
        }
    }

    /**
     * Set an element's HTML only if it changed
     * @param {HTMLElement} element - Element
     * @param {string} html - New HTML
     */
    setHTML(element, html) {
        if (element._html !== html) {
            element.innerHTML = html;
            element._html = html;
        }
    }

    /**
     * Redraw everything that changed
     */
    render() {
        const game = this.game;
        if (game.state.ended) {
            this.setHTML(this.root, this.endingScreen(game.state.ended));
            return;
        }

        const now = Date.now();
        this.setHTML(this.parts['dev-bar'], this.options.devMode ? this.devBar() : '');
        this.setHTML(this.parts.status, this.status(now));
        this.setHTML(this.parts.locations, this.locations());
        this.setHTML(this.parts.scene, this.scene());
        this.setHTML(this.parts.reveal, this.location === 'machine' ? this.reveal() : '');
        this.setHTML(this.parts.log, game.messages
            .map(message => `<p class="message ${message.kind}">${UI.escape(message.text)}</p>`)
            .join(''));
        this.setHTML(this.parts['endings-found'], this.endingsFound());

        // Money changes every second, so it is updated as text only
        this.parts.status.querySelector('[data-money]').textContent = Format.money(game.state.money);
    }

    static escape(text) {
        return String(text).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);
    }

    status(now) {
        const { packs, strikes } = this.game.state;
        const parts = [`<p>You have <b data-money></b> <span class="muted">(+${Format.money(Rules.allowancePerSecond * 60)} a minute)</span></p>`];

        const resting = !this.game.canDoChores(now);
        parts.push(`<p><button data-action="chores" ${resting ? 'disabled' : ''}>${resting ? 'Resting after chores...' : `Do chores (+${Format.money(Rules.chorePay)})`}</button></p>`);

        if (packs.normal > 0) {
            parts.push(`<p>Unopened packs: ${packs.normal} <button data-action="open" data-kind="normal">Open a pack</button></p>`);
        }
        if (packs.special > 0) {
            parts.push(`<p>Special packs: ${packs.special} <button data-action="open" data-kind="special">Open a special pack</button></p>`);
        }

        if (strikes > 0) {
            const marks = Array.from({ length: Rules.maxStrikes }, (_, index) => index < strikes ? 'X' : '_').join(' ');
            parts.push(`<p class="danger">Strikes: ${marks}</p>`);
        }
        if (strikes === Rules.maxStrikes - 1) {
            parts.push('<p class="danger"><b>People are starting to talk. One more, and you\'re done here.</b></p>');
        }

        return parts.join('');
    }

    locations() {
        const flags = this.game.state.flags;
        const places = [
            { id: 'machine', name: 'CARD-O-MATIC 3000', open: true },
            { id: 'binder', name: 'Your binder', open: flags.binder },
            { id: 'gus', name: 'Gus\'s Games & Grub', open: flags.gus }
        ].filter(place => place.open);

        if (places.length < 2) {
            return '';
        }
        return places.map(place => `<button data-action="go" data-location="${place.id}" ${place.id === this.location ? 'class="current"' : ''}>${place.name}</button>`).join(' ');
    }

    scene() {
        switch (this.location) {
            case 'binder': return this.binderScene();
            case 'gus': return this.gusScene();
            default: return this.machineScene();
        }
    }

    machineScene() {
        const game = this.game;
        const { vending, pip, money } = game.state;
        const parts = [`<pre class="art">${UI.escape(Art.vendingMachine(game))}</pre>`];
        parts.push(`<p class="muted">Restocks every 15 minutes. Next restock: ${Format.clock(game.nextRestockAt())}.</p>`);

        if (pip.inLine) {
            const canKeepBuying = vending.slots.some(kind => kind && money >= Rules.prices[kind]);
            const who = pip.kindness > 0 ? 'Pip is' : 'A kid is';
            parts.push(`<p>${who} waiting behind you.</p>`);
            parts.push('<p><button data-action="step-aside">Step aside and let them buy one</button> ');
            parts.push(`<button data-action="keep-buying" ${canKeepBuying ? '' : 'disabled'}>Keep buying</button></p>`);
        } else if (vending.jammedSlot !== null) {
            parts.push('<p><button data-action="kick">Kick the machine</button> <button data-action="walk-away">Walk away</button></p>');
        } else if (game.stockLeft() === 0) {
            parts.push('<p>The machine is empty.</p>');
        } else {
            const buttons = vending.slots.map((kind, index) => {
                if (!kind) {
                    return '';
                }
                const price = Rules.prices[kind];
                const label = `${Format.slotLabel(index)}${kind === 'special' ? ' [**]' : ''} (${Format.money(price)})`;
                return `<button data-action="buy" data-slot="${index}" ${money >= price ? '' : 'disabled'}>${label}</button>`;
            });
            parts.push(`<p>Buy from slot: ${buttons.filter(Boolean).join(' ')}</p>`);
        }

        return parts.join('');
    }

    reveal() {
        const cards = this.game.lastPack;
        if (cards.length === 0) {
            return '';
        }
        return '<p>You opened:</p><div class="cards">' +
            cards.map(card => `<pre class="art card ${card.rarity}">${UI.escape(Art.card(card))}</pre>`).join('') +
            '</div>';
    }

    binderScene() {
        const game = this.game;
        const collection = game.state.collection;
        const parts = ['<h2>Your binder</h2>'];

        const names = new Map();
        for (const card of collection) {
            names.set(card.name, (names.get(card.name) || 0) + 1);
        }
        parts.push(`<p>${collection.length} cards, ${names.size} different.</p>`);

        if (game.state.flags.benny) {
            const duplicates = game.duplicates();
            const total = duplicates.reduce((sum, card) => sum + card.value, 0);
            parts.push(duplicates.length > 0
                ? `<p><button data-action="sell-duplicates">Sell ${duplicates.length} duplicates to Benny (${Format.money(total)})</button></p>`
                : '<p class="muted">Benny checks your binder. "No duplicates? Lame."</p>');
        }

        // Fixed cards: the set checklist
        const fixedOwned = new Map();
        for (const card of collection.filter(card => card.fixedId)) {
            fixedOwned.set(card.fixedId, (fixedOwned.get(card.fixedId) || 0) + 1);
        }
        const setOne = Cards.fixed.filter(card => card.set === 1);
        parts.push(`<h3>Critter Clash Base Set: ${setOne.filter(card => fixedOwned.has(card.id)).length}/${setOne.length}</h3><ul class="checklist">`);
        for (const card of setOne) {
            const count = fixedOwned.get(card.id);
            parts.push(count
                ? `<li class="${card.rarity}"><b>${UI.escape(card.name)}</b>${count > 1 ? ' x' + count : ''} <span class="muted">${card.rarity}, ${card.type}. ${UI.escape(card.flavor)}</span></li>`
                : `<li class="muted">??? <span>(${card.rarity}, ${Cards.sourceHints[card.source]})</span></li>`);
        }
        parts.push('</ul>');

        // Random cards, best first
        const others = [...names.entries()]
            .map(([name, count]) => ({ name, count, card: collection.find(card => card.name === name) }))
            .filter(entry => !entry.card.fixedId)
            .sort((a, b) => Cards.rarities.indexOf(b.card.rarity) - Cards.rarities.indexOf(a.card.rarity) || a.name.localeCompare(b.name));
        if (others.length > 0) {
            parts.push('<h3>Other critters</h3><ul class="checklist">');
            for (const entry of others) {
                parts.push(`<li class="${entry.card.rarity}">${UI.escape(entry.name)}${entry.count > 1 ? ' x' + entry.count : ''} <span class="muted">${entry.card.rarity}</span></li>`);
            }
            parts.push('</ul>');
        }

        return parts.join('');
    }

    gusScene() {
        return `<pre class="art">${UI.escape(Art.hobbyStore)}</pre>` +
            '<p>The lights are off, but you can see shelves full of packs inside. There are more packs in there than the CARD-O-MATIC 3000 has ever held.</p>' +
            '<p class="muted">This is the end of Act 1. Gus\'s Games & Grub opens in a future update.</p>';
    }

    endingsFound() {
        const found = SaveSystem.loadEndings();
        if (found.length === 0) {
            return '';
        }
        return `<p class="muted">Endings found: ${found.length}/${Endings.length}</p>`;
    }

    endingScreen(id) {
        const ending = Endings.find(item => item.id === id);
        const screen = EndingScreens[id];
        const found = SaveSystem.loadEndings();
        const list = Endings.map(item => `<li>${found.includes(item.id) ? item.name : '???'}</li>`).join('');

        return `
            <section class="ending">
                <pre class="art">${UI.escape(screen.art)}</pre>
                ${screen.lines.map(text => `<p>${UI.escape(text)}</p>`).join('')}
                <h2>THE END: ${ending.name}</h2>
                <p>Endings found: ${found.length}/${Endings.length}</p>
                <ul>${list}</ul>
                <p><button data-action="restart">Start over</button></p>
            </section>
        `;
    }

    devBar() {
        return '<p class="dev">Dev: ' +
            '<button data-action="dev-money">+$50</button> ' +
            '<button data-action="dev-restock">Restock now</button> ' +
            '<button data-action="dev-pip">Kid in line</button> ' +
            '<button data-action="dev-delete">Delete save and endings</button></p>';
    }
}

// Make the UI available globally
window.UI = UI;
