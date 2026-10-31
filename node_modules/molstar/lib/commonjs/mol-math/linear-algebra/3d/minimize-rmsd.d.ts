/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Mat4 } from './mat4';
import { Vec3 } from './vec3';
export { MinimizeRmsd };
declare namespace MinimizeRmsd {
    interface Result {
        bTransform: Mat4;
        rmsd: number;
    }
    interface Positions {
        x: ArrayLike<number>;
        y: ArrayLike<number>;
        z: ArrayLike<number>;
    }
    namespace Positions {
        function empty(n: number): {
            x: Float64Array;
            y: Float64Array;
            z: Float64Array;
        };
    }
    interface Input {
        a: Positions;
        b: Positions;
        centerA?: Vec3;
        centerB?: Vec3;
    }
    function compute(data: Input, result?: MinimizeRmsd.Result): Result;
}
