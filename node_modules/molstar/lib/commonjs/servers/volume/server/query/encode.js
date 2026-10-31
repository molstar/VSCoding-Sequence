"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = encode;
const cif_1 = require("../../../../mol-io/writer/cif");
const version_1 = require("../version");
const binary_cif_1 = require("../../../../mol-io/common/binary-cif");
const typed_array_1 = require("../../../../mol-io/common/typed-array");
function encode(query, output) {
    const w = cif_1.CifWriter.createEncoder({ binary: query.params.asBinary, encoderName: `VolumeServer ${version_1.VOLUME_SERVER_VERSION}` });
    write(w, query);
    w.encode();
    w.writeTo(output);
}
function string(name, str, isSpecified) {
    if (isSpecified) {
        return cif_1.CifWriter.Field.str(name, (i, d) => str(d), { valueKind: (i, d) => isSpecified(d) ? 0 /* Column.ValueKinds.Present */ : 1 /* Column.ValueKinds.NotPresent */ });
    }
    return cif_1.CifWriter.Field.str(name, (i, d) => str(d));
}
function int32(name, value) {
    return cif_1.CifWriter.Field.int(name, (i, d) => value(d));
}
function float64(name, value, digitCount = 6) {
    return cif_1.CifWriter.Field.float(name, (i, d) => value(d), { digitCount: digitCount, typedArray: Float64Array });
}
const _volume_data_3d_info_fields = [
    string('name', ctx => ctx.header.channels[ctx.channelIndex]),
    int32('axis_order[0]', ctx => ctx.header.axisOrder[0]),
    int32('axis_order[1]', ctx => ctx.header.axisOrder[1]),
    int32('axis_order[2]', ctx => ctx.header.axisOrder[2]),
    float64('origin[0]', ctx => ctx.grid.origin[0]),
    float64('origin[1]', ctx => ctx.grid.origin[1]),
    float64('origin[2]', ctx => ctx.grid.origin[2]),
    float64('dimensions[0]', ctx => ctx.grid.dimensions[0]),
    float64('dimensions[1]', ctx => ctx.grid.dimensions[1]),
    float64('dimensions[2]', ctx => ctx.grid.dimensions[2]),
    int32('sample_rate', ctx => ctx.sampleRate),
    int32('sample_count[0]', ctx => ctx.grid.sampleCount[0]),
    int32('sample_count[1]', ctx => ctx.grid.sampleCount[1]),
    int32('sample_count[2]', ctx => ctx.grid.sampleCount[2]),
    int32('spacegroup_number', ctx => ctx.header.spacegroup.number),
    float64('spacegroup_cell_size[0]', ctx => ctx.header.spacegroup.size[0], 3),
    float64('spacegroup_cell_size[1]', ctx => ctx.header.spacegroup.size[1], 3),
    float64('spacegroup_cell_size[2]', ctx => ctx.header.spacegroup.size[2], 3),
    float64('spacegroup_cell_angles[0]', ctx => ctx.header.spacegroup.angles[0], 3),
    float64('spacegroup_cell_angles[1]', ctx => ctx.header.spacegroup.angles[1], 3),
    float64('spacegroup_cell_angles[2]', ctx => ctx.header.spacegroup.angles[2], 3),
    float64('mean_source', ctx => ctx.globalValuesInfo.mean),
    float64('mean_sampled', ctx => ctx.sampledValuesInfo.mean),
    float64('sigma_source', ctx => ctx.globalValuesInfo.sigma),
    float64('sigma_sampled', ctx => ctx.sampledValuesInfo.sigma),
    float64('min_source', ctx => ctx.globalValuesInfo.min),
    float64('min_sampled', ctx => ctx.sampledValuesInfo.min),
    float64('max_source', ctx => ctx.globalValuesInfo.max),
    float64('max_sampled', ctx => ctx.sampledValuesInfo.max)
];
const _volume_data_3d_info = {
    name: 'volume_data_3d_info',
    instance(result) {
        const ctx = {
            header: result.query.data.header,
            channelIndex: result.channelIndex,
            grid: result.query.samplingInfo.gridDomain,
            sampleRate: result.query.samplingInfo.sampling.rate,
            globalValuesInfo: result.query.data.header.sampling[0].valuesInfo[result.channelIndex],
            sampledValuesInfo: result.query.data.header.sampling[result.query.samplingInfo.sampling.index].valuesInfo[result.channelIndex]
        };
        return { fields: _volume_data_3d_info_fields, source: [{ data: ctx, rowCount: 1 }] };
    }
};
function _volume_data_3d_number(i, ctx) {
    return ctx[i];
}
const _volume_data_3d = {
    name: 'volume_data_3d',
    instance(ctx) {
        const data = ctx.query.values[ctx.channelIndex];
        const E = binary_cif_1.ArrayEncoding;
        let encoder;
        let typedArray;
        if (ctx.query.data.header.valueType === typed_array_1.TypedArrayValueType.Float32 || ctx.query.data.header.valueType === typed_array_1.TypedArrayValueType.Int16) {
            let min, max;
            min = data[0], max = data[0];
            for (let i = 0, n = data.length; i < n; i++) {
                const v = data[i];
                if (v < min)
                    min = v;
                else if (v > max)
                    max = v;
            }
            typedArray = Float32Array;
            // encode into 255 steps and store each value in 1 byte.
            encoder = E.by(E.intervalQuantizaiton(min, max, 255, Uint8Array)).and(E.byteArray);
        }
        else {
            typedArray = Int8Array;
            // just encode the bytes
            encoder = E.by(E.byteArray);
        }
        const fields = [cif_1.CifWriter.Field.float('values', _volume_data_3d_number, { encoder, typedArray, digitCount: 6 })];
        return cif_1.CifWriter.categoryInstance(fields, { data, rowCount: data.length });
    }
};
function pickQueryBoxDimension(ctx, e, d) {
    const box = ctx.params.box;
    switch (box.kind) {
        case 'Cartesian':
        case 'Fractional':
            return `${Math.round(1000000 * box[e][d]) / 1000000}`;
        default: return '';
    }
}
function queryBoxDimension(e, d) {
    return string(`query_box_${e}[${d}]`, ctx => pickQueryBoxDimension(ctx, e, d), ctx => ctx.params.box.kind !== 'Cell');
}
const _density_server_result_fields = [
    string('server_version', ctx => version_1.VOLUME_SERVER_VERSION),
    string('datetime_utc', ctx => new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')),
    string('guid', ctx => ctx.guid),
    string('is_empty', ctx => ctx.kind === 'Empty' || ctx.kind === 'Error' ? 'yes' : 'no'),
    string('has_error', ctx => ctx.kind === 'Error' ? 'yes' : 'no'),
    string('error', ctx => ctx.kind === 'Error' ? ctx.message : '', (ctx) => ctx.kind === 'Error'),
    string('query_source_id', ctx => ctx.params.sourceId),
    string('query_type', ctx => 'box'),
    string('query_box_type', ctx => ctx.params.box.kind.toLowerCase()),
    queryBoxDimension('a', 0),
    queryBoxDimension('a', 1),
    queryBoxDimension('a', 2),
    queryBoxDimension('b', 0),
    queryBoxDimension('b', 1),
    queryBoxDimension('b', 2)
];
const _density_server_result = {
    name: 'density_server_result',
    instance: ctx => cif_1.CifWriter.categoryInstance(_density_server_result_fields, { data: ctx, rowCount: 1 })
};
function write(encoder, query) {
    encoder.startDataBlock('SERVER');
    encoder.writeCategory(_density_server_result, query);
    switch (query.kind) {
        case 'Data':
    }
    if (query.kind === 'Data') {
        const header = query.data.header;
        for (let i = 0; i < header.channels.length; i++) {
            encoder.startDataBlock(header.channels[i]);
            const ctx = { query, channelIndex: i };
            encoder.writeCategory(_volume_data_3d_info, ctx);
            encoder.writeCategory(_volume_data_3d, ctx);
        }
    }
}
