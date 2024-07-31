/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { DnatcoTypes } from '../types';
import { Sphere3D } from '../../../mol-math/geometry/primitives/sphere3d';
import { DataLocation } from '../../../mol-model/location';
import { DataLoci } from '../../../mol-model/loci';
export declare namespace NtCTubeTypes {
    type Data = {
        data: DnatcoTypes.Steps;
    };
    type TubeBlock = {
        step: DnatcoTypes.Step;
        kind: 'upper' | 'lower' | 'residue-boundary' | 'segment-boundary';
    };
    interface Location extends DataLocation<TubeBlock> {
    }
    function Location(payload: TubeBlock): DataLocation<TubeBlock, {}>;
    function isLocation(x: any): x is Location;
    interface Loci extends DataLoci<DnatcoTypes.Step[], number> {
    }
    interface DummyLoci extends DataLoci<{}, number> {
    }
    function Loci(data: DnatcoTypes.Step[], stepIndices: number[], elements: number[], boundingSphere?: Sphere3D): Loci;
    function DummyLoci(): DummyLoci;
    function isLoci(x: any): x is Loci;
}
