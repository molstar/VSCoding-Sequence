"use strict";
/*
 * Copyright (c) 2016 - now, David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartesianToFractional = cartesianToFractional;
exports.fractionalToGrid = fractionalToGrid;
exports.gridToFractional = gridToFractional;
exports.fractionalBoxReorderAxes = fractionalBoxReorderAxes;
exports.expandGridBox = expandGridBox;
exports.shift = shift;
exports.clampGridToSamples = clampGridToSamples;
exports.fractionalToDomain = fractionalToDomain;
exports.fractionalFromBlock = fractionalFromBlock;
exports.bounding = bounding;
exports.areIntersecting = areIntersecting;
exports.intersect = intersect;
exports.dimensions = dimensions;
exports.volume = volume;
const tslib_1 = require("tslib");
const Coords = tslib_1.__importStar(require("./coordinate"));
// CONVERSIONS
function cartesianToFractional(box, spacegroup) {
    const { a: l, b: r } = box;
    const corners = [
        [l[0], l[1], l[2]],
        [r[0], l[1], l[2]],
        [l[0], r[1], l[2]],
        [l[0], l[1], r[2]],
        [r[0], r[1], l[2]],
        [r[0], l[1], r[2]],
        [l[0], r[1], r[2]],
        [r[0], r[1], r[2]],
    ].map(c => Coords.cartesianToFractional(Coords.cartesian(c[0], c[1], c[2]), spacegroup));
    return bounding(corners);
}
function fractionalToGrid(box, domain) {
    return { a: Coords.fractionalToGrid(box.a, domain, 'bottom'), b: Coords.fractionalToGrid(box.b, domain, 'top') };
}
function gridToFractional(box) {
    return { a: Coords.gridToFractional(box.a), b: Coords.gridToFractional(box.b) };
}
function fractionalBoxReorderAxes(box, axisOrder) {
    const { a, b } = box;
    return {
        a: Coords.withCoord(a, a[axisOrder[0]], a[axisOrder[1]], a[axisOrder[2]]),
        b: Coords.withCoord(b, b[axisOrder[0]], b[axisOrder[1]], b[axisOrder[2]])
    };
}
function expandGridBox(box, by) {
    const { a, b } = box;
    return {
        a: Coords.withCoord(a, a[0] - by, a[1] - by, a[2] - by),
        b: Coords.withCoord(b, b[0] + by, b[1] + by, b[2] + by)
    };
}
// MISC
function shift(box, offset) {
    return { a: Coords.add(box.a, offset), b: Coords.add(box.b, offset) };
}
function clampGridToSamples(box) {
    return { a: Coords.clampGridToSamples(box.a), b: Coords.clampGridToSamples(box.b) };
}
function fractionalToDomain(box, kind, delta) {
    const ds = Coords.fractional(box.b[0] - box.a[0], box.b[1] - box.a[1], box.b[2] - box.a[2]);
    return Coords.domain(kind, {
        delta,
        origin: box.a,
        dimensions: ds,
        sampleCount: Coords.sampleCounts(ds, delta)
    });
}
function fractionalFromBlock(block) {
    const { domain } = block;
    const a = Coords.gridToFractional(block);
    const b = Coords.add(a, domain.delta);
    for (let i = 0; i < 3; i++) {
        b[i] = Math.min(b[i], domain.origin[i] + domain.dimensions[i]);
    }
    return { a, b };
}
function bounding(xs) {
    const a = Coords.clone(xs[0]);
    const b = Coords.clone(xs[0]);
    for (const x of xs) {
        for (let i = 0; i < 3; i++) {
            a[i] = Math.min(a[i], x[i]);
            b[i] = Math.max(b[i], x[i]);
        }
    }
    return { a, b };
}
function areIntersecting(box1, box2) {
    for (let i = 0; i < 3; i++) {
        const x = box1.a[i], y = box1.b[i];
        const u = box2.a[i], v = box2.b[i];
        if (x > v || y < u)
            return false;
    }
    return true;
}
function intersect(box1, box2) {
    const a = Coords.clone(box1.a);
    const b = Coords.clone(box1.a);
    for (let i = 0; i < 3; i++) {
        const x = box1.a[i], y = box1.b[i];
        const u = box2.a[i], v = box2.b[i];
        if (x > v || y < u)
            return void 0;
        a[i] = Math.max(x, u);
        b[i] = Math.min(y, v);
    }
    return { a, b };
}
function dimensions(box) {
    return [box.b[0] - box.a[0], box.b[1] - box.a[1], box.b[2] - box.a[2]];
}
function volume(box) {
    return (box.b[0] - box.a[0]) * (box.b[1] - box.a[1]) * (box.b[2] - box.a[2]);
}
