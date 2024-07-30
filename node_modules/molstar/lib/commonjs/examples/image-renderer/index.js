"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 *
 * Example command-line application generating images of PDB structures
 * Build: npm install --no-save gl jpeg-js pngjs  // these packages are not listed in dependencies for performance reasons
 *        npm run build
 * Run:   node lib/commonjs/examples/image-renderer 1cbs ../outputs_1cbs/
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const argparse_1 = require("argparse");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const gl_1 = tslib_1.__importDefault(require("gl"));
const pngjs_1 = tslib_1.__importDefault(require("pngjs"));
const jpeg_js_1 = tslib_1.__importDefault(require("jpeg-js"));
const data_1 = require("../../mol-plugin-state/transforms/data");
const model_1 = require("../../mol-plugin-state/transforms/model");
const representation_1 = require("../../mol-plugin-state/transforms/representation");
const headless_plugin_context_1 = require("../../mol-plugin/headless-plugin-context");
const spec_1 = require("../../mol-plugin/spec");
const headless_screenshot_1 = require("../../mol-plugin/util/headless-screenshot");
const data_source_1 = require("../../mol-util/data-source");
(0, data_source_1.setFSModule)(fs_1.default);
function parseArguments() {
    const parser = new argparse_1.ArgumentParser({ description: 'Example command-line application generating images of PDB structures' });
    parser.add_argument('pdbId', { help: 'PDB identifier' });
    parser.add_argument('outDirectory', { help: 'Directory for outputs' });
    const args = parser.parse_args();
    return { ...args };
}
async function main() {
    const args = parseArguments();
    const url = `https://www.ebi.ac.uk/pdbe/entry-files/download/${args.pdbId}.bcif`;
    console.log('PDB ID:', args.pdbId);
    console.log('Source URL:', url);
    console.log('Outputs:', args.outDirectory);
    // Create a headless plugin
    const externalModules = { gl: gl_1.default, pngjs: pngjs_1.default, 'jpeg-js': jpeg_js_1.default };
    const plugin = new headless_plugin_context_1.HeadlessPluginContext(externalModules, (0, spec_1.DefaultPluginSpec)(), { width: 800, height: 800 });
    await plugin.init();
    // Download and visualize data in the plugin
    const update = plugin.build();
    const structure = update.toRoot()
        .apply(data_1.Download, { url, isBinary: true })
        .apply(data_1.ParseCif)
        .apply(model_1.TrajectoryFromMmCif)
        .apply(model_1.ModelFromTrajectory)
        .apply(model_1.StructureFromModel);
    const polymer = structure.apply(model_1.StructureComponent, { type: { name: 'static', params: 'polymer' } });
    const ligand = structure.apply(model_1.StructureComponent, { type: { name: 'static', params: 'ligand' } });
    polymer.apply(representation_1.StructureRepresentation3D, {
        type: { name: 'cartoon', params: { alpha: 1 } },
        colorTheme: { name: 'sequence-id', params: {} },
    });
    ligand.apply(representation_1.StructureRepresentation3D, {
        type: { name: 'ball-and-stick', params: { sizeFactor: 1 } },
        colorTheme: { name: 'element-symbol', params: { carbonColor: { name: 'element-symbol', params: {} } } },
        sizeTheme: { name: 'physical', params: {} },
    });
    await update.commit();
    // Export images
    fs_1.default.mkdirSync(args.outDirectory, { recursive: true });
    await plugin.saveImage(path_1.default.join(args.outDirectory, 'basic.png'));
    await plugin.saveImage(path_1.default.join(args.outDirectory, 'basic.jpg'));
    await plugin.saveImage(path_1.default.join(args.outDirectory, 'large.png'), { width: 1600, height: 1200 });
    await plugin.saveImage(path_1.default.join(args.outDirectory, 'large.jpg'), { width: 1600, height: 1200 });
    await plugin.saveImage(path_1.default.join(args.outDirectory, 'stylized.png'), undefined, headless_screenshot_1.STYLIZED_POSTPROCESSING);
    await plugin.saveImage(path_1.default.join(args.outDirectory, 'stylized.jpg'), undefined, headless_screenshot_1.STYLIZED_POSTPROCESSING);
    await plugin.saveImage(path_1.default.join(args.outDirectory, 'stylized-compressed-jpg.jpg'), undefined, headless_screenshot_1.STYLIZED_POSTPROCESSING, undefined, 10);
    // Export state loadable in Mol* Viewer
    await plugin.saveStateSnapshot(path_1.default.join(args.outDirectory, 'molstar-state.molj'));
    // Cleanup
    await plugin.clear();
    plugin.dispose();
}
main();
