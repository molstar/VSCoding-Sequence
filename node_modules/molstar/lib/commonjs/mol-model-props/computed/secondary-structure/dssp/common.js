"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bridge = exports.DSSPType = void 0;
const mol_util_1 = require("../../../../mol-util");
var DSSPType;
(function (DSSPType) {
    DSSPType.is = mol_util_1.BitFlags.has;
    DSSPType.create = mol_util_1.BitFlags.create;
})(DSSPType || (exports.DSSPType = DSSPType = {}));
class Bridge {
    constructor(p1, p2, type) {
        this.partner1 = Math.min(p1, p2);
        this.partner2 = Math.max(p1, p2);
        this.type = type;
    }
}
exports.Bridge = Bridge;
