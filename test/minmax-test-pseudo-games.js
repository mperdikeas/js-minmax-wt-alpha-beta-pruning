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


import type {ListMovesFT}                 from '../src/index.js';
import type {IGameRules}                  from '../src/index.js';
import type {EvaluateFT}                  from '../src/index.js';
import type {TMinMaxResult}               from '../src/index.js';
import      {minmax}                      from '../src/index.js';


type NodeT = Node<?number, string>;

function listMoves(node: NodeT): Array<string> {
    if (node.children!=null)
        return Array.from( node.children.keys() );
    else
        throw new Error('I was provided assurances from the library that the listMoves function will never be called on a childless node, and yet that came to pass');
}

(listMoves: ListMovesFT<NodeT, string>)

function nextState(gs: NodeT, move: string): NodeT {
    if (gs.children!=null) {
        const rv: ?NodeT = gs.children.get(move);
        if (rv!=null)
            return rv;
        else throw new Error('bug #1 in my pseudo-game logic');
    } else
        throw new Error('bug #2 in my pseudo-game logic');
}

function terminalStateEval(n: NodeT): ?number {
    if (n.children!==null)
        return null;
    else {
        if (n.value!=null)
            return n.value*( (n.depthFromRoot()%2===1)?-1:1 ); // sse-1513197068: this is deep. I'll write a more extended comment when I find the time ... (hint: it has to do with the way I construct the test trees and the way the evaluate function is supposed to work (it always evaluates from the perspective of the moving player and has no concept of maximizing and minimizing player)
    else
        throw new Error('bug #3 in my pseudo-game logic (or maybe the depth is not set deep enough for the test tree and I have reached a leaf node with no value');
    }
}


const GameRules: IGameRules<NodeT, string> =
          {
              listMoves: listMoves,
              nextState: nextState,
              terminalStateEval: terminalStateEval
          };

function evaluate(n: NodeT): number {
    if (n.value!=null)
        return n.value*( (n.depthFromRoot()%2===1)?-1:1 ); // see: sse-1513197068
    else
        throw new Error('bug #4 in my pseudo-game logic');
}

