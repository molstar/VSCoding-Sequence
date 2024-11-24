/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { DnatcoTypes } from '../types';
import { DataLocation } from '../../../mol-model/location';
import { DataLoci } from '../../../mol-model/loci';
import { confalPyramidLabel } from './behavior';
export var ConfalPyramidsTypes;
(function (ConfalPyramidsTypes) {
    function Location(step, isLower) {
        return DataLocation(DnatcoTypes.DataTag, { step, isLower }, {});
    }
    ConfalPyramidsTypes.Location = Location;
    function isLocation(x) {
        return !!x && x.kind === 'data-location' && x.tag === DnatcoTypes.DataTag;
    }
    ConfalPyramidsTypes.isLocation = isLocation;
    function Loci(data, elements) {
        return DataLoci(DnatcoTypes.DataTag, data, elements, undefined, () => elements[0] !== undefined ? confalPyramidLabel(data[elements[0]]) : '');
    }
    ConfalPyramidsTypes.Loci = Loci;
    function isLoci(x) {
        return !!x && x.kind === 'data-loci' && x.tag === DnatcoTypes.DataTag;
    }
    ConfalPyramidsTypes.isLoci = isLoci;
})(ConfalPyramidsTypes || (ConfalPyramidsTypes = {}));
