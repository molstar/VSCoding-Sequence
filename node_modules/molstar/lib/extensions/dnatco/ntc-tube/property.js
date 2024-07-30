/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { Dnatco, DnatcoParams } from '../property';
import { CustomPropertyDescriptor } from '../../../mol-model/custom-property';
import { CustomModelProperty } from '../../../mol-model-props/common/custom-model-property';
import { PropertyWrapper } from '../../../mol-model-props/common/wrapper';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
export const NtCTubeParams = { ...DnatcoParams };
async function fromCif(ctx, model, props) {
    const info = PropertyWrapper.createInfo();
    const data = Dnatco.getCifData(model);
    if (data === undefined)
        return { value: { info, data: undefined } };
    const steps = Dnatco.getStepsFromCif(model, data.steps, data.stepsSummary);
    return { value: { info, data: { data: steps } } };
}
export const NtCTubeProvider = CustomModelProperty.createProvider({
    label: 'NtC Tube',
    descriptor: CustomPropertyDescriptor({
        name: 'ntc-tube',
    }),
    type: 'static',
    defaultParams: NtCTubeParams,
    getParams: (data) => NtCTubeParams,
    isApplicable: (data) => Dnatco.isApplicable(data),
    obtain: async (ctx, data, props) => {
        const p = { ...PD.getDefaultValues(NtCTubeParams), ...props };
        return fromCif(ctx, data, p);
    }
});
