"use strict";
/**
 * Copyright (c) 2020-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LigandEncoder = void 0;
const mol_util_1 = require("../../mol-util");
const common_1 = require("../../mol-model/structure/structure/unit/bonds/common");
function Atom(partial) {
    return { ...partial };
}
class LigandEncoder {
    writeCategory(category, context) {
        if (this.encoded) {
            throw new Error('The writer contents have already been encoded, no more writing.');
        }
        if (this.metaInformation && (category.name === 'model_server_result' || category.name === 'model_server_params' || category.name === 'model_server_stats')) {
            this.writeFullCategory(this.meta, category, context);
            return;
        }
        // if error: force writing of meta information
        if (category.name === 'model_server_error') {
            this.writeFullCategory(this.meta, category, context);
            this.error = true;
            return;
        }
        // only care about atom_site category when writing SDF
        if (category.name !== 'atom_site') {
            return;
        }
        this._writeCategory(category, context);
    }
    setComponentAtomData(componentAtomData) {
        this.componentAtomData = componentAtomData;
    }
    setComponentBondData(componentBondData) {
        this.componentBondData = componentBondData;
    }
    writeTo(stream) {
        const chunks = mol_util_1.StringBuilder.getChunks(this.builder);
        for (let i = 0, _i = chunks.length; i < _i; i++) {
            stream.writeString(chunks[i]);
        }
    }
    getSize() {
        return mol_util_1.StringBuilder.getSize(this.builder);
    }
    getData() {
        return mol_util_1.StringBuilder.getString(this.builder);
    }
    getAtoms(instance, source, ccdAtoms) {
        const sortedFields = this.getSortedFields(instance, ['Cartn_x', 'Cartn_y', 'Cartn_z']);
        const label_atom_id = this.getField(instance, 'label_atom_id');
        const type_symbol = this.getField(instance, 'type_symbol');
        return this._getAtoms(source, sortedFields, label_atom_id, type_symbol, ccdAtoms);
    }
    _getAtoms(source, fields, label_atom_id, type_symbol, ccdAtoms) {
        const atoms = new Map();
        let index = 0;
        // is outer loop even needed?
        for (let _c = 0; _c < source.length; _c++) {
            const src = source[_c];
            const data = src.data;
            if (src.rowCount === 0)
                continue;
            const it = src.keys();
            while (it.hasNext) {
                const key = it.move();
                const lai = label_atom_id.value(key, data, index);
                // ignore all atoms not registered in the CCD
                if (!ccdAtoms.has(lai))
                    continue;
                // ignore all alternate locations after the first
                if (atoms.has(lai))
                    continue;
                const ts = type_symbol.value(key, data, index);
                if (this.skipHydrogen(ts))
                    continue;
                const a = {};
                for (let _f = 0, _fl = fields.length; _f < _fl; _f++) {
                    const f = fields[_f];
                    a[f.name] = f.value(key, data, index);
                }
                a[type_symbol.name] = ts;
                a['index'] = index;
                atoms.set(lai, Atom(a));
                index++;
            }
        }
        return atoms;
    }
    skipHydrogen(type_symbol) {
        if (this.hydrogens) {
            return false;
        }
        return this.isHydrogen(type_symbol);
    }
    isHydrogen(type_symbol) {
        return (0, common_1.isHydrogen)((0, common_1.getElementIdx)(type_symbol));
    }
    getSortedFields(instance, names) {
        return names.map(n => this.getField(instance, n));
    }
    getField(instance, name) {
        return instance.fields.find(f => f.name === name);
    }
    getName(instance, source) {
        const label_comp_id = this.getField(instance, 'label_comp_id');
        return label_comp_id.value(source[0].keys().move(), source[0].data, 0);
    }
    startDataBlock() { }
    setFilter() { }
    setFormatter() { }
    isCategoryIncluded() {
        return true;
    }
    constructor(encoder, metaInformation, hydrogens) {
        this.encoder = encoder;
        this.metaInformation = metaInformation;
        this.hydrogens = hydrogens;
        this.error = false;
        this.encoded = false;
        this.isBinary = false;
        this.binaryEncodingProvider = void 0;
        this.builder = mol_util_1.StringBuilder.create();
        this.meta = mol_util_1.StringBuilder.create();
    }
}
exports.LigandEncoder = LigandEncoder;
