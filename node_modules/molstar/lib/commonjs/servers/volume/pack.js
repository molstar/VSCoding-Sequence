#!/usr/bin/env node
"use strict";
/**
 * Copyright (c) 2018-2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Taken/adapted from DensityServer (https://github.com/dsehnal/DensityServer)
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const argparse = tslib_1.__importStar(require("argparse"));
const main_1 = require("./pack/main");
const version_1 = require("./pack/version");
function getConfig(args) {
    const config = {
        blockSizeInMB: args.blockSizeInMB,
        format: args.format,
        outputFilename: args.output
    };
    switch (args.mode) {
        case 'em':
            config.input = [
                { name: 'em', filename: args.inputEm }
            ];
            config.isPeriodic = false;
            break;
        case 'xray':
            config.input = [
                { name: '2Fo-Fc', filename: args.input2fofc },
                { name: 'Fo-Fc', filename: args.inputFofc }
            ];
            config.isPeriodic = true;
            break;
    }
    return config;
}
const parser = new argparse.ArgumentParser({
    add_help: true,
    description: `VolumeServer Packer ${version_1.VERSION}, (c) 2018-2019, Mol* contributors`
});
const subparsers = parser.add_subparsers({
    title: 'Packing modes',
    dest: 'mode'
});
function addGeneralArgs(parser) {
    parser.add_argument('output', { help: `Output path.` });
    parser.add_argument('--blockSizeInMB', { default: 96, help: `Maximum block size.`, metavar: 'SIZE' });
    parser.add_argument('--format', { default: 'ccp4', help: `Input file format.` });
}
const xrayParser = subparsers.add_parser('xray', { add_help: true });
xrayParser.add_argument('input2fofc', { help: `Path to 2fofc file.`, metavar: '2FOFC' });
xrayParser.add_argument('inputFofc', { help: `Path to fofc file.`, metavar: 'FOFC' });
addGeneralArgs(xrayParser);
const emParser = subparsers.add_parser('em', { add_help: true });
emParser.add_argument('inputEm', { help: `Path to EM density file.`, metavar: 'EM' });
addGeneralArgs(emParser);
const args = parser.parse_args();
const config = getConfig(args);
(0, main_1.pack)(config.input, config.blockSizeInMB, config.isPeriodic, config.outputFilename, config.format);
