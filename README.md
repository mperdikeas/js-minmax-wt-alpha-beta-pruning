# minmax-wt-alpha-beta-pruning

A JavaScript library implementing
a **generic** minmax engine with alpha-beta pruning that can work with **any** game supplied by a client programmer.


# Installation

```
npm install minmax-wt-alpha-beta-pruning
```

# Entry Point

The library exports a single function:

```js
import {minmax} from 'minmax-wt-alpha-beta-pruning';
```


# Features

The main feature of this library is that it can work with **any** two-player game that a client
programmer may define. As such, it can be thought of as an engine to which the client programmer plugs certain
functions describing their game rules and the engine comes up with the best move. The concepts of the
min-max algorithm do not leak out to client programmers who only concern themselves with the rules of the game.
Well, actually the only concept that does leak is the number of plies to look ahead but this is hardly
intrinsic to the min-max algorithm.

The basic min-max algorithm is rather obvious and straightforward, any coder is capable of independently
inventing it even if they have read nothing about it. The clever part is the performance optimization
afforded by the *alpha-beta pruning* idea. I am not going to describe that here. Refer to online resources
or some textbook. But note that, at the time of this writing, the algorithm as presented in the eponymous Wikipedia
article is wrong. Once you read about alpha-beta pruning it seems simple at first but it's tricky to get it
right. This being said, despite the bug in the algorithm, the Wikipedia article does a passable job at
explaining the intuition behind the alpha-beta pruning idea.


The library is statically typed using FlowType. Of course, you, as a client programmer, don't have to use FlowType.
However, if it so happens that you are familiar with FlowType, then simply look at the following two
files instead of (or in addition to) reading this documentation:

* *minmax-interface.js*: type definitions
* *index.js*: the single exported function (minmax) and some exported FlowType definitions


# Main Concepts

The engine imagines every game supplied to it as consisting of the following things:

* some opaque data structure representing the game state
* some opaque data structure representing a possible move
* a function that is given a game state returns the list of possible, valid moves (under the rules of the game)
* a function that is given a game state and a move returns a new game state
* a function that is given a game state and detects whether the game has finished (and pronounces the winner or declares a tie or some other more nuanced outcome &mdash; e.g. in scoring games)

The engine makes no assumptions at all as to the data structure representing the *game state*. It is assumed
to be an opaque object which the library does not try to access in any way. It is also assumed that this
object encodes which player is to move next (this is, after all, part of the game state so it should
come as no surprise). How the game state object, implicitly or explicitly, encodes which player is to move
next is up to the client programmer.

Similarly, the engine makes no assumptions as to the data structure representing *moves* in the game.
Again, it is treated as an opaque object that the library simply passes around.

Finally the engine is totally ignorant of whatever data structure the client programmer uses to represent
the two players or the two "sides" and is not even dealing with such objects. The only objects it deals with
are, as explained:

* game states
* moves

&hellip; and they are both treated opaquely by the library. I.e. the library does not expect them to
have any particular fields to access or methods to call. It simply accepts them and passes them around.

To invoke the engine, i.e. to call the *minmax* function, the client programmer has to supply 
four functions which the library internally names:

* *terminalStateEval*
* *listMoves*
* *nextState*
* *evaluate*


These four functions that the client programmer supplies are described below. These
functions have no concept of the minmax algorithm. For all the client programmer knows, they supply
those four functions to some AI and the AI figures the best move. Which algorithm the AI uses to find
the best move is abstracted away and the four functions supplied by the client programmer are not aware of what
algorithm operates on them nor do they need to be aware of any of the concepts of the minmax algorithm. In particular,
the concept of a maximizing player and a minimizing player is kept internal in the library and is not leaked to the client
programmer.

Note that I use the names that the library uses internally to
refer to those functions. You can obviously name yours however you like.

## terminalStateEval

This function serves a dual purpose: it pronounces whether the game has ended and, if so, the
outcome / score of the game (e.g. win or lose for a player or tie or some other score).
This function should accept an object representing the game state and return either:

* *null* if the game has not ended at this state according to the rules of the game.

&hellip; or:

