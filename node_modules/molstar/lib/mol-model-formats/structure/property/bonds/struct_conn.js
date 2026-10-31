/**
 * Copyright (c) 2017-2023 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Yakov Pechersky <ffxen158@gmail.com>
 */
import { Column } from '../../../../mol-data/db';
import { SortedArray } from '../../../../mol-data/int';
import { CifWriter } from '../../../../mol-io/writer/cif';
import { getInterBondOrderFromTable } from '../../../../mol-model/structure/model/properties/atomic/bonds';
import { FormatPropertyProvider } from '../../common/property';
export var StructConn;
(function (StructConn) {
    StructConn.Descriptor = {
        name: 'struct_conn',
        cifExport: {
            prefix: '',
            categories: [{
                    name: 'struct_conn',
                    instance(ctx) {
                        const p = StructConn.Provider.get(ctx.firstModel);
                        if (!p || p.entries.length === 0)
                            return CifWriter.Category.Empty;
                        const structure = ctx.structures[0];
                        const indices = [];
                        for (const e of p.entries) {
                            if (hasAtom(structure, e.partnerA.atomIndex) &&
                                hasAtom(structure, e.partnerB.atomIndex)) {
                                indices[indices.length] = e.rowIndex;
                            }
                        }
                        return CifWriter.Category.ofTable(p.data, indices);
                    }
                }]
        }
    };
    StructConn.Provider = FormatPropertyProvider.create(StructConn.Descriptor);
    /**
     * Heuristic to test if StructConn likely provides all atomic bonds by
     * checking if the fraction of bonds and atoms is high (> 0.95).
     */
    function isExhaustive(model) {
        const structConn = StructConn.Provider.get(model);
        return !!structConn && (structConn.data.id.rowCount / model.atomicConformation.atomId.rowCount) > 0.95;
    }
    StructConn.isExhaustive = isExhaustive;
    function hasAtom({ units }, element) {
        for (let i = 0, _i = units.length; i < _i; i++) {
            if (SortedArray.indexOf(units[i].elements, element) >= 0)
                return true;
        }
        return false;
    }
    function getAtomIndexFromEntries(entries) {
        const m = new Map();
        for (const e of entries) {
            const { partnerA: { atomIndex: iA }, partnerB: { atomIndex: iB } } = e;
            if (m.has(iA))
                m.get(iA).push(e);
            else
                m.set(iA, [e]);
            if (m.has(iB))
                m.get(iB).push(e);
            else
                m.set(iB, [e]);
        }
        return m;
    }
    StructConn.getAtomIndexFromEntries = getAtomIndexFromEntries;
    function getEntriesFromStructConn(struct_conn, model) {
        const { conn_type_id, pdbx_dist_value, pdbx_value_order } = struct_conn;
        const p1 = {
            label_asym_id: struct_conn.ptnr1_label_asym_id,
            label_seq_id: struct_conn.ptnr1_label_seq_id,
            auth_seq_id: struct_conn.ptnr1_auth_seq_id,
            label_atom_id: struct_conn.ptnr1_label_atom_id,
            label_alt_id: struct_conn.pdbx_ptnr1_label_alt_id,
            ins_code: struct_conn.pdbx_ptnr1_PDB_ins_code,
            symmetry: struct_conn.ptnr1_symmetry
        };
        const p2 = {
            label_asym_id: struct_conn.ptnr2_label_asym_id,
            label_seq_id: struct_conn.ptnr2_label_seq_id,
            auth_seq_id: struct_conn.ptnr2_auth_seq_id,
            label_atom_id: struct_conn.ptnr2_label_atom_id,
            label_alt_id: struct_conn.pdbx_ptnr2_label_alt_id,
            ins_code: struct_conn.pdbx_ptnr2_PDB_ins_code,
            symmetry: struct_conn.ptnr2_symmetry
        };
        const entityIds = Array.from(model.entities.data.id.toArray());
        const _p = (row, ps) => {
            if (ps.label_asym_id.valueKind(row) !== 0 /* Column.ValueKinds.Present */)
                return void 0;
            const asymId = ps.label_asym_id.value(row);
            const atomName = ps.label_atom_id.value(row);
            // turns out "mismat" records might not have atom name value
            if (!atomName)
                return undefined;
            // prefer auth_seq_id, but if it is absent, then fall back to label_seq_id
            const resId = (ps.auth_seq_id.valueKind(row) === Column.ValueKind.Present) ?
                ps.auth_seq_id.value(row) :
                ps.label_seq_id.value(row);
            const resInsCode = ps.ins_code.value(row);
            const altId = ps.label_alt_id.value(row);
            for (const eId of entityIds) {
                const residueIndex = model.atomicHierarchy.index.findResidue(eId, asymId, resId, resInsCode);
                if (residueIndex < 0)
                    continue;
                const atomIndex = model.atomicHierarchy.index.findAtomOnResidue(residueIndex, atomName, altId);
                if (atomIndex < 0)
                    continue;
                return { residueIndex, atomIndex, symmetry: ps.symmetry.value(row) };
            }
            return void 0;
        };
        const entries = [];
        for (let i = 0; i < struct_conn._rowCount; i++) {
            const partnerA = _p(i, p1);
            const partnerB = _p(i, p2);
            if (partnerA === undefined || partnerB === undefined)
                continue;
            const type = conn_type_id.value(i);
            const orderType = (pdbx_value_order.value(i) || '');
            let flags = 0 /* BondType.Flag.None */;
            let order = 1;
            switch (orderType) {
                case 'sing':
                    order = 1;
                    break;
                case 'doub':
                    order = 2;
                    break;
                case 'trip':
                    order = 3;
                    break;
                case 'quad':
                    order = 4;
                    break;
                default:
                    order = getInterBondOrderFromTable(struct_conn.ptnr1_label_comp_id.value(i), struct_conn.ptnr1_label_atom_id.value(i), struct_conn.ptnr2_label_comp_id.value(i), struct_conn.ptnr2_label_atom_id.value(i));
            }
            switch (type) {
                case 'covale':
                    flags = 1 /* BondType.Flag.Covalent */;
                    break;
                case 'disulf':
                    flags = 1 /* BondType.Flag.Covalent */ | 8 /* BondType.Flag.Disulfide */;
                    break;
                case 'hydrog':
                    flags = 4 /* BondType.Flag.HydrogenBond */;
                    break;
                case 'metalc':
                    flags = 2 /* BondType.Flag.MetallicCoordination */;
                    break;
            }
            entries.push({
                rowIndex: i, flags, order, distance: pdbx_dist_value.value(i), partnerA, partnerB
            });
        }
        return entries;
    }
    StructConn.getEntriesFromStructConn = getEntriesFromStructConn;
})(StructConn || (StructConn = {}));
