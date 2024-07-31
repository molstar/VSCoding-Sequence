"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MVSAnnotationTooltipsLabelProvider = exports.MVSAnnotationTooltipsProvider = exports.MVSAnnotationTooltipsParams = void 0;
const custom_structure_property_1 = require("../../../mol-model-props/common/custom-structure-property");
const custom_property_1 = require("../../../mol-model/custom-property");
const structure_1 = require("../../../mol-model/structure");
const param_definition_1 = require("../../../mol-util/param-definition");
const utils_1 = require("../helpers/utils");
const annotation_prop_1 = require("./annotation-prop");
/** Parameter definition for custom structure property "MVSAnnotationTooltips" */
exports.MVSAnnotationTooltipsParams = {
    tooltips: param_definition_1.ParamDefinition.ObjectList({
        annotationId: param_definition_1.ParamDefinition.Text('', { description: 'Reference to "MVS Annotation" custom model property' }),
        fieldName: param_definition_1.ParamDefinition.Text('tooltip', { description: 'Annotation field (column) from which to take color values' }),
    }, obj => `${obj.annotationId}:${obj.fieldName}`),
};
/** Provider for custom structure property "MVSAnnotationTooltips" */
exports.MVSAnnotationTooltipsProvider = custom_structure_property_1.CustomStructureProperty.createProvider({
    label: 'MVS Annotation Tooltips',
    descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
        name: 'mvs-annotation-tooltips',
    }),
    type: 'local',
    defaultParams: exports.MVSAnnotationTooltipsParams,
    getParams: (data) => exports.MVSAnnotationTooltipsParams,
    isApplicable: (data) => data.root === data,
    obtain: async (ctx, data, props) => {
        const fullProps = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.MVSAnnotationTooltipsParams), ...props };
        return { value: fullProps };
    },
});
/** Label provider based on data from "MVS Annotation" custom model property */
exports.MVSAnnotationTooltipsLabelProvider = {
    label: (loci) => {
        switch (loci.kind) {
            case 'element-loci':
                if (!loci.structure.customPropertyDescriptors.hasReference(exports.MVSAnnotationTooltipsProvider.descriptor))
                    return undefined;
                const location = structure_1.StructureElement.Loci.getFirstLocation(loci);
                if (!location)
                    return undefined;
                const tooltipProps = exports.MVSAnnotationTooltipsProvider.get(location.structure).value;
                if (!tooltipProps || tooltipProps.tooltips.length === 0)
                    return undefined;
                const annotations = annotation_prop_1.MVSAnnotationsProvider.get(location.unit.model).value;
                const texts = tooltipProps.tooltips.map(p => { var _a; return (_a = annotations === null || annotations === void 0 ? void 0 : annotations.getAnnotation(p.annotationId)) === null || _a === void 0 ? void 0 : _a.getValueForLocation(location, p.fieldName); });
                return (0, utils_1.filterDefined)(texts).join(' | ');
            default:
                return undefined;
        }
    }
};
