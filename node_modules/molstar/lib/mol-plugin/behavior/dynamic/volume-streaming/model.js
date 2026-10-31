/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { PluginStateObject } from '../../../../mol-plugin-state/objects';
export class VolumeServerInfo extends PluginStateObject.Create({ name: 'Volume Streaming', typeClass: 'Object' }) {
}
export var VolumeServerHeader;
(function (VolumeServerHeader) {
    let ValueType;
    (function (ValueType) {
        ValueType.Float32 = 'float32';
        ValueType.Int8 = 'int8';
    })(ValueType = VolumeServerHeader.ValueType || (VolumeServerHeader.ValueType = {}));
})(VolumeServerHeader || (VolumeServerHeader = {}));
