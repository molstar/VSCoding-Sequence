"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocessFile = preprocessFile;
const structure_wrapper_1 = require("../server/structure-wrapper");
const converter_1 = require("./converter");
const cif_1 = require("../../../mol-io/writer/cif");
const mmcif_1 = require("../../../mol-model/structure/export/mmcif");
const writer_1 = require("../utils/writer");
// TODO: error handling
function preprocessFile(filename, propertyProvider, outputCif, outputBcif) {
    return propertyProvider
        ? preprocess(filename, propertyProvider, outputCif, outputBcif)
        : convert(filename, outputCif, outputBcif);
}
async function preprocess(filename, propertyProvider, outputCif, outputBcif) {
    const input = await (0, structure_wrapper_1.readStructureWrapper)('entry', '_local_', filename, void 0, propertyProvider);
    const categories = await (0, converter_1.classifyCif)(input.cifFrame);
    const inputStructures = (await (0, structure_wrapper_1.resolveStructures)(input));
    const exportCtx = mmcif_1.CifExportContext.create(inputStructures);
    if (outputCif) {
        const writer = new writer_1.FileResultWriter(outputCif);
        const encoder = cif_1.CifWriter.createEncoder({ binary: false });
        encode(inputStructures[0], input.cifFrame.header, categories, encoder, exportCtx, writer);
        writer.end();
    }
    if (outputBcif) {
        const writer = new writer_1.FileResultWriter(outputBcif);
        const encoder = cif_1.CifWriter.createEncoder({ binary: true, binaryAutoClassifyEncoding: true });
        encode(inputStructures[0], input.cifFrame.header, categories, encoder, exportCtx, writer);
        writer.end();
    }
}
async function convert(filename, outputCif, outputBcif) {
    const { frame } = await (0, structure_wrapper_1.readDataAndFrame)(filename);
    const categories = await (0, converter_1.classifyCif)(frame);
    if (outputCif) {
        const writer = new writer_1.FileResultWriter(outputCif);
        const encoder = cif_1.CifWriter.createEncoder({ binary: false });
        encodeConvert(frame.header, categories, encoder, writer);
        writer.end();
    }
    if (outputBcif) {
        const writer = new writer_1.FileResultWriter(outputBcif);
        const encoder = cif_1.CifWriter.createEncoder({ binary: true, binaryAutoClassifyEncoding: true });
        encodeConvert(frame.header, categories, encoder, writer);
        writer.end();
    }
}
function encodeConvert(header, categories, encoder, writer) {
    encoder.startDataBlock(header);
    for (const cat of categories) {
        encoder.writeCategory(cat);
    }
    encoder.encode();
    encoder.writeTo(writer);
}
function encode(structure, header, categories, encoder, exportCtx, writer) {
    const skipCategoryNames = new Set(categories.map(c => c.name));
    encoder.startDataBlock(header);
    for (const cat of categories) {
        encoder.writeCategory(cat);
    }
    (0, mmcif_1.encode_mmCIF_categories)(encoder, structure, { skipCategoryNames, exportCtx });
    encoder.encode();
    encoder.writeTo(writer);
}
