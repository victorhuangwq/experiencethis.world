/**
 * Every line of text in the game, one file per topic.
 *
 * Voice: deadpan and absurd, like Candy Box. Short sentences. Never explain
 * a mechanic; let new buttons speak for themselves, and let characters hint
 * at things in their own words. The narrator may talk to the player, joke
 * about idle games, react to the real clock, and the developer may leave
 * the occasional note. See story/story.md for the full style guide.
 */

import { Story } from './story.js';
import { Opening } from './opening.js';
import { Money } from './money.js';
import { Job } from './job.js';
import { Mall } from './mall.js';
import { Packs } from './packs.js';
import { Home } from './home.js';
import { Benny } from './benny.js';
import { Pip } from './pip.js';
import { Strikes } from './strikes.js';
import { Gus } from './gus.js';
import { Flip } from './flip.js';
import { Terry } from './terry.js';
import { Tournaments } from './tournaments.js';
import { Marcus } from './marcus.js';
import { Endings } from './endings.js';
import { System } from './system.js';

export const Lines = {
    story: Story,
    opening: Opening,
    money: Money,
    job: Job,
    mall: Mall,
    packs: Packs,
    home: Home,
    benny: Benny,
    pip: Pip,
    strikes: Strikes,
    gus: Gus,
    flip: Flip,
    terry: Terry,
    tournaments: Tournaments,
    marcus: Marcus,
    endings: Endings,
    system: System
};
