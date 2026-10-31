/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Interval } from '../../mol-data/int';
import { isEveryLoci } from '../../mol-model/loci';
import { applyMarkerAction } from '../../mol-util/marker-action';
export { SequenceWrapper };
class SequenceWrapper {
    markResidue(loci, action) {
        if (isEveryLoci(loci)) {
            return applyMarkerAction(this.markerArray, Interval.ofLength(this.length), action);
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
