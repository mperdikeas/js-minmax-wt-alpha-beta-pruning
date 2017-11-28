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

// dig the difference between type and interface in flow

export type PlayerOneOrTwo = 1 | 2;
function theOtherPlayer(player: PlayerOneOrTwo): PlayerOneOrTwo {
    return player===1?2:1;
}

export interface IGameState<MoveGTP> {
    playerToMove(): PlayerOneOrTwo;
    newState(move: MoveGTP): IGameState<MoveGTP>;
    isEndState(): boolean;
}

export type GameStateBrancherFT <
    MoveGTP
                         > =
    (gs: IGameState<MoveGTP>) => Map<MoveGTP, IGameState<MoveGTP>>; // TODO-1 I am left to understand how can I assert that we expect the exact same type

type GameStateEvaluatorFT <MoveGTP> =
    (gs: IGameState<MoveGTP>, maximizingPlayer: PlayerOneOrTwo) => number;



type MinMaxFT<SideGTP
            , MoveGTP
            
             > =
    (gameState: IGameState<MoveGTP>
     , gameStateBrancher : GameStateBrancherFT<MoveGTP>
     , evaluator: GameStateEvaluatorFT<MoveGTP>
     , plies: number) => ?MoveGTP;


class GameStateWtEvaluation<MoveGTP> {

    gameState: IGameState<MoveGTP>;
    evaluation: ?number;
        
    
    constructor(gameState: IGameState<MoveGTP>, evaluation: ?number) {
        assert.isTrue(evaluation!==undefined);
        this.gameState  = gameState;
        this.evaluation = evaluation;
    }    
}




function generateMoveTree<MoveGTP>
    (  gameState: IGameState<MoveGTP>
     , brancher : GameStateBrancherFT<MoveGTP>
     , plies    : number       )
     : Node<GameStateWtEvaluation<MoveGTP>, MoveGTP> {

        function _generateMoveTree
        (   currentNode: Node<GameStateWtEvaluation<MoveGTP>, MoveGTP>
         ,  pliesRemaining: number  )
       : Node<GameStateWtEvaluation<MoveGTP>, MoveGTP> {        
            if (pliesRemaining===0) {
                return currentNode;
            } else {
                const gs: IGameState<MoveGTP> = currentNode.value.gameState;
                if (gs.isEndState())
                    return currentNode;
                else {
                const nextMoves: Map<MoveGTP, IGameState<MoveGTP>> = brancher(gs);
                    nextMoves.forEach(function(value: IGameState<MoveGTP>, key: MoveGTP) {
                        const childNode = new Node(new GameStateWtEvaluation(value, null));
                        currentNode.setn(key, _generateMoveTree(childNode, pliesRemaining-1));
                    });
                    return currentNode;
                }
            }
        }

        return _generateMoveTree(new Node(new GameStateWtEvaluation(gameState, null)), plies);
    }

function minmax <SideGTP
                , MoveGTP
                
                >
    (gameState           : IGameState<MoveGTP>
     , gameStateBrancher : GameStateBrancherFT<MoveGTP>
     , gameStateEvaluator: GameStateEvaluatorFT<MoveGTP>
     , plies             : number)
    : ?MoveGTP {
/*
         const nextStates: Map<MoveGTP, IGameState<MoveGTP>> = gameStateBrancher(gameState);
         const nextStatesIter = nextStates.keys();

         const nextV = nextStatesIter.next();
         if (nextV!=null) {
             const x =  nextV.value;
         } else
             assert.fail();

 */
        return null;
     }

(minmax: MinMaxFT<*, *>)



exports.theOtherPlayer = theOtherPlayer;
exports.minmax         = minmax;
exports.generateMoveTree = generateMoveTree;

