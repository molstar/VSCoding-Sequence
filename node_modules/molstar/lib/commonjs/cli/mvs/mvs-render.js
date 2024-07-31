#!/usr/bin/env node
"use strict";
/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 *
 * Command-line application for rendering images from MolViewSpec files
 * Build: npm install --no-save canvas gl jpeg-js pngjs  // these packages are not listed in Mol* dependencies for performance reasons
 *        npm run build
 * Run:   node lib/commonjs/cli/mvs/mvs-render -i examples/mvs/1cbs.mvsj -o ../outputs/1cbs.png --size 800x600 --molj
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const argparse_1 = require("argparse");
const fs_1 = tslib_1.__importDefault(require("fs"));
const gl_1 = tslib_1.__importDefault(require("gl"));
const jpeg_js_1 = tslib_1.__importDefault(require("jpeg-js"));
const path_1 = tslib_1.__importDefault(require("path"));
const pngjs_1 = tslib_1.__importDefault(require("pngjs"));
const canvas3d_1 = require("../../mol-canvas3d/canvas3d");
const font_atlas_1 = require("../../mol-geo/geometry/text/font-atlas");
const headless_plugin_context_1 = require("../../mol-plugin/headless-plugin-context");
const spec_1 = require("../../mol-plugin/spec");
const headless_screenshot_1 = require("../../mol-plugin/util/headless-screenshot");
const mol_task_1 = require("../../mol-task");
const data_source_1 = require("../../mol-util/data-source");
const json_1 = require("../../mol-util/json");
const param_definition_1 = require("../../mol-util/param-definition");
// MolViewSpec must be imported after HeadlessPluginContext
const behavior_1 = require("../../extensions/mvs/behavior");
const formats_1 = require("../../extensions/mvs/components/formats");
const load_1 = require("../../extensions/mvs/load");
const mvs_data_1 = require("../../extensions/mvs/mvs-data");
(0, data_source_1.setFSModule)(fs_1.default);
(0, font_atlas_1.setCanvasModule)(require('canvas'));
const DEFAULT_SIZE = '800x800';
/** Return parsed command line arguments for `main` */
function parseArguments() {
    const parser = new argparse_1.ArgumentParser({ description: 'Command-line application for rendering images from MolViewSpec files' });
    parser.add_argument('-i', '--input', { required: true, nargs: '+', help: 'Input file(s) in .mvsj or .mvsx format. File format is inferred from the file extension.' });
    parser.add_argument('-o', '--output', { required: true, nargs: '+', help: 'File path(s) for output files (one output path for each input file). Output format is inferred from the file extension (.png or .jpg)' });
    parser.add_argument('-s', '--size', { help: `Output image resolution, {width}x{height}. Default: ${DEFAULT_SIZE}.`, default: DEFAULT_SIZE });
    parser.add_argument('-m', '--molj', { action: 'store_true', help: `Save Mol* state (.molj) in addition to rendered images (use the same output file paths but with .molj extension)` });
    const args = parser.parse_args();
    try {
        const parts = args.size.split('x');
        if (parts.length !== 2)
            throw new Error('Must contain two x-separated parts');
        args.size = { width: parseIntStrict(parts[0]), height: parseIntStrict(parts[1]) };
    }
    catch (_a) {
        parser.error(`argument: --size: invalid image size string: '${args.size}' (must be two x-separated integers (width and height), e.g. '400x300')`);
    }
    if (args.input.length !== args.output.length) {
        parser.error(`argument: --output: must specify the same number of input and output file paths (specified ${args.input.length} input path${args.input.length !== 1 ? 's' : ''} but ${args.output.length} output path${args.output.length !== 1 ? 's' : ''})`);
    }
    return { ...args };
}
/** Main workflow for rendering images from MolViewSpec files */
async function main(args) {
    const plugin = await createHeadlessPlugin(args);
    for (let i = 0; i < args.input.length; i++) {
        const input = args.input[i];
        const output = args.output[i];
        console.log(`Processing ${input} -> ${output}`);
        let mvsData;
        let sourceUrl;
        if (input.toLowerCase().endsWith('.mvsj')) {
            const data = fs_1.default.readFileSync(input, { encoding: 'utf8' });
            mvsData = mvs_data_1.MVSData.fromMVSJ(data);
            sourceUrl = `file://${path_1.default.resolve(input)}`;
        }
        else if (input.toLowerCase().endsWith('.mvsx')) {
            const data = fs_1.default.readFileSync(input);
            const mvsx = await plugin.runTask(mol_task_1.Task.create('Load MVSX', async (ctx) => (0, formats_1.loadMVSX)(plugin, ctx, data)));
            mvsData = mvsx.mvsData;
            sourceUrl = mvsx.sourceUrl;
        }
        else {
            throw new Error(`Input file name must end with .mvsj or .mvsx: ${input}`);
        }
        await (0, load_1.loadMVS)(plugin, mvsData, { sanityChecks: true, replaceExisting: true, sourceUrl: sourceUrl });
        fs_1.default.mkdirSync(path_1.default.dirname(output), { recursive: true });
        if (args.molj) {
            await plugin.saveStateSnapshot(withExtension(output, '.molj'));
        }
        await plugin.saveImage(output);
        checkState(plugin);
    }
    await plugin.clear();
    plugin.dispose();
}
/** Return a new and initiatized HeadlessPlugin */
async function createHeadlessPlugin(args) {
    const externalModules = { gl: gl_1.default, pngjs: pngjs_1.default, 'jpeg-js': jpeg_js_1.default };
    const spec = (0, spec_1.DefaultPluginSpec)();
    spec.behaviors.push(spec_1.PluginSpec.Behavior(behavior_1.MolViewSpec));
    const headlessCanvasOptions = (0, headless_screenshot_1.defaultCanvas3DParams)();
    const canvasOptions = {
        ...param_definition_1.ParamDefinition.getDefaultValues(canvas3d_1.Canvas3DParams),
        cameraResetDurationMs: headlessCanvasOptions.cameraResetDurationMs,
        postprocessing: headlessCanvasOptions.postprocessing,
    };
    const plugin = new headless_plugin_context_1.HeadlessPluginContext(externalModules, spec, args.size, { canvas: canvasOptions });
    try {
        await plugin.init();
    }
    catch (error) {
        plugin.dispose();
        throw error;
    }
    return plugin;
}
/** Parse integer, fail early. */
function parseIntStrict(str) {
    if (str === '')
        throw new Error('Is empty string');
    const result = Number(str);
    if (isNaN(result))
        throw new Error('Is NaN');
    if (Math.floor(result) !== result)
        throw new Error('Is not integer');
    return result;
}
/** Replace the file extension in `filename` by `extension`. If `filename` has no extension, add it. */
function withExtension(filename, extension) {
    const oldExtension = path_1.default.extname(filename);
    return filename.slice(0, -oldExtension.length) + extension;
}
/** Check Mol* state, print and throw error if any cell is not OK. */
function checkState(plugin) {
    const cells = Array.from(plugin.state.data.cells.values());
    const badCell = cells.find(cell => cell.status !== 'ok');
    if (badCell) {
        console.error(`Building Mol* state failed`);
        console.error(`    Transformer: ${badCell.transform.transformer.id}`);
        console.error(`    Params: ${(0, json_1.onelinerJsonString)(badCell.transform.params)}`);
        console.error(`    Error: ${badCell.errorText}`);
        console.error(``);
        throw new Error(`Building Mol* state failed: ${badCell.errorText}`);
    }
}
main(parseArguments());
