/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { IntraUnitBondLineVisual, IntraUnitBondLineParams } from '../visual/bond-intra-unit-line';
import { InterUnitBondLineVisual, InterUnitBondLineParams } from '../visual/bond-inter-unit-line';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { UnitsRepresentation } from '../units-representation';
import { ComplexRepresentation } from '../complex-representation';
import { StructureRepresentationProvider, StructureRepresentationStateBuilder } from '../representation';
import { Representation } from '../../../mol-repr/representation';
import { Structure } from '../../../mol-model/structure';
import { getUnitKindsParam } from '../params';
import { ElementPointParams, ElementPointVisual } from '../visual/element-point';
import { ElementCrossParams, ElementCrossVisual } from '../visual/element-cross';
import { Points } from '../../../mol-geo/geometry/points/points';
const LineVisuals = {
    'intra-bond': (ctx, getParams) => UnitsRepresentation('Intra-unit bond line', ctx, getParams, IntraUnitBondLineVisual),
    'inter-bond': (ctx, getParams) => ComplexRepresentation('Inter-unit bond line', ctx, getParams, InterUnitBondLineVisual),
    'element-point': (ctx, getParams) => UnitsRepresentation('Points', ctx, getParams, ElementPointVisual),
    'element-cross': (ctx, getParams) => UnitsRepresentation('Crosses', ctx, getParams, ElementCrossVisual),
};
export const LineParams = {
    ...IntraUnitBondLineParams,
    ...InterUnitBondLineParams,
    ...ElementPointParams,
    ...ElementCrossParams,
    pointStyle: PD.Select('circle', PD.objectToOptions(Points.StyleTypes)),
    multipleBonds: PD.Select('offset', PD.arrayToOptions(['off', 'symmetric', 'offset'])),
    includeParent: PD.Boolean(false),
    sizeFactor: PD.Numeric(2, { min: 0.01, max: 10, step: 0.01 }),
    unitKinds: getUnitKindsParam(['atomic']),
    visuals: PD.MultiSelect(['intra-bond', 'inter-bond', 'element-point', 'element-cross'], PD.objectToOptions(LineVisuals))
};
export function getLineParams(ctx, structure) {
    const size = Structure.getSize(structure);
    if (size >= Structure.Size.Huge) {
        const params = PD.clone(LineParams);
        params.visuals.defaultValue = ['intra-bond', 'element-point', 'element-cross'];
        return params;
    }
    else {
        return LineParams;
    }
}
export function LineRepresentation(ctx, getParams) {
    return Representation.createMulti('Line', ctx, getParams, StructureRepresentationStateBuilder, LineVisuals);
}
export const LineRepresentationProvider = StructureRepresentationProvider({
    name: 'line',
    label: 'Line',
    description: 'Displays bonds as lines and atoms as points or croses.',
    factory: LineRepresentation,
    getParams: getLineParams,
    defaultValues: PD.getDefaultValues(LineParams),
    defaultColorTheme: { name: 'element-symbol' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => structure.elementCount > 0,
    getData: (structure, props) => {
        return props.includeParent ? structure.asParent() : structure;
    },
    mustRecreate: (oldProps, newProps) => {
        return oldProps.includeParent !== newProps.includeParent;
    }
});
