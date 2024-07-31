"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Predicates = void 0;
var Predicates;
(function (Predicates) {
    function isSetLike(x) { return !!x && !!x.has; }
    function eq(p, value) { return l => p(l) === value; }
    Predicates.eq = eq;
    function lt(p, value) { return l => p(l) < value; }
    Predicates.lt = lt;
    function lte(p, value) { return l => p(l) <= value; }
    Predicates.lte = lte;
    function gt(p, value) { return l => p(l) > value; }
    Predicates.gt = gt;
    function gte(p, value) { return l => p(l) >= value; }
    Predicates.gte = gte;
    function _true(ctx) { return true; }
    function _false(ctx) { return false; }
    function inSet(p, values) {
        if (isSetLike(values)) {
            return l => values.has(p(l));
        }
        else {
            if (values.length === 0)
                return _false;
            const set = new Set();
            for (let i = 0; i < values.length; i++)
                set.add(values[i]);
            return l => set.has(p(l));
        }
    }
    Predicates.inSet = inSet;
    function and(...ps) {
        switch (ps.length) {
            case 0: return _true;
            case 1: return ps[0];
            case 2: {
                const a = ps[0], b = ps[1];
                return l => a(l) && b(l);
            }
            case 3: {
                const a = ps[0], b = ps[1], c = ps[2];
                return l => a(l) && b(l) && c(l);
            }
            case 4: {
                const a = ps[0], b = ps[1], c = ps[2], d = ps[3];
                return l => a(l) && b(l) && c(l) && d(l);
            }
            case 5: {
                const a = ps[0], b = ps[1], c = ps[2], d = ps[3], e = ps[4];
                return l => a(l) && b(l) && c(l) && d(l) && e(l);
            }
            case 6: {
                const a = ps[0], b = ps[1], c = ps[2], d = ps[3], e = ps[4], f = ps[5];
                return l => a(l) && b(l) && c(l) && d(l) && e(l) && f(l);
            }
            default: {
                const count = ps.length;
                return l => {
                    for (let i = 0; i < count; i++)
                        if (!ps[i])
                            return false;
                    return true;
                };
            }
        }
    }
    Predicates.and = and;
    function or(...ps) {
        switch (ps.length) {
            case 0: return _false;
            case 1: return ps[0];
            case 2: {
                const a = ps[0], b = ps[1];
                return l => a(l) || b(l);
            }
            case 3: {
                const a = ps[0], b = ps[1], c = ps[2];
                return l => a(l) || b(l) || c(l);
            }
            case 4: {
                const a = ps[0], b = ps[1], c = ps[2], d = ps[3];
                return l => a(l) || b(l) || c(l) || d(l);
            }
            case 5: {
                const a = ps[0], b = ps[1], c = ps[2], d = ps[3], e = ps[4];
                return l => a(l) || b(l) || c(l) || d(l) || e(l);
            }
            case 6: {
                const a = ps[0], b = ps[1], c = ps[2], d = ps[3], e = ps[4], f = ps[5];
                return l => a(l) || b(l) || c(l) || d(l) || e(l) || f(l);
            }
            default: {
                const count = ps.length;
                return l => {
                    for (let i = 0; i < count; i++)
                        if (ps[i])
                            return true;
                    return false;
                };
            }
        }
    }
    Predicates.or = or;
})(Predicates || (exports.Predicates = Predicates = {}));
