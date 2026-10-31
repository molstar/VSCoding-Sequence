"use strict";
/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectKeys = ObjectKeys;
exports.assertUnreachable = assertUnreachable;
exports.isPromiseLike = isPromiseLike;
function ObjectKeys(o) {
    return Object.keys(o);
}
;
function assertUnreachable(x) {
    throw new Error('unreachable');
}
function isPromiseLike(x) {
    return typeof (x === null || x === void 0 ? void 0 : x.then) === 'function';
}
