/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure } from '../../mol-model/structure';
import { Task, RuntimeContext } from '../../mol-task';
import { Vec3 } from '../../mol-math/linear-algebra';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { MembraneOrientation } from './prop';
export declare const ANVILParams: {
    numberOfSpherePoints: PD.Numeric;
    stepSize: PD.Numeric;
    minThickness: PD.Numeric;
    maxThickness: PD.Numeric;
    asaCutoff: PD.Numeric;
    adjust: PD.Numeric;
    tmdetDefinition: PD.BooleanParam;
};
export type ANVILParams = typeof ANVILParams;
export type ANVILProps = PD.Values<ANVILParams>;
/**
 * Implements:
 * Membrane positioning for high- and low-resolution protein structures through a binary classification approach
 * Guillaume Postic, Yassine Ghouzam, Vincent Guiraud, and Jean-Christophe Gelly
 * Protein Engineering, Design & Selection, 2015, 1–5
 * doi: 10.1093/protein/gzv063
 *
 * ANVIL is derived from TMDET, the corresponding classification of hydrophobic amino acids is provided as optional parameter:
 * Gabor E. Tusnady, Zsuzsanna Dosztanyi and Istvan Simon
 * Transmembrane proteins in the Protein Data Bank: identification and classification
 * Bioinformatics, 2004, 2964-2972
 * doi: 10.1093/bioinformatics/bth340
 */
export declare function computeANVIL(structure: Structure, props: ANVILProps): Task<MembraneOrientation>;
export declare function calculate(runtime: RuntimeContext, structure: Structure, params: ANVILProps): Promise<MembraneOrientation>;
export declare function isInMembranePlane(testPoint: Vec3, normalVector: Vec3, planePoint1: Vec3, planePoint2: Vec3): boolean;
/** Returns true if the definition considers this as membrane-favoring amino acid */
export declare function isHydrophobic(definition: Set<string>, label_comp_id: string): boolean;
/** Accessible surface area used for normalization. ANVIL uses 'Total-Side REL' values from NACCESS, from: Hubbard, S. J., & Thornton, J. M. (1993). naccess. Computer Program, Department of Biochemistry and Molecular Biology, University College London, 2(1). */
export declare const MaxAsa: {
    [k: string]: number;
};
