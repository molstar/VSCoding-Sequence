"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.G3dLabelProvider = exports.G3dInfoDataProperty = exports.G3dSymbols = void 0;
exports.trajectoryFromG3D = trajectoryFromG3D;
exports.g3dHaplotypeQuery = g3dHaplotypeQuery;
exports.g3dChromosomeQuery = g3dChromosomeQuery;
exports.g3dRegionQuery = g3dRegionQuery;
const db_1 = require("../../mol-data/db");
const int_1 = require("../../mol-data/int");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const parser_1 = require("../../mol-model-formats/structure/basic/parser");
const schema_1 = require("../../mol-model-formats/structure/basic/schema");
const entity_1 = require("../../mol-model-formats/structure/common/entity");
const loci_1 = require("../../mol-model/loci");
const structure_1 = require("../../mol-model/structure");
const builder_1 = require("../../mol-script/language/builder");
const symbol_1 = require("../../mol-script/language/symbol");
const type_1 = require("../../mol-script/language/type");
const base_1 = require("../../mol-script/runtime/query/base");
const mol_task_1 = require("../../mol-task");
const object_1 = require("../../mol-util/object");
const property_1 = require("../../mol-model-formats/structure/common/property");
function getColumns(block) {
    const { data } = block;
    let size = 0;
    (0, object_1.objectForEach)(data, h => (0, object_1.objectForEach)(h, g => size += g.start.length));
    const normalized = {
        entity_id: new Array(size),
        chromosome: new Array(size),
        seq_id_begin: new Int32Array(size),
        seq_id_end: new Int32Array(size),
        start: new Int32Array(size),
        x: new Float32Array(size),
        y: new Float32Array(size),
        z: new Float32Array(size),
        r: new Float32Array(size),
        haplotype: new Array(size)
    };
    const p = [(0, linear_algebra_1.Vec3)(), (0, linear_algebra_1.Vec3)(), (0, linear_algebra_1.Vec3)()];
    let o = 0;
    (0, object_1.objectForEach)(data, (hs, h) => {
        (0, object_1.objectForEach)(hs, (chs, ch) => {
            const entity_id = `${ch}-${h}`;
            const l = chs.start.length;
            if (l === 0)
                return;
            let x = chs.x[0];
            let y = chs.y[0];
            let z = chs.z[0];
            linear_algebra_1.Vec3.set(p[0], x, y, z);
            linear_algebra_1.Vec3.set(p[2], x, y, z);
            for (let i = 0; i < l; i++) {
                normalized.entity_id[o] = entity_id;
                normalized.chromosome[o] = ch;
                normalized.start[o] = chs.start[i];
                normalized.seq_id_begin[o] = o;
                normalized.seq_id_end[o] = o;
                x = chs.x[i];
                y = chs.y[i];
                z = chs.z[i];
                linear_algebra_1.Vec3.set(p[1], x, y, z);
                if (i + 1 < l)
                    linear_algebra_1.Vec3.set(p[2], chs.x[i + 1], chs.y[i + 1], chs.z[i + 1]);
                else
                    linear_algebra_1.Vec3.set(p[2], x, y, z);
                normalized.x[o] = x;
                normalized.y[o] = y;
                normalized.z[o] = z;
                normalized.r[o] = 2 / 3 * Math.min(linear_algebra_1.Vec3.distance(p[0], p[1]), linear_algebra_1.Vec3.distance(p[1], p[2]));
                normalized.haplotype[o] = h;
                const _p = p[0];
                p[0] = p[1];
                p[1] = _p;
                o++;
            }
            if (l === 1) {
                normalized.r[o - 1] = 1;
            }
        });
    });
    return normalized;
}
async function getTraj(ctx, data) {
    const normalized = getColumns(data);
    const rowCount = normalized.seq_id_begin.length;
    const entityIds = new Array(rowCount);
    const entityBuilder = new entity_1.EntityBuilder();
    const eName = { customName: '' };
    for (let i = 0; i < rowCount; ++i) {
        const e = normalized.entity_id[i];
        eName.customName = e;
        const entityId = entityBuilder.getEntityId(e, 7 /* MoleculeType.DNA */, e, eName);
        entityIds[i] = entityId;
    }
    const ihm_sphere_obj_site = db_1.Table.ofPartialColumns(schema_1.BasicSchema.ihm_sphere_obj_site, {
        id: db_1.Column.range(0, rowCount),
        entity_id: db_1.Column.ofStringArray(entityIds),
        seq_id_begin: db_1.Column.ofIntArray(normalized.seq_id_begin),
        seq_id_end: db_1.Column.ofIntArray(normalized.seq_id_end),
        asym_id: db_1.Column.ofStringArray(normalized.chromosome),
        Cartn_x: db_1.Column.ofFloatArray(normalized.x),
        Cartn_y: db_1.Column.ofFloatArray(normalized.y),
        Cartn_z: db_1.Column.ofFloatArray(normalized.z),
        object_radius: db_1.Column.ofFloatArray(normalized.r),
        rmsf: db_1.Column.ofConst(0, rowCount, db_1.Column.Schema.float),
        model_id: db_1.Column.ofConst(1, rowCount, db_1.Column.Schema.int),
    }, rowCount);
    const basic = (0, schema_1.createBasic)({
        entity: entityBuilder.getEntityTable(),
        ihm_model_list: db_1.Table.ofPartialColumns(schema_1.BasicSchema.ihm_model_list, {
            model_id: db_1.Column.ofIntArray([1]),
            model_name: db_1.Column.ofStringArray(['G3D Model']),
        }, 1),
        ihm_sphere_obj_site
    });
    const models = await (0, parser_1.createModels)(basic, { kind: 'g3d', name: 'G3D', data }, ctx);
    exports.G3dInfoDataProperty.set(models.representative, {
        haplotypes: Object.keys(data.data),
        haplotype: normalized.haplotype,
        resolution: data.resolution,
        start: normalized.start,
        chroms: normalized.chromosome,
    });
    return models;
}
function trajectoryFromG3D(data) {
    return mol_task_1.Task.create('Parse G3D', async (ctx) => {
        return getTraj(ctx, data);
    });
}
exports.G3dSymbols = {
    haplotype: base_1.QuerySymbolRuntime.Dynamic((0, symbol_1.CustomPropSymbol)('g3d', 'haplotype', type_1.Type.Str), ctx => {
        if (structure_1.Unit.isAtomic(ctx.element.unit))
            return '';
        const info = exports.G3dInfoDataProperty.get(ctx.element.unit.model);
        if (!info)
            return '';
        const seqId = ctx.element.unit.model.coarseHierarchy.spheres.seq_id_begin.value(ctx.element.element);
        return info.haplotype[seqId] || '';
    }),
    chromosome: base_1.QuerySymbolRuntime.Dynamic((0, symbol_1.CustomPropSymbol)('g3d', 'chromosome', type_1.Type.Str), ctx => {
        if (structure_1.Unit.isAtomic(ctx.element.unit))
            return '';
        const { asym_id } = ctx.element.unit.model.coarseHierarchy.spheres;
        return asym_id.value(ctx.element.element) || '';
    }),
    region: base_1.QuerySymbolRuntime.Dynamic((0, symbol_1.CustomPropSymbol)('g3d', 'region', type_1.Type.Num), ctx => {
        if (structure_1.Unit.isAtomic(ctx.element.unit))
            return '';
        const info = exports.G3dInfoDataProperty.get(ctx.element.unit.model);
        if (!info)
            return 0;
        const seqId = ctx.element.unit.model.coarseHierarchy.spheres.seq_id_begin.value(ctx.element.element);
        return info.start[seqId] || 0;
    })
};
exports.G3dInfoDataProperty = property_1.FormatPropertyProvider.create({ name: 'g3d_info' });
function g3dHaplotypeQuery(haplotype) {
    return builder_1.MolScriptBuilder.struct.generator.atomGroups({
        'chain-test': builder_1.MolScriptBuilder.core.rel.eq([exports.G3dSymbols.haplotype.symbol(), haplotype]),
    });
}
function g3dChromosomeQuery(chr) {
    return builder_1.MolScriptBuilder.struct.generator.atomGroups({
        'chain-test': builder_1.MolScriptBuilder.core.logic.and([
            builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'sphere']),
            builder_1.MolScriptBuilder.core.rel.eq([exports.G3dSymbols.chromosome.symbol(), chr])
        ])
    });
}
function g3dRegionQuery(chr, start, end) {
    return builder_1.MolScriptBuilder.struct.generator.atomGroups({
        'chain-test': builder_1.MolScriptBuilder.core.logic.and([
            builder_1.MolScriptBuilder.core.rel.eq([builder_1.MolScriptBuilder.ammp('objectPrimitive'), 'sphere']),
            builder_1.MolScriptBuilder.core.rel.eq([exports.G3dSymbols.chromosome.symbol(), chr])
        ]),
        'residue-test': builder_1.MolScriptBuilder.core.rel.inRange([exports.G3dSymbols.region.symbol(), start, end])
    });
}
;
exports.G3dLabelProvider = {
    label: (e) => {
        if (e.kind !== 'element-loci' || loci_1.Loci.isEmpty(e))
            return;
        const first = e.elements[0];
        if (e.elements.length !== 1 || structure_1.Unit.isAtomic(first.unit))
            return;
        const info = exports.G3dInfoDataProperty.get(first.unit.model);
        if (!info)
            return;
        const eI = first.unit.elements[int_1.OrderedSet.getAt(first.indices, 0)];
        const seqId = first.unit.model.coarseHierarchy.spheres.seq_id_begin.value(eI);
        return `<b>Start:</b> ${info.start[seqId]} <small>| resolution ${info.resolution}<small>`;
    }
};
