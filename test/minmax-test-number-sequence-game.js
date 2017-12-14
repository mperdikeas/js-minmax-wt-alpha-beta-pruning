// @flow
'use strict'; 
require('source-map-support').install();
import 'babel-polyfill';
import {assert}  from 'chai';
import AssertionError    from 'assertion-error';
assert.isOk(AssertionError);
import           _ from 'lodash';
assert.isOk(_);
import {Node}            from 'simple-trees';
assert.isOk(Node);

/*
 *
 *    We're going to test a number sequence game. A game counter starts at 0.
 *    Each player can choose one of four numbers: 1, 2, 3 or 4
 *    The player who first reaches 10 wins the game.   
 *    If a player is stupid enough to exceed 10 he loses the game.
 *
 *    MoveGTP         will be the type Move
 *    GameStateGTP    is simply 'number'
 * 
 *
 *
 */

type Move = 1 | 2 | 3 | 4;



import type {IGameRules}                       from '../src/index.js';
import type {EvaluateFT}                      from '../src/index.js';
import type {TMinMaxResult}                    from '../src/index.js';

import      {minmax}                      from '../src/index.js';


const GameRules: IGameRules<number, Move> = (function(){

    function listMoves(gs: number): Array<Move> {
        return [1, 2, 3, 4];
    }

    function nextState(gs: number, move: Move): number {
        return gs+move;
    }

    function terminalStateEval(gs: number): ?number {
        if (gs>=10)
            return Number.NEGATIVE_INFINITY; // the player who just finished his move WON the game so the player who's to move next (the 'moving player') LOST
        else
            return null; // we are at a non-terminal state as far as the game is concerned
    }

    return {
        listMoves: listMoves,
        nextState: nextState,
        terminalStateEval: terminalStateEval
    };
})();

function evaluate(gs: number): number {
    return 0; // the evaluate is too stupid to figure out what to do in the other cases, so just returns an ambivalent 0
}

(evaluate: EvaluateFT<number>);

describe('recursive minmax on number game', function() {
    describe('winning cases', function() {    
        it('case 000', function() {

            for (let i = 10; i < 15; i++) {
                const x = minmax(i
                                 , GameRules
                                 , evaluate
                                 , 1);
                assert.isNull(x.bestMove);
            }
        });
        it('case 001', function() {
            const x: TMinMaxResult<Move> = minmax(9
                                                       , GameRules
                                                       , evaluate
                                                  , 30
                                                 );
            assert.strictEqual(x.bestMove  , 1);
            assert.strictEqual(x.evaluation, Number.POSITIVE_INFINITY);
        });
        it('case 002', function() {
            [1,2,3,4].forEach(function(i) {
                const plies = [1,2,10];
                plies.forEach(function(depth) {
                    const x: TMinMaxResult<Move> = minmax(10-i
                                                               , GameRules
                                                               , evaluate
                                                          , depth
                                                         );
                    assert.strictEqual(x.bestMove, i);
                    assert.strictEqual(x.evaluation, Number.POSITIVE_INFINITY);                
                });
            });
        });
        
        it('case 004', function() {
            const counterAndBestMoves = [[4,1], [3,2], [2,3], [1,4]];
            counterAndBestMoves.forEach(([counter, expectedBestMove])=>{
                const x: TMinMaxResult<Move> = minmax(counter
                                                           , GameRules
                                                           , evaluate
                                                           , 3
                                                          );
                assert.strictEqual(x.bestMove, expectedBestMove);
                assert.strictEqual(x.evaluation, Number.POSITIVE_INFINITY);            
            });
        });
    });
    describe('losing cases', function() {    
        it('case 000', function() {

            for (let i = 10; i < 15; i++) {
                for (let ply = 0; i < 10; ply++) {
                    const x = minmax(i
                                     , GameRules
                                     , evaluate
                                     , ply);
                    assert.isNull(x.bestMove);
                }
            }
        });
        it('case 001', function() {
            [0,5].forEach(function(i) {
                const x: TMinMaxResult<Move> = minmax(i
                                                           , GameRules
                                                           , evaluate
                                                           , 30
                                                          );                                                           
                assert.strictEqual(x.evaluation, Number.NEGATIVE_INFINITY);
            });
        });
    });    
});
