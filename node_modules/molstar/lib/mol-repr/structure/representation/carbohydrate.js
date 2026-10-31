/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { BaseGeometry } from '../../../mol-geo/geometry/base';
import { Model } from '../../../mol-model/structure';
import { Representation } from '../../../mol-repr/representation';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { ComplexRepresentation } from '../complex-representation';
import { StructureRepresentationProvider, StructureRepresentationStateBuilder } from '../representation';
import { CarbohydrateLinkParams, CarbohydrateLinkVisual } from '../visual/carbohydrate-link-cylinder';
import { CarbohydrateSymbolParams, CarbohydrateSymbolVisual } from '../visual/carbohydrate-symbol-mesh';
import { CarbohydrateTerminalLinkParams, CarbohydrateTerminalLinkVisual } from '../visual/carbohydrate-terminal-link-cylinder';
const CarbohydrateVisuals = {
    'carbohydrate-symbol': (ctx, getParams) => ComplexRepresentation('Carbohydrate symbol mesh', ctx, getParams, CarbohydrateSymbolVisual),
    'carbohydrate-link': (ctx, getParams) => ComplexRepresentation('Carbohydrate link cylinder', ctx, getParams, CarbohydrateLinkVisual),
    'carbohydrate-terminal-link': (ctx, getParams) => ComplexRepresentation('Carbohydrate terminal link cylinder', ctx, getParams, CarbohydrateTerminalLinkVisual),
};
export const CarbohydrateParams = {
    ...CarbohydrateSymbolParams,
    ...CarbohydrateLinkParams,
    ...CarbohydrateTerminalLinkParams,
    visuals: PD.MultiSelect(['carbohydrate-symbol', 'carbohydrate-link', 'carbohydrate-terminal-link'], PD.objectToOptions(CarbohydrateVisuals)),
    bumpFrequency: PD.Numeric(0, { min: 0, max: 10, step: 0.1 }, BaseGeometry.ShadingCategory),
    density: PD.Numeric(0.2, { min: 0, max: 1, step: 0.01 }, BaseGeometry.ShadingCategory),
};
export function getCarbohydrateParams(ctx, structure) {
    return CarbohydrateParams;
}
export function CarbohydrateRepresentation(ctx, getParams) {
    return Representation.createMulti('Carbohydrate', ctx, getParams, StructureRepresentationStateBuilder, CarbohydrateVisuals);
}
export const CarbohydrateRepresentationProvider = StructureRepresentationProvider({
    name: 'carbohydrate',
    label: 'Carbohydrate',
    description: 'Displays carbohydrate symbols (3D SNFG).',
    factory: CarbohydrateRepresentation,
    getParams: getCarbohydrateParams,
    defaultValues: PD.getDefaultValues(CarbohydrateParams),
    defaultColorTheme: { name: 'carbohydrate-symbol' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => {
        return structure.models.some(m => Model.hasCarbohydrate(m));
    }
});
