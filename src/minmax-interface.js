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
ISomeType      : Interface type for class structural (not nominal) typing
SomeFunctionFT : Function Type
*/

const PLAYER1 = 1;
const PLAYER2 = 2;
export type PlayerOneOrTwo = 1 | 2;
function theOtherPlayer(player: PlayerOneOrTwo): PlayerOneOrTwo {
    return player===PLAYER1?PLAYER2:PLAYER1;
}

export interface IGameState<MoveGTP> {
    playerToMove(): PlayerOneOrTwo;
    newState(move: MoveGTP): IGameState<MoveGTP>;
    isTerminalState(): boolean;
}

/*  The brancher function should know how to return all possible immediate states from a given
    state. The framework will only call the brancher on non-terminal states so you don't have
    to check for that inside your brancher's implementation.
 */
export type BrancherFT <
    MoveGTP
   ,GameStateGTP: IGameState<MoveGTP>
                       >
    =
    (gs: GameStateGTP) => Map<MoveGTP, GameStateGTP>;


/* The evaluator function will ***always*** evaluate from the perspective of PLAYER1
   positive infinity means WIN or hugely favourable situation for PLAYER1
   negative ------------------------------------------------------PLAYER2

   Note that in the general case it is possible for a game's terminal state to have
   an evaluation that's neither positive nor negative infinity (e.g. if the game allows
   draws or some other graded outcome).

 */
export type EvaluatorFT <MoveGTP, GameStateGTP: IGameState<MoveGTP>> =
    (gs: GameStateGTP) => number;



export type MinMaxFT<SideGTP
            , MoveGTP
            , GameStateGTP: IGameState<MoveGTP>
             > =
    (gameState: IGameState<MoveGTP>
     , gameStateBrancher : BrancherFT<MoveGTP, GameStateGTP>
     , evaluator: EvaluatorFT<MoveGTP, GameStateGTP>
     , plies: number) => MoveGTP;


exports.PLAYER1 = PLAYER1;
exports.PLAYER2 = PLAYER2;
exports.theOtherPlayer = theOtherPlayer;


