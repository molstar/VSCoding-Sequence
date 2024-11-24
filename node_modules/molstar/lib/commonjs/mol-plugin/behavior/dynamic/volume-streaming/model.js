"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeServerHeader = exports.VolumeServerInfo = void 0;
const objects_1 = require("../../../../mol-plugin-state/objects");
class VolumeServerInfo extends objects_1.PluginStateObject.Create({ name: 'Volume Streaming', typeClass: 'Object' }) {
}
exports.VolumeServerInfo = VolumeServerInfo;
var VolumeServerHeader;
(function (VolumeServerHeader) {
    let ValueType;
    (function (ValueType) {
        ValueType.Float32 = 'float32';
        ValueType.Int8 = 'int8';
    })(ValueType = VolumeServerHeader.ValueType || (VolumeServerHeader.ValueType = {}));
})(VolumeServerHeader || (exports.VolumeServerHeader = VolumeServerHeader = {}));
