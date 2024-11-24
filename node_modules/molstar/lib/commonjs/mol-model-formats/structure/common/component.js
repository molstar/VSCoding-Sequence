"use strict";
/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentBuilder = void 0;
const db_1 = require("../../../mol-data/db");
const types_1 = require("../../../mol-model/structure/model/types");
const set_1 = require("../../../mol-util/set");
const schema_1 = require("../basic/schema");
const constants_1 = require("../../../mol-model/structure/structure/carbohydrates/constants");
const ProteinAtomIdsList = [
    new Set(['CA']),
    new Set(['C']),
    new Set(['N'])
];
const RnaAtomIdsList = [
    new Set(['P', 'O3\'', 'O3*']),
    new Set(['C4\'', 'C4*']),
    new Set(['O2\'', 'O2*', 'F2\'', 'F2*'])
];
const DnaAtomIdsList = [
    new Set(['P', 'O3\'', 'O3*']),
    new Set(['C3\'', 'C3*']),
    new Set(['O2\'', 'O2*', 'F2\'', 'F2*'])
];
/** Used to reduce false positives for atom name-based type guessing */
const NonPolymerNames = new Set([
    'FMN', 'NCN', 'FNS', 'FMA', 'ATP', 'ADP', 'AMP', 'GTP', 'GDP', 'GMP', // Mononucleotides
    'LIG'
]);
const StandardComponents = (function () {
    const map = new Map();
    const components = [
        { id: 'HIS', name: 'HISTIDINE', type: 'l-peptide linking' },
        { id: 'ARG', name: 'ARGININE', type: 'l-peptide linking' },
        { id: 'LYS', name: 'LYSINE', type: 'l-peptide linking' },
        { id: 'ILE', name: 'ISOLEUCINE', type: 'l-peptide linking' },
        { id: 'PHE', name: 'PHENYLALANINE', type: 'l-peptide linking' },
        { id: 'LEU', name: 'LEUCINE', type: 'l-peptide linking' },
        { id: 'TRP', name: 'TRYPTOPHAN', type: 'l-peptide linking' },
        { id: 'ALA', name: 'ALANINE', type: 'l-peptide linking' },
        { id: 'MET', name: 'METHIONINE', type: 'l-peptide linking' },
        { id: 'CYS', name: 'CYSTEINE', type: 'l-peptide linking' },
        { id: 'ASN', name: 'ASPARAGINE', type: 'l-peptide linking' },
        { id: 'VAL', name: 'VALINE', type: 'l-peptide linking' },
        { id: 'GLY', name: 'GLYCINE', type: 'peptide linking' },
        { id: 'SER', name: 'SERINE', type: 'l-peptide linking' },
        { id: 'GLN', name: 'GLUTAMINE', type: 'l-peptide linking' },
        { id: 'TYR', name: 'TYROSINE', type: 'l-peptide linking' },
        { id: 'ASP', name: 'ASPARTIC ACID', type: 'l-peptide linking' },
        { id: 'GLU', name: 'GLUTAMIC ACID', type: 'l-peptide linking' },
        { id: 'THR', name: 'THREONINE', type: 'l-peptide linking' },
        { id: 'PRO', name: 'PROLINE', type: 'l-peptide linking' },
        { id: 'SEC', name: 'SELENOCYSTEINE', type: 'l-peptide linking' },
        { id: 'PYL', name: 'PYRROLYSINE', type: 'l-peptide linking' },
        { id: 'MSE', name: 'SELENOMETHIONINE', type: 'l-peptide linking' },
        { id: 'SEP', name: 'PHOSPHOSERINE', type: 'l-peptide linking' },
        { id: 'TPO', name: 'PHOSPHOTHREONINE', type: 'l-peptide linking' },
        { id: 'PTR', name: 'O-PHOSPHOTYROSINE', type: 'l-peptide linking' },
        { id: 'PCA', name: 'PYROGLUTAMIC ACID', type: 'l-peptide linking' },
        { id: 'A', name: 'ADENOSINE-5\'-MONOPHOSPHATE', type: 'rna linking' },
        { id: 'C', name: 'CYTIDINE-5\'-MONOPHOSPHATE', type: 'rna linking' },
        { id: 'T', name: 'THYMIDINE-5\'-MONOPHOSPHATE', type: 'rna linking' },
        { id: 'G', name: 'GUANOSINE-5\'-MONOPHOSPHATE', type: 'rna linking' },
        { id: 'I', name: 'INOSINIC ACID', type: 'rna linking' },
        { id: 'U', name: 'URIDINE-5\'-MONOPHOSPHATE', type: 'rna linking' },
        { id: 'DA', name: '2\'-DEOXYADENOSINE-5\'-MONOPHOSPHATE', type: 'dna linking' },
        { id: 'DC', name: '2\'-DEOXYCYTIDINE-5\'-MONOPHOSPHATE', type: 'dna linking' },
        { id: 'DT', name: 'THYMIDINE-5\'-MONOPHOSPHATE', type: 'dna linking' },
        { id: 'DG', name: '2\'-DEOXYGUANOSINE-5\'-MONOPHOSPHATE', type: 'dna linking' },
        { id: 'DI', name: '2\'-DEOXYINOSINE-5\'-MONOPHOSPHATE', type: 'dna linking' },
        { id: 'DU', name: '2\'-DEOXYURIDINE-5\'-MONOPHOSPHATE', type: 'dna linking' },
    ];
    components.forEach(c => map.set(c.id, c));
    return map;
})();
const CharmmIonComponents = (function () {
    const map = new Map();
    const components = [
        { id: 'ZN2', name: 'ZINC ION', type: 'ion' },
        { id: 'SOD', name: 'SODIUM ION', type: 'ion' },
        { id: 'CES', name: 'CESIUM ION', type: 'ion' },
        { id: 'CLA', name: 'CHLORIDE ION', type: 'ion' },
        { id: 'CAL', name: 'CALCIUM ION', type: 'ion' },
        { id: 'POT', name: 'POTASSIUM ION', type: 'ion' },
    ];
    components.forEach(c => map.set(c.id, c));
    return map;
})();
class ComponentBuilder {
    set(c) {
        this.comps.set(c.id, c);
        this.ids.push(c.id);
        this.names.push(c.name);
        this.types.push(c.type);
        this.mon_nstd_flags.push(types_1.PolymerNames.has(c.id) ? 'y' : 'n');
    }
    getAtomIds(index) {
        const atomIds = new Set();
        const prevSeqId = this.seqId.value(index);
        while (index < this.seqId.rowCount) {
            const seqId = this.seqId.value(index);
            if (seqId !== prevSeqId)
                break;
            atomIds.add(this.atomId.value(index));
            prevSeqId - seqId;
            index += 1;
        }
        return atomIds;
    }
    hasAtomIds(atomIds, atomIdsList) {
        for (let i = 0, il = atomIdsList.length; i < il; ++i) {
            if (!set_1.SetUtils.areIntersecting(atomIds, atomIdsList[i])) {
                return false;
            }
        }
        return true;
    }
    getType(atomIds) {
        if (this.hasAtomIds(atomIds, ProteinAtomIdsList)) {
            return 'peptide linking';
        }
        else if (this.hasAtomIds(atomIds, RnaAtomIdsList)) {
            return 'rna linking';
        }
        else if (this.hasAtomIds(atomIds, DnaAtomIdsList)) {
            return 'dna linking';
        }
        else {
            return 'other';
        }
    }
    has(compId) { return this.comps.has(compId); }
    get(compId) { return this.comps.get(compId); }
    add(compId, index) {
        if (!this.has(compId)) {
            if (StandardComponents.has(compId)) {
                this.set(StandardComponents.get(compId));
            }
            else if (types_1.WaterNames.has(compId)) {
                this.set({ id: compId, name: 'WATER', type: 'non-polymer' });
            }
            else if (NonPolymerNames.has(compId.toUpperCase())) {
                this.set({ id: compId, name: this.namesMap.get(compId) || compId, type: 'non-polymer' });
            }
            else if (constants_1.SaccharideCompIdMap.has(compId.toUpperCase())) {
                this.set({ id: compId, name: this.namesMap.get(compId) || compId, type: 'saccharide' });
            }
            else {
                const atomIds = this.getAtomIds(index);
                if (atomIds.size === 1 && CharmmIonComponents.has(compId)) {
                    this.set(CharmmIonComponents.get(compId));
                }
                else {
                    const type = this.getType(atomIds);
                    this.set({ id: compId, name: this.namesMap.get(compId) || compId, type });
                }
            }
        }
        return this.get(compId);
    }
    getChemCompTable() {
        return db_1.Table.ofPartialColumns(schema_1.BasicSchema.chem_comp, {
            id: db_1.Column.ofStringArray(this.ids),
            name: db_1.Column.ofStringArray(this.names),
            type: db_1.Column.ofStringAliasArray(this.types),
            mon_nstd_flag: db_1.Column.ofStringAliasArray(this.mon_nstd_flags),
        }, this.ids.length);
    }
    setNames(names) {
        names.forEach(n => this.namesMap.set(n[0], n[1]));
    }
    constructor(seqId, atomId) {
        this.seqId = seqId;
        this.atomId = atomId;
        this.namesMap = new Map();
        this.comps = new Map();
        this.ids = [];
        this.names = [];
        this.types = [];
        this.mon_nstd_flags = [];
    }
}
exports.ComponentBuilder = ComponentBuilder;
