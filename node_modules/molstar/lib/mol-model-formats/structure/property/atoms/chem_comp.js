/**
 * Copyright (c) 2020 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { CifWriter } from '../../../../mol-io/writer/cif';
import { Table } from '../../../../mol-data/db';
import { FormatPropertyProvider } from '../../common/property';
import { CCD_Schema } from '../../../../mol-io/reader/cif/schema/ccd';
export var ComponentAtom;
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
                            return CifWriter.Category.Empty;
                        const chem_comp_atom = p.data;
                        if (!chem_comp_atom)
                            return CifWriter.Category.Empty;
                        const comp_names = ctx.structures[0].uniqueResidueNames;
                        const { comp_id, _rowCount } = chem_comp_atom;
                        const indices = [];
                        for (let i = 0; i < _rowCount; i++) {
                            if (comp_names.has(comp_id.value(i)))
                                indices[indices.length] = i;
                        }
                        return CifWriter.Category.ofTable(chem_comp_atom, indices);
                    }
                }]
        }
    };
    ComponentAtom.Provider = FormatPropertyProvider.create(ComponentAtom.Descriptor);
    function chemCompAtomFromTable(model, table) {
        return Table.pick(table, CCD_Schema.chem_comp_atom, (i) => {
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
})(ComponentAtom || (ComponentAtom = {}));
