/**
 * Copyright (c) 2017-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { mmCIF_Schema } from '../../../mol-io/reader/cif/schema/mmcif';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { Symmetry } from '../../../mol-model/structure/model/properties/symmetry';
import { CustomPropertyDescriptor } from '../../../mol-model/custom-property';
import { FormatPropertyProvider } from '../common/property';
import { Table } from '../../../mol-data/db';
export { ModelSymmetry };
declare namespace ModelSymmetry {
    export const Descriptor: CustomPropertyDescriptor;
    export const Provider: FormatPropertyProvider<Symmetry>;
    type Data = {
        symmetry: Table<mmCIF_Schema['symmetry']>;
        cell: Table<mmCIF_Schema['cell']>;
        struct_ncs_oper: Table<mmCIF_Schema['struct_ncs_oper']>;
        atom_sites: Table<mmCIF_Schema['atom_sites']>;
        pdbx_struct_assembly: Table<mmCIF_Schema['pdbx_struct_assembly']>;
        pdbx_struct_assembly_gen: Table<mmCIF_Schema['pdbx_struct_assembly_gen']>;
        pdbx_struct_oper_list: Table<mmCIF_Schema['pdbx_struct_oper_list']>;
    };
    export function fromData(data: Data): Symmetry;
    export function fromCell(size: Vec3, anglesInRadians: Vec3): Symmetry;
    export {};
}
