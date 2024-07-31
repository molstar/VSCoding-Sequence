/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { NtCTubeSegmentLabel } from './behavior';
import { DataLocation } from '../../../mol-model/location';
import { DataLoci } from '../../../mol-model/loci';
export var NtCTubeTypes;
(function (NtCTubeTypes) {
    const DataTag = 'dnatco-tube-segment-data';
    const DummyTag = 'dnatco-tube-dummy';
    function Location(payload) {
        return DataLocation(DataTag, payload, {});
    }
    NtCTubeTypes.Location = Location;
    function isLocation(x) {
        return !!x && x.kind === 'data-location' && x.tag === DataTag;
    }
    NtCTubeTypes.isLocation = isLocation;
    function Loci(data, stepIndices, elements, boundingSphere) {
        return DataLoci(DataTag, data, elements, boundingSphere ? () => boundingSphere : undefined, () => stepIndices[0] !== undefined ? NtCTubeSegmentLabel(data[stepIndices[0]]) : '');
    }
    NtCTubeTypes.Loci = Loci;
    function DummyLoci() {
        return DataLoci(DummyTag, {}, [], undefined, () => '');
    }
    NtCTubeTypes.DummyLoci = DummyLoci;
    function isLoci(x) {
        return !!x && x.kind === 'data-loci' && x.tag === DataTag;
    }
    NtCTubeTypes.isLoci = isLoci;
})(NtCTubeTypes || (NtCTubeTypes = {}));
