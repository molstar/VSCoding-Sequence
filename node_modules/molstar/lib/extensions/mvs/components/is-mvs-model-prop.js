/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { CustomModelProperty } from '../../../mol-model-props/common/custom-model-property';
import { CustomPropertyDescriptor } from '../../../mol-model/custom-property';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
export const IsMVSModelParams = {
    isMvs: PD.Boolean(false, { description: 'Flag this model as managed by MolViewSpec and enable MolViewSpec features' }),
};
/** Provider for custom model property "Is MVS" */
export const IsMVSModelProvider = CustomModelProperty.createProvider({
    label: 'MVS',
    descriptor: CustomPropertyDescriptor({
        name: 'mvs-is-mvs-model',
    }),
    type: 'static',
    defaultParams: IsMVSModelParams,
    getParams: (data) => IsMVSModelParams,
    isApplicable: (data) => true,
    obtain: async (ctx, data, props) => ({ value: {} }),
});
/** Decide if the model is flagged as managed by MolViewSpec */
export function isMVSModel(model) {
    var _a;
    return !!((_a = IsMVSModelProvider.props(model)) === null || _a === void 0 ? void 0 : _a.isMvs);
}
/** Decide if the structure is flagged as managed by MolViewSpec */
export function isMVSStructure(structure) {
    return structure.models.some(isMVSModel);
}
