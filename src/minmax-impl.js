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

import type {
    IGameRules, EvaluateFT, MinMaxFT, TMinMaxResult, TMinMaxStatistics
} from './minmax-interface.js'


// This class is only used internally by the algorithm (in the recursive call)
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
     , evaluate          : EvaluateFT<GameStateGTP>
     , plies             : number
     , alpha             : number = Number.NEGATIVE_INFINITY
     , beta              : number = Number.POSITIVE_INFINITY 
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
                                 const vForTerminal: ?number = gameRules.terminalStateEval(gameState);
                                 if ( (vForTerminal!=null) || (pliesRemaining===0)) {
                                     if (statisticsHook!=null) statisticsHook.evaluatedLeafNode(gameState);
                                     const v2 : number = (vForTerminal!=null?vForTerminal:evaluate(gameState));
                                     return new EvaluationAndMove(null, v2*(maximizing?1:-1));
                                 } else {
                                     // construct the children and evaluate them
                                     const moves: Array<MoveGTP> = gameRules.listMoves(gameState);
                                     const NUM_OF_MOVES: number = moves.length;
                                     assert.isTrue(NUM_OF_MOVES>0, 'weird number of moves (${NUM_OF_MOVES}) in non-terminal state');
                                     // one can add cleverness and squeeze the two branches into one at the expense of readability 
                                     if (maximizing) {
                                         var v       : number   = Number.NEGATIVE_INFINITY;
                                         var bestMove: ?MoveGTP = null;
                                         for (let i = 0; i < NUM_OF_MOVES ; i++) {
                                             const nextState: (GameStateGTP) = gameRules.nextState(gameState, moves[i]);
                                             const nextStateEval: ?EvaluationAndMove<MoveGTP> = _minmax(nextState, pliesRemaining-1, Math.max(v, alpha), beta, !maximizing);
                                             if (nextStateEval!=null) {
                                                 if (nextStateEval.evaluation > v) {
                                                     if (nextStateEval.evaluation===Number.POSITIVE_INFINITY) // no need to look any further
                                                         return new EvaluationAndMove(moves[i], nextStateEval.evaluation); 
                                                     v        = nextStateEval.evaluation
                                                     bestMove = moves[i];
                                                 }
                                             } else throw new Error('impossible at this point');
                                             if ((v>=beta) && (i!==NUM_OF_MOVES-1)) { /* sse-1512513725: in the various resources on the algorithm I
                                                                                         always see this as (v>beta) but I am confident there is no
                                                                                         reason not to use ">=" instead as this is better (it
                                                                                         increases the likelihood of pruning). Also, if this is
                                                                                         the last child, we don't consider it a true pruning incident
                                                                                         for statistical purposes (the logic remains effectively the
                                                                                         same as for the last child we are going to break out of the
                                                                                         loop anyways */
                                                 if (statisticsHook!=null) statisticsHook.pruningIncident(gameState, true, v, beta, i);
                                                 break;
                                             }
                                         }
                                         assert.isTrue((v===Number.NEGATIVE_INFINITY) || (bestMove!=null), 'maximizing node, v is ${v}, bestMove is: ${bestMove} - this makes no sense');
                                         return new EvaluationAndMove(bestMove!==null?bestMove:moves[0], v); // if all moves are equally bad, return the first one
                                     } else {
                                         var v       : number   = Number.POSITIVE_INFINITY;
                                         var bestMove: ?MoveGTP = null;
                                         for (let i = 0; i < NUM_OF_MOVES ; i++) {
                                             const nextState: (GameStateGTP) = gameRules.nextState(gameState, moves[i]);
                                             const nextStateEval: ?EvaluationAndMove<MoveGTP> = _minmax(nextState, pliesRemaining-1, alpha, Math.min(v,beta), !maximizing);
                                             if (nextStateEval!=null) {
                                                 if (nextStateEval.evaluation===Number.NEGATIVE_INFINITY) // no need to look any further
                                                     return new EvaluationAndMove(moves[i], nextStateEval.evaluation);                                                  
                                                 if (nextStateEval.evaluation<v) {
                                                     v        = nextStateEval.evaluation;
                                                     bestMove = moves[i];
                                                 }
                                             } else throw new Error('impossible at this point');
                                             if ((v<=alpha) && (i!==NUM_OF_MOVES-1)) { // see sse-1512513725 (mutatis mutandis)
                                                 if (statisticsHook!=null) statisticsHook.pruningIncident(gameState, false, v, alpha, i);
                                                 break;
                                             }
                                         }
                                         assert.isTrue((v===Number.POSITIVE_INFINITY) || (bestMove!=null), 'minimizing node, v is ${v}, bestMove is: ${bestMove} - this makes no sense');
                                         return new EvaluationAndMove(bestMove!==null?bestMove:moves[0], v); // if all moves are equally bad, return the first one
                                     }
                                 }
                             }
        const v: ?number = gameRules.terminalStateEval(gameState);
        if (v!=null)
            return {
                bestMove: null,
                evaluation: v
            };
        else {
            assert.isTrue(Number.isInteger(plies) && (plies>=0), `illegal plies for minmax: ${plies}`);
            const evalAndMove :EvaluationAndMove<MoveGTP> = _minmax(gameState, plies, alpha, beta, true); // in the min-max algorithm the player who is to make the move is the maximizing player
            assert.isTrue((plies===0) || (evalAndMove.move!=null), 'this is not a terminal state, plies were not 0 (they were ${plies}) and yet, no move was found, this makes no sense'); 
            return {
                bestMove  : evalAndMove.move,
                evaluation: evalAndMove.evaluation
            };

        }
    }

(minmax: MinMaxFT<mixed, mixed>)

exports.minmax = minmax;

