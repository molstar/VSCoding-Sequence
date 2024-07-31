import { Model } from '../../../mol-model/structure';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { CustomModelProperty } from '../../../mol-model-props/common/custom-model-property';
type TypeId = number;
type IdToCharge = Map<number, number>;
export interface SBNcbrPartialChargeData {
    typeIdToMethod: Map<TypeId, string>;
    typeIdToAtomIdToCharge: Map<TypeId, IdToCharge>;
    typeIdToResidueToCharge: Map<TypeId, IdToCharge>;
    maxAbsoluteAtomCharges: IdToCharge;
    maxAbsoluteResidueCharges: IdToCharge;
    maxAbsoluteAtomChargeAll: number;
    params: PartialChargesPropertyParams;
}
declare const PartialChargesPropertyParams: {
    typeId: PD.Select<number>;
};
type PartialChargesPropertyParams = typeof PartialChargesPropertyParams;
export declare function hasPartialChargesCategories(model: Model): boolean;
export declare const SbNcbrPartialChargesPropertyProvider: CustomModelProperty.Provider<PartialChargesPropertyParams, SBNcbrPartialChargeData | undefined>;
export {};
