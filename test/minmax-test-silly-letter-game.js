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
 *    This is such a simple game that the listMoves function does not depend on whose turn it is to
 *    move (there's no concept of 'pieces' belonging to any of the players), and as such, there's
 *    no need for the game state class to keep track of whose turn it is to play.
 *
 */

type Letter = 'a' | 'b' | 'c';


import type {IGameRules}                  from '../lib/index.js';
import type {EvaluateFT}                  from '../lib/index.js';
import type {TMinMaxResult}               from '../lib/index.js';

import      {minmax}                      from '../lib/index.js';


import type {TMinMaxStatistics}           from '../lib/minmax-interface.js';



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

    terminalStateEval(): ?number {
        if ((this.letter!==null) && (this.prevLetter!==null) && (this.letter===this.prevLetter)) {
            const lettersMatch: boolean = (this.prevLetter===this.letter) && (this.letter!==null);
            if (lettersMatch)
                return Number.POSITIVE_INFINITY; // if the letters match then the player who just finished his move lost the game so the player who's to move next (the 'moving player') WON
            else
                return null;
        } else
            return null; // non-terminal state
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

    function listMoves(gs: GameState): Array<Letter> {
        return ['a', 'b', 'c'];
    }

    function nextState(gs: GameState, move: Letter) {
        return gs.newState(move);
    }

    function terminalStateEval(gs: GameState): ?number {
        return gs.terminalStateEval();
    }

    return {
        listMoves: listMoves,
        nextState: nextState,
        terminalStateEval: terminalStateEval
    };
})();


function evaluate(gs: GameState): number {
        return 0; // the game is totally undecided and balanced in all non-terminal states
}

(evaluate: EvaluateFT<GameState>);


describe('minmax on letter game', function() {
    describe('does not break for ...', function() {
        describe('depth 1', function() {
            it('minmax', function() {
                const stats = newStatistics();
                const s: TMinMaxResult<Letter> = minmax(new GameState(null, null, [])
                                                        , GameRules
                                                        , evaluate
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
                                                        , evaluate
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
                                                        , evaluate
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




    function foo(a: number=42): number {return a+1;}
    type FooT= (a: number)=> number

    (foo: FooT)

    foo();



/*

    function foo(a: ?number = 42): number {
        return a+1;
    }
    type FooT = (a: ?number)=> number

    (foo: FooT)

    foo();
 */
/*
In the following function definition:

     function foo(a: number = 42): number {return a+1;}

 &hellip; what are the semantics of the <i>number</i> annotation?

Is it saying that variable <i>a</i> will always have a value inside
the body of the function or is it saying that client programmers should always supply a value?
 In particular either of the below codes type-check:

 <h2>way 1</h2>
    function foo(a: number = 42): number {return a+1;}
    type FooT= (a: number)=> number

    (foo: FooT)

    foo();

 <h2>way 2</h2>
    function foo(a: ?number = 42): number {
        return a+1;
    }
    type FooT = (a: ?number)=> number

    (foo: FooT)

    foo();

What is the suggested way to annotate in such a case? My preference is with way #2 
as the client programmer only has to look at the definition of the FooT type to
realize that the parameter is optional. This allows me to tell users of my 
library: "simply look at the type of the function (FooT)".

Whereas with way #1 
I have to tell them "the type of the function (FooT) seems to suggest that
an argument is required, but in fact it isn't cause, see, if you look at the
implementation, a default value is supplied"

*/

/*
import type {F}  from '../src/trees.js';
import type {F2} from '../src/trees.js';

import type {Exact} from 'flow-common-types';

*/