* a number signifying the score / outcome of the game if the game has indeed ended on that state. I.e. if we are
on a state in which no more moves are possible. We call such a state, a "terminal state".

So it should look like this:

```js
function terminalStateEval(gameState) {
    // returns null or a number (do not mutate gameState)
}
```    

Pay extra attention to the following point:

The game engine expects the *terminalStateEval* function to always report the outcome, **from the perspective
of the player who is to move next**. Obviously, once the game has reached a terminal state there's going to be no
more moves to make, so no player will move next but it is still clear to which player we are referring when
we say "the player who moves next".
If this wording bothers you, think of it as "the player who would normally move next if this were not
a terminal state" or "the player other than the player who just made their move".

To provide some examples, in a game with only win/lose outcomes, suppose a player just made a move
that won the game for him. The *terminalStateEval* function should then return negative infinity or some other very low
value (see similar discussion in the description of the *evaluate* function) as the game was lost for the other player
(who would normally get to move next were this not a terminal state).

Depending on the game, it is quite possible that your
*terminalStateEval* function may return a non infinity value for a terminal state. This could be the case, e.g. if
the game allows draws or uses some numerical scoring mechanism. Finally, you are not even required to
return infinity on a terminal state that results in
victory or defeat for one of the players. Any sufficiently large (or small) value will do. The only requirements
the engine has are that:

* for non-terminal states you return null
* for terminal states you return a number with the understanding that the greater the number, the better the
situation will be assumed to be from the perspective of the player who moves next.

That's all.

Note that the *terminalStateEval* is not meant to be some general evaluation function for non-terminal states (that's the
*evaluate* function which is described later). For non-terminal states simply return null and be done with it. You
should be able to implement *terminalStateEval* such that it is very fast. In most games that I can think
of (except Go), it is very easy to determine if the game has ended and who's the winner or what's the score.
Clever heuristics
and AI stuff belong in the *evaluate* function, not in *terminalStateEval*.

Finally, if you already know a bit or two about the min-max algorithm, you will know that it has the
concept of "leaf nodes".
*Leaf nodes* are game states in the game tree in which either the game has ended or analysis cannot proceed
any further due to the fact that the maximum analysis depth has been reached. You may then be wondering
how *terminalStateEval* relates to the concept of *leaf nodes* in the minmax algorithm. The answer is that
it is unrelated.

Do not be confused by the minmax implementation-specific concept of "leaf nodes"! The
*terminalStateEval* is simply required to report whether the game has ended **under the rules
of the game**, not whether this game state is a *leaf node* in the game tree created by the minmax algorithm (to which
it has no visibility to begin with). Obviously a terminal game state will always be a leaf in the game tree
(the converse is not true), but that doesn't need to concern you.

## listMoves

This function accepts an object representing a game state and returns a non-empty list of possible (valid)
moves according to the rules of the game. It's as simple as that.

So it should look like this:

```js
function listMoves(gameState) {
    // do not mutate gameState
    const returnValue = []
    // populate with at least one (1) valid move
    return returnValue;
}
```    

The game engine will never call *listMoves* on a terminal game state. As such, *listMoves* should always return a
non-empty list of valid moves (the engine actually makes that assertion internally) as if there are
no valid moves, then we are by definition on a terminal game state.


## nextState

This function should accept two arguments:

* an object representing the state of the game
* an object representing a (valid) move

&hellip; and should return a new game state object corresponding to the state of the game if the move passed as argument is
indeed made. That's all. The previous game state object should not be mutated.

So it should look like this:


```js
function nextState(gameState, moveToMake) {
    // returns a new game state object; does not mutate gameState
}
```    


## evaluate

This is the most challenging function that the client programmer has to provide.

This function accepts an object representing the game state and returns a number that expresses how good the
position is **from the perspective of the moving player**, i.e. from the perspective of the player who moves next
(not from the perspective of the player who just finished moving). The greater the returned value, the better
the position is understood to be from the perspective of the moving player. Recall that the exact same
contract applies to the *terminalStateEval* function. The engine will never call *evaluate* on a terminal game
state, i.e. a state on which *terminalStateEval* has returned a non-null value; it will simply use the value
returned from *terminalStateEval* as the evaluation of such a state.


