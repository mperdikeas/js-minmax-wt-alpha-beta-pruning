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

/*
Guide to naming conventions used
-------------------------------
GTP            : Generic Type Parameter
ISomeType      : Interface type for class structural (not nominal) typing
SomeFunctionFT : Function Type
*/

// dig the difference between type and interface in flow

interface IGameState<SideGTP, MoveGTP>  {
    players(): [SideGTP, SideGTP];
    playerToMove(): SideGTP;
    newState(move: MoveGTP): IGameState<SideGTP, MoveGTP>;
}

// TODO: make a post about the below trickery which allows me to constraint generic types parameters
type GameStateBrancherFT <MoveGTP
                        , GameStateGTP: IGameState<any, MoveGTP>
                         > =
    (gs: GameStateGTP) => Map<MoveGTP, GameStateGTP>;

type GameStateEvaluatorFT <SideGTP, MoveGTP, GameStateGTP: IGameState<SideGTP, MoveGTP>> =
    (gs: GameStateGTP, maximizingPlayer: SideGTP) => number;


type MinMaxFT<SideGTP
            , MoveGTP
            , GameStateGTP: IGameState<SideGTP, MoveGTP>
             > =
    (gameState: GameStateGTP
     , gameStateBrancher : GameStateBrancherFT<MoveGTP, GameStateGTP>
     , evaluator: GameStateEvaluatorFT<SideGTP, MoveGTP, GameStateGTP>
     , plies: number) => ?MoveGTP;

// dig * vs. any

class GameStateWtEvaluation<SideGTP, MoveGTP, T: IGameState<SideGTP, MoveGTP>> {

    gameState: IGameState<SideGTP, MoveGTP>;
    evaluation: ?number;
        
    
    constructor(gameState: IGameState<SideGTP, MoveGTP>) {
        this.gameState  = gameState;
        this.evaluation = null;
    }

}


class Node<T> {}

function generateEvaluationTree<SideGTP, MoveGTP, GameStateGTP: IGameState<SideGTP, MoveGTP>>
    (gameState: GameStateGTP
     , plies: number) : Node<GameStateWtEvaluation<SideGTP, MoveGTP, GameStateGTP>> {

         return new Node();
    }

function minmax <SideGTP
               , MoveGTP
               , GameStateGTP: IGameState<SideGTP, MoveGTP>
                 >
    (gameState           : GameStateGTP
     , gameStateBrancher : GameStateBrancherFT<MoveGTP, GameStateGTP>
     , gameStateEvaluator: GameStateEvaluatorFT<SideGTP, MoveGTP, GameStateGTP>
     , plies: number): ?MoveGTP {

         const nextStates: Map<MoveGTP, GameStateGTP> = gameStateBrancher(gameState);
         const nextStatesIter = nextStates.keys();

         const nextV = nextStatesIter.next();
         if (nextV!=null) {
             const x =  nextV.value;
         } else
             assert.fail();


     }

(minmax: MinMaxFT<*, *, *>)

// TODO: monitor answer on SO: https://stackoverflow.com/q/46840017/274677
/*

const m: Map<string, string> = new Map();
const iter = m.keys();
const iternext = iter.next();
if (iternext!=null) {
    const ignore = iternext.value();
}



const a: ?any = {};
if (a!=null) {
    console.log(a.toString());
}

*/



exports.minmax = minmax;


type FooT<A, B> = (a: A)=>?B;

function foo<A, B> (a: A): ?B {
    const rv: ?B = null;
    return rv;
}

(foo: FooT<any, any>)



type FuncThatAccepts<A> = (x: A)=>void;

// TODO: SO question on this one



function foo<A>(a: A): void {

}

function foo2(a: number): void {

}

(foo2: FuncThatAccepts<number>)

//(foo: FuncThatAccepts<*>)
//(foo: FuncThatAccepts<any>)
//(foo: FuncThatAccepts)


function foo2(a: number): void {
}

(foo2: FuncThatAccepts<number>)


