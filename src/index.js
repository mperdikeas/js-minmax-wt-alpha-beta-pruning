//@flow
'use strict';
// The rationale behind using this idiom is described in:
//     http://stackoverflow.com/a/36628148/274677
//

if (!global._babelPolyfill) // https://github.com/s-panferov/awesome-typescript-loader/issues/121
    require('babel-polyfill'); // this is important as Babel only transforms syntax (e.g. arrow functions)
// so you need this in order to support new globals or (in my experience) well-known Symbols, e.g. the following:
//
//     console.log(Object[Symbol.hasInstance]);
//
// ... will print 'undefined' without the the babel-polyfill being required.

import type {
    IGameState, PlayerOneOrTwo, BrancherFT, EvaluatorFT, MinMaxFT
} from './minmax-interface.js'

import      {PLAYER1}                from './minmax-interface.js';
import      {PLAYER2}                from './minmax-interface.js';
import      {theOtherPlayer}         from './minmax-interface.js';
import      {generateMoveTree}       from './minmax-impl.js';
import      {minmax}                 from './minmax-impl.js';



export type {
    IGameState, PlayerOneOrTwo, BrancherFT, EvaluatorFT, MinMaxFT
};
exports.PLAYER1                 = PLAYER1;
exports.PLAYER2                 = PLAYER2;
exports.theOtherPlayer          = theOtherPlayer;
exports.generateMoveTree        = generateMoveTree;
exports.minmax                  = minmax;





