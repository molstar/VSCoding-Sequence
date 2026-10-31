"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topology = void 0;
const mol_util_1 = require("../../../mol-util");
var Topology;
(function (Topology) {
    function create(label, basic, bonds, format) {
        return {
            id: mol_util_1.UUID.create22(),
            label,
            basic,
            sourceData: format,
            bonds
        };
    }
    Topology.create = create;
})(Topology || (exports.Topology = Topology = {}));
