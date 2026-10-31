"use strict";
/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarkersAverage = getMarkersAverage;
exports.createMarkers = createMarkers;
exports.createEmptyMarkers = createEmptyMarkers;
const value_cell_1 = require("../../mol-util/value-cell");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const util_1 = require("../../mol-gl/renderable/util");
const MarkerCountLut = new Uint8Array(0x0303 + 1);
MarkerCountLut[0x0001] = 1;
MarkerCountLut[0x0002] = 1;
MarkerCountLut[0x0003] = 1;
MarkerCountLut[0x0100] = 1;
MarkerCountLut[0x0200] = 1;
MarkerCountLut[0x0300] = 1;
MarkerCountLut[0x0101] = 2;
MarkerCountLut[0x0201] = 2;
MarkerCountLut[0x0301] = 2;
MarkerCountLut[0x0102] = 2;
MarkerCountLut[0x0202] = 2;
MarkerCountLut[0x0302] = 2;
MarkerCountLut[0x0103] = 2;
MarkerCountLut[0x0203] = 2;
MarkerCountLut[0x0303] = 2;
/**
 * Calculates the average number of entries that have any marker flag set.
 *
 * For alternative implementations and performance tests see
 * `src\perf-tests\markers-average.ts`.
 */
function getMarkersAverage(array, count) {
    if (count === 0)
        return 0;
    const view = new Uint32Array(array.buffer, 0, array.buffer.byteLength >> 2);
    const viewEnd = (count - 4) >> 2;
    const backStart = 4 * viewEnd;
    let sum = 0;
    if (viewEnd < 0) {
        // avoid edge cases with small arrays
        for (let i = 0; i < count; ++i) {
            sum += array[i] && 1;
        }
    }
    else {
        for (let i = 0; i < viewEnd; ++i) {
            const v = view[i];
            sum += MarkerCountLut[v & 0xFFFF] + MarkerCountLut[v >> 16];
        }
        for (let i = backStart; i < count; ++i) {
            sum += array[i] && 1;
        }
    }
    return sum / count;
}
function createMarkers(count, type, markerData) {
    const markers = (0, util_1.createTextureImage)(Math.max(1, count), 1, Uint8Array, markerData && markerData.tMarker.ref.value.array);
    const average = getMarkersAverage(markers.array, count);
    const status = average === 0 ? 0 : -1;
    if (markerData) {
        value_cell_1.ValueCell.updateIfChanged(markerData.uMarker, 0);
        value_cell_1.ValueCell.update(markerData.tMarker, markers);
        value_cell_1.ValueCell.update(markerData.uMarkerTexDim, linear_algebra_1.Vec2.create(markers.width, markers.height));
        value_cell_1.ValueCell.updateIfChanged(markerData.markerAverage, average);
        value_cell_1.ValueCell.updateIfChanged(markerData.markerStatus, status);
        value_cell_1.ValueCell.updateIfChanged(markerData.dMarkerType, type);
        return markerData;
    }
    else {
        return {
            uMarker: value_cell_1.ValueCell.create(0),
            tMarker: value_cell_1.ValueCell.create(markers),
            uMarkerTexDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec2.create(markers.width, markers.height)),
            markerAverage: value_cell_1.ValueCell.create(average),
            markerStatus: value_cell_1.ValueCell.create(status),
            dMarkerType: value_cell_1.ValueCell.create(type),
        };
    }
}
const emptyMarkerTexture = { array: new Uint8Array(1), width: 1, height: 1 };
function createEmptyMarkers(markerData) {
    if (markerData) {
        value_cell_1.ValueCell.updateIfChanged(markerData.uMarker, 0);
        value_cell_1.ValueCell.update(markerData.tMarker, emptyMarkerTexture);
        value_cell_1.ValueCell.update(markerData.uMarkerTexDim, linear_algebra_1.Vec2.create(1, 1));
        value_cell_1.ValueCell.updateIfChanged(markerData.markerAverage, 0);
        value_cell_1.ValueCell.updateIfChanged(markerData.markerStatus, 0);
        return markerData;
    }
    else {
        return {
            uMarker: value_cell_1.ValueCell.create(0),
            tMarker: value_cell_1.ValueCell.create(emptyMarkerTexture),
            uMarkerTexDim: value_cell_1.ValueCell.create(linear_algebra_1.Vec2.create(1, 1)),
            markerAverage: value_cell_1.ValueCell.create(0),
            markerStatus: value_cell_1.ValueCell.create(0),
            dMarkerType: value_cell_1.ValueCell.create('groupInstance'),
        };
    }
}
