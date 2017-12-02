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
import type {Exact} from 'flow-common-types';


import type {BrancherFT}                       from '../src/index.js';
import type {IGameRules}                       from '../src/index.js';
import type {EvaluatorFT}                      from '../src/index.js';
import type {TMinMaxResult}                    from '../src/index.js';
import      {minmax}                      from '../src/index.js';


type NodeT = Node<?number, string>;

function brancher(node: NodeT): Array<string> {
    if (node.children!=null)
        return Array.from( node.children.keys() );
    else
        throw new Error('I was provided assurances from the library that the brancher will never be called on a childless node, and yet that came to pass');
}

(brancher: BrancherFT<NodeT, string>)

function nextState(gs: NodeT, move: string): NodeT {
    if (gs.children!=null) {
        const rv: ?NodeT = gs.children.get(move);
        if (rv!=null)
            return rv;
        else throw new Error('bug #1 in my pseudo-game logic');
    } else
        throw new Error('bug #2 in my pseudo-game logic');
}

function isTerminalState(n: NodeT) {
    return n.children===null;
}


const GameRules: IGameRules<NodeT, string> =
          {
              brancher: brancher,
              nextState: nextState,
              isTerminalState: isTerminalState
          };

function evaluator(n: NodeT): number {
    if (n.value!=null)
        return n.value*( (n.depthFromRoot()%2===1)?-1:1 ); // this is deep. I'll write a more extended comment when I find the time ... (hint: it has to do with the way I construct the test trees and the way the evaluator function is supposed to work (it always evaluates from the perspective of the moving player and has no concept of maximizing and minimizing player)
    else
        throw new Error('bug #3 in my pseudo-game logic');
}

(evaluator: EvaluatorFT<NodeT>);

class PruneIncidentInfo {
    prunedNode: mixed;
    aboveBetaOrBelowAlpha: boolean;
    v: number;
    alphaOrBetaValue: number;
    index: number;
    constructor(prunedNode, aboveBetaOrBelowAlpha, v, alphaOrBetaValue, index) {
        this.prunedNode = prunedNode;
        this.aboveBetaOrBelowAlpha = aboveBetaOrBelowAlpha;
        this.v = v;
        this.alphaOrBetaValue = alphaOrBetaValue;
        this.index = index;
    }
    equals(o): boolean {
        return this.prunedNode===o.prunedNode
            &&     this.aboveBetaOrBelowAlpha===o.aboveBetaOrBelowAlpha
            &&     this.v === o.v
            && this.alphaOrBetaValue===o.alphaOrBetaValue
            && this.index === o.index;
    }

}

function newStatistics() {
    let totalNodesVisited  = 0;
    let leafNodesEvaluated = 0;
    let nodesPruned        = [];
    return {
        getTotalNodesVisited  : function() {return totalNodesVisited;},
        visitedNode           : function() {       totalNodesVisited++;},
        getLeafNodesEvaluated : function() {return leafNodesEvaluated;},
        evaluatedLeafNode     : function() {       leafNodesEvaluated++;},
        getNodesPruned        : function() {return nodesPruned;},
        prunedNodes           : function(n: NodeT, aboveBetaOrBelowAlpha: boolean, v: number, alphaOrBetaValue: number, index: number) {
            const o = new PruneIncidentInfo(n, aboveBetaOrBelowAlpha, v, alphaOrBetaValue, index);
            nodesPruned.push(o);
        }
    };
}


function pseudoGameLogic1 (): NodeT {

    const a    = new Node();
    const b    = new Node();
    const c1   = new Node(5);
    const c2   = new Node(4);
    const c3   = new Node(1);
    const c4   = new Node(2);
    const c5   = new Node(3);
    
    a.setn('b' ,  b);
    b.setn('c1', c1);
    b.setn('c2', c2);
    b.setn('c3', c3);
    b.setn('c4', c4);
    b.setn('c5', c5);

    /*   X                     maximizing
         +--b-->X              minimizing
                +--c1-->5
                +--c2-->4
                +--c3-->1
                +--c4-->2
                +--c5-->3
     */

    return a;
}

