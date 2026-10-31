"use strict";
/**
 * Copyright (c) 2017-2022 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentBond = void 0;
const mmcif_1 = require("../../../../mol-io/reader/cif/schema/mmcif");
const cif_1 = require("../../../../mol-io/writer/cif");
const db_1 = require("../../../../mol-data/db");
const property_1 = require("../../common/property");
var ComponentBond;
(function (ComponentBond) {
    ComponentBond.Descriptor = {
        name: 'chem_comp_bond',
        cifExport: {
            prefix: '',
            categories: [{
                    name: 'chem_comp_bond',
                    instance(ctx) {
                        const p = ComponentBond.Provider.get(ctx.firstModel);
                        if (!p)
                            return cif_1.CifWriter.Category.Empty;
                        const chem_comp_bond = p.data;
                        if (!chem_comp_bond)
                            return cif_1.CifWriter.Category.Empty;
                        const comp_names = ctx.structures[0].uniqueResidueNames;
                        const { comp_id, _rowCount } = chem_comp_bond;
                        const indices = [];
                        for (let i = 0; i < _rowCount; i++) {
                            if (comp_names.has(comp_id.value(i)))
                                indices[indices.length] = i;
                        }
                        return cif_1.CifWriter.Category.ofTable(chem_comp_bond, indices);
                    }
                }]
        }
    };
    ComponentBond.Provider = property_1.FormatPropertyProvider.create(ComponentBond.Descriptor);
    function chemCompBondFromTable(model, table) {
        return db_1.Table.pick(table, mmcif_1.mmCIF_Schema.chem_comp_bond, (i) => {
            return model.properties.chemicalComponentMap.has(table.comp_id.value(i));
        });
    }
    ComponentBond.chemCompBondFromTable = chemCompBondFromTable;
    function getEntriesFromChemCompBond(data) {
        const entries = new Map();
        function addEntry(id) {
            // weird behavior when 'PRO' is requested - will report a single bond
            // between N and H because a later operation would override real content
            if (entries.has(id))
                return entries.get(id);
            const e = new Entry(id);
            entries.set(id, e);
            return e;
        }
        const { comp_id, atom_id_1, atom_id_2, value_order, pdbx_aromatic_flag, _rowCount, pdbx_ordinal } = data;
        let entry = addEntry(comp_id.value(0));
        for (let i = 0; i < _rowCount; i++) {
            const id = comp_id.value(i);
            const nameA = atom_id_1.value(i);
            const nameB = atom_id_2.value(i);
            const order = value_order.value(i);
            const aromatic = pdbx_aromatic_flag.value(i) === 'y';
            const key = pdbx_ordinal.value(i);
            if (entry.id !== id) {
                entry = addEntry(id);
            }
            let flags = 1 /* BondType.Flag.Covalent */;
            let ord = 1;
            if (aromatic)
                flags |= 16 /* BondType.Flag.Aromatic */;
            switch (order.toLowerCase()) {
                case 'delo':
                    flags |= 16 /* BondType.Flag.Aromatic */;
                    break;
                case 'doub':
                    ord = 2;
                    break;
                case 'trip':
                    ord = 3;
                    break;
                case 'quad':
                    ord = 4;
                    break;
            }
            entry.add(nameA, nameB, ord, flags, key);
        }
        return entries;
    }
    ComponentBond.getEntriesFromChemCompBond = getEntriesFromChemCompBond;
    class Entry {
        add(a, b, order, flags, key, swap = true) {
            const e = this.map.get(a);
            if (e !== void 0) {
                const f = e.get(b);
                if (f === void 0) {
                    e.set(b, { order, flags, key });
                }
            }
            else {
                const map = new Map();
                map.set(b, { order, flags, key });
                this.map.set(a, map);
            }
            if (swap)
                this.add(b, a, order, flags, key, false);
        }
        constructor(id) {
            this.id = id;
            this.map = new Map();
        }
    }
    ComponentBond.Entry = Entry;
})(ComponentBond || (exports.ComponentBond = ComponentBond = {}));
