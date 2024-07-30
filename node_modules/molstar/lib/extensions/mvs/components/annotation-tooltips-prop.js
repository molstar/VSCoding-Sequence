/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { CustomStructureProperty } from '../../../mol-model-props/common/custom-structure-property';
import { CustomPropertyDescriptor } from '../../../mol-model/custom-property';
import { StructureElement } from '../../../mol-model/structure';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { filterDefined } from '../helpers/utils';
import { MVSAnnotationsProvider } from './annotation-prop';
/** Parameter definition for custom structure property "MVSAnnotationTooltips" */
export const MVSAnnotationTooltipsParams = {
    tooltips: PD.ObjectList({
        annotationId: PD.Text('', { description: 'Reference to "MVS Annotation" custom model property' }),
        fieldName: PD.Text('tooltip', { description: 'Annotation field (column) from which to take color values' }),
    }, obj => `${obj.annotationId}:${obj.fieldName}`),
};
/** Provider for custom structure property "MVSAnnotationTooltips" */
export const MVSAnnotationTooltipsProvider = CustomStructureProperty.createProvider({
    label: 'MVS Annotation Tooltips',
    descriptor: CustomPropertyDescriptor({
        name: 'mvs-annotation-tooltips',
    }),
    type: 'local',
    defaultParams: MVSAnnotationTooltipsParams,
    getParams: (data) => MVSAnnotationTooltipsParams,
    isApplicable: (data) => data.root === data,
    obtain: async (ctx, data, props) => {
        const fullProps = { ...PD.getDefaultValues(MVSAnnotationTooltipsParams), ...props };
        return { value: fullProps };
    },
});
/** Label provider based on data from "MVS Annotation" custom model property */
export const MVSAnnotationTooltipsLabelProvider = {
    label: (loci) => {
        switch (loci.kind) {
            case 'element-loci':
                if (!loci.structure.customPropertyDescriptors.hasReference(MVSAnnotationTooltipsProvider.descriptor))
                    return undefined;
                const location = StructureElement.Loci.getFirstLocation(loci);
                if (!location)
                    return undefined;
                const tooltipProps = MVSAnnotationTooltipsProvider.get(location.structure).value;
                if (!tooltipProps || tooltipProps.tooltips.length === 0)
                    return undefined;
                const annotations = MVSAnnotationsProvider.get(location.unit.model).value;
                const texts = tooltipProps.tooltips.map(p => { var _a; return (_a = annotations === null || annotations === void 0 ? void 0 : annotations.getAnnotation(p.annotationId)) === null || _a === void 0 ? void 0 : _a.getValueForLocation(location, p.fieldName); });
                return filterDefined(texts).join(' | ');
            default:
                return undefined;
        }
    }
};
