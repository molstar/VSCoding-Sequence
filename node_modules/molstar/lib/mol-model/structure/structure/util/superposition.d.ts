/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { MinimizeRmsd } from '../../../../mol-math/linear-algebra/3d/minimize-rmsd';
import { StructureElement } from '../element';
export declare function superpose(xs: StructureElement.Loci[]): MinimizeRmsd.Result[];
type AlignAndSuperposeResult = MinimizeRmsd.Result & {
    alignmentScore: number;
};
export declare function alignAndSuperpose(xs: StructureElement.Loci[]): AlignAndSuperposeResult[];
export declare function getPositionTable(xs: StructureElement.Loci, n: number): MinimizeRmsd.Positions;
export {};
