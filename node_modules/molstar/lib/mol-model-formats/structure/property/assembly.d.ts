/**
 * Copyright (c) 2017-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Mat4 } from '../../../mol-math/linear-algebra';
import { Assembly, OperatorGroups } from '../../../mol-model/structure/model/properties/symmetry';
import { Table } from '../../../mol-data/db';
import { mmCIF_Schema } from '../../../mol-io/reader/cif/schema/mmcif';
type StructAssembly = Table<mmCIF_Schema['pdbx_struct_assembly']>;
type StructAssemblyGen = Table<mmCIF_Schema['pdbx_struct_assembly_gen']>;
type StructOperList = Table<mmCIF_Schema['pdbx_struct_oper_list']>;
export declare function createAssemblies(pdbx_struct_assembly: StructAssembly, pdbx_struct_assembly_gen: StructAssemblyGen, pdbx_struct_oper_list: StructOperList): ReadonlyArray<Assembly>;
type Matrices = Map<string, Mat4>;
type Generator = {
    assemblyId: string;
    expression: string;
    asymIds: string[];
};
export declare function operatorGroupsProvider(generators: Generator[], matrices: Matrices): () => OperatorGroups;
export declare function getMatrices(pdbx_struct_oper_list: StructOperList): Matrices;
export {};
