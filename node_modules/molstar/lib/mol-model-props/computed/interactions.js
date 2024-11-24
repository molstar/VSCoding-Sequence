/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { computeInteractions, InteractionsParams as _InteractionsParams } from './interactions/interactions';
import { CustomStructureProperty } from '../common/custom-structure-property';
import { CustomPropertyDescriptor } from '../../mol-model/custom-property';
export const InteractionsParams = {
    ..._InteractionsParams
};
export const InteractionsProvider = CustomStructureProperty.createProvider({
    label: 'Interactions',
    descriptor: CustomPropertyDescriptor({
        name: 'molstar_computed_interactions',
        // TODO `cifExport` and `symbol`
    }),
    type: 'local',
    defaultParams: InteractionsParams,
    getParams: (data) => InteractionsParams,
    isApplicable: (data) => !data.isCoarseGrained,
    obtain: async (ctx, data, props) => {
        const p = { ...PD.getDefaultValues(InteractionsParams), ...props };
        return { value: await computeInteractions(ctx, data, p) };
    }
});
