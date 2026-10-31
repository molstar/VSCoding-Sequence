"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vec2 = Vec2;
function Vec2() {
    return Vec2.zero();
}
(function (Vec2) {
    function zero() {
        // force double backing array by 0.1.
        const ret = [0.1, 0];
        ret[0] = 0.0;
        return ret;
    }
    Vec2.zero = zero;
    function clone(a) {
        const out = zero();
        out[0] = a[0];
        out[1] = a[1];
        return out;
    }
    Vec2.clone = clone;
    function create(x, y) {
        const out = zero();
        out[0] = x;
        out[1] = y;
        return out;
    }
    Vec2.create = create;
    function hasNaN(a) {
        return isNaN(a[0]) || isNaN(a[1]);
    }
    Vec2.hasNaN = hasNaN;
    function toArray(a, out, offset) {
        out[offset + 0] = a[0];
        out[offset + 1] = a[1];
        return out;
    }
    Vec2.toArray = toArray;
    function fromArray(a, array, offset) {
        a[0] = array[offset + 0];
        a[1] = array[offset + 1];
        return a;
    }
    Vec2.fromArray = fromArray;
    function copy(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        return out;
    }
    Vec2.copy = copy;
    function set(out, x, y) {
        out[0] = x;
        out[1] = y;
        return out;
    }
    Vec2.set = set;
    function add(out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        return out;
    }
    Vec2.add = add;
    function sub(out, a, b) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        return out;
    }
    Vec2.sub = sub;
    function mul(out, a, b) {
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        return out;
    }
    Vec2.mul = mul;
    function div(out, a, b) {
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        return out;
    }
    Vec2.div = div;
    function scale(out, a, b) {
        out[0] = a[0] * b;
        out[1] = a[1] * b;
        return out;
    }
    Vec2.scale = scale;
    /**
     * Math.round the components of a Vec2
     */
    function round(out, a) {
        out[0] = Math.round(a[0]);
        out[1] = Math.round(a[1]);
        return out;
    }
    Vec2.round = round;
    /**
     * Math.ceil the components of a Vec2
     */
    function ceil(out, a) {
        out[0] = Math.ceil(a[0]);
        out[1] = Math.ceil(a[1]);
        return out;
    }
    Vec2.ceil = ceil;
    /**
     * Math.floor the components of a Vec2
     */
    function floor(out, a) {
        out[0] = Math.floor(a[0]);
        out[1] = Math.floor(a[1]);
        return out;
    }
    Vec2.floor = floor;
    function distance(a, b) {
        const x = b[0] - a[0], y = b[1] - a[1];
        return Math.sqrt(x * x + y * y);
    }
    Vec2.distance = distance;
    function squaredDistance(a, b) {
        const x = b[0] - a[0], y = b[1] - a[1];
        return x * x + y * y;
    }
    Vec2.squaredDistance = squaredDistance;
    function magnitude(a) {
        const x = a[0], y = a[1];
        return Math.sqrt(x * x + y * y);
    }
    Vec2.magnitude = magnitude;
    function squaredMagnitude(a) {
        const x = a[0], y = a[1];
        return x * x + y * y;
    }
    Vec2.squaredMagnitude = squaredMagnitude;
    /**
     * Returns the inverse of the components of a Vec2
     */
    function inverse(out, a) {
        out[0] = 1.0 / a[0];
        out[1] = 1.0 / a[1];
        return out;
    }
    Vec2.inverse = inverse;
    function areEqual(a, b) {
        return a[0] === b[0] && a[1] === b[1];
    }
    Vec2.areEqual = areEqual;
    function toString(a, precision) {
        return `[${a[0].toPrecision(precision)} ${a[1].toPrecision(precision)}}]`;
    }
    Vec2.toString = toString;
})(Vec2 || (exports.Vec2 = Vec2 = {}));