type FuncThatAcceptsAndReturnsNumber<A> = (x: A)=>number;
{
    function foo<A>(a: A): number {
        return 42;
    }

    (foo: FuncThatAcceptsAndReturnsNumber<any>)

}

// TODO: ask SO why the following is allowed

interface ICanDoSomething {

    doSomething(): void;
}

interface IProducesThingsThatCanDoSomething<T: ICanDoSomething> {

    produce(): T;
    
}
/*
class ProducesThingsThatCanDoSomething implements IProducesThingsThatCanDoSomething<number> {

    produce() {
        return 42;
    }
}
 */





/*
function f(producer: IProducesThingsThatCanDoSomething<number>) {}

type SomethingT = {||};
interface IProducesSomething<T: SomethingT> {
    produce(): T;
}

class Foo implements IProducesSomething<SomethingT> {

    produce() {
        return {};
    }
}
*/


 
interface IGazelle<T> {
    graze(x: T): void;
}


interface ILion<GrassT, GazelleT: IGazelle<GrassT>> {
    sneakThrough(x: GrassT): void;
    hunt(x: GazelleT): void;
}

class GazelleThatEatsNumbers implements IGazelle<number> { // that's the new way in Flow; old way was: https://stackoverflow.com/a/38224059/274677 
    graze(x: number) {}
}

class GazelleThatEatsStrings implements IGazelle<string> {
    graze(x: string) {}
}

class Lion implements ILion<number, GazelleThatEatsNumbers> {
    hunt(x: GazelleThatEatsNumbers) {}
    sneakThrough(x: number) {}
}

{
    function simulate(gazelle, lion) {
        return "story of what happened";
    }
}

/* this fails:
{
    function simulate(gazelle: IGazelle, lion) {
        return "story of what happened";
    }
}
 */

{
    function simulate<GrassT> (gazelle: IGazelle<GrassT>, lion) {
        return "story of what happened";
    }
}


{
    function simulate<GrassT
    , GazelleT: IGazelle<GrassT>
        >
        (gazelle: GazelleT, lion: ILion<GrassT, GazelleT>) { // TODO: why don't I get a flowtype error when I switch GrassT and GazelleT in the parameteric arguments
            return "story of what happened";
        }
}

type SimulationFunction<GrassT, GazelleT: IGazelle<GrassT>, LionT: ILion<GrassT, GazelleT>> =
    (gazelle: GazelleT, lion: LionT) => string

{
    function simulate<GrassT
    , GazelleT: IGazelle<GrassT>
        , LionT: ILion<GrassT, GazelleT>  // TODO: why don't I get a flowtype error when I switch GrassT and GazelleT in the parameteric arguments
        >
        (gazelle: GazelleT, lion: LionT) {
            return "story of what happened";
        }



    (simulate: SimulationFunction<*, *, *>)
}



/*
type SimulationFunction<GrassT, GazelleT: IGazelle<GrassT>> =
    (gazelle: GazelleT, lion: ILion<GrassT, IGazelle<GrassT>>) => string

(simulate: SimulationFunction<*, *>)
*/


/* playground below */

// TODO: comment here: https://stackoverflow.com/a/37651652/274677
// TODO: ask above why isn't this the accepted answer
// TODO: write post on my github page on flow on * vs. any

type H<T> = (input: T) => T;
const h2:H<*> = i => i;
const h3:H<*> = i => i;
const hString: string = h3('apple');
const hNumber: number = h2(7);


