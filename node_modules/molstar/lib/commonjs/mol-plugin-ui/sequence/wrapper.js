"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequenceWrapper = void 0;
const int_1 = require("../../mol-data/int");
const loci_1 = require("../../mol-model/loci");
const marker_action_1 = require("../../mol-util/marker-action");
class SequenceWrapper {
    markResidue(loci, action) {
        if ((0, loci_1.isEveryLoci)(loci)) {
            return (0, marker_action_1.applyMarkerAction)(this.markerArray, int_1.Interval.ofLength(this.length), action);
        }
        else {
            return this.mark(loci, action);
        }
    }
    constructor(data, markerArray, length) {
        this.data = data;
        this.markerArray = markerArray;
        this.length = length;
    }
}
exports.SequenceWrapper = SequenceWrapper;
