/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { calcValenceModel, ValenceModelParams as _ValenceModelParams } from './chemistry/valence-model';
import { CustomStructureProperty } from '../common/custom-structure-property';
import { CustomPropertyDescriptor } from '../../mol-model/custom-property';
export const ValenceModelParams = {
    ..._ValenceModelParams
};
export const ValenceModelProvider = CustomStructureProperty.createProvider({
    label: 'Valence Model',
    descriptor: CustomPropertyDescriptor({
        name: 'molstar_computed_valence_model',
        // TODO `cifExport` and `symbol`
    }),
    type: 'local',
    defaultParams: ValenceModelParams,
    getParams: (data) => ValenceModelParams,
    isApplicable: (data) => true,
    obtain: async (ctx, data, props) => {
        const p = { ...PD.getDefaultValues(ValenceModelParams), ...props };
        return { value: await calcValenceModel(ctx.runtime, data, p) };
    }
});