/*
export type F<V,E>  = (n: Node<V, E>, parentN: ?Node<V, E>, birthEdge: ?E, depth: number)=> void;
export type F2<V,E> = (n: Node<V, E>, childN : ?Node<V, E>, childEdge: ?E, distanceFromStart: number, isRoot: boolean)=> void;



const TREE_NODE_ID_SYMBOL_KEY: string = 'mjb44-NODE-id';


class Node<V, E> {
    value: V;
    parent: ?Node<V, E>;
    children: ?Map<E, Node<V,E>>;

    constructor(value: V) {
        this.value = value;
        this.children = null;
        this.parent = null;
    }

    setParent(n: Node<V, E>): void {
        this.parent = n;
    }

    allChildrenSatisfy(f: Predicate<Node<V,E>>): boolean {
        let rv: boolean = true;
        if (this.children!=null) {
            this.children.forEach( (v:Node<V,E>, e:E) => {
                if (!f(v))
                    rv = false;
            });
            return rv;
        } else throw new Error('bad choreography'); // todo: is this really useful? the mathematical way to approach this would be to return true if there are no children
    }
    set(edge: E, node: Node<V,E>): ?Node<V,E> {
        if (this.children === null) {
            this.children = new Map();
        }
        const children: ?Map<E, Node<V, E>> = this.children;
        if (children!=null) {
            const prevValue: ?Node<V, E> = children.get(edge);
            children.set(edge, node);
            node.setParent(this);
            return prevValue;
        } else throw new Error('bug1');
    }

    setn(edge: E, node: Node<V,E>): void {
        const prevValue: ?Node<V, E> = this.set(edge, node);
        assert.isTrue(prevValue===undefined);
    }

    isLeaf(): boolean {
        return this.children === null;
    }

    depthFirstTraversal(f: F<V,E>, visitStartNode: boolean, visitParentFirstThenChildren: boolean): void {
        const cycleDetector: Array<Node<V,E>> = [];
        const that = this;
        function _visit(n: Node<V,E>, parentN: ?Node<V,E>, birthEdge: ?E, depth: number) {
            assert.isTrue(!cycleDetector.includes(n), 'cycle detected');
            cycleDetector.push(n);
            if (visitParentFirstThenChildren) {
                if ((n!==that) || visitStartNode) {
                    f(n, parentN, birthEdge, depth);
                }
            }
            const children: ?Map<E, Node<V,E>> = n.children;
            if (children != null) {
                children.forEach( (v: Node<V,E>, k: E) => {
                    _visit(v, n, k, depth+1);
                });
            }
            if (!visitParentFirstThenChildren) {
                if ((n!==that) || visitStartNode) {
                    f(n, parentN, birthEdge, depth);
                }
            }
        }
        _visit(this, null, null, 0);
    }

    traverseAncestors(f: F2<V, E>, includingThisNode: boolean = true): void {
        let distance = 0;
        let node: Node<V, E> = this;
        let child: ?Node<V, E> = null;
        let edge: ?E = null;
        while (true) {
            if ((node!==this) || includingThisNode)
                f(node, child, edge, distance, node.parent===null);
            if (node.parent!=null) {
                const savedParent: Node<V, E> = node.parent;
                child = node;
                edge = node.parent.edgeThatLeadsTo(node);
                node = savedParent;
                distance++;
            } else
                break;
        }
    }

    // "previous" is understood to be according to the map's enumeration order (which is the insertion order)
    allPreviousSiblingsSatisfyPredicate(pred: Predicate<Node<V, E>>): boolean {
        if (this.parent==null) {
            assert.isTrue(this.parent===null); // re-inforcing rigor (albeit at runtime) that FlowType's nagging forced me to abandon
            return true;
        } else {
            let allSatisfy = true;
            if (this.parent.children!=null) {
                for (let [edge, node] of this.parent.children) {
                    (edge: E);
                    (node: Node<V, E>);
                    if (node===this)
                        break;
                    if (!pred(node)) {
                        allSatisfy = false;
                        break;
                    }
                }
                return allSatisfy;
            } else {
                // re-inforcing rigor (albeit at runtime) that FlowType's nagging forced me to abandon
                assert.isTrue(this.parent.children===null);
                return true;
            }
        }
    }

    onePrevousSiblingFailsPredicate(pred: Predicate<Node<V, E>>): boolean {
        return !this.allPreviousSiblingsSatisfyPredicate(pred);
    }

    allAncestorsSatisfyPredicate(pred: Predicate<Node<V, E>>, includingThisNode: boolean = true): boolean {
        let earliestAncestorThatDoesntSatisfyPredicate: ?Node<V, E> = this.earliestAncestorThatDoesntSatisfyPredicate(pred, includingThisNode);
        if (earliestAncestorThatDoesntSatisfyPredicate===null)
            return true;
        else {
            assert.isTrue(earliestAncestorThatDoesntSatisfyPredicate!=null);
            return false;
        }
    }

    earliestAncestorThatDoesntSatisfyPredicate(pred: Predicate<Node<V, E>>, includingThisNode: boolean = true): ?Node<V, E> {
        function f(x: Node<V, E>) {
            if (!pred(x))
                throw x;
        }
        try {
            this.traverseAncestors(f, includingThisNode);
            return null;
        } catch (x) {
            assert.isTrue(x instanceof Node);
            return x;
        }
    }
    
    descendants(includingThisNode: boolean = false): Array<Node<V, E>> {
        const descendants: Array<Node<V, E>> = [];
        function f(n : Node<V, E>) {
            descendants.push(n);
        }

        this.depthFirstTraversal(f, includingThisNode, true);
        assert.isTrue(   ((!includingThisNode) && (descendants.length===0) && ( this.isLeaf())) ||
                         ((!includingThisNode) && (descendants.length>  0) && (!this.isLeaf())) ||
                         (( includingThisNode) && (descendants.length>  0)) );
        return descendants;
    }

    leaves(_includingThisNode: ?boolean): Array<Node<V,E>> {
        const includingThisNode: boolean = _includingThisNode == null ? false : _includingThisNode;        
        const rv: Array<Node<V,E>> = [];
        function addLeavesOnly(n: Node<V, E>): void {
            if (n.isLeaf())
                rv.push(n);
        }
        this.depthFirstTraversal(addLeavesOnly, includingThisNode, true);
        return rv;
    }

    edgeThatLeadsTo(n: Node<V, E>): ?E {
        assert.isFalse(this.isLeaf());
        const children: ?Map<E, Node<V, E>> = this.children;
        assert.isFalse(children === undefined);
        if (children != null) {
            const rv: Array<E> = [];
            children.forEach( function (child: Node<V, E>, edge: E) {
                const descendants: Array<Node<V, E>> = child.descendants(true);
                if (descendants.includes(n))
                    rv.push(edge);
            });
            if (rv.length > 1) throw new Error('Bug! ${rv.length} edges leading to node: ${n} - impossible if the graph is a tree.');
            else if (rv.length === 0) return null;
            else return rv[0];
        } else throw new Error('bug3');
    }

    print(valuePrinter: Stringifier<V> =  (x: V)=>String(x)): string {
        const s: symbol = Symbol.for(TREE_NODE_ID_SYMBOL_KEY);// Symbol();
        let i: number = 0;
        const lines: Array<string> = [];
        const printerVisitor: F<V,E> = function printNode(n: Node<V,E>, parentN: ?Node<V,E>, birthEdge: ?E) {
            assert.isTrue( ((parentN==null) && (birthEdge==null)) || ((parentN!=null) && (birthEdge!=null)) );
            if (!n.hasOwnProperty(s))
                // $SuppressFlowFinding: access of computed property/element. Indexable signature not found in ...
                n[s] = i++;
            if (parentN==null) {
                assert.isTrue(parentN===null);
                assert.isTrue(birthEdge===null);
                assert.isTrue(_.isEmpty(lines));
                // $SuppressFlowFinding: access of computed property/element. Indexable signature not found in ...
                let line: string = `ROOT node #${n[s]} with value: ${valuePrinter(n.value)}`;
                lines.push(line);
            } else {
                assert.isTrue(birthEdge !== undefined);
                if (birthEdge!=null) {
                    // $SuppressFlowFinding: access of computed property/element. Indexable signature not found in ...                    
                    let line: string = `node #${parentN[s]} ~~[${birthEdge}]~~> node #${n[s]} with value: ${valuePrinter(n.value)}`;
                    lines.push(line);
                } else throw new Error('bug');
            }
        };
        this.depthFirstTraversal(printerVisitor, true, true);
        return lines.join('\n');
    }
}


exports.Node = Node;
exports.TREE_NODE_ID_SYMBOL_KEY = TREE_NODE_ID_SYMBOL_KEY;
*/