function pseudoGameLogic2 (): NodeT {

    const a    = new Node();
    const b    = new Node();
    const c    = new Node();
    const b1   = new Node(4);
    const b2   = new Node(4);
    const b3   = new Node(0);
    const c1   = new Node(2);
    const c2   = new Node(1);
    const c3   = new Node(3);
    
    a.setn('b' ,  b);
    a.setn('c' ,  c);    
    b.setn('b1', b1);
    b.setn('b2', b2);
    b.setn('b3', b3);
    c.setn('c1', c1);
    c.setn('c2', c2);
    c.setn('c3', c3);

    /*   X                     maximizing
         +--b-->X              minimizing
         |      +--b1-->4
         |      +--b2-->4
         |      +--b3-->0
         |
         +--c-->X              minimizing
                +--c1-->2
                +--c2-->1
                +--c3-->3

     */    

    return a;
}



function pseudoGameLogic3 (NodeC): NodeT {

    const root = new Node(); 
    const a    = new Node();
    const b    = new Node();
    const c    = NodeC;
    const b1   = new Node(5);
    const b2   = new Node(1);
    const c1   = new Node(8);
    const c2   = new Node(); // this is a terminal node so it should normally have a value but we know for a fact that execution will not reach here due to pruning


    root.setn('a', a);
    a   .setn('b' ,  b);
    a   .setn('c' ,  c);    
    b   .setn('b1', b1);
    b   .setn('b2', b2);
    c   .setn('c1', c1);
    c   .setn('c2', c2);


    /*    X                            maximizing
          +--a-->X                     minimizing
                 +--b-->X              maximizing
                 |      +--b1-->5
                 |      +--b2-->1
                 |
                 +--c-->X              maximizing
                        +--c1-->8  <-- pruning happens here (and is reported on the father)
                        +--c2-->9  <-- this node is *never* evaluated
    */

    return root;
}


describe('recursive minmax on various pseudo games', function() {
    it('game 1', function() {
        [3,4,10,100,1000].forEach(function(ply) {
            const stats = newStatistics();
            const x: TMinMaxResult<string> = minmax(pseudoGameLogic1()
                                                         , GameRules
                                                         , evaluator
                                                         , ply
                                                         , Number.NEGATIVE_INFINITY
                                                         , Number.POSITIVE_INFINITY
                                                         , stats);
            assert.strictEqual(x.bestMove  , 'b');
            assert.strictEqual(x.evaluation,   1);
            assert.strictEqual(stats.getTotalNodesVisited (), 7);
            assert.strictEqual(stats.getLeafNodesEvaluated(), 5);
            assert.strictEqual(stats.getNodesPruned       ().length, 0);
        });
    });
    it('game 2', function() {
        [3,4,10,100,1000].forEach(function(ply) {
            const stats = newStatistics();            
            const x: TMinMaxResult<string> = minmax(pseudoGameLogic2()
                                                         , GameRules
                                                         , evaluator
                                                         , ply
                                                         , Number.NEGATIVE_INFINITY
                                                         , Number.POSITIVE_INFINITY
                                                         , stats);
            assert.strictEqual(x.bestMove  , 'c');
            assert.strictEqual(x.evaluation,   1);
            assert.strictEqual(stats.getTotalNodesVisited (), 9);
            assert.strictEqual(stats.getLeafNodesEvaluated(), 6);
            assert.strictEqual(stats.getNodesPruned       ().length, 0);            
        });
    });
    it('game 3', function() {
        [4,10,100,1000].forEach(function(ply) {
            const stats = newStatistics();
            const NodeC = new Node();
            const x: TMinMaxResult<string> = minmax(pseudoGameLogic3(NodeC)
                                                         , GameRules
                                                         , evaluator
                                                         , ply
                                                         , Number.NEGATIVE_INFINITY
                                                         , Number.POSITIVE_INFINITY
                                                         , stats);
            assert.strictEqual(x.bestMove  , 'a');
            assert.strictEqual(x.evaluation,   5);
            assert.strictEqual(stats.getTotalNodesVisited (), 7);
            assert.strictEqual(stats.getLeafNodesEvaluated(), 3);
            assert.strictEqual(stats.getNodesPruned       ().length, 1);
            const EXPECTED_PRUNE_INCIDENT_INFO = new PruneIncidentInfo(NodeC, true, 8, 5, 0);
            assert.isTrue(stats.getNodesPruned()[0].equals(EXPECTED_PRUNE_INCIDENT_INFO));
        });
    });        
});
