// @flow
'use strict';

// The rationale behind using this idiom is described in:
//     http://stackoverflow.com/a/36628148/274677
//
if (!global._babelPolyfill) // https://github.com/s-panferov/awesome-typescript-loader/issues/121
    require('babel-polyfill');
// The above is important as Babel only transforms syntax (e.g. arrow functions)
// so you need this in order to support new globals or (in my experience) well-known Symbols, e.g. the following:
//
//     console.log(Object[Symbol.hasInstance]);
//
// ... will print 'undefined' without the the babel-polyfill being required.


import _ from 'lodash';
import {assert} from 'chai';

import type {Stringifier, Predicate} from 'flow-common-types';

import {Node} from 'simple-trees';


/*
Guide to naming conventions used
-------------------------------
GTP            : Generic Type Parameter
{T/I}SomeType  : Interface or Type (respectively) for class or object structural (not nominal) typing
SomeFunctionFT : Function Type
*/


export type ListMovesFT<GameStateGTP, MoveGTP> = (GameStateGTP)=>Array<MoveGTP>

export type IGameRules<GameStateGTP, MoveGTP> = {|
    /* The framework will *never* call the listMoveser on a terminal state so you don't have to handle that state.
       If you don't trust, me simply return [] on a terminal state even though you can just as well throw an
       exception in that case as execution will never reach that path.
     */
    listMoves                                          : ListMovesFT<GameStateGTP, MoveGTP>,
    nextState         (gs: GameStateGTP, move: MoveGTP): GameStateGTP,
    terminalStateEval (gs: GameStateGTP)               : ?number
|}




/* The evaluate function will ***always*** evaluate from the perspective of the moving player
   (we assume that information on which player is moving is embedded in the GameStateGTP)
   positive infinity means  WIN  or hugely    favourable situation for the moving player
   negative --------------- LOSS ---------- unfavourable ------------------------------

   Note that in the general case it is possible for a game's terminal state to have
   an evaluation that's neither positive nor negative infinity (e.g. if the game allows
   draws or some other graded outcome).

   The evaluate function has no concept of "maximizing" or "minimizing" player. This is an artifact
   of the minmax algorithm. The evaluate function simply reports from the perspective of the moving
   player and the minmax implementation (that constructs the game tree) takes account of who the
   maximizing or minimizing player is and proceeds accordingly. I.e., it effectively multiplies the
   return value of the evaluate function by +1 or -1 respectively.
 */

export type EvaluateFT <GameStateGTP> = (gs: GameStateGTP) => number;

export type TMinMaxResult<MoveGTP> =
    {|
        bestMove  : ?MoveGTP,
        evaluation: number
    |}


export type TMinMaxStatistics<GameStateGTP> =
    {
     visitedNode       (n: GameStateGTP): void,
     evaluatedLeafNode (n: GameStateGTP): void,
     pruningIncident   (n: GameStateGTP, aboveBetaOrBelowAlpha: boolean, v: number, alphaOrBetaValue: number, index: number): void
    };

/* The minmax function type (MinMaxFT) returns both the best move and the evaluation of the root
   node. It assumes that the moving player at the root is also the maximizing player.
   
   Another way to think of the alpha and beta values is the following:
   * alpha: execute the algorithm (with the moving player being the maximizing player) assuming that the
            opponnent will be happy with any value less than alpha and will not try to minimize any further
            once he finds a move that yields an evaluation less than alpha. Default initial value: negative infinity.
     beta:  execute the algorithm and (while on a maximizing node) don't bother searching for anything better than
            beta. Default initial value: positive infinity.
   It should NOT be assumed that the algorithm will return a value in the [alpha, beta] range. In fact it is quite
   possible that you invoke the algorithm with alpha >= beta (e.g. see test file minmax-test-pseudo-games.js and the
   pseudoGameLogic7 test game). Though I don't know whether that makes any sense.
 */
export type MinMaxFT<GameStateGTP, MoveGTP> =
    (gameState   : GameStateGTP
     , gameRules : IGameRules<GameStateGTP, MoveGTP>
     , evaluate: EvaluateFT<GameStateGTP>
     , plies: number
     , alpha?: number
     , beta?:  number
     , statisticsHook?: TMinMaxStatistics<GameStateGTP>
    ) => TMinMaxResult<MoveGTP>;



