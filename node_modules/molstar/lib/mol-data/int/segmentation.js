/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as Impl from './impl/segmentation';
var Segmentation;
(function (Segmentation) {
    Segmentation.create = Impl.create;
    Segmentation.ofOffsets = Impl.ofOffsets;
    Segmentation.count = Impl.count;
    Segmentation.getSegment = Impl.getSegment;
    Segmentation.projectValue = Impl.projectValue;
    /** Segment iterator that mutates a single segment object to mark all the segments. */
    Segmentation.transientSegments = Impl.segments;
})(Segmentation || (Segmentation = {}));
export { Segmentation };
