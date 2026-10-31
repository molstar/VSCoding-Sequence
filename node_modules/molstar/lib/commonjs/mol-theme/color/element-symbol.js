"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementSymbolColorThemeProvider = exports.ElementSymbolColorThemeParams = exports.ElementSymbolColors = void 0;
exports.getElementSymbolColorThemeParams = getElementSymbolColorThemeParams;
exports.elementSymbolColor = elementSymbolColor;
exports.ElementSymbolColorTheme = ElementSymbolColorTheme;
const color_1 = require("../../mol-util/color");
const structure_1 = require("../../mol-model/structure");
const param_definition_1 = require("../../mol-util/param-definition");
const legend_1 = require("../../mol-util/legend");
const color_2 = require("../../mol-util/color/color");
const params_1 = require("../../mol-util/color/params");
const chain_id_1 = require("./chain-id");
const operator_name_1 = require("./operator-name");
const entity_id_1 = require("./entity-id");
const type_helpers_1 = require("../../mol-util/type-helpers");
const entity_source_1 = require("./entity-source");
const model_index_1 = require("./model-index");
const structure_index_1 = require("./structure-index");
const categories_1 = require("./categories");
const unit_index_1 = require("./unit-index");
const uniform_1 = require("./uniform");
const trajectory_index_1 = require("./trajectory-index");
// from Jmol http://jmol.sourceforge.net/jscolors/ (or 0xFFFFFF)
exports.ElementSymbolColors = (0, color_1.ColorMap)({
    'H': 0xFFFFFF, 'D': 0xFFFFC0, 'T': 0xFFFFA0, 'HE': 0xD9FFFF, 'LI': 0xCC80FF, 'BE': 0xC2FF00, 'B': 0xFFB5B5, 'C': 0x909090, 'N': 0x3050F8, 'O': 0xFF0D0D, 'F': 0x90E050, 'NE': 0xB3E3F5, 'NA': 0xAB5CF2, 'MG': 0x8AFF00, 'AL': 0xBFA6A6, 'SI': 0xF0C8A0, 'P': 0xFF8000, 'S': 0xFFFF30, 'CL': 0x1FF01F, 'AR': 0x80D1E3, 'K': 0x8F40D4, 'CA': 0x3DFF00, 'SC': 0xE6E6E6, 'TI': 0xBFC2C7, 'V': 0xA6A6AB, 'CR': 0x8A99C7, 'MN': 0x9C7AC7, 'FE': 0xE06633, 'CO': 0xF090A0, 'NI': 0x50D050, 'CU': 0xC88033, 'ZN': 0x7D80B0, 'GA': 0xC28F8F, 'GE': 0x668F8F, 'AS': 0xBD80E3, 'SE': 0xFFA100, 'BR': 0xA62929, 'KR': 0x5CB8D1, 'RB': 0x702EB0, 'SR': 0x00FF00, 'Y': 0x94FFFF, 'ZR': 0x94E0E0, 'NB': 0x73C2C9, 'MO': 0x54B5B5, 'TC': 0x3B9E9E, 'RU': 0x248F8F, 'RH': 0x0A7D8C, 'PD': 0x006985, 'AG': 0xC0C0C0, 'CD': 0xFFD98F, 'IN': 0xA67573, 'SN': 0x668080, 'SB': 0x9E63B5, 'TE': 0xD47A00, 'I': 0x940094, 'XE': 0x940094, 'CS': 0x57178F, 'BA': 0x00C900, 'LA': 0x70D4FF, 'CE': 0xFFFFC7, 'PR': 0xD9FFC7, 'ND': 0xC7FFC7, 'PM': 0xA3FFC7, 'SM': 0x8FFFC7, 'EU': 0x61FFC7, 'GD': 0x45FFC7, 'TB': 0x30FFC7, 'DY': 0x1FFFC7, 'HO': 0x00FF9C, 'ER': 0x00E675, 'TM': 0x00D452, 'YB': 0x00BF38, 'LU': 0x00AB24, 'HF': 0x4DC2FF, 'TA': 0x4DA6FF, 'W': 0x2194D6, 'RE': 0x267DAB, 'OS': 0x266696, 'IR': 0x175487, 'PT': 0xD0D0E0, 'AU': 0xFFD123, 'HG': 0xB8B8D0, 'TL': 0xA6544D, 'PB': 0x575961, 'BI': 0x9E4FB5, 'PO': 0xAB5C00, 'AT': 0x754F45, 'RN': 0x428296, 'FR': 0x420066, 'RA': 0x007D00, 'AC': 0x70ABFA, 'TH': 0x00BAFF, 'PA': 0x00A1FF, 'U': 0x008FFF, 'NP': 0x0080FF, 'PU': 0x006BFF, 'AM': 0x545CF2, 'CM': 0x785CE3, 'BK': 0x8A4FE3, 'CF': 0xA136D4, 'ES': 0xB31FD4, 'FM': 0xB31FBA, 'MD': 0xB30DA6, 'NO': 0xBD0D87, 'LR': 0xC70066, 'RF': 0xCC0059, 'DB': 0xD1004F, 'SG': 0xD90045, 'BH': 0xE00038, 'HS': 0xE6002E, 'MT': 0xEB0026, 'DS': 0xFFFFFF, 'RG': 0xFFFFFF, 'CN': 0xFFFFFF, 'UUT': 0xFFFFFF, 'FL': 0xFFFFFF, 'UUP': 0xFFFFFF, 'LV': 0xFFFFFF, 'UUH': 0xFFFFFF
});
const DefaultElementSymbolColor = (0, color_1.Color)(0xFFFFFF);
const Description = 'Assigns a color to every atom according to its chemical element.';
exports.ElementSymbolColorThemeParams = {
    carbonColor: param_definition_1.ParamDefinition.MappedStatic('chain-id', {
        'chain-id': param_definition_1.ParamDefinition.Group(chain_id_1.ChainIdColorThemeParams),
        'unit-index': param_definition_1.ParamDefinition.Group(unit_index_1.UnitIndexColorThemeParams, { label: 'Chain Instance' }),
        'entity-id': param_definition_1.ParamDefinition.Group(entity_id_1.EntityIdColorThemeParams),
        'entity-source': param_definition_1.ParamDefinition.Group(entity_source_1.EntitySourceColorThemeParams),
        'operator-name': param_definition_1.ParamDefinition.Group(operator_name_1.OperatorNameColorThemeParams),
        'model-index': param_definition_1.ParamDefinition.Group(model_index_1.ModelIndexColorThemeParams),
        'structure-index': param_definition_1.ParamDefinition.Group(structure_index_1.StructureIndexColorThemeParams),
        'trajectory-index': param_definition_1.ParamDefinition.Group(trajectory_index_1.TrajectoryIndexColorThemeParams),
        'uniform': param_definition_1.ParamDefinition.Group(uniform_1.UniformColorThemeParams),
        'element-symbol': param_definition_1.ParamDefinition.EmptyGroup(),
    }, { description: 'Use chain-id coloring for carbon atoms.' }),
    saturation: param_definition_1.ParamDefinition.Numeric(0, { min: -6, max: 6, step: 0.1 }),
    lightness: param_definition_1.ParamDefinition.Numeric(0.2, { min: -6, max: 6, step: 0.1 }),
    colors: param_definition_1.ParamDefinition.MappedStatic('default', {
        'default': param_definition_1.ParamDefinition.EmptyGroup(),
        'custom': param_definition_1.ParamDefinition.Group((0, params_1.getColorMapParams)(exports.ElementSymbolColors))
    })
};
function getElementSymbolColorThemeParams(ctx) {
    return param_definition_1.ParamDefinition.clone(exports.ElementSymbolColorThemeParams);
}
function elementSymbolColor(colorMap, element) {
    const c = colorMap[element];
    return c === undefined ? DefaultElementSymbolColor : c;
}
function getCarbonTheme(ctx, props) {
    switch (props.name) {
        case 'chain-id': return (0, chain_id_1.ChainIdColorTheme)(ctx, props.params);
        case 'unit-index': return (0, unit_index_1.UnitIndexColorTheme)(ctx, props.params);
        case 'entity-id': return (0, entity_id_1.EntityIdColorTheme)(ctx, props.params);
        case 'entity-source': return (0, entity_source_1.EntitySourceColorTheme)(ctx, props.params);
        case 'operator-name': return (0, operator_name_1.OperatorNameColorTheme)(ctx, props.params);
        case 'model-index': return (0, model_index_1.ModelIndexColorTheme)(ctx, props.params);
        case 'structure-index': return (0, structure_index_1.StructureIndexColorTheme)(ctx, props.params);
        case 'trajectory-index': return (0, trajectory_index_1.TrajectoryIndexColorTheme)(ctx, props.params);
        case 'uniform': return (0, uniform_1.UniformColorTheme)(ctx, props.params);
        case 'element-symbol': return undefined;
        default: (0, type_helpers_1.assertUnreachable)(props);
    }
}
function ElementSymbolColorTheme(ctx, props) {
    var _a;
    const colorMap = (0, color_2.getAdjustedColorMap)(props.colors.name === 'default' ? exports.ElementSymbolColors : props.colors.params, props.saturation, props.lightness);
    const carbonTheme = getCarbonTheme(ctx, props.carbonColor);
    const carbonColor = carbonTheme === null || carbonTheme === void 0 ? void 0 : carbonTheme.color;
    const contextHash = (_a = carbonTheme === null || carbonTheme === void 0 ? void 0 : carbonTheme.contextHash) !== null && _a !== void 0 ? _a : -1;
    function elementColor(element, location) {
        return (carbonColor && element === 'C')
            ? carbonColor(location, false)
            : elementSymbolColor(colorMap, element);
    }
    function color(location) {
        if (structure_1.StructureElement.Location.is(location)) {
            if (structure_1.Unit.isAtomic(location.unit)) {
                const { type_symbol } = location.unit.model.atomicHierarchy.atoms;
                return elementColor(type_symbol.value(location.element), location);
            }
        }
        else if (structure_1.Bond.isLocation(location)) {
            if (structure_1.Unit.isAtomic(location.aUnit)) {
                const { type_symbol } = location.aUnit.model.atomicHierarchy.atoms;
                const element = type_symbol.value(location.aUnit.elements[location.aIndex]);
                return elementColor(element, location);
            }
        }
        return DefaultElementSymbolColor;
    }
    const granularity = (props.carbonColor.name === 'operator-name' || props.carbonColor.name === 'unit-index') ? 'groupInstance' : 'group';
    return {
        factory: ElementSymbolColorTheme,
        granularity,
        preferSmoothing: true,
        color,
        props,
        contextHash,
        description: Description,
        legend: (0, legend_1.TableLegend)(Object.keys(colorMap).map(name => {
            return [name, colorMap[name]];
        }))
    };
}
exports.ElementSymbolColorThemeProvider = {
    name: 'element-symbol',
    label: 'Element Symbol',
    category: categories_1.ColorThemeCategory.Atom,
    factory: ElementSymbolColorTheme,
    getParams: getElementSymbolColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.ElementSymbolColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
