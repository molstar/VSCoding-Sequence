/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { Structure } from '../../../../mol-model/structure';
import { Vec3 } from '../../../../mol-math/linear-algebra';
export interface ShrakeRupleyContext {
    structure: Structure;
    spherePoints: Vec3[];
    probeSize: number;
    nonPolymer: boolean;
    traceOnly: boolean;
    scalingConstant: number;
    maxLookupRadius: number;
    atomRadiusType: Int8Array;
    serialResidueIndex: Int32Array;
    /** Accessible surface area values */
    area: Float32Array;
}
/** Chothia's amino acid and nucleotide atom vdw radii */
export declare const VdWLookup: number[];
/** Maximum accessible surface area observed for amino acids. Taken from: http://dx.doi.org/10.1371/journal.pone.0080635 */
export declare const MaxAsa: {
    [k: string]: number;
};
export declare const DefaultMaxAsa = 121;
