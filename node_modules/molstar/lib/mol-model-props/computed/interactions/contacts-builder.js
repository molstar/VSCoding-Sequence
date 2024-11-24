/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { IntAdjacencyGraph } from '../../../mol-math/graph';
import { InteractionsIntraContacts, InteractionsInterContacts, InteractionFlag } from './common';
import { InterUnitGraph } from '../../../mol-math/graph/inter-unit-graph';
export { IntraContactsBuilder };
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
                const builder = new IntAdjacencyGraph.EdgeBuilder(features.count, aIndices, bIndices);
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
                        return elementsIndex || (elementsIndex = InteractionsIntraContacts.createElementsIndex(graph, features, elementsCount));
                    }
                });
                return contacts;
            }
        };
    }
    IntraContactsBuilder.create = create;
})(IntraContactsBuilder || (IntraContactsBuilder = {}));
export { InterContactsBuilder };
var InterContactsBuilder;
(function (InterContactsBuilder) {
    function create() {
        const builder = new InterUnitGraph.Builder();
        return {
            startUnitPair(unitA, unitB) {
                builder.startUnitPair(unitA.id, unitB.id);
            },
            finishUnitPair() {
                builder.finishUnitPair();
            },
            add(indexA, indexB, type) {
                builder.add(indexA, indexB, { type, flag: InteractionFlag.None });
            },
            getContacts(unitsFeatures) {
                return new InteractionsInterContacts(builder.getMap(), unitsFeatures);
            }
        };
    }
    InterContactsBuilder.create = create;
})(InterContactsBuilder || (InterContactsBuilder = {}));
