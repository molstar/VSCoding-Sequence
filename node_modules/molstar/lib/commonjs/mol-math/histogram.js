"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateHistogram = calculateHistogram;
const array_1 = require("../mol-util/array");
function calculateHistogram(data, binCount, options) {
    if (!options) {
        const [min, max] = (0, array_1.arrayMinMax)(data);
        return _calcHistogram(data, binCount, min, max);
    }
    else {
        return _calcHistogram(data, binCount, options.min, options.max);
    }
}
function _calcHistogram(data, binCount, min, max) {
    let binWidth = (max - min) / binCount;
    if (binWidth === 0)
        binWidth = 1;
    const counts = new Int32Array(binCount);
    for (let i = 0, _i = data.length; i < _i; i++) {
        let bin = Math.floor((data[i] - min) / binWidth);
        if (bin >= binCount)
            bin = binCount - 1;
        else if (bin < 0)
            bin = 0;
        counts[bin]++;
    }
    return { min, max, binWidth, counts };
}
