"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NtCTubeTypes = void 0;
const behavior_1 = require("./behavior");
const location_1 = require("../../../mol-model/location");
const loci_1 = require("../../../mol-model/loci");
var NtCTubeTypes;
(function (NtCTubeTypes) {
    const DataTag = 'dnatco-tube-segment-data';
    const DummyTag = 'dnatco-tube-dummy';
    function Location(payload) {
        return (0, location_1.DataLocation)(DataTag, payload, {});
    }
    NtCTubeTypes.Location = Location;
    function isLocation(x) {
        return !!x && x.kind === 'data-location' && x.tag === DataTag;
    }
    NtCTubeTypes.isLocation = isLocation;
    function Loci(data, stepIndices, elements, boundingSphere) {
        return (0, loci_1.DataLoci)(DataTag, data, elements, boundingSphere ? () => boundingSphere : undefined, () => stepIndices[0] !== undefined ? (0, behavior_1.NtCTubeSegmentLabel)(data[stepIndices[0]]) : '');
    }
    NtCTubeTypes.Loci = Loci;
    function DummyLoci() {
        return (0, loci_1.DataLoci)(DummyTag, {}, [], undefined, () => '');
    }
    NtCTubeTypes.DummyLoci = DummyLoci;
    function isLoci(x) {
        return !!x && x.kind === 'data-loci' && x.tag === DataTag;
    }
    NtCTubeTypes.isLoci = isLoci;
})(NtCTubeTypes || (exports.NtCTubeTypes = NtCTubeTypes = {}));
