/**
 * Copyright (c) 2017-2022 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Model } from '../../../../mol-model/structure/model/model';
import { CustomPropertyDescriptor } from '../../../../mol-model/custom-property';
import { mmCIF_Schema } from '../../../../mol-io/reader/cif/schema/mmcif';
import { Table } from '../../../../mol-data/db';
import { FormatPropertyProvider } from '../../common/property';
export interface ComponentBond {
    readonly data: Table<mmCIF_Schema['chem_comp_bond']>;
    readonly entries: ReadonlyMap<string, ComponentBond.Entry>;
}
export declare namespace ComponentBond {
    const Descriptor: CustomPropertyDescriptor;
    const Provider: FormatPropertyProvider<ComponentBond>;
    function chemCompBondFromTable(model: Model, table: Table<mmCIF_Schema['chem_comp_bond']>): Table<mmCIF_Schema['chem_comp_bond']>;
    function getEntriesFromChemCompBond(data: Table<mmCIF_Schema['chem_comp_bond']>): Map<string, Entry>;
    class Entry {
        readonly id: string;
        readonly map: Map<string, Map<string, {
            order: number;
            flags: number;
            key: number;
        }>>;
        add(a: string, b: string, order: number, flags: number, key: number, swap?: boolean): void;
        constructor(id: string);
    }
}
