"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Segmentation = void 0;
const tslib_1 = require("tslib");
const Impl = tslib_1.__importStar(require("./impl/segmentation"));
var Segmentation;
(function (Segmentation) {
    Segmentation.create = Impl.create;
    Segmentation.ofOffsets = Impl.ofOffsets;
    Segmentation.count = Impl.count;
    Segmentation.getSegment = Impl.getSegment;
    Segmentation.projectValue = Impl.projectValue;
    /** Segment iterator that mutates a single segment object to mark all the segments. */
    Segmentation.transientSegments = Impl.segments;
})(Segmentation || (exports.Segmentation = Segmentation = {}));