So your *evaluate* function should look like this:

```js
function evaluate(gameState) {
    // returns a number, does not mutate gameState
}
```


The engine is using *terminalStateEval* to realize if the game has ended, it is not
going to automatically assume that an evaluation of positive of negative infinity necessarily translates to a terminal
state.

This means that you are free to use positive or negative infinities
to simply denote hugely favourable or hugely unfavourable
non-terminal states during the course of the game.

You are also not required to use negative values for game states that are unfavourable
to the moving player. Simply returning a low value in such a case is enough. In short, you have total liberty in deciding
what's the numerical range of your *evaluate* function. Much like you have total liberty in deciding what's the range
of your *terminalStateEval* function. This being said, I think a good practice would be to ensure
that *evaluate* always returns values in an interval that lies strictly within the interval defined by the lowest possible
and the highest possible value that *terminalStateEval* may return.

By having the contract that *evaluate* and *terminalStateEval* always evaluate from 
 the perspective of the moving player we dispense with the minmax algorithm-specific notions of "maximizing"
 and "minimizing" players. Naturally, the internal implementation of the algorithm uses these concepts,
 but the client programmer is not exposed to them. Also note that since all that's passed to the *evaluate*
 or the *terminalStateEval* functions is a *gameState* object, you should structure game state objects in such a way
 that they encode the information of which player moves next.

The beauty of this solution is that the client programmer doesn't need to know about "minimizing" and "maximizing"
players and that the engine library does not expose in the API, is not passed, and does not have to handle
any objects or conventions for representing or encoding "sides" or "players". As already explained, the only objects
passed to or handled by the library are *game state* and *move* objects &mdash; and these are treated opaquely.

Before we move onto the next section that shows how to actually use the library, observe that of the four functions
supplied by the client programmer, three correspond to the rules of the game (*terminalStateEval*, *listMoves*
and *nextState*) and one (*evaluate*) is more or less subjective. I am pointing out this distinction because
it is reflected in the API which is described in the next section.


# How to use

The library exports a single function *minmax* which the client programmer invokes by supplying four mandatory
arguments:

* the present state of the game
* a *game rules* object that bundles together the *terminalStateEval*, *listMoves* and *nextState* functions
discussed in the previous section
* the *evaluate* function
* the number of plies to look ahead

The *game rules* object collects the three functions that fully describe the game from the perspective of the
library. For any particular game, e.g. for the game of Chess, you only have to write the three *game rules* functions
once and then you forget about them, but you may have multiple *evaluate* functions with different degrees of
sophistication or running time requirements.

After the mandatory arguments, come three optional arguments which you're unlikely to need and which
we'll describe later.

For the time being, you can consider the *minmax* function to have the following signature:

```js
function minmax(gameState, gameRules, evalute, numOfPlies) {..}
```

You import function *minmax* like this:

```js
import {minmax} from 'minmax-wt-alpha-beta-pruning';
```


Function *minmax* returns an object with two properties 'bestMove' and 'evaluation':

* *bestMove*: this is (drum roll) the best move to make (always from the perspective of the moving player). This can be
*null* in the following two cases:

    * if the game state is a terminal state (there are no more moves to be made), or
    * if the given number of plies is 0.

    In the latter case, i.e. when called with 0 *plies*, the *minmax* function simply evaluates the game state without trying to find any moves.

* *evaluation*: this is the evaluation of the game state from the perspective of the moving player (the greater, the better).
It is always non-null.


For most use cases you don't care about the *evaluation* returned and are just interested in the best move to make.

Note that the library treats the *move* objects opaquely: it does not access them, nor does it now know to create
them (same thing applies to the *game state* objects). The library obtains *move* objects by invoking the
*listMoves* function supplied by the client programmer. Similarly, it obtains additional "game state" objects by invoking
the *nextState* function (also supplied by the client programmer).

## mandatory arguments to the *minmax* function
The four arguments needed in every invocation of the *minmax* function are described below:

### gameState

An opaque object which the library doesn't access but simply passes (internally) as argument to the functions supplied
in the next arguments.

