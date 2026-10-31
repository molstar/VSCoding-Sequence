/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Koya Sakuma <koya.sakuma.work@gmail.com>
 **
 * Adapted from Parsimmon (https://github.com/jneen/parsimmon)
 * Copyright (c) 2011-present J. Adkisson (http://jneen.net).
 **/
export class MonadicParser {
    constructor(_) {
        this._ = _;
    }
    parse(input) {
        const result = this.skip(MonadicParser.eof)._(input, 0);
        if (result.status) {
            return { success: true, value: result.value };
        }
        return { success: false, index: makeLineColumnIndex(input, result.furthest), expected: result.expected };
    }
    ;
    tryParse(str) {
        const result = this.parse(str);
        if (result.success) {
            return result.value;
        }
        else {
            const msg = formatError(str, result);
            const err = new Error(msg);
            throw err;
        }
    }
    or(alternative) {
        return MonadicParser.alt(this, alternative);
    }
    trim(parser) {
        return this.wrap(parser, parser);
    }
    wrap(leftParser, rightParser) {
        return seqPick(1, typeof leftParser === 'string' ? MonadicParser.string(leftParser) : leftParser, this, typeof rightParser === 'string' ? MonadicParser.string(rightParser) : rightParser);
    }
    thru(wrapper) {
        return wrapper(this);
    }
    then(next) {
        return seqPick(1, this, next);
    }
    many() {
        return new MonadicParser((input, i) => {
            const accum = [];
            let result = void 0;
            while (true) {
                result = mergeReplies(this._(input, i), result);
                if (result.status) {
                    if (i === result.index) {
                        throw new Error('infinite loop detected in .many() parser --- calling .many() on a parser which can accept zero characters is usually the cause');
                    }
                    i = result.index;
                    accum.push(result.value);
                }
                else {
                    return mergeReplies(makeSuccess(i, accum), result);
                }
            }
        });
    }
    ;
    times(min, _max) {
        const max = typeof _max === 'undefined' ? min : _max;
        return new MonadicParser((input, i) => {
            const accum = [];
            let result = void 0;
            let prevResult = void 0;
            let times;
            for (times = 0; times < min; times++) {
                result = this._(input, i);
                prevResult = mergeReplies(result, prevResult);
                if (result.status) {
                    i = result.index;
                    accum.push(result.value);
                }
                else {
                    return prevResult;
                }
            }
            for (; times < max; times += 1) {
                result = this._(input, i);
                prevResult = mergeReplies(result, prevResult);
                if (result.status) {
                    i = result.index;
                    accum.push(result.value);
                }
                else {
                    break;
                }
            }
            return mergeReplies(makeSuccess(i, accum), prevResult);
        });
    }
    ;
    result(res) {
        return this.map(() => res);
    }
    ;
    atMost(n) {
        return this.times(0, n);
    }
    ;
    atLeast(n) {
        return MonadicParser.seq(this.times(n), this.many()).map(r => [...r[0], ...r[1]]);
    }
    ;
    map(f) {
        return new MonadicParser((input, i) => {
            const result = this._(input, i);
            if (!result.status) {
                return result;
            }
            return mergeReplies(makeSuccess(result.index, f(result.value)), result);
        });
    }
    skip(next) {
        return seqPick(0, this, next);
    }
    mark() {
        return MonadicParser.seq(MonadicParser.index, this, MonadicParser.index).map(r => ({ start: r[0], value: r[1], end: r[2] }));
    }
    node(name) {
        return MonadicParser.seq(MonadicParser.index, this, MonadicParser.index).map(r => ({ name, start: r[0], value: r[1], end: r[2] }));
    }
    ;
    sepBy(separator) {
        return MonadicParser.sepBy(this, separator);
    }
    sepBy1(separator) {
        return MonadicParser.sepBy1(this, separator);
    }
    lookahead(x) {
        return this.skip(MonadicParser.lookahead(x));
    }
    ;
    notFollowedBy(x) {
        return this.skip(MonadicParser.notFollowedBy(x));
    }
    ;
    desc(expected) {
        return new MonadicParser((input, i) => {
            const reply = this._(input, i);
            if (!reply.status) {
                reply.expected = [expected];
            }
            return reply;
        });
    }
    ;
    fallback(result) {
        return this.or(MonadicParser.succeed(result));
    }
    ;
    ap(other) {
        return MonadicParser.seq(other, this).map(([f, x]) => f(x));
    }
    ;
    chain(f) {
        return new MonadicParser((input, i) => {
            const result = this._(input, i);
            if (!result.status) {
                return result;
            }
            const nextParser = f(result.value);
            return mergeReplies(nextParser._(input, result.index), result);
        });
    }
    ;
}
(function (MonadicParser) {
    function seqMap(a, b, c) {
        const args = [].slice.call(arguments);
        if (args.length === 0) {
            throw new Error('seqMap needs at least one argument');
        }
        const mapper = args.pop();
        assertFunction(mapper);
        return seq.apply(null, args).map(function (results) {
            return mapper.apply(null, results);
        });
    }
    MonadicParser.seqMap = seqMap;
    function createLanguage(parsers) {
        const language = {};
        for (const key of Object.keys(parsers)) {
            (function (key) {
                language[key] = lazy(() => parsers[key](language));
            })(key);
        }
        return language;
    }
    MonadicParser.createLanguage = createLanguage;
    function seq(...parsers) {
        const numParsers = parsers.length;
        return new MonadicParser((input, index) => {
            let result;
            const accum = new Array(numParsers);
            let i = index;
            for (let j = 0; j < numParsers; j++) {
                result = mergeReplies(parsers[j]._(input, i), result);
                if (!result.status) {
                    return result;
                }
                accum[j] = result.value;
                i = result.index;
            }
            return mergeReplies(makeSuccess(i, accum), result);
        });
    }
    MonadicParser.seq = seq;
    function alt(...parsers) {
        const numParsers = parsers.length;
        if (numParsers === 0) {
            return fail('zero alternates');
        }
        return new MonadicParser((input, i) => {
            let result;
            for (let j = 0; j < parsers.length; j++) {
                result = mergeReplies(parsers[j]._(input, i), result);
                if (result.status) {
                    return result;
                }
            }
            return result;
        });
    }
    MonadicParser.alt = alt;
    function sepBy(parser, separator) {
        return sepBy1(parser, separator).or(succeed([]));
    }
    MonadicParser.sepBy = sepBy;
    function sepBy1(parser, separator) {
        const pairs = separator.then(parser).many();
        return seq(parser, pairs).map(r => [r[0], ...r[1]]);
    }
    MonadicParser.sepBy1 = sepBy1;
    function string(str) {
        const expected = `'${str}'`;
        if (str.length === 1) {
            const code = str.charCodeAt(0);
            return new MonadicParser((input, i) => input.charCodeAt(i) === code ? makeSuccess(i + 1, str) : makeFailure(i, expected));
        }
        return new MonadicParser((input, i) => {
            const j = i + str.length;
            if (input.slice(i, j) === str)
                return makeSuccess(j, str);
            else
                return makeFailure(i, expected);
        });
    }
    MonadicParser.string = string;
    function flags(re) {
        const s = '' + re;
        return s.slice(s.lastIndexOf('/') + 1);
    }
    function anchoredRegexp(re) {
        return RegExp('^(?:' + re.source + ')', flags(re));
    }
    function regexp(re, group = 0) {
        const anchored = anchoredRegexp(re);
        const expected = '' + re;
        return new MonadicParser((input, i) => {
            const match = anchored.exec(input.slice(i));
            if (match) {
                if (0 <= group && group <= match.length) {
                    const fullMatch = match[0];
                    const groupMatch = match[group];
                    return makeSuccess(i + fullMatch.length, groupMatch);
                }
                const message = `invalid match group (0 to ${match.length}) in ${expected}`;
                return makeFailure(i, message);
            }
            return makeFailure(i, expected);
        });
    }
    MonadicParser.regexp = regexp;
    function succeed(value) {
        return new MonadicParser((input, i) => makeSuccess(i, value));
    }
    MonadicParser.succeed = succeed;
    function fail(expected) {
        return new MonadicParser((input, i) => makeFailure(i, expected));
    }
    MonadicParser.fail = fail;
    function lookahead(x) {
        if (isParser(x)) {
            return new MonadicParser((input, i) => {
                const result = x._(input, i);
                if (result.status) {
                    result.index = i;
                    result.value = null;
                }
                return result;
            });
        }
        else if (typeof x === 'string') {
            return lookahead(string(x));
        }
        else if (x instanceof RegExp) {
            return lookahead(regexp(x));
        }
        throw new Error('not a string, regexp, or parser: ' + x);
    }
    MonadicParser.lookahead = lookahead;
    function notFollowedBy(parser) {
        return new MonadicParser((input, i) => {
            const result = parser._(input, i);
            return result.status
                ? makeFailure(i, 'not "' + input.slice(i, result.index) + '"')
                : makeSuccess(i, null);
        });
    }
    MonadicParser.notFollowedBy = notFollowedBy;
    function test(predicate) {
        return new MonadicParser((input, i) => {
            const char = input.charAt(i);
            if (i < input.length && predicate(char)) {
                return makeSuccess(i + 1, char);
            }
            else {
                return makeFailure(i, 'a character ' + predicate);
            }
        });
    }
    MonadicParser.test = test;
    function oneOf(str) {
        return test(ch => str.indexOf(ch) >= 0);
    }
    MonadicParser.oneOf = oneOf;
    function noneOf(str) {
        return test(ch => str.indexOf(ch) < 0);
    }
    MonadicParser.noneOf = noneOf;
    function range(begin, end) {
        return test(ch => begin <= ch && ch <= end).desc(begin + '-' + end);
    }
    MonadicParser.range = range;
    function takeWhile(predicate) {
        return new MonadicParser((input, i) => {
            let j = i;
            while (j < input.length && predicate(input.charAt(j))) {
                j++;
            }
            return makeSuccess(j, input.slice(i, j));
        });
    }
    MonadicParser.takeWhile = takeWhile;
    function lazy(f) {
        const parser = new MonadicParser((input, i) => {
            const a = f()._;
            parser._ = a;
            return a(input, i);
        });
        return parser;
    }
    MonadicParser.lazy = lazy;
    function empty() {
        return fail('empty');
    }
    MonadicParser.empty = empty;
    MonadicParser.index = new MonadicParser(function (input, i) {
        return makeSuccess(i, makeLineColumnIndex(input, i));
    });
    MonadicParser.anyChar = new MonadicParser((input, i) => {
        if (i >= input.length) {
            return makeFailure(i, 'any character');
        }
        return makeSuccess(i + 1, input.charAt(i));
    });
    MonadicParser.all = new MonadicParser(function (input, i) {
        return makeSuccess(input.length, input.slice(i));
    });
    MonadicParser.eof = new MonadicParser(function (input, i) {
        if (i < input.length) {
            return makeFailure(i, 'EOF');
        }
        return makeSuccess(i, null);
    });
    MonadicParser.digit = regexp(/[0-9]/).desc('a digit');
    MonadicParser.digits = regexp(/[0-9]*/).desc('optional digits');
    MonadicParser.letter = regexp(/[a-z]/i).desc('a letter');
    MonadicParser.letters = regexp(/[a-z]*/i).desc('optional letters');
    MonadicParser.optWhitespace = regexp(/\s*/).desc('optional whitespace');
    MonadicParser.whitespace = regexp(/\s+/).desc('whitespace');
    MonadicParser.cr = string('\r');
    MonadicParser.lf = string('\n');
    MonadicParser.crlf = string('\r\n');
    MonadicParser.newline = alt(MonadicParser.crlf, MonadicParser.lf, MonadicParser.cr).desc('newline');
    MonadicParser.end = alt(MonadicParser.newline, MonadicParser.eof);
    function of(value) {
        return succeed(value);
    }
    MonadicParser.of = of;
    function regex(re) {
        return regexp(re);
    }
    MonadicParser.regex = regex;
})(MonadicParser || (MonadicParser = {}));
function seqPick(idx, ...parsers) {
    const numParsers = parsers.length;
    return new MonadicParser((input, index) => {
        let result;
        let picked;
        let i = index;
        for (let j = 0; j < numParsers; j++) {
            result = mergeReplies(parsers[j]._(input, i), result);
            if (!result.status) {
                return result;
            }
            if (idx === j)
                picked = result.value;
            i = result.index;
        }
        return mergeReplies(makeSuccess(i, picked), result);
    });
}
function makeSuccess(index, value) {
    return { status: true, index, value };
}
function makeFailure(index, expected) {
    return { status: false, furthest: index, expected: [expected] };
}
function mergeReplies(result, last) {
    if (!last || result.status || last.status || result.furthest > last.furthest) {
        return result;
    }
    const expected = result.furthest === last.furthest
        ? unsafeUnion(result.expected, last.expected)
        : last.expected;
    return { status: result.status, furthest: last.furthest, expected };
}
function makeLineColumnIndex(input, i) {
    const lines = input.slice(0, i).split('\n');
    // Note that unlike the character offset, the line and column offsets are
    // 1-based.
    const lineWeAreUpTo = lines.length;
    const columnWeAreUpTo = lines[lines.length - 1].length + 1;
    return { offset: i, line: lineWeAreUpTo, column: columnWeAreUpTo };
}
function formatExpected(expected) {
    if (expected.length === 1) {
        return expected[0];
    }
    return 'one of ' + expected.join(', ');
}
function formatGot(input, error) {
    const index = error.index;
    const i = index.offset;
    if (i === input.length) {
        return ', got the end of the input';
    }
    const prefix = i > 0 ? '\'...' : '\'';
    const suffix = input.length - i > 12 ? '...\'' : '\'';
    return ` at line ${index.line} column ${index.column}, got ${prefix}${input.slice(i, i + 12)}${suffix}`;
}
function formatError(input, error) {
    return `expected ${formatExpected(error.expected)}${formatGot(input, error)}`;
}
function unsafeUnion(xs, ys) {
    const xn = xs.length;
    const yn = ys.length;
    if (xn === 0)
        return ys;
    else if (yn === 0)
        return xs;
    const set = new Set();
    const ret = [];
    for (let i = 0; i < xn; i++) {
        if (!set.has(xs[i])) {
            ret[ret.length] = xs[i];
            set.add(xs[i]);
        }
    }
    for (let i = 0; i < yn; i++) {
        if (!set.has(ys[i])) {
            ret[ret.length] = ys[i];
            set.add(ys[i]);
        }
    }
    ret.sort();
    return ret;
}
function isParser(obj) {
    return obj instanceof MonadicParser;
}
function assertFunction(x) {
    if (typeof x !== 'function') {
        throw new Error('not a function: ' + x);
    }
}