(evaluate: EvaluateFT<NodeT>);

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
    let pruningIncident    = [];
    return {
        getTotalNodesVisited  : function() {return totalNodesVisited;},
        visitedNode           : function() {       totalNodesVisited++;},
        getLeafNodesEvaluated : function() {return leafNodesEvaluated;},
        evaluatedLeafNode     : function() {       leafNodesEvaluated++;},
        getPruningIncidents        : function() {return pruningIncident;},
        pruningIncident       : function(n: NodeT, aboveBetaOrBelowAlpha: boolean, v: number, alphaOrBetaValue: number, index: number) {
            const o = new PruneIncidentInfo(n, aboveBetaOrBelowAlpha, v, alphaOrBetaValue, index);
            pruningIncident.push(o);
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


function pseudoGameLogic4 (a2, c, c2): NodeT {

    const root = new Node(); 
    const a    = new Node();
    const a1   = new Node();
//    const a2   = new Node();
    const a1a  = new Node(5);
    const a1b  = new Node(1);    
    const a2a  = new Node(8);
    const a2b  = new Node(); // leaf node but we know it will get pruned

    const b    = new Node();
    const b1   = new Node();
    const b2   = new Node();
    const b1a  = new Node(9);
    const b1b  = new Node(7);    
    const b2a  = new Node(4);
    const b2b  = new Node(5);
    
    
    const c1   = new Node();
    const c1a  = new Node(0);
    const c1b  = new Node(7);    
  //  const c2   = new Node();
    const c2a  = new Node();
    const c2a1 = new Node(8);
    const c2a2 = new Node(10);
    const c2a3 = new Node(11);
    const c2a4 = new Node(12);
    const c2b  = new Node();   // leaf node but we know it will get pruned
    const c2c  = new Node();   // ----------------------------------------

    const c3 = new Node(4);
    const c4 = new Node();
    const c5 = new Node();
    const c6 = new Node();    


    
    root.setn('a',  a);
    root.setn('b',  b);
    root.setn('c',  c);
    
    a   .setn('1' , a1);
    a   .setn('2' , a2);
    a1  .setn('a' , a1a);
    a1  .setn('b' , a1b);
    a2  .setn('a' , a2a);
    a2  .setn('b' , a2b);

    
    b   .setn('1',  b1);
    b   .setn('2',  b2);
    b1  .setn('a',  b1a);
    b1  .setn('b',  b1b);
    b2  .setn('a',  b2a);
    b2  .setn('b',  b2b);

    c   .setn('1',  c1);
    c   .setn('2',  c2);
    c   .setn('3',  c3);
    c   .setn('4',  c4);
    c   .setn('5',  c5);    
    c   .setn('6',  c6);    
    c1  .setn('a',  c1a);
    c1  .setn('b',  c1b);

    c2  .setn('a',  c2a);
    c2  .setn('b',  c2b);
    c2  .setn('c',  c2c);

    c2a .setn('1',  c2a1);
    c2a .setn('2',  c2a2);
    c2a .setn('3',  c2a3);
    c2a .setn('4',  c2a4);





    /*    X                            maximizing
          +--a-->N                     minimizing
          |      +--1-->X              maximizing
          |      |      +--a-->5
          |      |      +--b-->1
          |      |
          |      +--2-->X              maximizing node a2
          |             +--a-->8   <-- pruning happens here (and is reported on the father)
          |             +--b-->NA  <-- this node is *never* evaluated
          +--b-->N                     minimizing 
          |      +--1-->X              maximizing
          |      |      +--a-->9
          |      |      +--b-->7
          |      |
          |      +--2-->X              maximizing
          |             +--a-->4
          |             +--b-->5
          +--c-->N                     minimizing
                 +--1-->X              maximizing
                 |      +--a-->0
                 |      +--b-->7
                 |
                 +--2-->X              maximizing node c2
                 |      +--a-->N       minimizing <-- pruning happens here (and is reported on the father)
                 |      |      +--1--> 8
                 |      |      +--2--> 10
                 |      |      +--3--> 11
                 |      |      +--4--> 12
                 |      +--b-->NA      <-- this node is *never* evaluated
                 |      +--b-->NA      <-- this node is *never* evaluated
                 +--3-->4    <-- pruning happens here (and is reported on the father)
                 +--4--> NA <-- this node is *never* evaluated
                 +--5--> NA <-- this node is *never* evaluated
                 +--6--> NA <-- this node is *never* evaluated
    */

    return root;
}

function pseudoGameLogic5 (): NodeT {

    const root = new Node(); 
    const a    = new Node(1);
    const b    = new Node(4);
    const c    = new Node(3);
    const d    = new Node(2);    
    const d1   = new Node(9);
    const d2   = new Node(7);
    const d3   = new Node(8);    



    root.setn('a' ,  a);
    root.setn('b' ,  b);
    root.setn('c' ,  c);
    root.setn('d' ,  d);
    d   .setn('1' ,  d1);
    d   .setn('2' ,  d2);


    /*    X          maximizing
          +--a-->1       
          +--b-->4              
          +--c-->3
          +--d-->2   minimizing
                 +--d1-->9
                 +--d2-->7
                 +--d3-->8
    */

    return root;
}


/* This game will be evaluated by passing a beta of 3.
   Essentially this means that maximizing nodes will take anything >= 3 as a good enough value
   and prune remaining siblings.
*/
function pseudoGameLogic6 (root): NodeT {

    const a    = new Node(1);
    const b    = new Node(4);
    const c    = new Node(); // leaf node and that would normally be a problem, but we will evaluate this game with a beta of 3 and thus pruning will be activated on node [b] (i.e. nodes [c] and [d] will never be evaluated)
    const d    = new Node();

    root.setn('a' ,  a);
    root.setn('b' ,  b);
    root.setn('c' ,  c);
    root.setn('d' ,  d);

    /*    X          maximizing
          +--a-->1
          +--b-->4
          +--c-->X
          +--d-->X
    */

    return root;
}

// game tree evaluated with an alpha of 10 and a beta of 6
function pseudoGameLogic7 (root, c): NodeT {

    root.setn('a' , new Node(1));
    root.setn('b' , new Node(5));

    c   .setn('1' , new Node(12));
    c   .setn('2' , new Node( 9));
    c   .setn('3' , new Node());
    c   .setn('4' , new Node());
    root.setn('c' ,  c);
    
    const d       = new Node(100);
    root.setn('d' ,  d);

    /*    X          maximizing
          +--a-->1
          +--b-->5
          +--c-->X   minimizing  <-- pruning happens here because node c is evaluated to the value of 9 (following pruning at node c2) and 9 is good enough for a maximizing node, given a beta of 6
                 +---1--->12
                 +---2---> 9 <-- pruning happens here first as 9 is less than the alpha of 10 and thus assumed to good enough for a minimizing node. As such we lose sight of the fact that the minimizing player (the opponents) might in fact be able to minimize even further below if we ever end up on node c (i.e. below the value of 9) by chosing one of the c3 or c4 nodes which we disdain to evaluate. In other words we assume that once the opponent gets here he'll grab the good enough value of 9 without analyzing the situation further.
                 +---3---> X
                 +---4---> X
          +--d-->100
    */

    return root;
}

// "linear" game tree to be evaluated with 0, 1, 2 and 3 plies
function pseudoGameLogic8 (evaluations): NodeT {
    const root = new Node(evaluations[0]);
    const a    = new Node(evaluations[1]);
    const b    = new Node(evaluations[2]);
    const c    = new Node(evaluations[3]);
    const d    = new Node();
    const e    = new Node();
    root.setn('a' , a);
    a.setn('b' , b);
    b.setn('c' , c);
    c.setn('d' , d);
    d.setn('d' , e);
    return root;
}

describe('recursive minmax on various pseudo games', function() {
    it('game 1', function() {
        [3,4,10,100,1000].forEach(function(ply) {
            const stats = newStatistics();
            const x: TMinMaxResult<string> = minmax(pseudoGameLogic1()
                                                         , GameRules
                                                         , evaluate
                                                         , ply
                                                         , Number.NEGATIVE_INFINITY
                                                         , Number.POSITIVE_INFINITY
                                                         , stats);
            assert.strictEqual(x.bestMove  , 'b');
            assert.strictEqual(x.evaluation,   1);
            assert.strictEqual(stats.getTotalNodesVisited (), 7);
            assert.strictEqual(stats.getLeafNodesEvaluated(), 5);
            assert.strictEqual(stats.getPruningIncidents  ().length, 0);
        });
    });
    it('game 2', function() {
        [3,4,10,100,1000].forEach(function(ply) {
            const stats = newStatistics();            
            const x: TMinMaxResult<string> = minmax(pseudoGameLogic2()
                                                         , GameRules
                                                         , evaluate
                                                         , ply
                                                         , Number.NEGATIVE_INFINITY
                                                         , Number.POSITIVE_INFINITY
                                                         , stats);
            assert.strictEqual(x.bestMove  , 'c');
            assert.strictEqual(x.evaluation,   1);
            assert.strictEqual(stats.getTotalNodesVisited (), 9);
            assert.strictEqual(stats.getLeafNodesEvaluated(), 6);
            assert.strictEqual(stats.getPruningIncidents  ().length, 0);
        });
    });
    it('game 3', function() {
        [4,10,100,1000].forEach(function(ply) {
            const stats = newStatistics();
            const NodeC = new Node();
            const x: TMinMaxResult<string> = minmax(pseudoGameLogic3(NodeC)
                                                         , GameRules
                                                         , evaluate
                                                         , ply
                                                         , Number.NEGATIVE_INFINITY
                                                         , Number.POSITIVE_INFINITY
                                                         , stats);
            assert.strictEqual(x.bestMove  , 'a');
            assert.strictEqual(x.evaluation,   5);
            assert.strictEqual(stats.getTotalNodesVisited (), 7);
            assert.strictEqual(stats.getLeafNodesEvaluated(), 3);
            assert.strictEqual(stats.getPruningIncidents  ().length, 1);
            const EXPECTED_PRUNE_INCIDENT_INFO = new PruneIncidentInfo(NodeC, true, 8, 5, 0);
            assert.isTrue(stats.getPruningIncidents()[0].equals(EXPECTED_PRUNE_INCIDENT_INFO));
        });
    });
    it('game 4', function() {
        [4,10,100,1000].forEach(function(ply) {
            const stats = newStatistics();
            const a2 = new Node();
            const c  = new Node();            
            const c2 = new Node();
            const x: TMinMaxResult<string> = minmax(pseudoGameLogic4(a2, c, c2)
                                                         , GameRules
                                                         , evaluate
                                                         , ply
                                                         , Number.NEGATIVE_INFINITY
                                                         , Number.POSITIVE_INFINITY
                                                         , stats);
            assert.strictEqual(x.bestMove  , 'a');
            assert.strictEqual(x.evaluation,   5);
            assert.strictEqual(stats.getTotalNodesVisited (), 25);
            assert.strictEqual(stats.getLeafNodesEvaluated(), 14);
            assert.strictEqual(stats.getPruningIncidents  ().length, 3);
            const EXPECTED_PRUNE_INCIDENT_INFO_on_node_a2 = new PruneIncidentInfo(a2, true , 8, 5, 0);
            const EXPECTED_PRUNE_INCIDENT_INFO_on_node_c  = new PruneIncidentInfo( c, false, 4, 5, 2);
            const EXPECTED_PRUNE_INCIDENT_INFO_on_node_c2 = new PruneIncidentInfo(c2, true , 8, 7, 0);
            assert.isTrue(stats.getPruningIncidents()[0].equals(EXPECTED_PRUNE_INCIDENT_INFO_on_node_a2));
            assert.isTrue(stats.getPruningIncidents()[1].equals(EXPECTED_PRUNE_INCIDENT_INFO_on_node_c2));
            assert.isTrue(stats.getPruningIncidents()[2].equals(EXPECTED_PRUNE_INCIDENT_INFO_on_node_c ));
        });
    });
    it('game 5', function() {
        [1,2,3,4,10,100,1000].forEach(function(ply) {
            const stats = newStatistics();
            const x: TMinMaxResult<string> = minmax(pseudoGameLogic5()
                                                         , GameRules
                                                         , evaluate
                                                         , ply
                                                         , Number.NEGATIVE_INFINITY
                                                         , Number.POSITIVE_INFINITY
                                                    , stats);
            if (ply===1) {
                assert.strictEqual(x.bestMove  , 'b');
                assert.strictEqual(x.evaluation,   4);
            } else {
                assert.strictEqual(x.bestMove  , 'd');
                assert.strictEqual(x.evaluation,   7);                
            }
        });
    });
    it('game 6 - with beta equal to 3', function() {
        [1,2,3,4,10,100,1000].forEach(function(ply) {
            const stats = newStatistics();
            const pruningIncidentFatherNode = new Node();
            const x: TMinMaxResult<string> = minmax(pseudoGameLogic6(pruningIncidentFatherNode)
                                                         , GameRules
                                                         , evaluate
                                                         , ply
                                                         , Number.NEGATIVE_INFINITY
                                                         , 3
                                                    , stats);
            assert.strictEqual(x.bestMove  , 'b');
            assert.strictEqual(x.evaluation,   4);
            assert.strictEqual(stats.getPruningIncidents       ().length, 1);
            const EXPECTED_PRUNE_INCIDENT_INFO_on_root = new PruneIncidentInfo(pruningIncidentFatherNode, true, 4, 3, 1);
            assert.isTrue(stats.getPruningIncidents()[0].equals(EXPECTED_PRUNE_INCIDENT_INFO_on_root));
        });
    });
    it('game 7 - with alpha equal to 9 and beta equal to 4', function() {
        [42,10,100,1000].forEach(function(ply) {
            const stats = newStatistics();
            const root = new Node();
            const c    = new Node();
            const x: TMinMaxResult<string> = minmax(pseudoGameLogic7(root, c)
                                                         , GameRules
                                                         , evaluate
                                                         , ply
                                                         ,10
                                                         , 6
                                                    , stats);
            assert.strictEqual(x.bestMove  , 'c');
            assert.strictEqual(x.evaluation,   9);
            assert.strictEqual(stats.getPruningIncidents().length, 2);
            assert.isTrue(stats.getPruningIncidents()[0].equals(new PruneIncidentInfo(   c, false, 9,10, 1)));
            assert.isTrue(stats.getPruningIncidents()[1].equals(new PruneIncidentInfo(root, true , 9, 6, 2)));
        });
    });
    it('game 8', function() {
        const evaluations = [24,1,-3,32];
        [0, 1, 2, 3].forEach(function(ply) {
            const x: TMinMaxResult<string> = minmax(pseudoGameLogic8(evaluations)
                                                    , GameRules
                                                    , evaluate
                                                    , ply);
            if (ply>0)
                assert.strictEqual(x.bestMove  , 'a');
            assert.strictEqual(x.evaluation,   evaluations[ply]);
        });
    });        
});
