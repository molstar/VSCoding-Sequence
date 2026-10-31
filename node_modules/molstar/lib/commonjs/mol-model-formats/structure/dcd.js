"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.coordinatesFromDcd = coordinatesFromDcd;
const mol_task_1 = require("../../mol-task");
const coordinates_1 = require("../../mol-model/structure/coordinates");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const misc_1 = require("../../mol-math/misc");
const cell_1 = require("../../mol-math/geometry/spacegroup/cell");
const common_1 = require("../../mol-math/linear-algebra/3d/common");
const charmmTimeUnitFactor = 20.45482949774598;
function coordinatesFromDcd(dcdFile) {
    return mol_task_1.Task.create('Parse DCD', async (ctx) => {
        await ctx.update('Converting to coordinates');
        const { header } = dcdFile;
        const deltaTime = header.DELTA
            ? (0, coordinates_1.Time)(header.DELTA * charmmTimeUnitFactor, 'ps')
            : (0, coordinates_1.Time)(1, 'step');
        const offsetTime = header.ISTART >= 1
            ? (0, coordinates_1.Time)((header.ISTART - 1) * deltaTime.value, deltaTime.unit)
            : (0, coordinates_1.Time)(0, deltaTime.unit);
        const frames = [];
        for (let i = 0, il = dcdFile.frames.length; i < il; ++i) {
            const dcdFrame = dcdFile.frames[i];
            const frame = {
                elementCount: dcdFrame.elementCount,
                time: (0, coordinates_1.Time)(offsetTime.value + deltaTime.value * i, deltaTime.unit),
                x: dcdFrame.x,
                y: dcdFrame.y,
                z: dcdFrame.z,
                xyzOrdering: { isIdentity: true }
            };
            if (dcdFrame.cell) {
                // this is not standardized, using heuristics to handle variants
                const c = dcdFrame.cell;
                if (c[1] >= -1 && c[1] <= 1 && c[3] >= -1 && c[3] <= 1 && c[4] >= -1 && c[4] <= 1) {
                    frame.cell = cell_1.Cell.create(linear_algebra_1.Vec3.create(c[0], c[2], c[5]), linear_algebra_1.Vec3.create((0, misc_1.degToRad)(90 - Math.asin(c[1]) * 90 / misc_1.halfPI), (0, misc_1.degToRad)(90 - Math.asin(c[3]) * 90 / misc_1.halfPI), (0, misc_1.degToRad)(90 - Math.asin(c[4]) * 90 / misc_1.halfPI)));
                }
                else if (c[0] < 0 || c[1] < 0 || c[2] < 0 || c[3] < 0 || c[4] < 0 || c[5] < 0 ||
                    c[3] > 180 || c[4] > 180 || c[5] > 180) {
                    frame.cell = cell_1.Cell.fromBasis(linear_algebra_1.Vec3.create(c[0], c[1], c[3]), linear_algebra_1.Vec3.create(c[1], c[2], c[4]), linear_algebra_1.Vec3.create(c[3], c[4], c[5]));
                }
                else {
                    frame.cell = cell_1.Cell.create(linear_algebra_1.Vec3.create(c[0], c[2], c[5]), 
                    // interpret angles very close to 0 as 90 deg
                    linear_algebra_1.Vec3.create((0, misc_1.degToRad)((0, common_1.equalEps)(c[1], 0, common_1.EPSILON) ? 90 : c[1]), (0, misc_1.degToRad)((0, common_1.equalEps)(c[3], 0, common_1.EPSILON) ? 90 : c[3]), (0, misc_1.degToRad)((0, common_1.equalEps)(c[4], 0, common_1.EPSILON) ? 90 : c[4])));
                }
            }
            frames.push(frame);
        }
        return coordinates_1.Coordinates.create(frames, deltaTime, offsetTime);
    });
}
