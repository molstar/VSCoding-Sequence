/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { Structure } from '../../mol-model/structure';
import { CustomProperty } from '../../mol-model-props/common/custom-property';
import { CustomStructureProperty } from '../../mol-model-props/common/custom-structure-property';
import { ReadonlyVec3 } from '../../mol-math/linear-algebra/3d/vec3';
export declare function isBiologicalAssembly(structure: Structure): boolean;
export declare namespace AssemblySymmetryData {
    enum Tag {
        Cluster = "assembly-symmetry-cluster",
        Representation = "assembly-symmetry-3d"
    }
    const DefaultServerUrl = "https://data.rcsb.org/graphql";
    function isApplicable(structure?: Structure): boolean;
    function fetch(ctx: CustomProperty.Context, structure: Structure, props: AssemblySymmetryDataProps): Promise<CustomProperty.Data<AssemblySymmetryDataValue>>;
    function fetchRCSB(ctx: CustomProperty.Context, structure: Structure, props: AssemblySymmetryDataProps): Promise<CustomProperty.Data<AssemblySymmetryDataValue>>;
    /** Returns the index of the first non C1 symmetry or -1 */
    function firstNonC1(assemblySymmetryData: AssemblySymmetryDataValue): number;
    type RotationAxes = ReadonlyArray<{
        order: number;
        start: ReadonlyVec3;
        end: ReadonlyVec3;
    }>;
    function isRotationAxes(x: AssemblySymmetryValue['rotation_axes']): x is RotationAxes;
    function getAsymIds(assemblySymmetry: AssemblySymmetryValue): string[];
    /** Returns structure limited to all cluster member chains */
    function getStructure(structure: Structure, assemblySymmetry: AssemblySymmetryValue): Structure;
}
export declare function getSymmetrySelectParam(structure?: Structure): PD.Select<number>;
export declare const AssemblySymmetryDataParams: {
    serverType: PD.Select<"rcsb" | "pdbe">;
    serverUrl: PD.Text<string>;
};
export type AssemblySymmetryDataParams = typeof AssemblySymmetryDataParams;
export type AssemblySymmetryDataProps = PD.Values<AssemblySymmetryDataParams>;
export type AssemblySymmetryDataValue = ReadonlyArray<{
    readonly kind: string;
    readonly oligomeric_state: string;
    readonly stoichiometry: ReadonlyArray<string>;
    readonly symbol: string;
    readonly type: string;
    readonly clusters: ReadonlyArray<{
        readonly avg_rmsd?: number;
        readonly members: ReadonlyArray<{
            readonly asym_id: string;
            readonly pdbx_struct_oper_list_ids?: ReadonlyArray<string>;
        }>;
    }>;
    readonly rotation_axes?: ReadonlyArray<{
        readonly order?: number;
        readonly start: ReadonlyArray<number>;
        readonly end: ReadonlyArray<number>;
    }>;
}>;
export declare const AssemblySymmetryDataProvider: CustomStructureProperty.Provider<AssemblySymmetryDataParams, AssemblySymmetryDataValue>;
export declare const AssemblySymmetryParams: {
    symmetryIndex: PD.Select<number>;
    serverType: PD.Select<"rcsb" | "pdbe">;
    serverUrl: PD.Text<string>;
};
export type AssemblySymmetryParams = typeof AssemblySymmetryParams;
export type AssemblySymmetryProps = PD.Values<AssemblySymmetryParams>;
export type AssemblySymmetryValue = AssemblySymmetryDataValue[0];
export declare const AssemblySymmetryProvider: CustomStructureProperty.Provider<AssemblySymmetryParams, AssemblySymmetryValue>;
