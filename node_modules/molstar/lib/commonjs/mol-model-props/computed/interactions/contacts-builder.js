"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterContactsBuilder = exports.IntraContactsBuilder = void 0;
const graph_1 = require("../../../mol-math/graph");
const common_1 = require("./common");
const inter_unit_graph_1 = require("../../../mol-math/graph/inter-unit-graph");
var IntraContactsBuilder;
(function (IntraContactsBuilder) {
    function create(features, elementsCount) {
        const aIndices = [];
        const bIndices = [];
        const types = [];
        return {
            add(indexA, indexB, type) {
                aIndices[aIndices.length] = indexA;
                bIndices[bIndices.length] = indexB;
                types[types.length] = type;
            },
            getContacts() {
                const builder = new graph_1.IntAdjacencyGraph.EdgeBuilder(features.count, aIndices, bIndices);
                const type = new Int8Array(builder.slotCount);
                const flag = new Int8Array(builder.slotCount);
                for (let i = 0, _i = builder.edgeCount; i < _i; i++) {
                    builder.addNextEdge();
                    builder.assignProperty(type, types[i]);
                }
                const graph = builder.createGraph({ type, flag });
                let elementsIndex;
                const contacts = Object.defineProperty(graph, 'elementsIndex', {
                    get: () => {
                        return elementsIndex || (elementsIndex = common_1.InteractionsIntraContacts.createElementsIndex(graph, features, elementsCount));
                    }
                });
                return contacts;
            }
        };
    }
    IntraContactsBuilder.create = create;
})(IntraContactsBuilder || (exports.IntraContactsBuilder = IntraContactsBuilder = {}));
var InterContactsBuilder;
(function (InterContactsBuilder) {
    function create() {
        const builder = new inter_unit_graph_1.InterUnitGraph.Builder();
        return {
            startUnitPair(unitA, unitB) {
                builder.startUnitPair(unitA.id, unitB.id);
            },
            finishUnitPair() {
                builder.finishUnitPair();
            },
            add(indexA, indexB, type) {
                builder.add(indexA, indexB, { type, flag: common_1.InteractionFlag.None });
            },
            getContacts(unitsFeatures) {
                return new common_1.InteractionsInterContacts(builder.getMap(), unitsFeatures);
            }
        };
    }
    InterContactsBuilder.create = create;
})(InterContactsBuilder || (exports.InterContactsBuilder = InterContactsBuilder = {}));
