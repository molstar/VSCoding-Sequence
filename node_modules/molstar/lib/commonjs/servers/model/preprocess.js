#!/usr/bin/env node
"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const cluster_1 = tslib_1.__importDefault(require("cluster"));
const parallel_1 = require("./preprocess/parallel");
if (cluster_1.default.isPrimary) {
    require('./preprocess/master');
}
else {
    (0, parallel_1.runChild)();
}
// example:
// node build\node_modules\servers\model\preprocess -i e:\test\Quick\1cbs_updated.cif -oc e:\test\mol-star\model\1cbs.cif -ob e:\test\mol-star\model\1cbs.bcif
