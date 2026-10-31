"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeUnitMolecularSurface = computeUnitMolecularSurface;
exports.computeStructureMolecularSurface = computeStructureMolecularSurface;
const mol_task_1 = require("../../../../mol-task");
const common_1 = require("./common");
const molecular_surface_1 = require("../../../../mol-math/geometry/molecular-surface");
const int_1 = require("../../../../mol-data/int");
function getUnitPositionDataAndMaxRadius(structure, unit, sizeTheme, props) {
    const { probeRadius } = props;
    const { position, boundary, radius } = (0, common_1.getUnitConformationAndRadius)(structure, unit, sizeTheme, props);
    const { indices } = position;
    const n = int_1.OrderedSet.size(indices);
    const radii = new Float32Array(int_1.OrderedSet.end(indices));
    let maxRadius = 0;
    for (let i = 0; i < n; ++i) {
        const j = int_1.OrderedSet.getAt(indices, i);
        const r = radius(j);
        if (maxRadius < r)
            maxRadius = r;
        radii[j] = r + probeRadius;
    }
    return { position: { ...position, radius: radii }, boundary, maxRadius };
}
function computeUnitMolecularSurface(structure, unit, sizeTheme, props) {
    const { position, boundary, maxRadius } = getUnitPositionDataAndMaxRadius(structure, unit, sizeTheme, props);
    const p = (0, common_1.ensureReasonableResolution)(boundary.box, props);
    return mol_task_1.Task.create('Molecular Surface', async (ctx) => {
        return await MolecularSurface(ctx, position, boundary, maxRadius, boundary.box, p);
    });
}
//
function getStructurePositionDataAndMaxRadius(structure, sizeTheme, props) {
    const { probeRadius } = props;
    const { position, boundary, radius } = (0, common_1.getStructureConformationAndRadius)(structure, sizeTheme, props);
    const { indices } = position;
    const n = int_1.OrderedSet.size(indices);
    const radii = new Float32Array(int_1.OrderedSet.end(indices));
    let maxRadius = 0;
    for (let i = 0; i < n; ++i) {
        const j = int_1.OrderedSet.getAt(indices, i);
        const r = radius(j);
        if (maxRadius < r)
            maxRadius = r;
        radii[j] = r + probeRadius;
    }
    return { position: { ...position, radius: radii }, boundary, maxRadius };
}
function computeStructureMolecularSurface(structure, sizeTheme, props) {
    const { position, boundary, maxRadius } = getStructurePositionDataAndMaxRadius(structure, sizeTheme, props);
    const p = (0, common_1.ensureReasonableResolution)(boundary.box, props);
    return mol_task_1.Task.create('Molecular Surface', async (ctx) => {
        return await MolecularSurface(ctx, position, boundary, maxRadius, boundary.box, p);
    });
}
//
async function MolecularSurface(ctx, position, boundary, maxRadius, box, props) {
    return (0, molecular_surface_1.calcMolecularSurface)(ctx, position, boundary, maxRadius, box, props);
}
