"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUniqueBlocks = findUniqueBlocks;
const tslib_1 = require("tslib");
const Coords = tslib_1.__importStar(require("../algebra/coordinate"));
const Box = tslib_1.__importStar(require("../algebra/box"));
// import { FastMap } from '../utils/collections'
/** Find a list of unique blocks+offsets that overlap with the query region. */
function findUniqueBlocks(data, sampling, queryBox) {
    const translations = data.header.spacegroup.isPeriodic
        // find all query box translations that overlap with the unit cell.
        ? findDataOverlapTranslationList(queryBox, sampling.dataDomain)
        // no translations
        : [Coords.fractional(0, 0, 0)];
    const blocks = new Map();
    for (const t of translations) {
        findUniqueBlocksOffset(data, sampling, queryBox, t, blocks);
    }
    const blockList = [];
    blocks.forEach(function (b) { this.push(b); }, blockList);
    // sort the data so that the first coodinate changes the fastest
    // this is because that's how the data is laid out in the underlaying
    // data format and reading the data 'in order' makes it faster.
    blockList.sort((a, b) => {
        const x = a.coord, y = b.coord;
        for (let i = 2; i >= 0; i--) {
            if (x[i] !== y[i])
                return x[i] - y[i];
        }
        return 0;
    });
    return blockList;
}
/**
 * Find the integer interval [x, y] so that for all k \in [x, y]
 * [a + k, b + k] intersects with (u, v)
 */
function overlapMultiplierRange(a, b, u, v) {
    let x = Math.ceil(u - b) | 0, y = Math.floor(v - a) | 0;
    if (Coords.round(b + x) <= Coords.round(u))
        x++;
    if (Coords.round(a + y) >= Coords.round(v))
        y--;
    if (x > y)
        return void 0;
    return [x, y];
}
/**
 * Finds that list of "unit" offsets (in fractional space) so that
 * shift(box, offset) has non-empty interaction with the region
 * described in the give domain.
 */
function findDataOverlapTranslationList(box, domain) {
    const ranges = [];
    const translations = [];
    const { origin, dimensions } = domain;
    for (let i = 0; i < 3; i++) {
        const range = overlapMultiplierRange(box.a[i], box.b[i], origin[i], origin[i] + dimensions[i]);
        if (!range)
            return translations;
        ranges[i] = range;
    }
    const [u, v, w] = ranges;
    for (let k = w[0]; k <= w[1]; k++) {
        for (let j = v[0]; j <= v[1]; j++) {
            for (let i = u[0]; i <= u[1]; i++) {
                translations.push(Coords.fractional(i, j, k));
            }
        }
    }
    return translations;
}
function addUniqueBlock(blocks, coord, offset) {
    const hash = Coords.linearGridIndex(coord);
    if (blocks.has(hash)) {
        const entry = blocks.get(hash);
        entry.offsets.push(offset);
    }
    else {
        blocks.set(hash, { coord, offsets: [offset] });
    }
}
function findUniqueBlocksOffset(data, sampling, queryBox, offset, blocks) {
    const shifted = Box.shift(queryBox, offset);
    const intersection = Box.intersect(shifted, data.dataBox);
    // Intersection can be empty in the case of "aperiodic spacegroups"
    if (!intersection)
        return;
    const blockDomain = sampling.blockDomain;
    // this gets the "3d range" of block indices that contain data that overlaps
    // with the query region.
    //
    // Clamping the data makes sure we avoid silly rounding errors (hopefully :))
    const { a: min, b: max } = Box.clampGridToSamples(Box.fractionalToGrid(intersection, blockDomain));
    for (let i = min[0]; i < max[0]; i++) {
        for (let j = min[1]; j < max[1]; j++) {
            for (let k = min[2]; k < max[2]; k++) {
                addUniqueBlock(blocks, Coords.grid(blockDomain, i, j, k), offset);
            }
        }
    }
}
