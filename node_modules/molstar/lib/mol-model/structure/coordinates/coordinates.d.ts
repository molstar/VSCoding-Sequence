/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { UUID } from '../../../mol-util';
import { Cell } from '../../../mol-math/geometry/spacegroup/cell';
import { AtomicConformation } from '../model/properties/atomic';
import { Column } from '../../../mol-data/db';
export interface Frame {
    readonly elementCount: number;
    readonly time: Time;
    readonly x: ArrayLike<number>;
    readonly y: ArrayLike<number>;
    readonly z: ArrayLike<number>;
    readonly cell?: Cell;
    readonly velocities?: {
        readonly vx: ArrayLike<number>;
        readonly vy: ArrayLike<number>;
        readonly vz: ArrayLike<number>;
    };
    readonly forces?: {
        readonly fx: ArrayLike<number>;
        readonly fy: ArrayLike<number>;
        readonly fz: ArrayLike<number>;
    };
    readonly xyzOrdering: {
        isIdentity: boolean;
        frozen?: boolean;
        index?: ArrayLike<number>;
    };
}
export { Time };
interface Time {
    value: number;
    unit: Time.Unit;
}
declare function Time(value: number, unit: Time.Unit): {
    value: number;
    unit: Time.Unit;
};
declare namespace Time {
    type Unit = 'ps' | 'step';
}
export { Coordinates };
interface Coordinates {
    readonly id: UUID;
    readonly frames: Frame[];
    readonly hasCell: boolean;
    readonly hasVelocities: boolean;
    readonly hasForces: boolean;
    readonly deltaTime: Time;
    readonly timeOffset: Time;
}
declare namespace Coordinates {
    function create(frames: Frame[], deltaTime: Time, timeOffset: Time): Coordinates;
    /**
     * Only use ordering if it's not identity.
     */
    function getAtomicConformation(frame: Frame, fields: {
        atomId: Column<number>;
        occupancy?: Column<number>;
        B_iso_or_equiv?: Column<number>;
    }, ordering?: ArrayLike<number>): AtomicConformation;
}