### gameRules

An object that bundles together the three functions *listMoves*, *nextState*, *terminalStateEval*
described in the "Main Concepts" section:

```js
{
    listMoves        : function (gameState)       {/* returns a list of moves */}
    nextState        : function (gameState, move) {/* returns a new state object */}
    terminalStateEval: function (gameState)       {/* returns a number or null */}
}
```

These three functions fully define the rules of the game from the perspective of the engine.

### evaluate

This is simply the *evaluate* function described in the "Main Concepts" section.

### numOfPlies

This is the number of plies that the algorithm is instructed to look ahead. I.e. it's the depth of the
game tree constructed by the algorithm. A ply is a move by a single player.
The term 'ply' is used for clarity, since different games define 'turn' and 'move' quite differently. E.g. a move in
Chess consists of each player taking a turn, i.e. a move in Chess consists of two plies. The *numOfPlies* argument
must be an integer greater than or equal to 0. Calling the *minmax* function with a *ply* argument of 0
essentially results in the engine evaluating the game state without trying to find the best move.

Depending on the branching factor of the game, the worst case
size of the game tree that the algorithm will need to evaluate is the average branching number raised to the
number of plies. The alpha-beta pruning optimization will serve to reduce this worst-case size.

## optional arguments to the *minmax* function

In addition to the four mandatory arguments that the *minmax* function takes:

```js
function minmax(gameState, gameRules, evalute, numOfPlies) {..}
```

&hellip; there's three more optional arguments that should normally not concern a client programmer.
These are:

* alpha
* beta
* statisticsHook

I am not going to explain what *alpha* and *beta* are. Refer to some textbook. There is no reason why you
might consider passing arguments other than the default for these two parameters (negative and positive
infinity respectively), except for experimentation or to make the algorithm dumber. But you can always
make the algorithm dumber by decreasing the number of plies.

The *statisticsHook* is only provided for, you guessed it, statistics and I've only used it during active
development and testing. It allowed me to accumulate statistics such as number of nodes visited, number of
pruning incidents, etc. It is used in the testing code (directory */test*). It served to provide me with
some visibility and assurance that the algorithm operated in the way I expected it to operate. I don't
think it's of any utility to the client programmers.

# Implementation details

There is a common further optimization in alpha-beta pruning which is to arrange the children nodes in the
game tree in such a way as to maximize the possibility of pruning. 

For the client programmer to activate
this kind of optimization they only thing they have to do is to return the list of valid moves in the *listMoves*
function in a way that places stronger moves, as much as possible, towards the beginning of the list of valid moves.

Note that
returning the list of moves
from *listMoves* in the suggested order (stronger moves first) is **not** necessary for pruning to occur. Pruning
will happen even if you return the moves in no particular order. It is simply that by returning the moves
in this manner, that more pruning is likely to occur (the more nodes / sub-trees are pruned, the better the
space requirements and the running time of the algorithm).

An obvious caveat is that there is a trade-off involved in this, and so the client programmer wouldn't
want to spend too much time evaluating and sorting possible moves inside *listMoves*
(or perhaps no time at all).

The library uses FlowType for static type checking and type-checks with no errors.
It is not a requirement for the client programmer to use FlowType but if they do, then they are able to
import a number of exported types or look at the type definitions in file *minmax-interface.js*.
These type definitions communicate clearly
the API of the library and can be consulted in lieu or alongside this documentation.

E.g. the type of the *minmax* function is defined in *minmax-interface.js* thus:

```js
export type MinMaxFT<GameStateGTP, MoveGTP> =
    (gameState   : GameStateGTP
     , gameRules : IGameRules<GameStateGTP, MoveGTP>
     , evaluate: EvaluateFT<GameStateGTP>
     , plies: number
     , alpha?: number
     , beta?:  number
     , statisticsHook?: TMinMaxStatistics<GameStateGTP>
    ) => TMinMaxResult<MoveGTP>;
```

You can see from the above type definition that function *minmax* uses generic type parameters (that's what
*GTP* stands for) and is agnostic as to the actual structures the client programmer uses to represent
game state or game moves.



