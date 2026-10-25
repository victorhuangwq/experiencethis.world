import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gameAtMall, act } from './helpers.js';
import { machine } from '../js/ui/art/mall.js';
import { card, cardBack, packTear } from '../js/ui/art/cards.js';
import { storage } from '../js/ui/art/home.js';
import { store } from '../js/ui/art/gus.js';
import { Catalog } from '../js/content/catalog.js';

const widths = text => new Set(text.split('\n').map(line => line.length));

test('the machine shows the marks of the player\'s choices', () => {
    const game = gameAtMall();
    const plain = machine(game.state, false);
    assert.ok(!plain.includes('(^o^)'));
    assert.ok(!plain.includes('BE NICE'));
    assert.ok(!plain.includes(')\n'), 'no dents yet');

    game.state.people.pip.kindness = 1;
    game.state.kindness.note = true;
    act(game, 'vending.kick');
    const marked = machine(game.state, true);
    assert.ok(marked.includes('(^o^)'), "Pip's sticker");
    assert.ok(marked.includes('BE NICE'), 'the note');
    assert.ok(marked.split('\n')[6].endsWith(')'), 'a dent');
    assert.ok(marked.includes('PIP'), 'Pip in line');
});

test('every card is drawn the same size as the back of a card', () => {
    const backWidths = widths(cardBack);
    assert.equal(backWidths.size, 1);
    const height = cardBack.split('\n').length;
    for (const definition of Catalog.fixed) {
        const art = card({ ...definition, isNew: true });
        assert.deepEqual(widths(art), backWidths, definition.name);
        assert.equal(art.split('\n').length, height, definition.name);
    }
});

test('boxes have a straight right edge below their top edge', () => {
    const boxes = { store, binder: storage('binder'), 'two-binders': storage('two-binders'), bookshelf: storage('bookshelf'), 'card-room': storage('card-room') };
    for (const [name, art] of Object.entries(boxes)) {
        assert.equal(widths(art.split('\n').slice(1).join('\n')).size, 1, name);
    }
});

test('both pack-tearing frames are the same height', () => {
    assert.equal(packTear[0].split('\n').length, packTear[1].split('\n').length);
});
