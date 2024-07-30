/**
 * Copyright (c) 2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { CustomModelProperty } from '../../../mol-model-props/common/custom-model-property';
import { Model, Structure } from '../../../mol-model/structure';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
/** Parameter definition for custom model property "Is MVS" */
export type IsMVSModelParams = typeof IsMVSModelParams;
export declare const IsMVSModelParams: {
    isMvs: PD.BooleanParam;
};
/** Parameter values for custom model property "Is MVS" */
export type IsMVSModelProps = PD.Values<IsMVSModelParams>;
/** Provider for custom model property "Is MVS" */
export declare const IsMVSModelProvider: CustomModelProperty.Provider<IsMVSModelParams, {}>;
/** Decide if the model is flagged as managed by MolViewSpec */
export declare function isMVSModel(model: Model): boolean;
/** Decide if the structure is flagged as managed by MolViewSpec */
export declare function isMVSStructure(structure: Structure): boolean;
