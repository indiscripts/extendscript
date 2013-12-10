#include 'muZ.jsx'


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

alert( _.EXPRESSION );
