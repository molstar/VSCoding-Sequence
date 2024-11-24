/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { SecondaryStructure } from '../../mol-model/structure/model/properties/secondary-structure';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { CustomStructureProperty } from '../common/custom-structure-property';
export declare const SecondaryStructureParams: {
    type: PD.Mapped<PD.NamedParams<PD.Normalize<unknown>, "auto"> | PD.NamedParams<PD.Normalize<unknown>, "model"> | PD.NamedParams<PD.Normalize<{
        oldDefinition: boolean;
        oldOrdering: boolean;
    }>, "dssp"> | PD.NamedParams<PD.Normalize<unknown>, "zhang-skolnick">>;
};
export type SecondaryStructureParams = typeof SecondaryStructureParams;
export type SecondaryStructureProps = PD.Values<SecondaryStructureParams>;
/** Maps `unit.id` to `SecondaryStructure` */
export type SecondaryStructureValue = Map<number, SecondaryStructure>;
export declare const SecondaryStructureProvider: CustomStructureProperty.Provider<SecondaryStructureParams, SecondaryStructureValue>;
