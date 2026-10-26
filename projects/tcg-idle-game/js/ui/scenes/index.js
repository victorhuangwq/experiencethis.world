/**
 * Scenes: the places the player can go, in navigation order. Each one has:
 *
 *   id              Location id (encounters use it too)
 *   name(game)      Name in the navigation; it can change as the game goes on
 *   visible(game)   Whether the player can go there yet
 *   render(game)    HTML for the scene
 */

import { HomeScene } from './home.js';
import { MallScene } from './mall.js';
import { GusScene } from './gus.js';

export const Locations = [HomeScene, MallScene, GusScene];
