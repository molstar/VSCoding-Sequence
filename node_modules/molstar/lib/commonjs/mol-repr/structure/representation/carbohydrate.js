"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarbohydrateRepresentationProvider = exports.CarbohydrateParams = void 0;
exports.getCarbohydrateParams = getCarbohydrateParams;
exports.CarbohydrateRepresentation = CarbohydrateRepresentation;
const base_1 = require("../../../mol-geo/geometry/base");
const structure_1 = require("../../../mol-model/structure");
const representation_1 = require("../../../mol-repr/representation");
const param_definition_1 = require("../../../mol-util/param-definition");
const complex_representation_1 = require("../complex-representation");
const representation_2 = require("../representation");
const carbohydrate_link_cylinder_1 = require("../visual/carbohydrate-link-cylinder");
const carbohydrate_symbol_mesh_1 = require("../visual/carbohydrate-symbol-mesh");
const carbohydrate_terminal_link_cylinder_1 = require("../visual/carbohydrate-terminal-link-cylinder");
const CarbohydrateVisuals = {
    'carbohydrate-symbol': (ctx, getParams) => (0, complex_representation_1.ComplexRepresentation)('Carbohydrate symbol mesh', ctx, getParams, carbohydrate_symbol_mesh_1.CarbohydrateSymbolVisual),
    'carbohydrate-link': (ctx, getParams) => (0, complex_representation_1.ComplexRepresentation)('Carbohydrate link cylinder', ctx, getParams, carbohydrate_link_cylinder_1.CarbohydrateLinkVisual),
    'carbohydrate-terminal-link': (ctx, getParams) => (0, complex_representation_1.ComplexRepresentation)('Carbohydrate terminal link cylinder', ctx, getParams, carbohydrate_terminal_link_cylinder_1.CarbohydrateTerminalLinkVisual),
};
exports.CarbohydrateParams = {
    ...carbohydrate_symbol_mesh_1.CarbohydrateSymbolParams,
    ...carbohydrate_link_cylinder_1.CarbohydrateLinkParams,
    ...carbohydrate_terminal_link_cylinder_1.CarbohydrateTerminalLinkParams,
    visuals: param_definition_1.ParamDefinition.MultiSelect(['carbohydrate-symbol', 'carbohydrate-link', 'carbohydrate-terminal-link'], param_definition_1.ParamDefinition.objectToOptions(CarbohydrateVisuals)),
    bumpFrequency: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 10, step: 0.1 }, base_1.BaseGeometry.ShadingCategory),
    density: param_definition_1.ParamDefinition.Numeric(0.2, { min: 0, max: 1, step: 0.01 }, base_1.BaseGeometry.ShadingCategory),
};
function getCarbohydrateParams(ctx, structure) {
    return exports.CarbohydrateParams;
}
function CarbohydrateRepresentation(ctx, getParams) {
    return representation_1.Representation.createMulti('Carbohydrate', ctx, getParams, representation_2.StructureRepresentationStateBuilder, CarbohydrateVisuals);
}
exports.CarbohydrateRepresentationProvider = (0, representation_2.StructureRepresentationProvider)({
    name: 'carbohydrate',
    label: 'Carbohydrate',
    description: 'Displays carbohydrate symbols (3D SNFG).',
    factory: CarbohydrateRepresentation,
    getParams: getCarbohydrateParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.CarbohydrateParams),
    defaultColorTheme: { name: 'carbohydrate-symbol' },
    defaultSizeTheme: { name: 'uniform' },
    isApplicable: (structure) => {
        return structure.models.some(m => structure_1.Model.hasCarbohydrate(m));
    }
});
