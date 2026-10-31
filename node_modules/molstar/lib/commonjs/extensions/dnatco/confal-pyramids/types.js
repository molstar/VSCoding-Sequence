"use strict";
/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfalPyramidsTypes = void 0;
const types_1 = require("../types");
const location_1 = require("../../../mol-model/location");
const loci_1 = require("../../../mol-model/loci");
const behavior_1 = require("./behavior");
var ConfalPyramidsTypes;
(function (ConfalPyramidsTypes) {
    function Location(step, isLower) {
        return (0, location_1.DataLocation)(types_1.DnatcoTypes.DataTag, { step, isLower }, {});
    }
    ConfalPyramidsTypes.Location = Location;
    function isLocation(x) {
        return !!x && x.kind === 'data-location' && x.tag === types_1.DnatcoTypes.DataTag;
    }
    ConfalPyramidsTypes.isLocation = isLocation;
    function Loci(data, elements) {
        return (0, loci_1.DataLoci)(types_1.DnatcoTypes.DataTag, data, elements, undefined, () => elements[0] !== undefined ? (0, behavior_1.confalPyramidLabel)(data[elements[0]]) : '');
    }
    ConfalPyramidsTypes.Loci = Loci;
    function isLoci(x) {
        return !!x && x.kind === 'data-loci' && x.tag === types_1.DnatcoTypes.DataTag;
    }
    ConfalPyramidsTypes.isLoci = isLoci;
})(ConfalPyramidsTypes || (exports.ConfalPyramidsTypes = ConfalPyramidsTypes = {}));
