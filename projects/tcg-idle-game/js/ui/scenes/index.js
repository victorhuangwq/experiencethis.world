/**
 * Scenes: the places the player can go, in navigation order. Each one has:
 *
 *   id                  Location id (encounters use it too)
 *   name(game)          Name in the navigation; it can change as the game goes on
 *   visible(game)       Whether the player can go there yet
 *   render(game, view)  HTML for the scene. view holds what the scene is
 *                       showing, like a binder page; buttons change it with
 *                       the "view.set" action. It isn't saved.
 */

import { HomeScene } from './home.js';
import { OfficeScene } from './office.js';
import { MallScene } from './mall.js';
import { GusScene } from './gus.js';

export const Locations = [HomeScene, OfficeScene, MallScene, GusScene];
