/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { Dnatco, DnatcoParams } from '../property';
import { CustomPropertyDescriptor } from '../../../mol-model/custom-property';
import { CustomModelProperty } from '../../../mol-model-props/common/custom-model-property';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
export const ConfalPyramidsParams = { ...DnatcoParams };
export const ConfalPyramidsProvider = CustomModelProperty.createProvider({
    label: 'Confal Pyramids',
    descriptor: CustomPropertyDescriptor({
        name: 'confal_pyramids',
    }),
    type: 'static',
    defaultParams: ConfalPyramidsParams,
    getParams: (data) => ConfalPyramidsParams,
    isApplicable: (data) => Dnatco.isApplicable(data),
    obtain: async (ctx, data, props) => {
        const p = { ...PD.getDefaultValues(ConfalPyramidsParams), ...props };
        return Dnatco.fromCif(ctx, data, p);
    }
});
