/**
 * Every system in the game, in the order they tick.
 * The game core's header comment (js/core/game.js) describes what a
 * system is. cards.js is a helper used by systems, not a system.
 */

import { Story } from './story.js';
import { Wallet } from './wallet.js';
import { Job } from './job.js';
import { Collection } from './collection.js';
import { Vending } from './vending.js';
import { Kindness } from './kindness.js';
import { People } from './people.js';

export const Systems = [Story, Wallet, Job, Collection, Vending, Kindness, People];
