"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.coordinatesFromNctraj = coordinatesFromNctraj;
const mol_task_1 = require("../../mol-task");
const coordinates_1 = require("../../mol-model/structure/coordinates");
const cell_1 = require("../../mol-math/geometry/spacegroup/cell");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
function coordinatesFromNctraj(file) {
    return mol_task_1.Task.create('Parse NCTRAJ', async (ctx) => {
        await ctx.update('Converting to coordinates');
        const deltaTime = (0, coordinates_1.Time)(file.deltaTime, 'step');
        const offsetTime = (0, coordinates_1.Time)(file.timeOffset, deltaTime.unit);
        const frames = [];
        for (let i = 0, il = file.coordinates.length; i < il; ++i) {
            const c = file.coordinates[i];
            const elementCount = c.length / 3;
            const x = new Float32Array(elementCount);
            const y = new Float32Array(elementCount);
            const z = new Float32Array(elementCount);
            for (let j = 0, jl = c.length; j < jl; j += 3) {
                x[j / 3] = c[j];
                y[j / 3] = c[j + 1];
                z[j / 3] = c[j + 2];
            }
            const frame = {
                elementCount,
                x, y, z,
                xyzOrdering: { isIdentity: true },
                time: (0, coordinates_1.Time)(offsetTime.value + deltaTime.value * i, deltaTime.unit)
            };
            // TODO: handle case where cell_lengths and cell_angles are set, i.e., angles not 90deg
            if (file.cell_lengths) {
                const lengths = file.cell_lengths[i];
                const x = linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.unitX, lengths[0]);
                const y = linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.unitY, lengths[1]);
                const z = linear_algebra_1.Vec3.scale((0, linear_algebra_1.Vec3)(), linear_algebra_1.Vec3.unitZ, lengths[2]);
                frame.cell = cell_1.Cell.fromBasis(x, y, z);
            }
            frames.push(frame);
        }
        return coordinates_1.Coordinates.create(frames, deltaTime, offsetTime);
    });
}
