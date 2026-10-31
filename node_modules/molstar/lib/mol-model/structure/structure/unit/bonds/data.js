/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { IntAdjacencyGraph } from '../../../../../mol-math/graph';
import { Unit } from '../../unit';
import { InterUnitGraph } from '../../../../../mol-math/graph/inter-unit-graph';
var IntraUnitBonds;
(function (IntraUnitBonds) {
    IntraUnitBonds.Empty = IntAdjacencyGraph.create([], [], [], 0, { flags: [], order: [], key: [] });
})(IntraUnitBonds || (IntraUnitBonds = {}));
class InterUnitBonds extends InterUnitGraph {
    /** Get inter-unit bond given a bond-location */
    getBondFromLocation(l) {
        return Unit.isAtomic(l.aUnit) && Unit.isAtomic(l.bUnit) ? this.getEdge(l.aIndex, l.aUnit.id, l.bIndex, l.bUnit.id) : undefined;
    }
    /** Get inter-unit bond index given a bond-location */
    getBondIndexFromLocation(l) {
        return Unit.isAtomic(l.aUnit) && Unit.isAtomic(l.bUnit) ? this.getEdgeIndex(l.aIndex, l.aUnit.id, l.bIndex, l.bUnit.id) : -1;
    }
}
(function (InterUnitBonds) {
    class UnitPairBonds extends InterUnitGraph.UnitPairEdges {
    }
    InterUnitBonds.UnitPairBonds = UnitPairBonds;
})(InterUnitBonds || (InterUnitBonds = {}));
export { IntraUnitBonds, InterUnitBonds };
