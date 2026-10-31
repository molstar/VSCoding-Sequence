"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitFlags = void 0;
var BitFlags;
(function (BitFlags) {
    function create(flags) { return flags; }
    BitFlags.create = create;
    function has(flags, flag) { return (flags & flag) !== 0; }
    BitFlags.has = has;
    /** toCheck must be non-zero */
    function hasAll(flags, toCheck) { return !!toCheck && (flags & toCheck) === toCheck; }
    BitFlags.hasAll = hasAll;
})(BitFlags || (exports.BitFlags = BitFlags = {}));
