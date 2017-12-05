// @flow
'use strict'; 
require('source-map-support').install();
import 'babel-polyfill';
import {assert}          from 'chai';
import AssertionError    from 'assertion-error';
assert.isOk(AssertionError);
import           _ from 'lodash';
assert.isOk(_);
import {Node}            from 'simple-trees';
assert.isOk(Node);

/*
 *
 *    We're going to test a very silly game:
 *    Each player can choose one of three letters 'A', 'B' and 'C'
 *    If the player chooses the letter his opponent chose in the previous round, he LOSES the game.
 *    With perfect play, the game should never end.
 *
 *    MoveGTP         will be the type Letter
 *    GameStateGTP    will be the class GameState
 *
 *    This is such a simple game that the brancher function does not depend on whose turn it is to
 *    move (there's no concept of 'pieces' belonging to any of the players), and as such, there's
 *    no need for the game state class to keep track of whose turn it is to play.
 *
 */

type Letter = 'a' | 'b' | 'c';


import type {IGameRules}                       from '../src/index.js';
import type {EvaluatorFT}                      from '../src/index.js';
import type {TMinMaxResult}                    from '../src/index.js';

import      {minmax}                      from '../src/index.js';


import type {TMinMaxStatistics}                from '../src/minmax-interface.js';



class GameState {
    prevLetter    : ?Letter;
    letter        : ?Letter;
    allLetters    : Array<Letter>; // only needed for testing statistics, not used in the actual game logic

    allLettersS(): string {
        let rv = '';
        for (let i = 0; i < this.allLetters.length ; i++) {
            if (this.allLetters[i]==null)
                ;
            else
                rv+=this.allLetters[i];
        }
        return rv;
            
    }

    
    newState(newLetter: Letter): GameState {
        const newAllLetters = this.allLetters.slice();
        newAllLetters.push(newLetter);
        return new GameState(this.letter, newLetter, newAllLetters);
    }

    isTerminalState(): boolean {
        return (this.letter!==null) && (this.prevLetter!==null) && (this.letter===this.prevLetter);
    }

    constructor (prevLetter: ?Letter, letter: ?Letter, allLetters: Array<Letter>) {
        assert.isTrue(prevLetter!==undefined);
        assert.isTrue(letter!==undefined);
        this.prevLetter = prevLetter;
        this.letter = letter;
        this.allLetters = allLetters;
    }
}

function newStatistics() {
    let totalNodesVisited  = 0;
    let leafNodesEvaluated = 0;
    let nodesPruned        = 0;
    return {
        getTotalNodesVisited  : function()             {return totalNodesVisited;},
        visitedNode           : function(_: GameState) {       totalNodesVisited++;},
        getLeafNodesEvaluated : function()             {return leafNodesEvaluated;},
        evaluatedLeafNode     : function(_: GameState) {       leafNodesEvaluated++;},
        getNodesPruned        : function()             {return nodesPruned;},
        pruningIncident       : function() {nodesPruned++;}
    };
}

const GameRules: IGameRules<GameState, Letter> = (function(){

    function brancher(gs: GameState): Array<Letter> {
        return ['a', 'b', 'c'];
    }

    function nextState(gs: GameState, move: Letter) {
        return gs.newState(move);
    }

    function isTerminalState(gs: GameState): boolean {
        return gs.isTerminalState();
    }

    return {
        brancher: brancher,
        nextState: nextState,
        isTerminalState: isTerminalState
    };
})();


function evaluator(gs: GameState): number {
    const lettersMatch: boolean = (gs.prevLetter===gs.letter) && (gs.letter!==null);
    if (lettersMatch)
        return Number.POSITIVE_INFINITY; // if the letters match then the player who just finished his move lost the game so the player who's to move next (the 'moving player') WON
    else
        return 0;
}

(evaluator: EvaluatorFT<GameState>);


describe('minmax on letter game', function() {
    describe('does not break for ...', function() {
        describe('depth 1', function() {
            it('minmax', function() {
                const stats = newStatistics();
                const s: TMinMaxResult<Letter> = minmax(new GameState(null, null, [])
                                                        , GameRules
                                                        , evaluator
                                                        , 1
                                                        , Number.NEGATIVE_INFINITY
                                                        , Number.POSITIVE_INFINITY
                                                        , stats);
                assert.strictEqual(s.bestMove, 'a');
                assert.strictEqual(s.evaluation, 0); // (since the game never finishes with perfect play)
                assert.strictEqual(stats.getTotalNodesVisited (), 4);
                assert.strictEqual(stats.getLeafNodesEvaluated(), 3);
                assert.strictEqual(stats.getNodesPruned       (), 0);
            });
        });
        if (false)        
        describe('depth 2', function() {
            it('minmax', function() {
                const stats = newStatistics();
                const s: TMinMaxResult<Letter> = minmax(new GameState(null, null, [])
                                                        , GameRules
                                                        , evaluator
                                                        , 2
                                                        , Number.NEGATIVE_INFINITY
                                                        , Number.POSITIVE_INFINITY 
                                                        , stats);
                assert.strictEqual(s.bestMove, 'a');
                assert.strictEqual(s.evaluation, 0); // (since the game never finishes with perfect play)
                assert.strictEqual(stats.getTotalNodesVisited() , 1+3+9);
                assert.strictEqual(stats.getLeafNodesEvaluated(),     9);
                assert.strictEqual(stats.getNodesPruned       (),     0);
            });
        });
        describe('depth 3', function() {
            it('minmax', function() {
                const stats = newStatistics();                    
                const s: TMinMaxResult<Letter> = minmax(new GameState(null, null, [])
                                                        , GameRules
                                                        , evaluator
                                                        , 3
                                                        , Number.NEGATIVE_INFINITY
                                                        , Number.POSITIVE_INFINITY
                                                        , stats);
                assert.strictEqual(s.bestMove, 'a');
                assert.strictEqual(s.evaluation, 0); // (since the game never finishes with perfect play)



                assert.strictEqual(stats.getTotalNodesVisited()  , 19);
                assert.strictEqual(stats.getLeafNodesEvaluated() , 11);
                assert.strictEqual(stats.getNodesPruned()        ,  3);
            });                
        });
    });
});

/*
import type {F}  from '../src/trees.js';
import type {F2} from '../src/trees.js';

import type {Exact} from 'flow-common-types';

*/
