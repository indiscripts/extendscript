What is µZ?
======

**µZ** is a very basic parser intended to demo the powerfullness of operator overloading in ExtendScript.

Once the module is loaded you get a global `_` (underscore) function that allows to declare tokens and complex expressions in the form:

		_('TOKEN1')('TOKEN2') // declare tokens
		({
		    TOKEN1: <expression1>,
		    TOKEN2: <expression2>,
		    // etc.
		});

Each <expression> must be a valid JS expression. It can use:

+ Any declared token identifier (as itself).
+ The `_` identifier (as the root).
+ Operators, parentheses, scalar values.

As a result, each `_.TOKEN` points out to a function that parses the considered token through a callback function.

**µZ** automatically intercepts operator invocations with respect to their precedence and associativity.

Here are the supported operators:

		~ * / % + - << >> >>> & ^ |

How does it work?
======

The idea behind **µZ** is to use the JS interpreter *itself* to parse any expression in the proper way.

Given a function `f`, we can create a `f['+']` method so that `f + anything` means `f['+'](anything)`.

**µZ** overrides all operators (at least, those that ExtendScript allows) in order to interpret expressions in its own process.

No semantics is provided here. It's your job to give a meaning to e.g. `+(a,b)` or `~("foo")`.

Usage
======

A possible use of **µZ** (in fact, my original purpose) is to handle BNF syntax, as shown in the sample code:

		_('EXPRESSION')('LITERAL')
		({
			EXPRESSION: LITERAL
		  		| _/"NAME"
		  		| _/'(' + EXPRESSION + _/')'
		  		| _/"PREFIX_OP" + EXPRESSION
		  		| EXPRESSION +
		  			(
		  	  		_/"INFIX_OP" + EXPRESSION
		  			| _/'?' + EXPRESSION + _/':' + EXPRESSION
		  			| _/"INVOCATION"
		  			| _/"REFINEMENT"
		  			)
		  		| _/'new' + EXPRESSION + _/"INVOCATION"
		  		| _/'delete' + EXPRESSION + _/"REFINEMENT"
			,
			LITERAL: _/"a-z"
			,
		});

Here I use the expression `_/"foo"`—that is, `/(µZ,"foo")`—as a way to declare literals, then `+` means concatenation, `|` means alternation, and so on.

One could extend the syntax above to handle expressions such as:

+ `item*0` —addressing the Kleene star, `item*` in regex syntax
+ `item*1` —addressing `item+`
+ `~item`  —addressing optional item, that is `item?`

Issues
=====

Not really an issue, but an important consequence of how **µZ** works: all declared tokens are loaded in `$.global`, which is usually considered polluting the global namespace.

For that reason, **µZ** will not support token names which are not valid JS identifiers. This is not a bug, this is a feature!!

What if your expressions are invalid? **µZ** does not manage or throw errors by itself, because errors are just instantly detected by the interpreter. (Yeah, this is feature too!)

Project status
=====

Work-in-progress. Many things in the present module seem useless or sound like placeholders for a simple reason: they are so!
