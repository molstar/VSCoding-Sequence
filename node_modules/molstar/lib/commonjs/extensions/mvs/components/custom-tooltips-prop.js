"use strict";
/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomTooltipsLabelProvider = exports.CustomTooltipsProvider = exports.CustomTooltipsParams = void 0;
const custom_structure_property_1 = require("../../../mol-model-props/common/custom-structure-property");
const custom_property_1 = require("../../../mol-model/custom-property");
const structure_1 = require("../../../mol-model/structure");
const param_definition_1 = require("../../../mol-util/param-definition");
const utils_1 = require("../helpers/utils");
const selector_1 = require("./selector");
exports.CustomTooltipsParams = {
    tooltips: param_definition_1.ParamDefinition.ObjectList({
        text: param_definition_1.ParamDefinition.Text('', { description: 'Text of the tooltip' }),
        selector: selector_1.SelectorParams,
    }, obj => obj.text),
};
/** Provider for custom structure property "CustomTooltips" */
exports.CustomTooltipsProvider = custom_structure_property_1.CustomStructureProperty.createProvider({
    label: 'MVS Custom Tooltips',
    descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
        name: 'mvs-custom-tooltips',
    }),
    type: 'local',
    defaultParams: exports.CustomTooltipsParams,
    getParams: (data) => exports.CustomTooltipsParams,
    isApplicable: (data) => data.root === data,
    obtain: async (ctx, data, props) => {
        const fullProps = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.CustomTooltipsParams), ...props };
        const value = fullProps.tooltips.map(t => ({
            selector: t.selector,
            text: t.text,
        }));
        return { value: value };
    },
});
/** Label provider based on custom structure property "CustomTooltips" */
exports.CustomTooltipsLabelProvider = {
    label: (loci) => {
        var _a;
        switch (loci.kind) {
            case 'element-loci':
                if (!loci.structure.customPropertyDescriptors.hasReference(exports.CustomTooltipsProvider.descriptor))
                    return undefined;
                const location = structure_1.StructureElement.Loci.getFirstLocation(loci);
                if (!location)
                    return undefined;
                const tooltipData = exports.CustomTooltipsProvider.get(location.structure).value;
                if (!tooltipData || tooltipData.length === 0)
                    return undefined;
                const texts = [];
                for (const tooltip of tooltipData) {
                    const elements = (_a = tooltip.elementSet) !== null && _a !== void 0 ? _a : (tooltip.elementSet = selector_1.ElementSet.fromSelector(location.structure, tooltip.selector));
                    if (selector_1.ElementSet.has(elements, location))
                        texts.push(tooltip.text);
                }
                return (0, utils_1.filterDefined)(texts).join(' | ');
            default:
                return undefined;
        }
    }
};
