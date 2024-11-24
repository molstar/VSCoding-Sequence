/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Column } from '../../mol-data/db';
import { CifWriter } from '../../mol-io/writer/cif';
import { Model } from '../../mol-model/structure';
export declare namespace PDBePreferredAssembly {
    type Property = string;
    function getFirstFromModel(model: Model): Property;
    function get(model: Model): Property;
    const Schema: {
        pdbe_preferred_assembly: {
            assembly_id: Column.Schema.Str;
        };
    };
    type Schema = typeof Schema;
    const Descriptor: {
        name: string;
        cifExport: {
            prefix: string;
            context(ctx: import("../../mol-model/structure").CifExportContext): Property;
            categories: {
                name: string;
                instance(ctx: Property): CifWriter.Category.Instance<any, any>;
            }[];
        };
    };
    function attachFromCifOrApi(model: Model, params: {
        PDBe_apiSourceJson?: (model: Model) => Promise<any>;
    }): Promise<boolean>;
}
