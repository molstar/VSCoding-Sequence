"use strict";
/**
 * Copyright (c) 2020 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentAtom = void 0;
const cif_1 = require("../../../../mol-io/writer/cif");
const db_1 = require("../../../../mol-data/db");
const property_1 = require("../../common/property");
const ccd_1 = require("../../../../mol-io/reader/cif/schema/ccd");
var ComponentAtom;
(function (ComponentAtom) {
    ComponentAtom.Descriptor = {
        name: 'chem_comp_atom',
        cifExport: {
            prefix: '',
            categories: [{
                    name: 'chem_comp_atom',
                    instance(ctx) {
                        const p = ComponentAtom.Provider.get(ctx.firstModel);
                        if (!p)
                            return cif_1.CifWriter.Category.Empty;
                        const chem_comp_atom = p.data;
                        if (!chem_comp_atom)
                            return cif_1.CifWriter.Category.Empty;
                        const comp_names = ctx.structures[0].uniqueResidueNames;
                        const { comp_id, _rowCount } = chem_comp_atom;
                        const indices = [];
                        for (let i = 0; i < _rowCount; i++) {
                            if (comp_names.has(comp_id.value(i)))
                                indices[indices.length] = i;
                        }
                        return cif_1.CifWriter.Category.ofTable(chem_comp_atom, indices);
                    }
                }]
        }
    };
    ComponentAtom.Provider = property_1.FormatPropertyProvider.create(ComponentAtom.Descriptor);
    function chemCompAtomFromTable(model, table) {
        return db_1.Table.pick(table, ccd_1.CCD_Schema.chem_comp_atom, (i) => {
            return model.properties.chemicalComponentMap.has(table.comp_id.value(i));
        });
    }
    ComponentAtom.chemCompAtomFromTable = chemCompAtomFromTable;
    function getEntriesFromChemCompAtom(data) {
        const entries = new Map();
        function addEntry(id) {
            // weird behavior when 'PRO' is requested - will report a single bond between N and H because a later operation would override real content
            if (entries.has(id)) {
                return entries.get(id);
            }
            const e = new Entry(id);
            entries.set(id, e);
            return e;
        }
        const { comp_id, atom_id, charge, pdbx_stereo_config, _rowCount } = data;
        let entry = addEntry(comp_id.value(0));
        for (let i = 0; i < _rowCount; i++) {
            const name = atom_id.value(i);
            const id = comp_id.value(i);
            const ch = charge.value(i);
            const stereo = pdbx_stereo_config.value(i);
            if (entry.id !== id) {
                entry = addEntry(id);
            }
            entry.add(name, ch, stereo);
        }
        return entries;
    }
    ComponentAtom.getEntriesFromChemCompAtom = getEntriesFromChemCompAtom;
    class Entry {
        add(a, charge, stereo_config) {
            this.map.set(a, { charge, stereo_config });
        }
        constructor(id) {
            this.id = id;
            this.map = new Map();
        }
    }
    ComponentAtom.Entry = Entry;
})(ComponentAtom || (exports.ComponentAtom = ComponentAtom = {}));
