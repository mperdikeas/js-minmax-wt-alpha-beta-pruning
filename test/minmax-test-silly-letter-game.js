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
 *
 */

type Letter = 'a' | 'b' | 'c';


import type {IGameState}                       from '../src/index.js';
import type {PlayerOneOrTwo}                   from '../src/index.js';
import type {BrancherFT}                       from '../src/index.js';
import type {EvaluatorFT}                      from '../src/index.js';
import      {PLAYER1}                          from '../src/index.js';
import      {PLAYER2}                          from '../src/index.js';
import      {theOtherPlayer}                   from '../src/index.js';
import      {generateMoveTree}                 from '../src/index.js';
import      {minmax}                           from '../src/index.js';

// importation of types that the client programmer will NOT normally have to encounter
import      {GameStateWtEvaluation}            from '../src/minmax-common.js';

import      {evaluateLeafNodes}                from '../src/minmax-impl.js';
import      {pullUpNodesEvaluationWithMinmax}  from '../src/minmax-impl.js';




class GameState implements IGameState<Letter> {
    _playerToMove : PlayerOneOrTwo;
    prevLetter    : ?Letter;
    letter        : ?Letter;

    
    playerToMove(): PlayerOneOrTwo {
        return this._playerToMove;
    }
    newState(newLetter: Letter) {
        return new GameState(theOtherPlayer(this._playerToMove), this.letter, newLetter);

    }

    isTerminalState(): boolean {
        return (this.letter!==null) && (this.prevLetter!==null) && (this.letter===this.prevLetter);
    }

    constructor (playerToMove: PlayerOneOrTwo, prevLetter: ?Letter, letter: ?Letter) {
        assert.isTrue(prevLetter!==undefined);
        assert.isTrue(letter!==undefined);
        this._playerToMove = playerToMove;
        this.prevLetter = prevLetter;
        this.letter = letter;
    }
}

function stringifier(x : GameStateWtEvaluation<Letter, GameState>) : string {
    function s(s: ?string) {
        return s==null?".":s;
    }
    const prevLetter : string = s(x.gameState.prevLetter);
    const letter     : string = s(x.gameState.letter);
    const ev         : string = x.evaluation==null?'?':x.evaluation.toString();
    return `letr: ${prevLetter}-${letter}, end state? ${x.gameState.isTerminalState()?'Y':'N'} ev: ${ev}, mov: ${x.gameState.playerToMove()}`;
}

function brancher(gs: GameState): Map<Letter, GameState> {
    const rv: Map<Letter, GameState> = new Map();
    rv.set('a', gs.newState('a'));
    rv.set('b', gs.newState('b'));
    rv.set('c', gs.newState('c'));
    return rv;
}


(brancher:BrancherFT<Letter, GameState>);


function evaluator(gs: GameState): number {
    if ((gs.prevLetter===gs.letter) && (gs.letter!==null))
        return gs.playerToMove()===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY;
    else
        return 0;
}

(evaluator: EvaluatorFT<Letter, GameState>);


function allNonTerminalNodesAreEvaluatedToZero(tree: Node<GameStateWtEvaluation<Letter, GameState>, Letter>) {

    tree.depthFirstTraversal(function(x: Node<GameStateWtEvaluation<Letter, GameState>, Letter>) {
        if (!x.value.gameState.isTerminalState()) {
            if (x.value.evaluation!=null) {
                assert.isTrue(x.value.evaluation===0, `evaluation was: ${x.value.evaluation}`);
            } else
                assert.fail('at this point all nodes should be evaluated');
        }
    }, true, true);
}

