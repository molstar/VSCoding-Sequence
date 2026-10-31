/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Koya Sakuma <koya.sakuma.work@gmail.com>
 **
 * Adapted from Parsimmon (https://github.com/jneen/parsimmon)
 * Copyright (c) 2011-present J. Adkisson (http://jneen.net).
 **/
export declare class MonadicParser<A> {
    _: MonadicParser.Action<A>;
    constructor(_: MonadicParser.Action<A>);
    parse(input: string): MonadicParser.ParseResult<A>;
    tryParse(str: string): A;
    or<B>(alternative: MonadicParser<B>): MonadicParser<A | B>;
    trim<B>(parser: MonadicParser<B> | string): MonadicParser<A>;
    wrap<L, R>(leftParser: MonadicParser<L> | string, rightParser: MonadicParser<R> | string): MonadicParser<A>;
    thru<B>(wrapper: (p: MonadicParser<A>) => MonadicParser<B>): MonadicParser<B>;
    then<B>(next: MonadicParser<B>): MonadicParser<B>;
    many(): MonadicParser<A[]>;
    times(min: number, _max?: number): MonadicParser<A[]>;
    result<B>(res: B): MonadicParser<B>;
    atMost(n: number): MonadicParser<A[]>;
    atLeast(n: number): MonadicParser<A[]>;
    map<B>(f: (a: A) => B): MonadicParser<B>;
    skip<B>(next: MonadicParser<B>): MonadicParser<A>;
    mark(): MonadicParser<MonadicParser.Mark<A>>;
    node(name: string): MonadicParser<MonadicParser.Node<A>>;
    sepBy<B>(separator: MonadicParser<B>): MonadicParser<A[]>;
    sepBy1<B>(separator: MonadicParser<B>): MonadicParser<A[]>;
    lookahead<B>(x: MonadicParser<B>): MonadicParser<A>;
    notFollowedBy<B>(x: MonadicParser<B>): MonadicParser<A>;
    desc(expected: string): MonadicParser<A>;
    fallback<B>(result: B): MonadicParser<A | B>;
    ap<B>(other: MonadicParser<(x: A) => B>): MonadicParser<B>;
    chain<B>(f: (a: A) => MonadicParser<B>): MonadicParser<B>;
}
export declare namespace MonadicParser {
    type Action<T> = (input: string, i: number) => MonadicParser.Result<T>;
    type ParseResult<T> = ParseSuccess<T> | ParseFailure;
    interface Index {
        /** zero-based character offset */
        offset: number;
        /** one-based line offset */
        line: number;
        /** one-based column offset */
        column: number;
    }
    interface ParseSuccess<T> {
        success: true;
        value: T;
    }
    interface ParseFailure {
        success: false;
        index: Index;
        expected: string[];
    }
    interface Mark<T> {
        start: Index;
        end: Index;
        value: T;
    }
    interface Node<T> extends Mark<T> {
        name: string;
    }
    interface Success<T> {
        status: true;
        value: T;
        index: number;
    }
    interface Failure {
        status: false;
        furthest: number;
        expected: string[];
    }
    type Result<T> = Success<T> | Failure;
    function seqMap<A, B>(a: MonadicParser<A>, b: MonadicParser<B>, c: any): any;
    function createLanguage(parsers: any): any;
    function seq<A>(a: MonadicParser<A>): MonadicParser<[A]>;
    function seq<A, B>(a: MonadicParser<A>, b: MonadicParser<B>): MonadicParser<[A, B]>;
    function seq<A, B, C>(a: MonadicParser<A>, b: MonadicParser<B>, c: MonadicParser<C>): MonadicParser<[A, B, C]>;
    function seq<A, B, C, D>(a: MonadicParser<A>, b: MonadicParser<B>, c: MonadicParser<C>, d: MonadicParser<D>): MonadicParser<[A, B, C, D]>;
    function seq<A, B, C, D, E>(a: MonadicParser<A>, b: MonadicParser<B>, c: MonadicParser<C>, d: MonadicParser<D>, e: MonadicParser<E>): MonadicParser<[A, B, C, D, E]>;
    function seq<T>(...parsers: MonadicParser<T>[]): MonadicParser<T[]>;
    function alt<A>(a: MonadicParser<A>): MonadicParser<A>;
    function alt<A, B>(a: MonadicParser<A>, b: MonadicParser<B>): MonadicParser<A | B>;
    function alt<A, B, C>(a: MonadicParser<A>, b: MonadicParser<B>, c: MonadicParser<C>): MonadicParser<A | B | C>;
    function alt<A, B, C, D>(a: MonadicParser<A>, b: MonadicParser<B>, c: MonadicParser<C>, d: MonadicParser<D>): MonadicParser<A | B | C | D>;
    function alt<A, B, C, D, E>(a: MonadicParser<A>, b: MonadicParser<B>, c: MonadicParser<C>, d: MonadicParser<D>, e: MonadicParser<E>): MonadicParser<A | B | C | D | E>;
    function alt<T>(...parsers: MonadicParser<T>[]): MonadicParser<T[]>;
    function sepBy<A, B>(parser: MonadicParser<A>, separator: MonadicParser<B>): MonadicParser<A[]>;
    function sepBy1<A, B>(parser: MonadicParser<A>, separator: MonadicParser<B>): MonadicParser<A[]>;
    function string(str: string): MonadicParser<string>;
    function regexp(re: RegExp, group?: number): MonadicParser<string>;
    function succeed<A>(value: A): MonadicParser<A>;
    function fail(expected: string): MonadicParser<any>;
    function lookahead<A>(x: MonadicParser<A> | string | RegExp): MonadicParser<null>;
    function notFollowedBy<A>(parser: MonadicParser<A>): MonadicParser<null>;
    function test(predicate: (char: string) => boolean): MonadicParser<string>;
    function oneOf(str: string): MonadicParser<string>;
    function noneOf(str: string): MonadicParser<string>;
    function range(begin: string, end: string): MonadicParser<string>;
    function takeWhile(predicate: (ch: string) => boolean): MonadicParser<string>;
    function lazy<T>(f: () => MonadicParser<T>): MonadicParser<T>;
    function empty(): MonadicParser<any>;
    const index: MonadicParser<Index>;
    const anyChar: MonadicParser<string>;
    const all: MonadicParser<string>;
    const eof: MonadicParser<null>;
    const digit: MonadicParser<string>;
    const digits: MonadicParser<string>;
    const letter: MonadicParser<string>;
    const letters: MonadicParser<string>;
    const optWhitespace: MonadicParser<string>;
    const whitespace: MonadicParser<string>;
    const cr: MonadicParser<string>;
    const lf: MonadicParser<string>;
    const crlf: MonadicParser<string>;
    const newline: MonadicParser<string>;
    const end: MonadicParser<string | null>;
    function of<A>(value: A): MonadicParser<A>;
    function regex(re: RegExp): MonadicParser<string>;
}
