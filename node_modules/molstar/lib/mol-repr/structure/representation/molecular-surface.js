/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { MolecularSurfaceMeshVisual, MolecularSurfaceMeshParams, StructureMolecularSurfaceMeshVisual } from '../visual/molecular-surface-mesh';
import { UnitsRepresentation } from '../units-representation';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { ComplexRepresentation, StructureRepresentationProvider, StructureRepresentationStateBuilder } from '../representation';
import { Representation } from '../../../mol-repr/representation';
import { MolecularSurfaceWireframeParams, MolecularSurfaceWireframeVisual } from '../visual/molecular-surface-wireframe';
import { BaseGeometry } from '../../../mol-geo/geometry/base';
const MolecularSurfaceVisuals = {
    'molecular-surface-mesh': (ctx, getParams) => UnitsRepresentation('Molecular surface mesh', ctx, getParams, MolecularSurfaceMeshVisual),
    'structure-molecular-surface-mesh': (ctx, getParams) => ComplexRepresentation('Structure Molecular surface mesh', ctx, getParams, StructureMolecularSurfaceMeshVisual),
    'molecular-surface-wireframe': (ctx, getParams) => UnitsRepresentation('Molecular surface wireframe', ctx, getParams, MolecularSurfaceWireframeVisual),
};
export const MolecularSurfaceParams = {
    ...MolecularSurfaceMeshParams,
    ...MolecularSurfaceWireframeParams,
    visuals: PD.MultiSelect(['molecular-surface-mesh'], PD.objectToOptions(MolecularSurfaceVisuals)),
    bumpFrequency: PD.Numeric(1, { min: 0, max: 10, step: 0.1 }, BaseGeometry.ShadingCategory),
    density: PD.Numeric(0.5, { min: 0, max: 1, step: 0.01 }, BaseGeometry.ShadingCategory),
};
export function getMolecularSurfaceParams(ctx, structure) {
    return MolecularSurfaceParams;
}
export function MolecularSurfaceRepresentation(ctx, getParams) {
    return Representation.createMulti('Molecular Surface', ctx, getParams, StructureRepresentationStateBuilder, MolecularSurfaceVisuals);
}
export const MolecularSurfaceRepresentationProvider = StructureRepresentationProvider({
    name: 'molecular-surface',
    label: 'Molecular Surface',
    description: 'Displays a molecular surface.',
    factory: MolecularSurfaceRepresentation,
    getParams: getMolecularSurfaceParams,
    defaultValues: PD.getDefaultValues(MolecularSurfaceParams),
    defaultColorTheme: { name: 'chain-id' },
    defaultSizeTheme: { name: 'physical' },
    isApplicable: (structure) => structure.elementCount > 0
});
