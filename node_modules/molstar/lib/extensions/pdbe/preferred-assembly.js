/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Column, Table } from '../../mol-data/db';
import { toTable } from '../../mol-io/reader/cif/schema';
import { CifWriter } from '../../mol-io/writer/cif';
import { ModelSymmetry } from '../../mol-model-formats/structure/property/symmetry';
import { MmcifFormat } from '../../mol-model-formats/structure/mmcif';
import { CustomPropertyDescriptor } from '../../mol-model/custom-property';
export var PDBePreferredAssembly;
(function (PDBePreferredAssembly) {
    function getFirstFromModel(model) {
        const symmetry = ModelSymmetry.Provider.get(model);
        return (symmetry === null || symmetry === void 0 ? void 0 : symmetry.assemblies.length) ? symmetry.assemblies[0].id : '';
    }
    PDBePreferredAssembly.getFirstFromModel = getFirstFromModel;
    function get(model) {
        return model._staticPropertyData.__PDBePreferredAssebly__ || getFirstFromModel(model);
    }
    PDBePreferredAssembly.get = get;
    function set(model, prop) {
        model._staticPropertyData.__PDBePreferredAssebly__ = prop;
    }
    PDBePreferredAssembly.Schema = {
        pdbe_preferred_assembly: {
            assembly_id: Column.Schema.str
        }
    };
    PDBePreferredAssembly.Descriptor = CustomPropertyDescriptor({
        name: 'pdbe_preferred_assembly',
        cifExport: {
            prefix: 'pdbe',
            context(ctx) { return get(ctx.firstModel); },
            categories: [{
                    name: 'pdbe_preferred_assembly',
                    instance(ctx) {
                        return CifWriter.Category.ofTable(Table.ofArrays(PDBePreferredAssembly.Schema.pdbe_preferred_assembly, { assembly_id: [ctx] }));
                    }
                }]
        }
    });
    function fromCifData(model) {
        if (!MmcifFormat.is(model.sourceData))
            return void 0;
        const cat = model.sourceData.data.frame.categories.pdbe_preferred_assembly;
        if (!cat)
            return void 0;
        return toTable(PDBePreferredAssembly.Schema.pdbe_preferred_assembly, cat).assembly_id.value(0) || getFirstFromModel(model);
    }
    async function attachFromCifOrApi(model, params) {
        if (model.customProperties.has(PDBePreferredAssembly.Descriptor))
            return true;
        let asmName = fromCifData(model);
        if (asmName === void 0 && params.PDBe_apiSourceJson) {
            const data = await params.PDBe_apiSourceJson(model);
            if (!data)
                return false;
            asmName = asmNameFromJson(model, data);
        }
        else {
            return false;
        }
        if (!asmName)
            return false;
        model.customProperties.add(PDBePreferredAssembly.Descriptor);
        set(model, asmName);
        return true;
    }
    PDBePreferredAssembly.attachFromCifOrApi = attachFromCifOrApi;
})(PDBePreferredAssembly || (PDBePreferredAssembly = {}));
function asmNameFromJson(modelData, data) {
    const assemblies = data[0] && data[0].assemblies;
    if (!assemblies || !assemblies.length)
        return PDBePreferredAssembly.getFirstFromModel(modelData);
    for (const asm of assemblies) {
        if (asm.preferred) {
            return asm.assembly_id;
        }
    }
    return assemblies[0].assembly_id;
}
