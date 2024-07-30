"use strict";
/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.coordinatesFromTrr = coordinatesFromTrr;
const mol_task_1 = require("../../mol-task");
const coordinates_1 = require("../../mol-model/structure/coordinates");
const cell_1 = require("../../mol-math/geometry/spacegroup/cell");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
function coordinatesFromTrr(file) {
    return mol_task_1.Task.create('Parse TRR', async (ctx) => {
        await ctx.update('Converting to coordinates');
        const deltaTime = (0, coordinates_1.Time)(file.deltaTime, 'step');
        const offsetTime = (0, coordinates_1.Time)(file.timeOffset, deltaTime.unit);
        const frames = [];
        for (let i = 0, il = file.frames.length; i < il; ++i) {
            const box = file.boxes[i];
            const x = linear_algebra_1.Vec3.fromArray((0, linear_algebra_1.Vec3)(), box, 0);
            const y = linear_algebra_1.Vec3.fromArray((0, linear_algebra_1.Vec3)(), box, 3);
            const z = linear_algebra_1.Vec3.fromArray((0, linear_algebra_1.Vec3)(), box, 6);
            frames.push({
                elementCount: file.frames[i].count,
                cell: cell_1.Cell.fromBasis(x, y, z),
                x: file.frames[i].x,
                y: file.frames[i].y,
                z: file.frames[i].z,
                xyzOrdering: { isIdentity: true },
                time: (0, coordinates_1.Time)(offsetTime.value + deltaTime.value * i, deltaTime.unit)
            });
        }
        return coordinates_1.Coordinates.create(frames, deltaTime, offsetTime);
    });
}
