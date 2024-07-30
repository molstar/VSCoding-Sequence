type Expression = Expression.Literal | Expression.Symbol | Expression.Apply;
declare namespace Expression {
    type Literal = string | number | boolean;
    type Symbol = {
        name: string;
    };
    type Arguments = Expression[] | {
        [name: string]: Expression;
    };
    interface Apply {
        readonly head: Expression;
        readonly args?: Arguments;
    }
    function Symbol(name: string): Expression.Symbol;
    function Apply(head: Expression, args?: Arguments): Apply;
    function isArgumentsArray(e?: Arguments): e is Expression[];
    function isArgumentsMap(e?: Arguments): e is {
        [name: string]: Expression;
    };
    function isLiteral(e: Expression): e is Expression.Literal;
    function isApply(e: Expression): e is Expression.Apply;
    function isSymbol(e: Expression): e is Expression.Symbol;
}
export { Expression };
