"use strict";
/**
 * Copyright (c) 2021-23 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIFTSMapping = void 0;
const mmcif_1 = require("../../mol-model-formats/structure/mmcif");
const custom_property_1 = require("../../mol-model/custom-property");
const custom_model_property_1 = require("../common/custom-model-property");
var SIFTSMapping;
(function (SIFTSMapping) {
    SIFTSMapping.Provider = custom_model_property_1.CustomModelProperty.createProvider({
        label: 'SIFTS Mapping',
        descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
            name: 'sifts_sequence_mapping'
        }),
        type: 'static',
        defaultParams: {},
        getParams: () => ({}),
        isApplicable: (data) => isAvailable(data),
        obtain: async (ctx, data) => {
            return { value: fromCif(data) };
        }
    });
    function isAvailable(model) {
        if (!mmcif_1.MmcifFormat.is(model.sourceData))
            return false;
        const { pdbx_sifts_xref_db_name: db_name, pdbx_sifts_xref_db_acc: db_acc, pdbx_sifts_xref_db_num: db_num, pdbx_sifts_xref_db_res: db_res } = model.sourceData.data.db.atom_site;
        return db_name.isDefined && db_acc.isDefined && db_num.isDefined && db_res.isDefined;
    }
    SIFTSMapping.isAvailable = isAvailable;
    function getKey(loc) {
        const model = loc.unit.model;
        const data = SIFTSMapping.Provider.get(model).value;
        if (!data)
            return '';
        const rI = model.atomicHierarchy.residueAtomSegments.index[loc.element];
        return data.accession[rI];
    }
    SIFTSMapping.getKey = getKey;
    function getLabel(loc) {
        const model = loc.unit.model;
        const data = SIFTSMapping.Provider.get(model).value;
        if (!data)
            return;
        const rI = model.atomicHierarchy.residueAtomSegments.index[loc.element];
        const dbName = data.dbName[rI];
        if (!dbName)
            return;
        return `${dbName} ${data.accession[rI]} ${data.num[rI]} ${data.residue[rI]}`;
    }
    SIFTSMapping.getLabel = getLabel;
    function fromCif(model) {
        if (!mmcif_1.MmcifFormat.is(model.sourceData))
            return;
        const { pdbx_sifts_xref_db_name: db_name, pdbx_sifts_xref_db_acc: db_acc, pdbx_sifts_xref_db_num: db_num, pdbx_sifts_xref_db_res: db_res } = model.sourceData.data.db.atom_site;
        if (!db_name.isDefined || !db_acc.isDefined || !db_num.isDefined || !db_res.isDefined)
            return;
        const { atomSourceIndex } = model.atomicHierarchy;
        const { count, offsets: residueOffsets } = model.atomicHierarchy.residueAtomSegments;
        const dbName = new Array(count);
        const accession = new Array(count);
        const num = new Array(count);
        const residue = new Array(count);
        for (let i = 0; i < count; i++) {
            const row = atomSourceIndex.value(residueOffsets[i]);
            if (db_name.valueKind(row) !== 0 /* Column.ValueKinds.Present */) {
                dbName[i] = '';
                accession[i] = '';
                num[i] = '';
                residue[i] = '';
                continue;
            }
            dbName[i] = db_name.value(row);
            accession[i] = db_acc.value(row);
            num[i] = db_num.value(row);
            residue[i] = db_res.value(row);
        }
        return { dbName, accession, num, residue };
    }
})(SIFTSMapping || (exports.SIFTSMapping = SIFTSMapping = {}));
