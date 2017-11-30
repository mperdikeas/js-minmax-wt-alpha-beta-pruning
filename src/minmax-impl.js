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

import type {
    IGameState, PlayerOneOrTwo, BrancherFT, EvaluatorFT, MinMaxFT
} from './minmax-interface.js'

import      {PLAYER1}                from './minmax-interface.js';
import      {PLAYER2}                from './minmax-interface.js';
import      {theOtherPlayer}         from './minmax-interface.js';


import {GameStateWtEvaluation}       from './minmax-common.js';
import {generateMoveTree}            from './minmax-common.js';



function evaluateLeafNodes<MoveGTP, GameStateGTP: IGameState<MoveGTP>>
    (   moveTree : Node<GameStateWtEvaluation<MoveGTP, GameStateGTP>, MoveGTP>
     , evaluator : EvaluatorFT <MoveGTP, GameStateGTP>
    ): void
    {
        moveTree.depthFirstTraversal(function(n: Node<GameStateWtEvaluation<MoveGTP, GameStateGTP>, MoveGTP>) {
            if (n.isLeaf()) {
                const evaluation: number = evaluator(n.value.gameState);
                n.value.evaluation = evaluation;                                  
            }
        }, true , true);
    }


function pullUpNodesEvaluationWithMinmax
<MoveGTP, GameStateGTP: IGameState<MoveGTP>>
    (
        moveTree : Node<GameStateWtEvaluation<MoveGTP, GameStateGTP>, MoveGTP>
    ): void {
        function allChildrenHaveBeenEvaluated(n: Node<GameStateWtEvaluation<MoveGTP, GameStateGTP>, MoveGTP>) {
            function predicate(n: Node<GameStateWtEvaluation<MoveGTP, GameStateGTP>, MoveGTP>): boolean {
                return n.value.evaluation!==null;
            }
            return n.allChildrenSatisfy(predicate);
        }
        moveTree.depthFirstTraversal(function(n: Node<GameStateWtEvaluation<MoveGTP, GameStateGTP>, MoveGTP>) {
            if (!n.isLeaf()) {
                assert.isTrue(allChildrenHaveBeenEvaluated(n)); // TODO: not in production, only in test
                function reducedChildrenEvaluation(children: Map<MoveGTP, Node<GameStateWtEvaluation<MoveGTP, GameStateGTP>, MoveGTP>>, f: (number,number)=>number, initial: number): number {
                    return Array.from(children).reduce( (accum: number, [_, v: Node<GameStateWtEvaluation<MoveGTP, GameStateGTP>>]) => {
                        const evaluation: ?number = v.value.evaluation;
                        if (evaluation!=null)
                            return f(accum, evaluation);
                        else
                            throw new Error('impossible, the children should be evaluated at this point');
                    }, initial);
                }                
                const children: ?Map<MoveGTP, Node<GameStateWtEvaluation<MoveGTP, GameStateGTP>, MoveGTP>> = n.children;
                if (children!=null) {
                    if (n.value.gameState.playerToMove()===PLAYER1)
                        n.value.evaluation = reducedChildrenEvaluation(children, Math.max, Number.NEGATIVE_INFINITY);
                    else
                        n.value.evaluation = reducedChildrenEvaluation(children, Math.min, Number.POSITIVE_INFINITY);
                } else {
                    assert.isTrue(children===null); // we can't have undefined children
                    assert.fail(0,1,"impossible, I've already checked that this node is not a leaf");
                }
            }
        }
                                     , true    // including this node, although this isn't strictly necessary
                                     , false); // children first, then parents
    }

function findBestMoveByExaminingTheChildrenOfTheRootOnly
    <MoveGTP, GameStateGTP: IGameState<MoveGTP>>
    (root: Node<GameStateWtEvaluation<MoveGTP, GameStateGTP>, MoveGTP>): MoveGTP {
        assert.isTrue(root.parent  ===null);
        assert.isTrue(root.children !=null);  // you shouldn't call this method on a childless root !
        const rootEvaluation: ?number = root.value.evaluation;
        if (rootEvaluation!=null) {
            let bestMove: ?MoveGTP = null;
            const BEST_MOVE_FOUND = {};
            if (root.children!=null) {
                try {

                    root.children.forEach( (node: Node<GameStateWtEvaluation<MoveGTP, GameStateGTP>, MoveGTP>, move: MoveGTP) => {
                        if (node.value.evaluation===rootEvaluation) {
                            bestMove = move; // there may be ties but we simply return the first one we find
                            throw BEST_MOVE_FOUND;
                        }
                    } );
                    throw new Error('impossible to iterate the children without encountering the best move');
                } catch (e) {
                    if (e===BEST_MOVE_FOUND) {
                        if (bestMove!=null)
                            return bestMove;
                        else
                            throw new Error();
                    }
                    else throw e;
                }
            } else throw new Error("we've already asserted the root has children at the beginning of this method");
        } else throw new Error('root must be evaluated at this point');
    }

function minmax <SideGTP
                , MoveGTP
                , GameStateGTP: IGameState<MoveGTP>
                >
    (gameState           : GameStateGTP
     , brancher          : BrancherFT<MoveGTP, GameStateGTP>
     , evaluator         : EvaluatorFT<MoveGTP, GameStateGTP>
     , plies             : number
    )
    : MoveGTP {
        assert.isFalse(gameState.isTerminalState(), 'minmax called on terminal state');
        assert.isTrue(Number.isInteger(plies) && (plies>=1), `illegal plies for minmax: ${plies}`);
        const moveTree: Node<GameStateWtEvaluation<MoveGTP, GameStateGTP>, MoveGTP>
                  = generateMoveTree                       (gameState, brancher, plies);
        
        evaluateLeafNodes                                      (moveTree, evaluator);
        pullUpNodesEvaluationWithMinmax                        (moveTree);
        return findBestMoveByExaminingTheChildrenOfTheRootOnly (moveTree);
     }

(minmax: MinMaxFT<mixed, mixed, any>)


exports.minmax         = minmax;
exports.generateMoveTree = generateMoveTree;
exports.evaluateLeafNodes = evaluateLeafNodes;
exports.pullUpNodesEvaluationWithMinmax = pullUpNodesEvaluationWithMinmax;