describe('minmax on letter game', function() {

    describe('generateMoveTree', function() {
        describe('does not break for ...', function() {
            function moveTree(depth: number): Node<GameStateWtEvaluation<Letter, GameState>, Letter> {
                const rv: Node<GameStateWtEvaluation<Letter, GameState>, Letter>
                          = generateMoveTree(new GameState(1, null, null), brancher, depth);
                return rv;
            }
            function moveTreeOnlyEndStatesEvaluated(depth: number): Node<GameStateWtEvaluation<Letter, GameState>, Letter> {
                const rv : Node<GameStateWtEvaluation<Letter, GameState>, Letter> = moveTree(depth);
                evaluateLeafNodes(rv, evaluator);
                return rv;
            }
            function moveTreeOnlyEndStatesEvaluatedStringified(depth: number): string {
                const rv : Node<GameStateWtEvaluation<Letter, GameState>, Letter> =  moveTreeOnlyEndStatesEvaluated(depth);
                return rv.print(stringifier);
            }
            function moveTreeAllStatesEvaluatedStringified(depth: number): string {
                const rv : Node<GameStateWtEvaluation<Letter, GameState>, Letter> =  moveTreeOnlyEndStatesEvaluated(depth);
                pullUpNodesEvaluationWithMinmax(rv);
                allNonTerminalNodesAreEvaluatedToZero(rv); // this must be true, precisely because the game is undecided with perfect play
                return rv.print(stringifier);
            }
            describe('depth 0', function() {
                it('only leaves evaluated', function() {
                    const s: string = moveTreeOnlyEndStatesEvaluatedStringified(0);
                    assert.strictEqual(s, 'ROOT node #0 with value: letr: .-., end state? N ev: 0, mov: 1');
                });
                it('all nodes evaluated', function() {
                    const s: string = moveTreeAllStatesEvaluatedStringified(0);
                    assert.strictEqual(s, 'ROOT node #0 with value: letr: .-., end state? N ev: 0, mov: 1');
                });
            });
            describe('depth 1', function() {
                it ('only leaves evaluated', function() {
                    const s: string = moveTreeOnlyEndStatesEvaluatedStringified(1);
                    assert.strictEqual(s,
                                       `
ROOT node #0 with value: letr: .-., end state? N ev: ?, mov: 1
node #0 ~~[a]~~> node #1 with value: letr: .-a, end state? N ev: 0, mov: 2
node #0 ~~[b]~~> node #2 with value: letr: .-b, end state? N ev: 0, mov: 2
node #0 ~~[c]~~> node #3 with value: letr: .-c, end state? N ev: 0, mov: 2

`.trim()                           );
                });
                it ('all nodes evaluated', function() {
                    const s: string = moveTreeAllStatesEvaluatedStringified(1);
                    assert.strictEqual(s,
                                       `
ROOT node #0 with value: letr: .-., end state? N ev: 0, mov: 1
node #0 ~~[a]~~> node #1 with value: letr: .-a, end state? N ev: 0, mov: 2
node #0 ~~[b]~~> node #2 with value: letr: .-b, end state? N ev: 0, mov: 2
node #0 ~~[c]~~> node #3 with value: letr: .-c, end state? N ev: 0, mov: 2

`.trim()                           );
                });
                it('minmax', function() {
                    const s: Letter = minmax(new GameState(1, null, null)
                                             , brancher
                                             , evaluator
                                             , 1);
                    assert.strictEqual(s, 'a');
                });
            });

            describe('depth 2', function() {
                it('only leaves evaluated', function() {
                const s: string = moveTreeOnlyEndStatesEvaluatedStringified(2);
                assert.strictEqual(s,
`
ROOT node #0 with value: letr: .-., end state? N ev: ?, mov: 1
node #0 ~~[a]~~> node #1 with value: letr: .-a, end state? N ev: ?, mov: 2
node #1 ~~[a]~~> node #2 with value: letr: a-a, end state? Y ev: Infinity, mov: 1
node #1 ~~[b]~~> node #3 with value: letr: a-b, end state? N ev: 0, mov: 1
node #1 ~~[c]~~> node #4 with value: letr: a-c, end state? N ev: 0, mov: 1
node #0 ~~[b]~~> node #5 with value: letr: .-b, end state? N ev: ?, mov: 2
node #5 ~~[a]~~> node #6 with value: letr: b-a, end state? N ev: 0, mov: 1
node #5 ~~[b]~~> node #7 with value: letr: b-b, end state? Y ev: Infinity, mov: 1
node #5 ~~[c]~~> node #8 with value: letr: b-c, end state? N ev: 0, mov: 1
node #0 ~~[c]~~> node #9 with value: letr: .-c, end state? N ev: ?, mov: 2
node #9 ~~[a]~~> node #10 with value: letr: c-a, end state? N ev: 0, mov: 1
node #9 ~~[b]~~> node #11 with value: letr: c-b, end state? N ev: 0, mov: 1
node #9 ~~[c]~~> node #12 with value: letr: c-c, end state? Y ev: Infinity, mov: 1


`.trim()                           );                                   
                });

                it('all nodes evaluated', function() {
                    const s: string = moveTreeAllStatesEvaluatedStringified(2);
                assert.strictEqual(s,
`
ROOT node #0 with value: letr: .-., end state? N ev: 0, mov: 1
node #0 ~~[a]~~> node #1 with value: letr: .-a, end state? N ev: 0, mov: 2
node #1 ~~[a]~~> node #2 with value: letr: a-a, end state? Y ev: Infinity, mov: 1
node #1 ~~[b]~~> node #3 with value: letr: a-b, end state? N ev: 0, mov: 1
node #1 ~~[c]~~> node #4 with value: letr: a-c, end state? N ev: 0, mov: 1
node #0 ~~[b]~~> node #5 with value: letr: .-b, end state? N ev: 0, mov: 2
node #5 ~~[a]~~> node #6 with value: letr: b-a, end state? N ev: 0, mov: 1
node #5 ~~[b]~~> node #7 with value: letr: b-b, end state? Y ev: Infinity, mov: 1
node #5 ~~[c]~~> node #8 with value: letr: b-c, end state? N ev: 0, mov: 1
node #0 ~~[c]~~> node #9 with value: letr: .-c, end state? N ev: 0, mov: 2
node #9 ~~[a]~~> node #10 with value: letr: c-a, end state? N ev: 0, mov: 1
node #9 ~~[b]~~> node #11 with value: letr: c-b, end state? N ev: 0, mov: 1
node #9 ~~[c]~~> node #12 with value: letr: c-c, end state? Y ev: Infinity, mov: 1

`.trim()                           );                                   
                });
                it('minmax', function() {
                    const s: Letter = minmax(new GameState(1, null, null)
                                             , brancher
                                             , evaluator
                                             , 2);
                    assert.strictEqual(s, 'a');
                });
                
            });

            describe('depth 3', function() {
                it('only leaves evaluated', function() {
                    const s: string = moveTreeOnlyEndStatesEvaluatedStringified(3);
                    assert.strictEqual(s,
`
ROOT node #0 with value: letr: .-., end state? N ev: ?, mov: 1
node #0 ~~[a]~~> node #1 with value: letr: .-a, end state? N ev: ?, mov: 2
node #1 ~~[a]~~> node #2 with value: letr: a-a, end state? Y ev: Infinity, mov: 1
node #1 ~~[b]~~> node #3 with value: letr: a-b, end state? N ev: ?, mov: 1
node #3 ~~[a]~~> node #4 with value: letr: b-a, end state? N ev: 0, mov: 2
node #3 ~~[b]~~> node #5 with value: letr: b-b, end state? Y ev: -Infinity, mov: 2
node #3 ~~[c]~~> node #6 with value: letr: b-c, end state? N ev: 0, mov: 2
node #1 ~~[c]~~> node #7 with value: letr: a-c, end state? N ev: ?, mov: 1
node #7 ~~[a]~~> node #8 with value: letr: c-a, end state? N ev: 0, mov: 2
node #7 ~~[b]~~> node #9 with value: letr: c-b, end state? N ev: 0, mov: 2
node #7 ~~[c]~~> node #10 with value: letr: c-c, end state? Y ev: -Infinity, mov: 2
node #0 ~~[b]~~> node #11 with value: letr: .-b, end state? N ev: ?, mov: 2
node #11 ~~[a]~~> node #12 with value: letr: b-a, end state? N ev: ?, mov: 1
node #12 ~~[a]~~> node #13 with value: letr: a-a, end state? Y ev: -Infinity, mov: 2
node #12 ~~[b]~~> node #14 with value: letr: a-b, end state? N ev: 0, mov: 2
node #12 ~~[c]~~> node #15 with value: letr: a-c, end state? N ev: 0, mov: 2
node #11 ~~[b]~~> node #16 with value: letr: b-b, end state? Y ev: Infinity, mov: 1
node #11 ~~[c]~~> node #17 with value: letr: b-c, end state? N ev: ?, mov: 1
node #17 ~~[a]~~> node #18 with value: letr: c-a, end state? N ev: 0, mov: 2
node #17 ~~[b]~~> node #19 with value: letr: c-b, end state? N ev: 0, mov: 2
node #17 ~~[c]~~> node #20 with value: letr: c-c, end state? Y ev: -Infinity, mov: 2
node #0 ~~[c]~~> node #21 with value: letr: .-c, end state? N ev: ?, mov: 2
node #21 ~~[a]~~> node #22 with value: letr: c-a, end state? N ev: ?, mov: 1
node #22 ~~[a]~~> node #23 with value: letr: a-a, end state? Y ev: -Infinity, mov: 2
node #22 ~~[b]~~> node #24 with value: letr: a-b, end state? N ev: 0, mov: 2
node #22 ~~[c]~~> node #25 with value: letr: a-c, end state? N ev: 0, mov: 2
node #21 ~~[b]~~> node #26 with value: letr: c-b, end state? N ev: ?, mov: 1
node #26 ~~[a]~~> node #27 with value: letr: b-a, end state? N ev: 0, mov: 2
node #26 ~~[b]~~> node #28 with value: letr: b-b, end state? Y ev: -Infinity, mov: 2
node #26 ~~[c]~~> node #29 with value: letr: b-c, end state? N ev: 0, mov: 2
node #21 ~~[c]~~> node #30 with value: letr: c-c, end state? Y ev: Infinity, mov: 1

`.trim()                           );                                   
                });
                it('all nodes evaluated', function() {
                    const s: string = moveTreeAllStatesEvaluatedStringified(3);
                    assert.strictEqual(s,
`
ROOT node #0 with value: letr: .-., end state? N ev: 0, mov: 1
node #0 ~~[a]~~> node #1 with value: letr: .-a, end state? N ev: 0, mov: 2
node #1 ~~[a]~~> node #2 with value: letr: a-a, end state? Y ev: Infinity, mov: 1
node #1 ~~[b]~~> node #3 with value: letr: a-b, end state? N ev: 0, mov: 1
node #3 ~~[a]~~> node #4 with value: letr: b-a, end state? N ev: 0, mov: 2
node #3 ~~[b]~~> node #5 with value: letr: b-b, end state? Y ev: -Infinity, mov: 2
node #3 ~~[c]~~> node #6 with value: letr: b-c, end state? N ev: 0, mov: 2
node #1 ~~[c]~~> node #7 with value: letr: a-c, end state? N ev: 0, mov: 1
node #7 ~~[a]~~> node #8 with value: letr: c-a, end state? N ev: 0, mov: 2
node #7 ~~[b]~~> node #9 with value: letr: c-b, end state? N ev: 0, mov: 2
node #7 ~~[c]~~> node #10 with value: letr: c-c, end state? Y ev: -Infinity, mov: 2
node #0 ~~[b]~~> node #11 with value: letr: .-b, end state? N ev: 0, mov: 2
node #11 ~~[a]~~> node #12 with value: letr: b-a, end state? N ev: 0, mov: 1
node #12 ~~[a]~~> node #13 with value: letr: a-a, end state? Y ev: -Infinity, mov: 2
node #12 ~~[b]~~> node #14 with value: letr: a-b, end state? N ev: 0, mov: 2
node #12 ~~[c]~~> node #15 with value: letr: a-c, end state? N ev: 0, mov: 2
node #11 ~~[b]~~> node #16 with value: letr: b-b, end state? Y ev: Infinity, mov: 1
node #11 ~~[c]~~> node #17 with value: letr: b-c, end state? N ev: 0, mov: 1
node #17 ~~[a]~~> node #18 with value: letr: c-a, end state? N ev: 0, mov: 2
node #17 ~~[b]~~> node #19 with value: letr: c-b, end state? N ev: 0, mov: 2
node #17 ~~[c]~~> node #20 with value: letr: c-c, end state? Y ev: -Infinity, mov: 2
node #0 ~~[c]~~> node #21 with value: letr: .-c, end state? N ev: 0, mov: 2
node #21 ~~[a]~~> node #22 with value: letr: c-a, end state? N ev: 0, mov: 1
node #22 ~~[a]~~> node #23 with value: letr: a-a, end state? Y ev: -Infinity, mov: 2
node #22 ~~[b]~~> node #24 with value: letr: a-b, end state? N ev: 0, mov: 2
node #22 ~~[c]~~> node #25 with value: letr: a-c, end state? N ev: 0, mov: 2
node #21 ~~[b]~~> node #26 with value: letr: c-b, end state? N ev: 0, mov: 1
node #26 ~~[a]~~> node #27 with value: letr: b-a, end state? N ev: 0, mov: 2
node #26 ~~[b]~~> node #28 with value: letr: b-b, end state? Y ev: -Infinity, mov: 2
node #26 ~~[c]~~> node #29 with value: letr: b-c, end state? N ev: 0, mov: 2
node #21 ~~[c]~~> node #30 with value: letr: c-c, end state? Y ev: Infinity, mov: 1

`.trim()                           );                                   
                });
                it('minmax', function() {
                    const s: Letter = minmax(new GameState(1, null, null)
                                             , brancher
                                             , evaluator
                                             , 2);
                    assert.strictEqual(s, 'a');
                });                                
            });
        });
    });
});

/*
import type {F}  from '../src/trees.js';
import type {F2} from '../src/trees.js';

import type {Exact} from 'flow-common-types';

*/
