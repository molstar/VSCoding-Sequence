/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { arrayEqual, UUID } from '../../../mol-util';
import { Column } from '../../../mol-data/db';
//
export { Time };
function Time(value, unit) {
    return { value, unit };
}
//
export { Coordinates };
var Coordinates;
(function (Coordinates) {
    function create(frames, deltaTime, timeOffset) {
        const hasCell = !!frames[0].cell;
        const hasVelocities = !!frames[0].velocities;
        const hasForces = !!frames[0].forces;
        return {
            id: UUID.create22(),
            frames,
            hasCell,
            hasVelocities,
            hasForces,
            deltaTime,
            timeOffset,
        };
    }
    Coordinates.create = create;
    /**
     * Only use ordering if it's not identity.
     */
    function getAtomicConformation(frame, fields, ordering) {
        var _a, _b;
        let { x, y, z } = frame;
        if (frame.xyzOrdering.frozen) {
            if (ordering) {
                if (frame.xyzOrdering.isIdentity) {
                    // simple list reordering
                    x = getOrderedCoords(x, ordering);
                    y = getOrderedCoords(y, ordering);
                    z = getOrderedCoords(z, ordering);
                }
                else if (!arrayEqual(frame.xyzOrdering.index, ordering)) {
                    x = getSourceOrderedCoords(x, frame.xyzOrdering.index, ordering);
                    y = getSourceOrderedCoords(y, frame.xyzOrdering.index, ordering);
                    z = getSourceOrderedCoords(z, frame.xyzOrdering.index, ordering);
                }
            }
            else if (!frame.xyzOrdering.isIdentity) {
                x = getInvertedCoords(x, frame.xyzOrdering.index);
                y = getInvertedCoords(y, frame.xyzOrdering.index);
                z = getInvertedCoords(z, frame.xyzOrdering.index);
            }
        }
        else if (ordering) {
            if (frame.xyzOrdering.isIdentity) {
                frame.xyzOrdering.isIdentity = false;
                frame.xyzOrdering.index = ordering;
                reorderCoordsInPlace(x, ordering);
                reorderCoordsInPlace(y, ordering);
                reorderCoordsInPlace(z, ordering);
            }
            else {
                // is current ordering is not the same as requested?
                //   => copy the conformations into a new array
                if (!arrayEqual(frame.xyzOrdering.index, ordering)) {
                    x = getSourceOrderedCoords(x, frame.xyzOrdering.index, ordering);
                    y = getSourceOrderedCoords(y, frame.xyzOrdering.index, ordering);
                    z = getSourceOrderedCoords(z, frame.xyzOrdering.index, ordering);
                }
            }
        }
        // once the conformation has been accessed at least once, freeze it.
        //   => any other request to the frame with different ordering will result in a copy.
        frame.xyzOrdering.frozen = true;
        return {
            id: UUID.create22(),
            atomId: fields.atomId,
            occupancy: (_a = fields.occupancy) !== null && _a !== void 0 ? _a : Column.ofConst(1, frame.elementCount, Column.Schema.int),
            B_iso_or_equiv: (_b = fields.B_iso_or_equiv) !== null && _b !== void 0 ? _b : Column.ofConst(0, frame.elementCount, Column.Schema.float),
            xyzDefined: true,
            x,
            y,
            z,
        };
    }
    Coordinates.getAtomicConformation = getAtomicConformation;
    const _reorderBuffer = [0.123];
    function reorderCoordsInPlace(xs, index) {
        const buffer = _reorderBuffer;
        for (let i = 0, _i = xs.length; i < _i; i++) {
            buffer[i] = xs[index[i]];
        }
        for (let i = 0, _i = xs.length; i < _i; i++) {
            xs[i] = buffer[i];
        }
    }
    function getSourceOrderedCoords(xs, srcIndex, index) {
        const ret = new Float32Array(xs.length);
        for (let i = 0, _i = xs.length; i < _i; i++) {
            ret[i] = xs[srcIndex[index[i]]];
        }
        return ret;
    }
    function getOrderedCoords(xs, index) {
        const ret = new Float32Array(xs.length);
        for (let i = 0, _i = xs.length; i < _i; i++) {
            ret[i] = xs[index[i]];
        }
        return ret;
    }
    function getInvertedCoords(xs, index) {
        const ret = new Float32Array(xs.length);
        for (let i = 0, _i = xs.length; i < _i; i++) {
            ret[index[i]] = xs[i];
        }
        return ret;
    }
})(Coordinates || (Coordinates = {}));
