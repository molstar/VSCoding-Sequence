/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../../../mol-task';
import { getUnitConformationAndRadius, ensureReasonableResolution, getStructureConformationAndRadius } from './common';
import { calcMolecularSurface } from '../../../../mol-math/geometry/molecular-surface';
import { OrderedSet } from '../../../../mol-data/int';
function getUnitPositionDataAndMaxRadius(structure, unit, sizeTheme, props) {
    const { probeRadius } = props;
    const { position, boundary, radius } = getUnitConformationAndRadius(structure, unit, sizeTheme, props);
    const { indices } = position;
    const n = OrderedSet.size(indices);
    const radii = new Float32Array(OrderedSet.end(indices));
    let maxRadius = 0;
    for (let i = 0; i < n; ++i) {
        const j = OrderedSet.getAt(indices, i);
        const r = radius(j);
        if (maxRadius < r)
            maxRadius = r;
        radii[j] = r + probeRadius;
    }
    return { position: { ...position, radius: radii }, boundary, maxRadius };
}
export function computeUnitMolecularSurface(structure, unit, sizeTheme, props) {
    const { position, boundary, maxRadius } = getUnitPositionDataAndMaxRadius(structure, unit, sizeTheme, props);
    const p = ensureReasonableResolution(boundary.box, props);
    return Task.create('Molecular Surface', async (ctx) => {
        return await MolecularSurface(ctx, position, boundary, maxRadius, boundary.box, p);
    });
}
//
function getStructurePositionDataAndMaxRadius(structure, sizeTheme, props) {
    const { probeRadius } = props;
    const { position, boundary, radius } = getStructureConformationAndRadius(structure, sizeTheme, props);
    const { indices } = position;
    const n = OrderedSet.size(indices);
    const radii = new Float32Array(OrderedSet.end(indices));
    let maxRadius = 0;
    for (let i = 0; i < n; ++i) {
        const j = OrderedSet.getAt(indices, i);
        const r = radius(j);
        if (maxRadius < r)
            maxRadius = r;
        radii[j] = r + probeRadius;
    }
    return { position: { ...position, radius: radii }, boundary, maxRadius };
}
export function computeStructureMolecularSurface(structure, sizeTheme, props) {
    const { position, boundary, maxRadius } = getStructurePositionDataAndMaxRadius(structure, sizeTheme, props);
    const p = ensureReasonableResolution(boundary.box, props);
    return Task.create('Molecular Surface', async (ctx) => {
        return await MolecularSurface(ctx, position, boundary, maxRadius, boundary.box, p);
    });
}
//
async function MolecularSurface(ctx, position, boundary, maxRadius, box, props) {
    return calcMolecularSurface(ctx, position, boundary, maxRadius, box, props);
}
