/**
 * Copyright (c) 2020 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { Model } from '../../../../mol-model/structure/model/model';
import { CustomPropertyDescriptor } from '../../../../mol-model/custom-property';
import { Table } from '../../../../mol-data/db';
import { FormatPropertyProvider } from '../../common/property';
import { CCD_Schema } from '../../../../mol-io/reader/cif/schema/ccd';
export interface ComponentAtom {
    readonly data: Table<CCD_Schema['chem_comp_atom']>;
    readonly entries: ReadonlyMap<string, ComponentAtom.Entry>;
}
export declare namespace ComponentAtom {
    const Descriptor: CustomPropertyDescriptor;
    const Provider: FormatPropertyProvider<ComponentAtom>;
    function chemCompAtomFromTable(model: Model, table: Table<CCD_Schema['chem_comp_atom']>): Table<CCD_Schema['chem_comp_atom']>;
    function getEntriesFromChemCompAtom(data: Table<CCD_Schema['chem_comp_atom']>): Map<string, Entry>;
    class Entry {
        readonly id: string;
        readonly map: Map<string, {
            charge: number;
            stereo_config: CCD_Schema['chem_comp_atom']['pdbx_stereo_config']['T'];
        }>;
        add(a: string, charge: number, stereo_config: CCD_Schema['chem_comp_atom']['pdbx_stereo_config']['T']): void;
        constructor(id: string);
    }
}
