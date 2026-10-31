/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Task } from '../../../mol-task';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Structure, StructureElement } from '../../../mol-model/structure';
export declare const ShrakeRupleyComputationParams: {
    numberOfSpherePoints: PD.Numeric;
    probeSize: PD.Numeric;
    nonPolymer: PD.BooleanParam;
    traceOnly: PD.BooleanParam;
};
export type ShrakeRupleyComputationParams = typeof ShrakeRupleyComputationParams;
export type ShrakeRupleyComputationProps = PD.Values<ShrakeRupleyComputationParams>;
export { AccessibleSurfaceArea };
interface AccessibleSurfaceArea {
    readonly serialResidueIndex: ArrayLike<number>;
    readonly area: ArrayLike<number>;
}
declare namespace AccessibleSurfaceArea {
    /**
     * Adapts the BioJava implementation by Jose Duarte. That implementation is based on the publication by Shrake, A., and
     * J. A. Rupley. "Environment and Exposure to Solvent of Protein Atoms. Lysozyme and Insulin." JMB (1973).
     */
    function compute(structure: Structure, props?: Partial<ShrakeRupleyComputationProps>): Task<AccessibleSurfaceArea>;
    const enum Flags {
        NA = 0,
        Buried = 1,
        Accessible = 2
    }
    const Flag: {
        readonly NA: Flags.NA;
        readonly Buried: Flags.Buried;
        readonly Accessible: Flags.Accessible;
    };
    type Flag = (typeof Flag)[keyof typeof Flag];
    /** Get relative area for a given component id */
    function normalize(compId: string, asa: number): number;
    function getValue(location: StructureElement.Location, accessibleSurfaceArea: AccessibleSurfaceArea): number;
    function getNormalizedValue(location: StructureElement.Location, accessibleSurfaceArea: AccessibleSurfaceArea): number;
    function getFlag(location: StructureElement.Location, accessibleSurfaceArea: AccessibleSurfaceArea): Flags;
}
