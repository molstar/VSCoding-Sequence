"use strict";
/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IllustrativeColorThemeProvider = exports.IllustrativeColorThemeParams = void 0;
exports.getIllustrativeColorThemeParams = getIllustrativeColorThemeParams;
exports.IllustrativeColorTheme = IllustrativeColorTheme;
const color_1 = require("../../mol-util/color");
const structure_1 = require("../../mol-model/structure");
const param_definition_1 = require("../../mol-util/param-definition");
const chain_id_1 = require("./chain-id");
const uniform_1 = require("./uniform");
const type_helpers_1 = require("../../mol-util/type-helpers");
const entity_id_1 = require("./entity-id");
const molecule_type_1 = require("./molecule-type");
const entity_source_1 = require("./entity-source");
const model_index_1 = require("./model-index");
const structure_index_1 = require("./structure-index");
const categories_1 = require("./categories");
const trajectory_index_1 = require("./trajectory-index");
const DefaultIllustrativeColor = (0, color_1.Color)(0xEEEEEE);
const Description = `Assigns an illustrative color that gives every chain a color based on the chosen style but with lighter carbons (inspired by David Goodsell's Molecule of the Month style).`;
exports.IllustrativeColorThemeParams = {
    style: param_definition_1.ParamDefinition.MappedStatic('entity-id', {
        uniform: param_definition_1.ParamDefinition.Group(uniform_1.UniformColorThemeParams),
        'chain-id': param_definition_1.ParamDefinition.Group(chain_id_1.ChainIdColorThemeParams),
        'entity-id': param_definition_1.ParamDefinition.Group(entity_id_1.EntityIdColorThemeParams),
        'entity-source': param_definition_1.ParamDefinition.Group(entity_source_1.EntitySourceColorThemeParams),
        'molecule-type': param_definition_1.ParamDefinition.Group(molecule_type_1.MoleculeTypeColorThemeParams),
        'model-index': param_definition_1.ParamDefinition.Group(model_index_1.ModelIndexColorThemeParams),
        'structure-index': param_definition_1.ParamDefinition.Group(structure_index_1.StructureIndexColorThemeParams),
        'trajectory-index': param_definition_1.ParamDefinition.Group(trajectory_index_1.TrajectoryIndexColorThemeParams),
    }),
    carbonLightness: param_definition_1.ParamDefinition.Numeric(0.8, { min: -6, max: 6, step: 0.1 })
};
function getIllustrativeColorThemeParams(ctx) {
    const params = param_definition_1.ParamDefinition.clone(exports.IllustrativeColorThemeParams);
    return params;
}
function getStyleTheme(ctx, props) {
    switch (props.name) {
        case 'uniform': return (0, uniform_1.UniformColorTheme)(ctx, props.params);
        case 'chain-id': return (0, chain_id_1.ChainIdColorTheme)(ctx, props.params);
        case 'entity-id': return (0, entity_id_1.EntityIdColorTheme)(ctx, props.params);
        case 'entity-source': return (0, entity_source_1.EntitySourceColorTheme)(ctx, props.params);
        case 'molecule-type': return (0, molecule_type_1.MoleculeTypeColorTheme)(ctx, props.params);
        case 'model-index': return (0, model_index_1.ModelIndexColorTheme)(ctx, props.params);
        case 'structure-index': return (0, structure_index_1.StructureIndexColorTheme)(ctx, props.params);
        case 'trajectory-index': return (0, trajectory_index_1.TrajectoryIndexColorTheme)(ctx, props.params);
        default: (0, type_helpers_1.assertUnreachable)(props);
    }
}
function IllustrativeColorTheme(ctx, props) {
    const { color: styleColor, legend, contextHash } = getStyleTheme(ctx, props.style);
    function illustrativeColor(location, typeSymbol) {
        const baseColor = styleColor(location, false);
        return typeSymbol === 'C' ? color_1.Color.lighten(baseColor, props.carbonLightness) : baseColor;
    }
    function color(location) {
        if (structure_1.StructureElement.Location.is(location) && structure_1.Unit.isAtomic(location.unit)) {
            const typeSymbol = location.unit.model.atomicHierarchy.atoms.type_symbol.value(location.element);
            return illustrativeColor(location, typeSymbol);
        }
        else if (structure_1.Bond.isLocation(location) && structure_1.Unit.isAtomic(location.aUnit)) {
            const elementIndex = location.aUnit.elements[location.aIndex];
            const typeSymbol = location.aUnit.model.atomicHierarchy.atoms.type_symbol.value(elementIndex);
            return illustrativeColor(location, typeSymbol);
        }
        return DefaultIllustrativeColor;
    }
    return {
        factory: IllustrativeColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color,
        props,
        contextHash,
        description: Description,
        legend
    };
}
exports.IllustrativeColorThemeProvider = {
    name: 'illustrative',
    label: 'Illustrative',
    category: categories_1.ColorThemeCategory.Misc,
    factory: IllustrativeColorTheme,
    getParams: getIllustrativeColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.IllustrativeColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
