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



import {assert} from 'chai';
import {Node}   from 'simple-trees';
import type {IGameState} from './minmax-interface.js';
import type {BrancherFT} from './minmax-interface.js';


class GameStateWtEvaluation<MoveGTP, GameStateGTP: IGameState<MoveGTP>> {

    gameState: GameStateGTP;
    evaluation: ?number;
        
    
    constructor(gameState: GameStateGTP, evaluation: ?number) {
        assert.isTrue(evaluation!==undefined);
        this.gameState  = gameState;
        this.evaluation = evaluation;
    }     
}

function generateMoveTree<MoveGTP, GameStateGTP: IGameState<MoveGTP>>
    (  gameState: GameStateGTP
       , brancher : BrancherFT<MoveGTP, GameStateGTP>
       , plies    : number
    )
    : Node<GameStateWtEvaluation<MoveGTP, GameStateGTP>, MoveGTP> {

        function _generateMoveTree
        (   currentNode: Node<GameStateWtEvaluation<MoveGTP, GameStateGTP>, MoveGTP>
         ,  pliesRemaining: number  )
        : Node<GameStateWtEvaluation<MoveGTP, GameStateGTP>, MoveGTP> {
            if (pliesRemaining===0) {
                return currentNode;
            } else {
                const gs: GameStateGTP = currentNode.value.gameState;
                if (gs.isTerminalState())
                    return currentNode;
                else {
                    const nextMoves: Map<MoveGTP, GameStateGTP> = brancher(gs);
                    nextMoves.forEach(function(value: GameStateGTP, key: MoveGTP) {
                        const childNode = new Node(new GameStateWtEvaluation(value, null));
                        currentNode.setn(key, _generateMoveTree(childNode, pliesRemaining-1));
                    });
                    return currentNode;
                }
            }
        }

        return _generateMoveTree(new Node(new GameStateWtEvaluation(gameState, null)), plies);
    }



exports.GameStateWtEvaluation = GameStateWtEvaluation;
exports.generateMoveTree      = generateMoveTree;
