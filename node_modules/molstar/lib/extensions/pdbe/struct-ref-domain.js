/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Column, Table } from '../../mol-data/db';
import { toTable } from '../../mol-io/reader/cif/schema';
import { CifWriter } from '../../mol-io/writer/cif';
import { PropertyWrapper } from '../../mol-model-props/common/wrapper';
import { MmcifFormat } from '../../mol-model-formats/structure/mmcif';
import { CustomPropertyDescriptor } from '../../mol-model/custom-property';
export var PDBeStructRefDomain;
(function (PDBeStructRefDomain) {
    function get(model) {
        return model._staticPropertyData.__PDBeStructRefSeq__;
    }
    PDBeStructRefDomain.get = get;
    function set(model, prop) {
        model._staticPropertyData.__PDBeStructRefSeq__ = prop;
    }
    PDBeStructRefDomain.Schema = {
        pdbe_struct_ref_domain: {
            id: Column.Schema.int,
            db_name: Column.Schema.str,
            db_code: Column.Schema.str,
            identifier: Column.Schema.str,
            name: Column.Schema.str,
            label_entity_id: Column.Schema.str,
            label_asym_id: Column.Schema.str,
            beg_label_seq_id: Column.Schema.int,
            beg_pdbx_PDB_ins_code: Column.Schema.str,
            end_label_seq_id: Column.Schema.int,
            end_pdbx_PDB_ins_code: Column.Schema.str
        }
    };
    PDBeStructRefDomain.Descriptor = CustomPropertyDescriptor({
        name: 'pdbe_struct_ref_domain',
        cifExport: {
            prefix: 'pdbe',
            context(ctx) { return get(ctx.firstModel); },
            categories: [
                PropertyWrapper.defaultInfoCategory('pdbe_struct_ref_domain_info', ctx => ctx.info),
                {
                    name: 'pdbe_struct_ref_domain',
                    instance(ctx) {
                        if (!ctx || !ctx.data)
                            return CifWriter.Category.Empty;
                        return CifWriter.Category.ofTable(ctx.data);
                    }
                }
            ]
        }
    });
    function fromCifData(model) {
        if (!MmcifFormat.is(model.sourceData))
            return void 0;
        const cat = model.sourceData.data.frame.categories.pdbe_struct_ref_domain;
        if (!cat)
            return void 0;
        return toTable(PDBeStructRefDomain.Schema.pdbe_struct_ref_domain, cat);
    }
    async function attachFromCifOrApi(model, params) {
        if (model.customProperties.has(PDBeStructRefDomain.Descriptor))
            return true;
        let table;
        let info = PropertyWrapper.tryGetInfoFromCif('pdbe_struct_ref_domain_info', model);
        if (info) {
            table = fromCifData(model);
        }
        else if (params.PDBe_apiSourceJson) {
            const data = await params.PDBe_apiSourceJson(model);
            if (!data)
                return false;
            info = PropertyWrapper.createInfo();
            table = fromPDBeJson(model, data);
        }
        else {
            return false;
        }
        model.customProperties.add(PDBeStructRefDomain.Descriptor);
        set(model, { info, data: table });
        return true;
    }
    PDBeStructRefDomain.attachFromCifOrApi = attachFromCifOrApi;
})(PDBeStructRefDomain || (PDBeStructRefDomain = {}));
function fromPDBeJson(modelData, data) {
    const rows = [];
    let id = 1;
    for (const db_name of Object.keys(data)) {
        const db = data[db_name];
        for (const db_code of Object.keys(db)) {
            const domain = db[db_code];
            for (const map of domain.mappings) {
                rows.push({
                    id: id++,
                    db_name,
                    db_code,
                    identifier: domain.identifier,
                    name: domain.name,
                    label_entity_id: '' + map.entity_id,
                    label_asym_id: map.struct_asym_id,
                    beg_label_seq_id: map.start.residue_number,
                    beg_pdbx_PDB_ins_code: map.start.author_insertion_code,
                    end_label_seq_id: map.end.residue_number,
                    end_pdbx_PDB_ins_code: map.end.author_insertion_code,
                });
            }
        }
    }
    return Table.ofRows(PDBeStructRefDomain.Schema.pdbe_struct_ref_domain, rows);
}
