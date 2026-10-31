/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { QueryFn, QueryPredicate } from './context';
declare namespace Predicates {
    interface SetLike<A> {
        has(v: A): boolean;
    }
    function eq<A>(p: QueryFn<A>, value: A): QueryPredicate;
    function lt<A>(p: QueryFn<A>, value: A): QueryPredicate;
    function lte<A>(p: QueryFn<A>, value: A): QueryPredicate;
    function gt<A>(p: QueryFn<A>, value: A): QueryPredicate;
    function gte<A>(p: QueryFn<A>, value: A): QueryPredicate;
    function inSet<A>(p: QueryFn<A>, values: SetLike<A> | ArrayLike<A>): QueryPredicate;
    function and(...ps: QueryPredicate[]): QueryPredicate;
    function or(...ps: QueryPredicate[]): QueryPredicate;
}
export { Predicates };
