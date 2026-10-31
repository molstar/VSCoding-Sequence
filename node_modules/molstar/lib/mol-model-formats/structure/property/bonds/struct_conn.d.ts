/**
 * Copyright (c) 2017-2023 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Yakov Pechersky <ffxen158@gmail.com>
 */
import { Model } from '../../../../mol-model/structure/model/model';
import { Table } from '../../../../mol-data/db';
import { CustomPropertyDescriptor } from '../../../../mol-model/custom-property';
import { mmCIF_Schema } from '../../../../mol-io/reader/cif/schema/mmcif';
import { ElementIndex, ResidueIndex } from '../../../../mol-model/structure/model/indexing';
import { FormatPropertyProvider } from '../../common/property';
export interface StructConn {
    readonly data: Table<mmCIF_Schema['struct_conn']>;
    readonly byAtomIndex: Map<ElementIndex, ReadonlyArray<StructConn.Entry>>;
    readonly entries: ReadonlyArray<StructConn.Entry>;
}
export declare namespace StructConn {
    const Descriptor: CustomPropertyDescriptor;
    const Provider: FormatPropertyProvider<StructConn>;
    /**
     * Heuristic to test if StructConn likely provides all atomic bonds by
     * checking if the fraction of bonds and atoms is high (> 0.95).
     */
    function isExhaustive(model: Model): boolean;
    function getAtomIndexFromEntries(entries: StructConn['entries']): Map<any, any>;
    interface Entry {
        rowIndex: number;
        distance: number;
        order: number;
        flags: number;
        partnerA: {
            residueIndex: ResidueIndex;
            atomIndex: ElementIndex;
            symmetry: string;
        };
        partnerB: {
            residueIndex: ResidueIndex;
            atomIndex: ElementIndex;
            symmetry: string;
        };
    }
    function getEntriesFromStructConn(struct_conn: Table<mmCIF_Schema['struct_conn']>, model: Model): StructConn['entries'];
}
