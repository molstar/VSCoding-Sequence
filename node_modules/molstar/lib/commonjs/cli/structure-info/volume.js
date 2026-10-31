#!/usr/bin/env node
"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const argparse = tslib_1.__importStar(require("argparse"));
const util = tslib_1.__importStar(require("util"));
const volume_1 = require("../../mol-model/volume");
const helpers_1 = require("./helpers");
const cif_1 = require("../../mol-io/reader/cif");
const db_1 = require("../../mol-data/db");
const mol_util_1 = require("../../mol-util");
const mol_task_1 = require("../../mol-task");
const isosurface_1 = require("../../mol-repr/volume/isosurface");
const theme_1 = require("../../mol-theme/theme");
const density_server_1 = require("../../mol-model-formats/volume/density-server");
require('util.promisify').shim();
const writeFileAsync = util.promisify(fs.writeFile);
async function getVolume(url) {
    const cif = await (0, helpers_1.downloadCif)(url, true);
    const data = cif_1.CIF.schema.densityServer(cif.blocks[1]);
    return await (0, density_server_1.volumeFromDensityServerData)(data).run();
}
function print(volume) {
    if (!density_server_1.DscifFormat.is(volume.sourceData))
        return;
    const { volume_data_3d_info } = volume.sourceData.data;
    const row = db_1.Table.getRow(volume_data_3d_info, 0);
    console.log(row);
    console.log(volume.grid.transform);
    console.log(volume.grid.stats);
}
async function doMesh(volume, filename) {
    const mesh = await mol_task_1.Task.create('', runtime => (0, isosurface_1.createVolumeIsosurfaceMesh)({ runtime }, volume, -1, theme_1.Theme.createEmpty(), { isoValue: volume_1.Volume.IsoValue.absolute(1.5) })).run();
    console.log({ vc: mesh.vertexCount, tc: mesh.triangleCount });
    // Export the mesh in OBJ format.
    const { vertexCount, triangleCount } = mesh;
    const vs = mesh.vertexBuffer.ref.value;
    const ts = mesh.indexBuffer.ref.value;
    const obj = mol_util_1.StringBuilder.create();
    for (let i = 0; i < vertexCount; i++) {
        mol_util_1.StringBuilder.write(obj, 'v ');
        mol_util_1.StringBuilder.writeFloat(obj, vs[3 * i + 0], 100);
        mol_util_1.StringBuilder.whitespace1(obj);
        mol_util_1.StringBuilder.writeFloat(obj, vs[3 * i + 1], 100);
        mol_util_1.StringBuilder.whitespace1(obj);
        mol_util_1.StringBuilder.writeFloat(obj, vs[3 * i + 2], 100);
        mol_util_1.StringBuilder.newline(obj);
    }
    for (let i = 0; i < triangleCount; i++) {
        mol_util_1.StringBuilder.write(obj, 'f ');
        mol_util_1.StringBuilder.writeIntegerAndSpace(obj, ts[3 * i + 0] + 1);
        mol_util_1.StringBuilder.writeIntegerAndSpace(obj, ts[3 * i + 1] + 1);
        mol_util_1.StringBuilder.writeInteger(obj, ts[3 * i + 2] + 1);
        mol_util_1.StringBuilder.newline(obj);
    }
    await writeFileAsync(filename, mol_util_1.StringBuilder.getString(obj));
}
async function run(url, meshFilename) {
    const volume = await getVolume(url);
    print(volume);
    await doMesh(volume, meshFilename);
}
const parser = new argparse.ArgumentParser({
    add_help: true,
    description: 'Info about VolumeData from mol-model module'
});
parser.add_argument('--emdb', '-e', {
    help: 'EMDB id, for example 8116',
});
parser.add_argument('--mesh', {
    help: 'Mesh filename',
    required: true
});
const args = parser.parse_args();
run(`https://ds.litemol.org/em/emd-${args.emdb}/cell?detail=4`, args.mesh);
