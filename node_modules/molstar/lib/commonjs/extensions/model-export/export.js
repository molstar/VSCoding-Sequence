"use strict";
/**
 * Copyright (c) 2021-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelExport = void 0;
exports.exportHierarchy = exportHierarchy;
const utf8_1 = require("../../mol-io/common/utf8");
const structure_1 = require("../../mol-model/structure");
const mol_task_1 = require("../../mol-task");
const date_1 = require("../../mol-util/date");
const download_1 = require("../../mol-util/download");
const zip_1 = require("../../mol-util/zip/zip");
const ModelExportNameProp = '__ModelExportName__';
exports.ModelExport = {
    getStructureName(structure) {
        return structure.inheritedPropertyData[ModelExportNameProp];
    },
    setStructureName(structure, name) {
        return structure.inheritedPropertyData[ModelExportNameProp] = name;
    }
};
async function exportHierarchy(plugin, options) {
    try {
        await plugin.runTask(_exportHierarchy(plugin, options), { useOverlay: true });
    }
    catch (e) {
        console.error(e);
        plugin.log.error(`Model export failed. See console for details.`);
    }
}
function _exportHierarchy(plugin, options) {
    return mol_task_1.Task.create('Export', async (ctx) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        await ctx.update({ message: 'Exporting...', isIndeterminate: true, canAbort: false });
        const format = (_a = options === null || options === void 0 ? void 0 : options.format) !== null && _a !== void 0 ? _a : 'cif';
        const { structures } = plugin.managers.structure.hierarchy.current;
        const files = [];
        const entryMap = new Map();
        for (const _s of structures) {
            const s = (_d = (_c = (_b = _s.transform) === null || _b === void 0 ? void 0 : _b.cell.obj) === null || _c === void 0 ? void 0 : _c.data) !== null && _d !== void 0 ? _d : (_e = _s.cell.obj) === null || _e === void 0 ? void 0 : _e.data;
            if (!s)
                continue;
            if (s.models.length > 1) {
                plugin.log.warn(`[Export] Skipping ${(_f = _s.cell.obj) === null || _f === void 0 ? void 0 : _f.label}: Multimodel exports not supported.`);
                continue;
            }
            if (s.units.some(u => !structure_1.Unit.isAtomic(u))) {
                plugin.log.warn(`[Export] Skipping ${(_g = _s.cell.obj) === null || _g === void 0 ? void 0 : _g.label}: Non-atomic model exports not supported.`);
                continue;
            }
            const name = exports.ModelExport.getStructureName(s) || s.model.entryId || 'unnamed';
            const fileName = entryMap.has(name)
                ? `${name}_${entryMap.get(name) + 1}.${format}`
                : `${name}.${format}`;
            entryMap.set(name, ((_h = entryMap.get(name)) !== null && _h !== void 0 ? _h : 0) + 1);
            await ctx.update({ message: `Exporting ${name}...`, isIndeterminate: true, canAbort: false });
            if (s.elementCount > 100000) {
                // Give UI chance to update, only needed for larger structures.
                await new Promise(res => setTimeout(res, 50));
            }
            try {
                files.push([fileName, (0, structure_1.to_mmCIF)(name, s, format === 'bcif', { copyAllCategories: true })]);
            }
            catch (e) {
                if (format === 'cif' && s.elementCount > 2000000) {
                    plugin.log.warn(`[Export] The structure might be too big to be exported as Text CIF, consider using the BinaryCIF format instead.`);
                }
                throw e;
            }
        }
        if (files.length === 1) {
            (0, download_1.download)(new Blob([files[0][1]]), files[0][0]);
        }
        else if (files.length > 1) {
            const zipData = {};
            for (const [fn, data] of files) {
                if (data instanceof Uint8Array) {
                    zipData[fn] = data;
                }
                else {
                    const bytes = new Uint8Array((0, utf8_1.utf8ByteCount)(data));
                    (0, utf8_1.utf8Write)(bytes, 0, data);
                    zipData[fn] = bytes;
                }
            }
            await ctx.update({ message: `Compressing Data...`, isIndeterminate: true, canAbort: false });
            const buffer = await (0, zip_1.zip)(ctx, zipData);
            (0, download_1.download)(new Blob([new Uint8Array(buffer, 0, buffer.byteLength)]), `structures_${(0, date_1.getFormattedTime)()}.zip`);
        }
        plugin.log.info(`[Export] Done.`);
    });
}
