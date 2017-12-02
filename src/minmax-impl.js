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

import type {
    IGameRules, EvaluatorFT, MinMaxFT, TMinMaxResult, TMinMaxStatistics
} from './minmax-interface.js'


class EvaluationAndMove<MoveGTP> {
    move: ?MoveGTP
    evaluation: number;

    constructor(move: ?MoveGTP, evaluation: number) {
        this.move = move;
        this.evaluation = evaluation;
    }

}

function minmax <GameStateGTP, MoveGTP>
    (gameState           : GameStateGTP
     , gameRules         : IGameRules<GameStateGTP, MoveGTP>
     , evaluator         : EvaluatorFT<GameStateGTP>
     , plies             : number
     , alpha             : number
     , beta              : number     
     , statisticsHook    : ?TMinMaxStatistics<GameStateGTP>
    )
    : TMinMaxResult<MoveGTP> {

    
        function _minmax(gameState           : GameStateGTP
                              , pliesRemaining    : number
                              , alpha             : number
                              , beta              : number                              
                              , maximizing        : boolean
                             ): EvaluationAndMove<MoveGTP> {
                                 if (statisticsHook!=null) statisticsHook.visitedNode(gameState);
                                 if (gameRules.isTerminalState(gameState) || (pliesRemaining===0)) {
                                     if (statisticsHook!=null) statisticsHook.evaluatedLeafNode(gameState);
                                     return new EvaluationAndMove(null, evaluator(gameState)*(maximizing?1:-1));
                                 } else {
                                     // construct the children and evaluate them
                                     const moves: Array<MoveGTP> = gameRules.brancher(gameState);
                                     assert.isTrue(moves.length > 0); // given that this is not a terminal state we should expect at least one possible move
                                     const NUM_OF_MOVES: number = moves.length;
                                     assert.isTrue(NUM_OF_MOVES>0);
                                     if (maximizing) {
                                         var v       : number   = Number.NEGATIVE_INFINITY;
                                         var bestMove: ?MoveGTP = null;
                                         for (let i = 0; i < NUM_OF_MOVES ; i++) {
                                             const nextState: (GameStateGTP) = gameRules.nextState(gameState, moves[i]);
                                             const nextStateEval: ?EvaluationAndMove<MoveGTP> = _minmax(nextState, pliesRemaining-1, v, beta, !maximizing);
                                             if (nextStateEval!=null) {
                                                 if (nextStateEval.evaluation > v) {
                                                     if (nextStateEval.evaluation===Number.POSITIVE_INFINITY) // no need to look any further
                                                         return new EvaluationAndMove(moves[i], nextStateEval.evaluation); 
                                                     v        = nextStateEval.evaluation
                                                     bestMove = moves[i];
                                                 }
                                             } else throw new Error('impossible at this point');
                                             if (v>beta) {
                                                 if (statisticsHook!=null) statisticsHook.prunedNodes(gameState, true, v, beta, i);
                                                 break;
                                             }
                                         }
                                         assert.isTrue((v===Number.NEGATIVE_INFINITY) || (bestMove!=null));
                                         return new EvaluationAndMove(bestMove!==null?bestMove:moves[0], v); // if all moves are equally bad, return the first one
                                     } else {
                                         var v       : number   = Number.POSITIVE_INFINITY;
                                         var bestMove: ?MoveGTP = null;
                                         for (let i = 0; i < NUM_OF_MOVES ; i++) {
                                             const nextState: (GameStateGTP) = gameRules.nextState(gameState, moves[i]);
                                             const nextStateEval: ?EvaluationAndMove<MoveGTP> = _minmax(nextState, pliesRemaining-1, alpha, v, !maximizing);
                                             if (nextStateEval!=null) {
                                                 if (nextStateEval.evaluation===Number.NEGATIVE_INFINITY) // no need to look any further
                                                     return new EvaluationAndMove(moves[i], nextStateEval.evaluation);                                                  
                                                 if (nextStateEval.evaluation<v) {
                                                     v        = nextStateEval.evaluation;
                                                     bestMove = moves[i];
                                                 }
                                             } else throw new Error('impossible at this point');
                                             if (v<alpha) {
                                                 if (statisticsHook!=null) statisticsHook.prunedNodes(gameState, false, v, alpha, i);
                                                 break;
                                             }
                                         }
                                         assert.isTrue((v===Number.POSITIVE_INFINITY) || (bestMove!=null));
                                         return new EvaluationAndMove(bestMove!==null?bestMove:moves[0], v); // if all moves are equally bad, return the first one
                                     }
                                 }
                             }
        assert.isFalse(gameRules.isTerminalState(gameState), 'minmax called on terminal state');
        assert.isTrue(Number.isInteger(plies) && (plies>=1), `illegal plies for minmax: ${plies}`);
        const evalAndMove :EvaluationAndMove<MoveGTP> = _minmax(gameState, plies, alpha, beta, true); // in the min-max algorithm the player who starts first is the maximizing player
        assert.isTrue(evalAndMove.move!=null);

        if (evalAndMove.move!=null)
            return {
                bestMove  : evalAndMove.move,
                evaluation: evalAndMove.evaluation
            };
        else
            throw new Error("impossible at this point as I've already asserted that the move is not null");
    }

(minmax: MinMaxFT<mixed, mixed>)

exports.minmax = minmax;

