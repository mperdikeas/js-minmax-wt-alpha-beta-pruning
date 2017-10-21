// @flow
'use strict'; 
require('source-map-support').install();
import 'babel-polyfill';
import {assert}          from 'chai';
import AssertionError    from 'assertion-error';
assert.isOk(AssertionError);
import           _ from 'lodash';
assert.isOk(_);
import {minmax} from '../src/index.js';
assert.isOk(minmax);


describe('minmax', function() {

    describe('dummy test', function() {
        it('should work', function() {
            assert.isTrue(true);
            //            assert.fail(undefined, undefined, "excrement happened" );
            // TODO: comment on: https://stackoverflow.com/a/33756131/274677
            // TODO: I updated the chai declarations to support the signature assert.fail(undefined, undefined, string)
        });
    });
});

/*
import type {F}  from '../src/trees.js';
import type {F2} from '../src/trees.js';

import type {Exact} from 'flow-common-types';


describe('Node', function() {

    describe('constructor', function() {
        it('should work', function() {
            const node = new Node(3);
            assert.isTrue(node.children===null);
            assert.isTrue(node.value===3);
        });
    });
    describe('set', function() {
        it('should work', function() {
            const node: Node<number, string>= new Node(3);
            assert.isTrue(node.isLeaf());
            const nodeToAdd = new Node(4);
            assert.isTrue(node.set('a', nodeToAdd)===undefined);
            assert.isTrue(!node.isLeaf());            
            assert.isTrue(node.set('a', new Node(5))===nodeToAdd);
            assert.isTrue(!node.isLeaf());                        
        });
    });

    describe('descendants', function() {
        it('should work', function() {
            const {root,a,b,c,d,e,f,g,h,i,j} = sampleTree1();
            assert.deepEqual(h.descendants(), []);
            assert.deepEqual(h.descendants(true), [h]);
            assert.deepEqual(i.descendants(), []);
            assert.deepEqual(i.descendants(true), [i]);
            assert.deepEqual(g.descendants(), []);
            assert.deepEqual(g.descendants(true), [g]);
            assert.deepEqual(d.descendants(), []);
            assert.deepEqual(d.descendants(true), [d]);
            assert.deepEqual(c.descendants(), []);
            assert.deepEqual(c.descendants(true), [c]);
            assert.deepEqual(f.descendants()    .map( (x)=>x.value), ['h', 'i']);
            assert.deepEqual(f.descendants(true).map( (x)=>x.value), ['f', 'h', 'i']);            
            assert.deepEqual(e.descendants()    .map( (x)=>x.value), ['f', 'h', 'i', 'g']);
            assert.deepEqual(e.descendants(true).map( (x)=>x.value), ['e', 'f', 'h', 'i', 'g']);
            assert.deepEqual(b.descendants()    .map( (x)=>x.value), ['d', 'e', 'f', 'h', 'i', 'g']);
            assert.deepEqual(b.descendants(true).map( (x)=>x.value), ['b', 'd', 'e', 'f', 'h', 'i', 'g']);
            assert.deepEqual(a.descendants()    .map( (x)=>x.value), ['b', 'd', 'e', 'f', 'h', 'i', 'g', 'c']);
            assert.deepEqual(a.descendants(true).map( (x)=>x.value), ['a', 'b', 'd', 'e', 'f', 'h', 'i', 'g', 'c']);
        });
    });
    describe('leaves', function() {
        it('should work', function() {
            const {root,a,b,c,d,e,f,g,h,i,j} = sampleTree1();
            assert.deepEqual(h.leaves(), []);
            assert.deepEqual(h.leaves(true), [h]);
            assert.deepEqual(h.leaves(false), []);
            assert.deepEqual(i.leaves(), []);
            assert.deepEqual(i.leaves(true), [i]);
            assert.deepEqual(g.leaves(), []);
            assert.deepEqual(g.leaves(true), [g]);
            assert.deepEqual(d.leaves(), []);
            assert.deepEqual(d.leaves(true), [d]);
            assert.deepEqual(c.leaves(), []);
            assert.deepEqual(c.leaves(true), [c]);
            assert.deepEqual(f.leaves()    .map( (x)=>x.value), ['h', 'i']);
            assert.deepEqual(f.leaves(true).map( (x)=>x.value), ['h', 'i']);            
            assert.deepEqual(e.leaves()    .map( (x)=>x.value), ['h', 'i', 'g']);
            assert.deepEqual(e.leaves(true).map( (x)=>x.value), ['h', 'i', 'g']);
            assert.deepEqual(b.leaves()    .map( (x)=>x.value), ['d', 'h', 'i', 'g']);
            assert.deepEqual(b.leaves(true).map( (x)=>x.value), ['d', 'h', 'i', 'g']);            
            assert.deepEqual(a.leaves()    .map( (x)=>x.value), ['d', 'h', 'i', 'g', 'c']);
            assert.deepEqual(a.leaves(true).map( (x)=>x.value), ['d', 'h', 'i', 'g', 'c']);
        });
    });    
    describe('edgeThatLeadsTo', function() {
        it('should work', function() {
            const {root,a,b,c,d,e,f,g,h,i,j} = sampleTree1();
            assert.strictEqual(a.edgeThatLeadsTo(b), 0);
            assert.strictEqual(a.edgeThatLeadsTo(c), 1);
            assert.strictEqual(a.edgeThatLeadsTo(d), 0);
            assert.strictEqual(a.edgeThatLeadsTo(e), 0);
            assert.strictEqual(a.edgeThatLeadsTo(f), 0);
            assert.strictEqual(a.edgeThatLeadsTo(g), 0);
            assert.strictEqual(a.edgeThatLeadsTo(h), 0);
            assert.strictEqual(a.edgeThatLeadsTo(i), 0);
            assert.strictEqual(a.edgeThatLeadsTo(j), null);  // j is not connected with the tree
        });
    });

    describe('print', function() {
        it('does not break', function() {
            {
            let {root,a,b,c,d,e,f,g,h,i,j} = sampleTree1();
            assert.strictEqual(root.print(),
`ROOT node #0 with value: a
node #0 ~~[0]~~> node #1 with value: b
node #1 ~~[0]~~> node #2 with value: d
node #1 ~~[1]~~> node #3 with value: e
node #3 ~~[0]~~> node #4 with value: f
node #4 ~~[0]~~> node #5 with value: h
node #4 ~~[1]~~> node #6 with value: i
node #3 ~~[1]~~> node #7 with value: g
node #0 ~~[1]~~> node #8 with value: c
`.trim());
            assert.strictEqual(j.print(),
`ROOT node #0 with value: j
`.trim());
            }
            {
                // read them again to drop previously assigned numbers on nodes
           let {root,a,b,c,d,e,f,g,h,i,j} = sampleTree1();
           assert.strictEqual(f.print(),
`ROOT node #0 with value: f
node #0 ~~[0]~~> node #1 with value: h
node #0 ~~[1]~~> node #2 with value: i
`.trim());            
            }
        });
    });


    describe('depthFirstTraversal', function() {
        it('seems correct', function() {
            let root: Node<number, number> = sampleTree2(false);
            let sum: number = 0;
            function accum(n: Node<number, number>) {
                sum+=n.value;
            }
            (accum: F<number, number>);
            {
                sum = 0;
                root.depthFirstTraversal(accum, true, true);
                assert.strictEqual(45, sum);
            }
            {
                sum = 0;
                root.depthFirstTraversal(accum, false, false);
                assert.strictEqual(44, sum);
            }
            // cycle detection
            assert.throws( ()=>
                           {
                               let root = sampleTree2(true);
                               root.depthFirstTraversal((x)=>{}, true, true);
                           }, AssertionError);
 
        });
        it('depths are correct', function() {
            let root: Node<number, number> = sampleTree2(false);
            let depths: Array<number> = [];
            function accum(n: Node<number, number>, parent: ?Node<number, number>, birthEdge: ?number, depth: number) {
                depths.push(depth);
            }
            (accum: F<number, number>);
            {
                depths = [];
                root.depthFirstTraversal(accum, true, true);
                assert.deepEqual(depths, [0,1,2,2,3,4,4,3,1]);
            }
            {
                depths = [];
                root.depthFirstTraversal(accum, false, false);
                assert.deepEqual(depths, [2,4,4,3,3,2,1,1]);
            }
        });
    });

    describe('depthFirstTraversal visits nodes in correct order', function() {
        it('seems correct', function() {
            let {root,a,b,c,d,e,f,g,h,i,j} = sampleTree1(false);
            let visited = '';
            function visitor(n: Node<string, number>) {
                visited+=n.value;
            }
            (visitor: F<string, number>); // see: https://stackoverflow.com/q/41212389/274677
            {
                visited = '';
                root.depthFirstTraversal(visitor, true, true);
                assert.strictEqual(visited, 'abdefhigc');
            }
            {
                visited = '';
                root.depthFirstTraversal(visitor, false, true);
                assert.strictEqual(visited, 'bdefhigc');
            }
            {
                visited = '';
                root.depthFirstTraversal(visitor, true, false);
                assert.strictEqual(visited, 'dhifgebca');
            }
            {
                visited = '';
                root.depthFirstTraversal(visitor, false, false);
                assert.strictEqual(visited, 'dhifgebc');
            }
         });
    });

    describe('depthFirstTraversal birth edges are correct', function() {
        it('seems correct', function() {
            let root: Node<string, string> = sampleTree3(false).a;
            let edgesTraversed = '';
            const visitor: F<string, string> =  // alternate way of: https://stackoverflow.com/q/41212389/274677
            function visitor(n: Node<string, string>, parent: ?Node<string, string>, edge: ?string): void {
                if (edge!=null)
                    edgesTraversed+=edge;
            }
            {
                edgesTraversed = '';
                root.depthFirstTraversal(visitor, true, true);
                assert.strictEqual(edgesTraversed, 'bdefhigc');
            }
            {
                edgesTraversed = '';
                root.depthFirstTraversal(visitor, true, false);
                assert.strictEqual(edgesTraversed, 'dhifgebc');
            }            
         });
    });

    describe('traverseAncestors', function() {
        const {root,a,b,c,d,e,f,g,h,i,j} = sampleTree1();
        (root: Node<string, number>);
        let ancestors = '';
        let children  = '';
        let childEdges= [];
        let distances = [];
        let isRoots   = [];
        function clearTestVariables() {
            ancestors  = '';
            children   = '';
            childEdges = [];
            distances  = [];
            isRoots    = [];
        }
        function visitor(parent: Node<string, number>, child: ?Node<string, number>, childEdge: ?number, distanceFromStart: number, isRoot: boolean) {
            ancestors+=parent.value;
            if (child!=null)
                children+=child.value;
            if (childEdge!=null)
                childEdges.push(childEdge);
            distances.push(distanceFromStart);
            isRoots.push(isRoot);
        }
        (visitor: F2<string, number>);        
        it('should work', function() {
            clearTestVariables();
            root.traverseAncestors(visitor);
            assert.strictEqual(ancestors, 'a');
            assert.strictEqual(children , '');
            assert.deepEqual(childEdges, []);
            assert.deepEqual(distances, [0]);
            assert.deepEqual(isRoots, [true]);

            clearTestVariables();
            root.traverseAncestors(visitor, false);
            assert.strictEqual(ancestors, '');
            assert.strictEqual(children , '');
            assert.deepEqual(childEdges, []);
            assert.deepEqual(distances, []);
            assert.deepEqual(isRoots, []);            
        });
        it('should work #2', function() {
            clearTestVariables();
            a.traverseAncestors(visitor);
            assert.strictEqual(ancestors, 'a');
            assert.strictEqual(children , '');
            assert.deepEqual(childEdges, []);
            assert.deepEqual(distances, [0]);
            assert.deepEqual(isRoots, [true]);
        });
        it('should work #3', function() {
            clearTestVariables();
            b.traverseAncestors(visitor);
            assert.strictEqual(ancestors, 'ba');
            assert.strictEqual(children , 'b');
            assert.deepEqual(childEdges, [0]);
            assert.deepEqual(distances, [0,1]);
            assert.deepEqual(isRoots, [false, true]);
        });
        it('should work #4', function() {
            clearTestVariables();
            c.traverseAncestors(visitor);
            assert.strictEqual(ancestors, 'ca');
            assert.strictEqual(children , 'c');
            assert.deepEqual(childEdges, [1]);
            assert.deepEqual(distances, [0,1]);
            assert.deepEqual(isRoots, [false, true]);
        });
        it('should work #5', function() {
            clearTestVariables();
            i.traverseAncestors(visitor);
            assert.strictEqual(ancestors, 'ifeba');
            assert.strictEqual(children , 'ifeb');
            assert.deepEqual(childEdges, [1,0,1,0]);
            assert.deepEqual(distances, [0,1,2,3,4]);
            assert.deepEqual(isRoots, [false, false, false, false, true]);

            clearTestVariables();
            i.traverseAncestors(visitor, false);
            assert.strictEqual(ancestors, 'feba');
            assert.strictEqual(children , 'ifeb');
            assert.deepEqual(childEdges, [1,0,1,0]);
            assert.deepEqual(distances, [1,2,3,4]);
            assert.deepEqual(isRoots, [false, false, false, true]);            
        });
    });

    describe('leaves II', function() {
        const {root,a,b,c,d,e,f,g,h,i,j} = sampleTree1();
        (root: Node<string, number>);
        let leaves = [];
        function clearTestVariables() {
            leaves = [];
        }
        it('should work', function() {
            clearTestVariables();
            leaves = h.leaves();
            assert.deepEqual(leaves, []);
        });
        it('should work #2', function() {
            clearTestVariables();
            leaves = i.leaves();
            assert.deepEqual(leaves, []);
        });
        it('should work #3', function() {
            clearTestVariables();
            leaves = f.leaves();
            assert.deepEqual(leaves, [h, i]);
        });
        it('should work #4', function() {
            clearTestVariables();
            leaves = b.leaves();
            assert.deepEqual(leaves, [d, h, i, g]);
        });
        it('should work #5', function() {
            clearTestVariables();
            leaves = root.leaves();
            assert.deepEqual(leaves, [d, h, i, g, c]);
        });        
    });

    describe('allPreviousSiblingsSatisfyPredicate', function() {
        it('should work', function() {
            const {a, b, b1, b2, b3, b4, b5} = sampleTree4();
            assert.isTrue (a.allPreviousSiblingsSatisfyPredicate( (x)=>true  ));
            assert.isTrue (a.allPreviousSiblingsSatisfyPredicate( (x)=>false ));
            assert.isFalse(a.onePrevousSiblingFailsPredicate    ( (x)=>true  ));
            assert.isFalse(a.onePrevousSiblingFailsPredicate    ( (x)=>false ));

            assert.isTrue (b.allPreviousSiblingsSatisfyPredicate( (x)=>true  ));
            assert.isTrue (b.allPreviousSiblingsSatisfyPredicate( (x)=>false ));
            assert.isFalse(b.onePrevousSiblingFailsPredicate    ( (x)=>true  ));
            assert.isFalse(b.onePrevousSiblingFailsPredicate    ( (x)=>false ));

            assert.isTrue (b1.allPreviousSiblingsSatisfyPredicate( (x)=>true  ));
            assert.isTrue (b1.allPreviousSiblingsSatisfyPredicate( (x)=>false ));
            assert.isFalse(b1.onePrevousSiblingFailsPredicate    ( (x)=>true  ));
            assert.isFalse(b1.onePrevousSiblingFailsPredicate    ( (x)=>false ));

            assert.isTrue (b2.allPreviousSiblingsSatisfyPredicate( (x)=>true  ));
            assert.isFalse(b2.allPreviousSiblingsSatisfyPredicate( (x)=>false ));
            assert.isFalse(b2.onePrevousSiblingFailsPredicate    ( (x)=>true  ));
            assert.isTrue (b2.onePrevousSiblingFailsPredicate    ( (x)=>false ));

            assert.isTrue (b2.allPreviousSiblingsSatisfyPredicate( (x)=>{return (x.value<2);} ));
            assert.isFalse(b2.allPreviousSiblingsSatisfyPredicate( (x)=>{return (x.value<1);} ));

            assert.isTrue (b3.allPreviousSiblingsSatisfyPredicate( (x)=>{return (x.value<3);} ));
            assert.isFalse(b3.allPreviousSiblingsSatisfyPredicate( (x)=>{return (x.value<1);} ));            
            assert.isFalse(b3.allPreviousSiblingsSatisfyPredicate( (x)=>{return (x.value<2);} ));

            assert.isTrue (b4.allPreviousSiblingsSatisfyPredicate( (x)=>{return (x.value<4);} ));
            assert.isFalse(b4.allPreviousSiblingsSatisfyPredicate( (x)=>{return (x.value<1);} ));
            assert.isFalse(b4.allPreviousSiblingsSatisfyPredicate( (x)=>{return (x.value<2);} ));
            assert.isFalse(b4.allPreviousSiblingsSatisfyPredicate( (x)=>{return (x.value<3);} ));

        });
    });

    describe('earliestAncestorThatDoesntSatisfyPredicate', function() {
        it('should work', function() {
            const {a, b, c, d, e, f, g, h, i} = sampleTree3();
            assert.isTrue(a.earliestAncestorThatDoesntSatisfyPredicate((x)=>false, false)===null);
            [a,b,c,d,e,f,g,h,i].forEach( (x) => {
                assert.isTrue(x.earliestAncestorThatDoesntSatisfyPredicate((y)=>false       )===x);
            } );
            [b, d, e, f, g, h, i].forEach( (x) => {
                assert.isTrue(x.earliestAncestorThatDoesntSatisfyPredicate((y:Node<string, string>)=>y.value>'b' )===b);
            } );
            [b, d, e, f, g, h, i].forEach( (x) => {
                assert.isTrue(x.allAncestorsSatisfyPredicate((y:Node<string, string>)=>y.value>'b' )===false);
            } );
            [a,c].forEach( (x) => {
                assert.isTrue(x.earliestAncestorThatDoesntSatisfyPredicate((y:Node<string, string>)=>y.value>'b' )===a);
            } );
            [a,c].forEach( (x) => {
                assert.isTrue(x.allAncestorsSatisfyPredicate((y:Node<string, string>)=>y.value>'b' )===false);
            } );
            [a, b, c, d, e, f, g, h, i].forEach( (x) => {
                assert.isTrue(x.allAncestorsSatisfyPredicate((y:Node<string, string>)=>y.value>='a' )===true);
            } );            
        });
    });
    
}); //  Node

function sampleTree1() {
    const a = new Node('a');
    const b = new Node('b');
    const c = new Node('c');
    const d = new Node('d');
    const e = new Node('e');
    const f = new Node('f');
    const g = new Node('g');
    const h = new Node('h');
    const i = new Node('i');
    const j = new Node('j');
    f.setn(0, h);
    f.setn(1, i);
    e.setn(0, f);
    e.setn(1, g);
    b.setn(0, d);
    b.setn(1, e);
    a.setn(0, b);
    a.setn(1, c);
    // j is not connected to the rest of the tree
    return {root: a, a: a, b: b, c: c, d: d, e: e, f: f, g: g, h: h, i: i, j: j};
}



function sampleTree2(withCycle: boolean) : Node<number, number>{
    const a: Node<number, number> = new Node(1);
    const b = new Node(2);
    const c = new Node(3);
    const d = new Node(4);
    const e = new Node(5);
    const f = new Node(6);
    const g = new Node(7);
    const h = new Node(8);
    const i = new Node(9);
    f.setn(0, h);
    f.setn(1, i);
    e.setn(0, f);
    e.setn(1, g);
    b.setn(0, d);
    b.setn(1, e);
    a.setn(0, b);
    a.setn(1, c);
    if (withCycle)
        h.setn(0,a);
    return a;
}

function sampleTree3(): {a: Node<string, string>, b: Node<string, string>, c: Node<string, string>, d: Node<string, string>, e: Node<string, string>, f: Node<string, string>, g: Node<string, string>, h: Node<string, string>, i: Node<string, string>} {
    const a: Node<string, string> = new Node('a');
    const b = new Node('b');
    const c = new Node('c');
    const d = new Node('d');
    const e = new Node('e');
    const f = new Node('f');
    const g = new Node('g');
    const h = new Node('h');
    const i = new Node('i');
    f.setn('h', h);
    f.setn('i', i);
    e.setn('f', f);
    e.setn('g', g);
    b.setn('d', d);
    b.setn('e', e);
    a.setn('b', b);
    a.setn('c', c);
    return {a:a, b:b, c:c, d:d, e:e, f:f, g:g, h:h, i:i};
}


type EmptyObject = {};


function sampleTree4() {
    const a : Node<number, Exact<EmptyObject>> = new Node(-1);
    const b : Node<number, Exact<EmptyObject>> = new Node(-1);
    const b1: Node<number, Exact<EmptyObject>> = new Node(1);
    const b2: Node<number, Exact<EmptyObject>> = new Node(2);
    const b3: Node<number, Exact<EmptyObject>> = new Node(3);
    const b4: Node<number, Exact<EmptyObject>> = new Node(4);
    const b5: Node<number, Exact<EmptyObject>> = new Node(5);
    a.setn({}, b);
    b.setn({}, b1);
    b.setn({}, b2);
    b.setn({}, b3);
    b.setn({}, b4);
    b.setn({}, b5);

    return {a, b, b1, b2, b3, b4, b5};

}
*/
