"use strict";
/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtomSiteOperatorMappingSchema = exports.AtomSiteOperatorMappingCategoryName = void 0;
exports.atom_site_operator_mapping = atom_site_operator_mapping;
const structure_1 = require("../../structure");
const int_1 = require("../../../../mol-data/int");
const cif_1 = require("../../../../mol-io/writer/cif");
const db_1 = require("../../../../mol-data/db");
function atom_site_operator_mapping(ctx) {
    const entries = getEntries(ctx);
    if (entries.length === 0)
        return;
    return [Category, entries, { ignoreFilter: true }];
}
exports.AtomSiteOperatorMappingCategoryName = 'molstar_atom_site_operator_mapping';
exports.AtomSiteOperatorMappingSchema = {
    molstar_atom_site_operator_mapping: {
        label_asym_id: db_1.Column.Schema.Str(),
        auth_asym_id: db_1.Column.Schema.Str(),
        operator_name: db_1.Column.Schema.Str(),
        suffix: db_1.Column.Schema.Str(),
        // assembly
        assembly_id: db_1.Column.Schema.Str(),
        assembly_operator_id: db_1.Column.Schema.Int(),
        // symmetry
        symmetry_operator_index: db_1.Column.Schema.Int(),
        symmetry_hkl: db_1.Column.Schema.Vector(3),
        // NCS
        ncs_id: db_1.Column.Schema.Int(),
    }
};
const asmValueKind = (i, xs) => typeof xs[i].operator.assembly === 'undefined' ? 1 /* Column.ValueKinds.NotPresent */ : 0 /* Column.ValueKinds.Present */;
const symmetryValueKind = (i, xs) => xs[i].operator.spgrOp === -1 ? 1 /* Column.ValueKinds.NotPresent */ : 0 /* Column.ValueKinds.Present */;
const Fields = cif_1.CifWriter.fields()
    .str('label_asym_id', (i, xs) => xs[i].label_asym_id)
    .str('auth_asym_id', (i, xs) => xs[i].auth_asym_id)
    .str('operator_name', (i, xs) => xs[i].operator.name)
    .str('suffix', (i, xs) => xs[i].operator.suffix)
    // assembly
    // TODO: include oper list as well?
    .str('assembly_id', (i, xs) => { var _a; return ((_a = xs[i].operator.assembly) === null || _a === void 0 ? void 0 : _a.id) || ''; }, { valueKind: asmValueKind })
    .int('assembly_operator_id', (i, xs) => { var _a; return ((_a = xs[i].operator.assembly) === null || _a === void 0 ? void 0 : _a.operId) || 0; }, { valueKind: asmValueKind })
    // symmetry
    .int('symmetry_operator_index', (i, xs) => xs[i].operator.spgrOp, { valueKind: symmetryValueKind })
    .vec('symmetry_hkl', [(i, xs) => xs[i].operator.hkl[0], (i, xs) => xs[i].operator.hkl[1], (i, xs) => xs[i].operator.hkl[2]], { valueKind: symmetryValueKind })
    // NCS
    .int('ncs_id', (i, xs) => xs[i].operator.ncsId, { valueKind: symmetryValueKind })
    .getFields();
const Category = {
    name: 'molstar_atom_site_operator_mapping',
    instance(entries) {
        return { fields: Fields, source: [{ data: entries, rowCount: entries.length }] };
    }
};
function getEntries(ctx) {
    const existing = new Set();
    const entries = [];
    for (const s of ctx.structures) {
        const l = structure_1.StructureElement.Location.create(s);
        for (const unit of s.units) {
            const operator = unit.conformation.operator;
            if (!operator.suffix || unit.kind !== 0 /* Unit.Kind.Atomic */)
                continue;
            l.unit = unit;
            const { elements } = unit;
            const chainsIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.chainAtomSegments, elements);
            while (chainsIt.hasNext) {
                const chainSegment = chainsIt.move();
                l.element = elements[chainSegment.start];
                const label_asym_id = structure_1.StructureProperties.chain.label_asym_id(l);
                const key = `${label_asym_id}${operator.suffix}`;
                if (existing.has(key))
                    continue;
                existing.add(key);
                const auth_asym_id = structure_1.StructureProperties.chain.label_asym_id(l);
                entries.push({ label_asym_id, auth_asym_id, operator });
            }
        }
    }
    return entries;
}
