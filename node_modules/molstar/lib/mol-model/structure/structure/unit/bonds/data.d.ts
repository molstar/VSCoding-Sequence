/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { BondType } from '../../../model/types';
import { IntAdjacencyGraph } from '../../../../../mol-math/graph';
import { StructureElement } from '../../element';
import { Bond } from '../bonds';
import { InterUnitGraph } from '../../../../../mol-math/graph/inter-unit-graph';
type IntraUnitBondProps = {
    /** Can remap even with `dynamicBonds` on, e.g., for water molecules */
    readonly canRemap?: boolean;
    /** Can be cached in `ElementSetIntraBondCache` */
    readonly cacheable?: boolean;
};
type IntraUnitBonds = IntAdjacencyGraph<StructureElement.UnitIndex, {
    readonly order: ArrayLike<number>;
    readonly flags: ArrayLike<BondType.Flag>;
    readonly key: ArrayLike<number>;
}, IntraUnitBondProps>;
declare namespace IntraUnitBonds {
    const Empty: IntraUnitBonds;
}
type InterUnitEdgeProps = {
    readonly order: number;
    readonly flag: BondType.Flag;
    readonly key: number;
};
declare class InterUnitBonds extends InterUnitGraph<number, StructureElement.UnitIndex, InterUnitEdgeProps> {
    /** Get inter-unit bond given a bond-location */
    getBondFromLocation(l: Bond.Location): InterUnitGraph.Edge<number, StructureElement.UnitIndex, InterUnitEdgeProps> | undefined;
    /** Get inter-unit bond index given a bond-location */
    getBondIndexFromLocation(l: Bond.Location): number;
}
declare namespace InterUnitBonds {
    class UnitPairBonds extends InterUnitGraph.UnitPairEdges<number, StructureElement.UnitIndex, InterUnitEdgeProps> {
    }
    type BondInfo = InterUnitGraph.EdgeInfo<StructureElement.UnitIndex, InterUnitEdgeProps>;
}
export { IntraUnitBonds, IntraUnitBondProps, InterUnitBonds, InterUnitEdgeProps };
