/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { CustomStructureProperty } from '../../../mol-model-props/common/custom-structure-property';
import { CustomPropertyDescriptor } from '../../../mol-model/custom-property';
import { StructureElement } from '../../../mol-model/structure';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { filterDefined } from '../helpers/utils';
import { ElementSet, SelectorParams } from './selector';
export const CustomTooltipsParams = {
    tooltips: PD.ObjectList({
        text: PD.Text('', { description: 'Text of the tooltip' }),
        selector: SelectorParams,
    }, obj => obj.text),
};
/** Provider for custom structure property "CustomTooltips" */
export const CustomTooltipsProvider = CustomStructureProperty.createProvider({
    label: 'MVS Custom Tooltips',
    descriptor: CustomPropertyDescriptor({
        name: 'mvs-custom-tooltips',
    }),
    type: 'local',
    defaultParams: CustomTooltipsParams,
    getParams: (data) => CustomTooltipsParams,
    isApplicable: (data) => data.root === data,
    obtain: async (ctx, data, props) => {
        const fullProps = { ...PD.getDefaultValues(CustomTooltipsParams), ...props };
        const value = fullProps.tooltips.map(t => ({
            selector: t.selector,
            text: t.text,
        }));
        return { value: value };
    },
});
/** Label provider based on custom structure property "CustomTooltips" */
export const CustomTooltipsLabelProvider = {
    label: (loci) => {
        var _a;
        switch (loci.kind) {
            case 'element-loci':
                if (!loci.structure.customPropertyDescriptors.hasReference(CustomTooltipsProvider.descriptor))
                    return undefined;
                const location = StructureElement.Loci.getFirstLocation(loci);
                if (!location)
                    return undefined;
                const tooltipData = CustomTooltipsProvider.get(location.structure).value;
                if (!tooltipData || tooltipData.length === 0)
                    return undefined;
                const texts = [];
                for (const tooltip of tooltipData) {
                    const elements = (_a = tooltip.elementSet) !== null && _a !== void 0 ? _a : (tooltip.elementSet = ElementSet.fromSelector(location.structure, tooltip.selector));
                    if (ElementSet.has(elements, location))
                        texts.push(tooltip.text);
                }
                return filterDefined(texts).join(' | ');
            default:
                return undefined;
        }
    }
};
