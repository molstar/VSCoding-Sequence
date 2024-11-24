"use strict";
/**
 * Copyright (c) 2017-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterUnitBonds = exports.IntraUnitBonds = void 0;
const graph_1 = require("../../../../../mol-math/graph");
const unit_1 = require("../../unit");
const inter_unit_graph_1 = require("../../../../../mol-math/graph/inter-unit-graph");
var IntraUnitBonds;
(function (IntraUnitBonds) {
    IntraUnitBonds.Empty = graph_1.IntAdjacencyGraph.create([], [], [], 0, { flags: [], order: [], key: [] });
})(IntraUnitBonds || (exports.IntraUnitBonds = IntraUnitBonds = {}));
class InterUnitBonds extends inter_unit_graph_1.InterUnitGraph {
    /** Get inter-unit bond given a bond-location */
    getBondFromLocation(l) {
        return unit_1.Unit.isAtomic(l.aUnit) && unit_1.Unit.isAtomic(l.bUnit) ? this.getEdge(l.aIndex, l.aUnit.id, l.bIndex, l.bUnit.id) : undefined;
    }
    /** Get inter-unit bond index given a bond-location */
    getBondIndexFromLocation(l) {
        return unit_1.Unit.isAtomic(l.aUnit) && unit_1.Unit.isAtomic(l.bUnit) ? this.getEdgeIndex(l.aIndex, l.aUnit.id, l.bIndex, l.bUnit.id) : -1;
    }
}
exports.InterUnitBonds = InterUnitBonds;
(function (InterUnitBonds) {
    class UnitPairBonds extends inter_unit_graph_1.InterUnitGraph.UnitPairEdges {
    }
    InterUnitBonds.UnitPairBonds = UnitPairBonds;
})(InterUnitBonds || (exports.InterUnitBonds = InterUnitBonds = {}));
